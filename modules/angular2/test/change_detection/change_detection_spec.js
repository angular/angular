import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach, IS_DARTIUM} from 'angular2/test_lib';

import {isPresent, isBlank, isJsObject, BaseException, FunctionWrapper} from 'angular2/src/facade/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {Parser} from 'angular2/src/change_detection/parser/parser';
import {Lexer} from 'angular2/src/change_detection/parser/lexer';
import {Locals} from 'angular2/src/change_detection/parser/locals';

import {ChangeDispatcher, DynamicChangeDetector, ChangeDetectionError, BindingRecord, DirectiveRecord,
  PipeRegistry, Pipe, NO_CHANGE, CHECK_ALWAYS, CHECK_ONCE, CHECKED, DETACHED, ON_PUSH, DEFAULT} from 'angular2/change_detection';

import {JitProtoChangeDetector, DynamicProtoChangeDetector} from 'angular2/src/change_detection/proto_change_detector';


export function main() {
  describe("change detection", () => {
    StringMapWrapper.forEach(
      { "dynamic": (registry = null, strategy = null) => new DynamicProtoChangeDetector(registry, strategy),
        "JIT": (registry = null, strategy = null) => new JitProtoChangeDetector(registry, strategy)
      }, (createProtoChangeDetector, name) => {

        if (name == "JIT" && IS_DARTIUM) return;

        function ast(exp:string, location:string = 'location') {
          var parser = new Parser(new Lexer());
          return parser.parseBinding(exp, location);
        }

        function dirs(directives:List) {
          return new FakeDirectives(directives);
        }

        function convertLocalsToVariableBindings(locals) {
          var variableBindings = [];
          var loc = locals;
          while(isPresent(loc)) {
            MapWrapper.forEach(loc.current, (v, k) => ListWrapper.push(variableBindings, k));
            loc = loc.parent;
          }
          return variableBindings;
        }

        function createChangeDetector(propName:string, exp:string, context = null, locals = null, registry = null) {
          var pcd = createProtoChangeDetector(registry);
          var dispatcher = new TestDispatcher();

          var variableBindings = convertLocalsToVariableBindings(locals);

          var records = [BindingRecord.createForElement(ast(exp), 0, propName)];
          var cd = pcd.instantiate(dispatcher, records, variableBindings, []);
          cd.hydrate(context, locals, null);

          return {"changeDetector" : cd, "dispatcher" : dispatcher};
        }

        function executeWatch(memo:string, exp:string, context = null, locals = null) {
          var res = createChangeDetector(memo, exp, context, locals);
          res["changeDetector"].detectChanges();
          return res["dispatcher"].log;
        }

        function instantiate(protoChangeDetector, dispatcher, bindings, directiveRecords = null) {
          if (isBlank(directiveRecords)) directiveRecords = [];
          return protoChangeDetector.instantiate(dispatcher, bindings, null, directiveRecords);
        }

        describe(`${name} change detection`, () => {
          var dispatcher;

          beforeEach(() => {
            dispatcher = new TestDispatcher();
          });

          it('should do simple watching', () => {
            var person = new Person("misko");

            var c = createChangeDetector('name', 'name', person);
            var cd = c["changeDetector"];
            var dispatcher = c["dispatcher"];

            cd.detectChanges();
            expect(dispatcher.log).toEqual(['name=misko']);
            dispatcher.clear();

            cd.detectChanges();
            expect(dispatcher.log).toEqual([]);
            dispatcher.clear();

            person.name = "Misko";
            cd.detectChanges();
            expect(dispatcher.log).toEqual(['name=Misko']);
          });

          it('should report all changes on the first run including uninitialized values', () => {
            expect(executeWatch('value', 'value', new Uninitialized())).toEqual(['value=null']);
          });

          it('should report all changes on the first run including null values', () => {
            var td = new TestData(null);
            expect(executeWatch('a', 'a', td)).toEqual(['a=null']);
          });

          it("should support literals", () => {
            expect(executeWatch('const', '10')).toEqual(['const=10']);
            expect(executeWatch('const', '"str"')).toEqual(['const=str']);
            expect(executeWatch('const', '"a\n\nb"')).toEqual(['const=a\n\nb']);
          });

          it('simple chained property access', () => {
            var address = new Address('Grenoble');
            var person = new Person('Victor', address);

            expect(executeWatch('address.city', 'address.city', person))
              .toEqual(['address.city=Grenoble']);
          });

          it("should support method calls", () => {
            var person = new Person('Victor');
            expect(executeWatch('m', 'sayHi("Jim")', person)).toEqual(['m=Hi, Jim']);
          });

          it("should support function calls", () => {
            var td = new TestData(() => (a) => a);
            expect(executeWatch('value', 'a()(99)', td)).toEqual(['value=99']);
          });

          it("should support chained method calls", () => {
            var person = new Person('Victor');
            var td = new TestData(person);
            expect(executeWatch('m', 'a.sayHi("Jim")', td)).toEqual(['m=Hi, Jim']);
          });

          it("should support literal array", () => {
            var c = createChangeDetector('array', '[1,2]');
            c["changeDetector"].detectChanges();
            expect(c["dispatcher"].loggedValues).toEqual([[1, 2]]);

            c = createChangeDetector('array', '[1,a]', new TestData(2));
            c["changeDetector"].detectChanges();
            expect(c["dispatcher"].loggedValues).toEqual([[1, 2]]);
          });

          it("should support literal maps", () => {
            var c = createChangeDetector('map', '{z:1}');
            c["changeDetector"].detectChanges();
            expect(c["dispatcher"].loggedValues[0]['z']).toEqual(1);

            c = createChangeDetector('map', '{z:a}', new TestData(1));
            c["changeDetector"].detectChanges();
            expect(c["dispatcher"].loggedValues[0]['z']).toEqual(1);
          });

          it("should support binary operations", () => {
            expect(executeWatch('exp', '10 + 2')).toEqual(['exp=12']);
            expect(executeWatch('exp', '10 - 2')).toEqual(['exp=8']);

            expect(executeWatch('exp', '10 * 2')).toEqual(['exp=20']);
            expect(executeWatch('exp', '10 / 2')).toEqual([`exp=${5.0}`]); //dart exp=5.0, js exp=5
            expect(executeWatch('exp', '11 % 2')).toEqual(['exp=1']);

            expect(executeWatch('exp', '1 == 1')).toEqual(['exp=true']);
            expect(executeWatch('exp', '1 != 1')).toEqual(['exp=false']);

            expect(executeWatch('exp', '1 < 2')).toEqual(['exp=true']);
            expect(executeWatch('exp', '2 < 1')).toEqual(['exp=false']);

            expect(executeWatch('exp', '2 > 1')).toEqual(['exp=true']);
            expect(executeWatch('exp', '2 < 1')).toEqual(['exp=false']);

            expect(executeWatch('exp', '1 <= 2')).toEqual(['exp=true']);
            expect(executeWatch('exp', '2 <= 2')).toEqual(['exp=true']);
            expect(executeWatch('exp', '2 <= 1')).toEqual(['exp=false']);

            expect(executeWatch('exp', '2 >= 1')).toEqual(['exp=true']);
            expect(executeWatch('exp', '2 >= 2')).toEqual(['exp=true']);
            expect(executeWatch('exp', '1 >= 2')).toEqual(['exp=false']);

            expect(executeWatch('exp', 'true && true')).toEqual(['exp=true']);
            expect(executeWatch('exp', 'true && false')).toEqual(['exp=false']);

            expect(executeWatch('exp', 'true || false')).toEqual(['exp=true']);
            expect(executeWatch('exp', 'false || false')).toEqual(['exp=false']);
          });

          it("should support negate", () => {
            expect(executeWatch('exp', '!true')).toEqual(['exp=false']);
            expect(executeWatch('exp', '!!true')).toEqual(['exp=true']);
          });

          it("should support conditionals", () => {
            expect(executeWatch('m', '1 < 2 ? 1 : 2')).toEqual(['m=1']);
            expect(executeWatch('m', '1 > 2 ? 1 : 2')).toEqual(['m=2']);
          });

          describe("keyed access", () => {
            it("should support accessing a list item", () => {
              expect(executeWatch('array[0]', '["foo", "bar"][0]')).toEqual(['array[0]=foo']);
            });

            it("should support accessing a map item", () => {
              expect(executeWatch('map[foo]', '{"foo": "bar"}["foo"]')).toEqual(['map[foo]=bar']);
            });
          });

          it("should support interpolation", () => {
            var parser = new Parser(new Lexer());
            var pcd = createProtoChangeDetector();
            var ast = parser.parseInterpolation("B{{a}}A", "location");

            var cd = instantiate(pcd, dispatcher, [BindingRecord.createForElement(ast, 0, "memo")]);
            cd.hydrate(new TestData("value"), null, null);

            cd.detectChanges();

            expect(dispatcher.log).toEqual(["memo=BvalueA"]);
          });

          describe("change notification", () => {
            describe("simple checks", () => {
              it("should pass a change record to the dispatcher", () => {
                var person = new Person('bob');
                var c = createChangeDetector('name', 'name', person);
                var cd = c["changeDetector"];
                var dispatcher = c["dispatcher"];

                cd.detectChanges();

                expect(dispatcher.loggedValues).toEqual(['bob']);
              });
            });

            describe("pipes", () => {
              it("should pass a change record to the dispatcher", () => {
                var registry = new FakePipeRegistry('pipe', () => new CountingPipe());

                var person = new Person('bob');
                var c = createChangeDetector('name', 'name | pipe', person, null, registry);
                var cd = c["changeDetector"];
                var dispatcher = c["dispatcher"];

                cd.detectChanges();

                expect(dispatcher.loggedValues).toEqual(['bob state:0']);
              });
            });

            describe("updating directives", () => {
              var dirRecord1 = new DirectiveRecord(0, 0, true, true);
              var dirRecord2 = new DirectiveRecord(0, 1, true, true);
              var dirRecordNoCallbacks = new DirectiveRecord(0, 0, false, false);

              function updateA(exp:string, dirRecord) {
                return BindingRecord.createForDirective(ast(exp), "a", (o,v) => o.a = v, dirRecord);
              }

              function updateB(exp:string, dirRecord) {
                return BindingRecord.createForDirective(ast(exp), "b", (o,v) => o.b = v, dirRecord);
              }

              var directive1;
              var directive2;

              beforeEach(() => {
                directive1 = new TestDirective();
                directive2 = new TestDirective();
              });

              it("should happen directly, without invoking the dispatcher", () => {
                var pcd = createProtoChangeDetector();

                var cd = instantiate(pcd, dispatcher, [updateA("42", dirRecord1)],
                  [dirRecord1]);

                cd.hydrate(null, null, dirs([directive1]));

                cd.detectChanges();

                expect(dispatcher.loggedValues).toEqual([]);
                expect(directive1.a).toEqual(42);
              });

              describe("onChange", () => {
                it("should notify the directive when a group of records changes", () => {
                  var pcd = createProtoChangeDetector();

                  var cd = instantiate(pcd, dispatcher, [
                    updateA("1", dirRecord1),
                    updateB("2", dirRecord1),
                    updateA("3", dirRecord2)
                  ], [dirRecord1, dirRecord2]);

                  cd.hydrate(null, null, dirs([directive1, directive2]));

                  cd.detectChanges();

                  expect(directive1.changes).toEqual({'a': 1, 'b': 2});
                  expect(directive2.changes).toEqual({'a': 3});
                });

                it("should not call onChange when callOnChange is false", () => {
                  var pcd = createProtoChangeDetector();

                  var cd = instantiate(pcd, dispatcher, [
                    updateA("1", dirRecordNoCallbacks)
                  ], [dirRecordNoCallbacks]);

                  cd.hydrate(null, null, dirs([directive1]));

                  cd.detectChanges();

                  expect(directive1.changes).toEqual(null);
                });
              });

              describe("onAllChangesDone", () => {
                it("should be called after processing all the children", () => {
                  var pcd = createProtoChangeDetector();

                  var cd = instantiate(pcd, dispatcher, [], [dirRecord1, dirRecord2]);
                  cd.hydrate(null, null, dirs([directive1, directive2]));

                  cd.detectChanges();

                  expect(directive1.onChangesDoneCalled).toBe(true);
                  expect(directive2.onChangesDoneCalled).toBe(true);
                });


                it("should not be called when onAllChangesDone is false", () => {
                  var pcd = createProtoChangeDetector();

                  var cd = instantiate(pcd, dispatcher, [
                    updateA("1", dirRecordNoCallbacks)
                  ], [dirRecordNoCallbacks]);

                  cd.hydrate(null, null, dirs([directive1]));

                  cd.detectChanges();

                  expect(directive1.onChangesDoneCalled).toEqual(false);
                });

                it("should be called in reverse order so the child is always notified before the parent", () => {
                  var pcd = createProtoChangeDetector();
                  var cd = instantiate(pcd, dispatcher, [], [dirRecord1, dirRecord2]);

                  var onChangesDoneCalls = [];
                  var td1;
                  td1 = new TestDirective(() => ListWrapper.push(onChangesDoneCalls, td1));
                  var td2;
                  td2 = new TestDirective(() => ListWrapper.push(onChangesDoneCalls, td2));
                  cd.hydrate(null, null, dirs([td1, td2]));

                  cd.detectChanges();

                  expect(onChangesDoneCalls).toEqual([td2, td1]);
                });

                it("should be called before processing shadow dom children", () => {
                  var pcd = createProtoChangeDetector();
                  var shadowDomChildPCD = createProtoChangeDetector();

                  var parent = pcd.instantiate(dispatcher, [], null, [dirRecord1]);

                  var child = shadowDomChildPCD.instantiate(dispatcher,
                    [updateA("1", dirRecord1)], null, [dirRecord1]);
                  parent.addShadowDomChild(child);

                  var directiveInShadowDom = new TestDirective();
                  var parentDirective = new TestDirective(() => {
                    expect(directiveInShadowDom.a).toBe(null);
                  });

                  parent.hydrate(null, null, dirs([parentDirective]));
                  child.hydrate(null, null, dirs([directiveInShadowDom]));

                  parent.detectChanges();
                });
              });
            });
          });

          describe("enforce no new changes", () => {
            it("should throw when a record gets changed after it has been checked", () => {
              var pcd = createProtoChangeDetector();

              var dispatcher = new TestDispatcher();
              var cd = instantiate(pcd, dispatcher, [
                BindingRecord.createForElement(ast("a"), 0, "a")
              ]);
              cd.hydrate(new TestData('value'), null, null);

              expect(() => {
                cd.checkNoChanges();
              }).toThrowError(new RegExp("Expression 'a in location' has changed after it was checked"));
            });
          });

          //TODO vsavkin: implement it
          describe("error handling", () => {
            xit("should wrap exceptions into ChangeDetectionError", () => {
              var pcd = createProtoChangeDetector();
              var cd = pcd.instantiate(new TestDispatcher(), [
                BindingRecord.createForElement(ast("invalidProp"), 0, "a")
              ], null, []);
              cd.hydrate(null, null);

              try {
                cd.detectChanges();

                throw new BaseException("fail");
              } catch (e) {
                expect(e).toBeAnInstanceOf(ChangeDetectionError);
                expect(e.location).toEqual("invalidProp in someComponent");
              }
            });
          });

          describe("Locals", () => {
            it('should read a value from locals', () => {
              var locals = new Locals(null,
                MapWrapper.createFromPairs([["key", "value"]]));

              expect(executeWatch('key', 'key', null, locals))
                .toEqual(['key=value']);
            });

            it('should invoke a function from local', () => {
              var locals = new Locals(null,
                MapWrapper.createFromPairs([["key", () => "value"]]));

              expect(executeWatch('key', 'key()', null, locals))
                .toEqual(['key=value']);
            });

            it('should handle nested locals', () => {
              var nested = new Locals(null,
                MapWrapper.createFromPairs([["key", "value"]]));
              var locals = new Locals(nested, MapWrapper.create());

              expect(executeWatch('key', 'key', null, locals))
                .toEqual(['key=value']);
            });

            it("should fall back to a regular field read when the locals map" +
              "does not have the requested field", () => {
              var locals = new Locals(null,
                MapWrapper.createFromPairs([["key", "value"]]));

              expect(executeWatch('name', 'name', new Person("Jim"), locals))
                .toEqual(['name=Jim']);
            });
          });

          describe("handle children", () => {
            var parent, child;

            beforeEach(() => {
              var protoParent = createProtoChangeDetector();
              parent = instantiate(protoParent, null, []);

              var protoChild = createProtoChangeDetector();
              child = instantiate(protoChild, null, []);
            });

            it("should add light dom children", () => {
              parent.addChild(child);

              expect(parent.lightDomChildren.length).toEqual(1);
              expect(parent.lightDomChildren[0]).toBe(child);
            });

            it("should add shadow dom children", () => {
              parent.addShadowDomChild(child);

              expect(parent.shadowDomChildren.length).toEqual(1);
              expect(parent.shadowDomChildren[0]).toBe(child);
            });

            it("should remove light dom children", () => {
              parent.addChild(child);
              parent.removeChild(child);

              expect(parent.lightDomChildren).toEqual([]);
            });
          });
        });

        describe("mode", () => {
          it("should set the mode to CHECK_ALWAYS when the default change detection is used", () => {
            var proto = createProtoChangeDetector(null, DEFAULT);
            var cd = proto.instantiate(null, [], [], []);

            expect(cd.mode).toEqual(null);

            cd.hydrate(null, null, null);

            expect(cd.mode).toEqual(CHECK_ALWAYS);
          });

          it("should set the mode to CHECK_ONCE when the push change detection is used", () => {
            var proto = createProtoChangeDetector(null, ON_PUSH);
            var cd = proto.instantiate(null, [], [], []);
            cd.hydrate(null, null, null);

            expect(cd.mode).toEqual(CHECK_ONCE);
          });

          it("should not check a detached change detector", () => {
            var c = createChangeDetector('name', 'a', new TestData("value"));
            var cd = c["changeDetector"];
            var dispatcher = c["dispatcher"];

            cd.mode = DETACHED;
            cd.detectChanges();

            expect(dispatcher.log).toEqual([]);
          });

          it("should not check a checked change detector", () => {
            var c = createChangeDetector('name', 'a', new TestData("value"));
            var cd = c["changeDetector"];
            var dispatcher = c["dispatcher"];

            cd.mode = CHECKED;
            cd.detectChanges();

            expect(dispatcher.log).toEqual([]);
          });

          it("should change CHECK_ONCE to CHECKED", () => {
            var cd = instantiate(createProtoChangeDetector(), null, []);
            cd.mode = CHECK_ONCE;

            cd.detectChanges();

            expect(cd.mode).toEqual(CHECKED);
          });

          it("should not change the CHECK_ALWAYS", () => {
            var cd = instantiate(createProtoChangeDetector(), null, []);
            cd.mode = CHECK_ALWAYS;

            cd.detectChanges();

            expect(cd.mode).toEqual(CHECK_ALWAYS);
          });
        });

        describe("markPathToRootAsCheckOnce", () => {
          function changeDetector(mode, parent) {
            var cd = instantiate(createProtoChangeDetector(), null, []);
            cd.mode = mode;
            if (isPresent(parent)) parent.addChild(cd);
            return cd;
          }

          it("should mark all checked detectors as CHECK_ONCE " +
            "until reaching a detached one", () => {

            var root = changeDetector(CHECK_ALWAYS, null);
            var disabled = changeDetector(DETACHED, root);
            var parent = changeDetector(CHECKED, disabled);
            var checkAlwaysChild = changeDetector(CHECK_ALWAYS, parent);
            var checkOnceChild = changeDetector(CHECK_ONCE, checkAlwaysChild);
            var checkedChild = changeDetector(CHECKED, checkOnceChild);

            checkedChild.markPathToRootAsCheckOnce();

            expect(root.mode).toEqual(CHECK_ALWAYS);
            expect(disabled.mode).toEqual(DETACHED);
            expect(parent.mode).toEqual(CHECK_ONCE);
            expect(checkAlwaysChild.mode).toEqual(CHECK_ALWAYS);
            expect(checkOnceChild.mode).toEqual(CHECK_ONCE);
            expect(checkedChild.mode).toEqual(CHECK_ONCE);
          });
        });

        describe("hydration", () => {
          it("should be able to rehydrate a change detector", () => {
            var c  = createChangeDetector("memo", "name");
            var cd = c["changeDetector"];

            cd.hydrate("some context", null, null);
            expect(cd.hydrated()).toBe(true);

            cd.dehydrate();
            expect(cd.hydrated()).toBe(false);

            cd.hydrate("other context", null, null);
            expect(cd.hydrated()).toBe(true);
          });

          it("should destroy all active pipes during dehyration", () => {
            var pipe = new OncePipe();
            var registry = new FakePipeRegistry('pipe', () => pipe);
            var c  = createChangeDetector("memo", "name | pipe", new Person('bob'), null, registry);
            var cd = c["changeDetector"];

            cd.detectChanges();

            cd.dehydrate();

            expect(pipe.destroyCalled).toBe(true);
          });
        });

        describe("pipes", () => {
          it("should support pipes", () => {
            var registry = new FakePipeRegistry('pipe', () => new CountingPipe());
            var ctx = new Person("Megatron");

            var c  = createChangeDetector("memo", "name | pipe", ctx, null, registry);
            var cd = c["changeDetector"];
            var dispatcher = c["dispatcher"];

            cd.detectChanges();

            expect(dispatcher.log).toEqual(['memo=Megatron state:0']);

            dispatcher.clear();
            cd.detectChanges();

            expect(dispatcher.log).toEqual(['memo=Megatron state:1']);
          });

          it("should lookup pipes in the registry when the context is not supported", () => {
            var registry = new FakePipeRegistry('pipe', () => new OncePipe());
            var ctx = new Person("Megatron");

            var c  = createChangeDetector("memo", "name | pipe", ctx, null, registry);
            var cd = c["changeDetector"];

            cd.detectChanges();

            expect(registry.numberOfLookups).toEqual(1);

            ctx.name = "Optimus Prime";
            cd.detectChanges();

            expect(registry.numberOfLookups).toEqual(2);
          });

          it("should invoke onDestroy on a pipe before switching to another one", () => {
            var pipe = new OncePipe();
            var registry = new FakePipeRegistry('pipe', () => pipe);
            var ctx = new Person("Megatron");

            var c  = createChangeDetector("memo", "name | pipe", ctx, null, registry);
            var cd = c["changeDetector"];

            cd.detectChanges();
            ctx.name = "Optimus Prime";
            cd.detectChanges();

            expect(pipe.destroyCalled).toEqual(true);
          });

          it("should inject the binding propagation configuration " +
            "of the encompassing component into a pipe", () => {

            var registry = new FakePipeRegistry('pipe', () => new IdentityPipe());
            var c = createChangeDetector("memo", "name | pipe", new Person('bob'), null, registry);
            var cd = c["changeDetector"];

            cd.detectChanges();

            expect(registry.bpc).toBe(cd.bindingPropagationConfig);
          });
        });

        it("should do nothing when returns NO_CHANGE", () => {
          var registry = new FakePipeRegistry('pipe', () => new IdentityPipe())
          var ctx = new Person("Megatron");

          var c  = createChangeDetector("memo", "name | pipe", ctx, null, registry);
          var cd = c["changeDetector"];
          var dispatcher = c["dispatcher"];

          cd.detectChanges();
          cd.detectChanges();

          expect(dispatcher.log).toEqual(['memo=Megatron']);

          ctx.name = "Optimus Prime";
          dispatcher.clear();
          cd.detectChanges();

          expect(dispatcher.log).toEqual(['memo=Optimus Prime']);
        });
      });
  });
}

class CountingPipe extends Pipe {
  state:number;

  constructor() {
    super();
    this.state = 0;
  }

  supports(newValue) {
    return true;
  }

  transform(value) {
    return `${value} state:${this.state ++}`;
  }
}

class OncePipe extends Pipe {
  called:boolean;
  destroyCalled:boolean;

  constructor() {
    super();
    this.called = false;
    this.destroyCalled = false;
  }

  supports(newValue) {
    return !this.called;
  }

  onDestroy() {
    this.destroyCalled = true;
  }

  transform(value) {
    this.called = true;
    return value;
  }
}

class IdentityPipe extends Pipe {
  state:any;

  supports(newValue) {
    return true;
  }

  transform(value) {
    if (this.state === value) {
      return NO_CHANGE;
    } else {
      this.state = value;
      return value;
    }
  }
}

class FakePipeRegistry extends PipeRegistry {
  numberOfLookups:number;
  pipeType:string;
  factory:Function;
  bpc:any;

  constructor(pipeType, factory) {
    super({});
    this.pipeType = pipeType;
    this.factory = factory;
    this.numberOfLookups = 0;
  }

  get(type:string, obj, bpc) {
    if (type != this.pipeType) return null;
    this.numberOfLookups ++;
    this.bpc = bpc;
    return this.factory();
  }
}

class TestDirective {
  a;
  b;
  changes;
  onChangesDoneCalled;
  onChangesDoneSpy;

  constructor(onChangesDoneSpy = null) {
    this.onChangesDoneCalled = false;
    this.onChangesDoneSpy = onChangesDoneSpy;
    this.a = null;
    this.b = null;
    this.changes = null;
  }

  onChange(changes) {
    var r = {};
    StringMapWrapper.forEach(changes, (c, key) => r[key] = c.currentValue);
    this.changes = r;
  }

  onAllChangesDone() {
    this.onChangesDoneCalled = true;
    if(isPresent(this.onChangesDoneSpy)) {
      this.onChangesDoneSpy();
    }
  }
}

class Person {
  name:string;
  age:number;
  address:Address;
  constructor(name:string, address:Address = null) {
    this.name = name;
    this.address = address;
  }

  sayHi(m) {
    return `Hi, ${m}`;
  }

  toString():string {
    var address = this.address == null ? '' : ' address=' + this.address.toString();

    return 'name=' + this.name + address;
  }
}

class Address {
  city:string;
  constructor(city:string) {
    this.city = city;
  }

  toString():string {
    return this.city;
  }
}

class Uninitialized {
  value:any;
}

class TestData {
  a;

  constructor(a) {
    this.a = a;
  }
}

class FakeDirectives {
  directives:List;

  constructor(directives:List) {
    this.directives = directives;
  }

  directive(directiveRecord:DirectiveRecord) {
    return this.directives[directiveRecord.directiveIndex];
  }
}

class TestDispatcher extends ChangeDispatcher {
  log:List;
  loggedValues:List;

  constructor() {
    super();
    this.clear();
  }

  clear() {
    this.log = ListWrapper.create();
    this.loggedValues = ListWrapper.create();
  }

  notifyOnBinding(binding, value) {
    ListWrapper.push(this.log, `${binding.propertyName}=${this._asString(value)}`);
    ListWrapper.push(this.loggedValues, value);
  }

  _asString(value) {
    return (isBlank(value) ? 'null' : value.toString());
  }
}