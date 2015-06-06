import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  IS_DARTIUM
} from 'angular2/test_lib';

import {
  isPresent,
  isBlank,
  isJsObject,
  BaseException,
  FunctionWrapper
} from 'angular2/src/facade/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {
  ChangeDispatcher,
  DynamicChangeDetector,
  ChangeDetectionError,
  BindingRecord,
  DirectiveRecord,
  DirectiveIndex,
  PipeRegistry,
  Pipe,
  CHECK_ALWAYS,
  CHECK_ONCE,
  CHECKED,
  DETACHED,
  ON_PUSH,
  DEFAULT,
  WrappedValue,
  JitProtoChangeDetector,
  DynamicProtoChangeDetector,
  ChangeDetectorDefinition,
  Lexer,
  Parser,
  Locals,
  ProtoChangeDetector
} from 'angular2/change_detection';

import {getDefinition} from './simple_watch_config';
import {getFactoryById} from './generated/simple_watch_classes';


export function main() {
  // These tests also run against pre-generated Dart Change Detectors. We will move tests up from
  // the loop below as they are converted.
  ListWrapper.forEach(['dynamic', 'JIT', 'Pregen'], (cdType) => {

    if (cdType == "JIT" && IS_DARTIUM) return;
    if (cdType == "Pregen" && !IS_DARTIUM) return;

    describe(`${cdType} Change Detector`, () => {

      function _getProtoChangeDetector(def: ChangeDetectorDefinition) {
        var registry = null;
        switch (cdType) {
          case 'dynamic':
            return new DynamicProtoChangeDetector(registry, def);
          case 'JIT':
            return new JitProtoChangeDetector(registry, def);
          case 'Pregen':
            return getFactoryById(def.id)(registry, def);
          default:
            return null;
        }
      }

      function _bindSimpleValue(expression: string, context = null) {
        var dispatcher = new TestDispatcher();
        var testDef = getDefinition(expression);
        var protoCd = _getProtoChangeDetector(testDef.cdDef);
        var cd = protoCd.instantiate(dispatcher);

        cd.hydrate(context, testDef.locals, null);
        cd.detectChanges();
        return dispatcher.log;
      }

      it('should support literals',
         () => { expect(_bindSimpleValue('10')).toEqual(['propName=10']); });

      it('should strip quotes from literals',
         () => { expect(_bindSimpleValue('"str"')).toEqual(['propName=str']); });

      it('should support newlines in literals',
         () => { expect(_bindSimpleValue('"a\n\nb"')).toEqual(['propName=a\n\nb']); });

      it('should support + operations',
         () => { expect(_bindSimpleValue('10 + 2')).toEqual(['propName=12']); });

      it('should support - operations',
         () => { expect(_bindSimpleValue('10 - 2')).toEqual(['propName=8']); });

      it('should support * operations',
         () => { expect(_bindSimpleValue('10 * 2')).toEqual(['propName=20']); });

      it('should support / operations', () => {
        expect(_bindSimpleValue('10 / 2')).toEqual([`propName=${5.0}`]);
      });  // dart exp=5.0, js exp=5

      it('should support % operations',
         () => { expect(_bindSimpleValue('11 % 2')).toEqual(['propName=1']); });

      it('should support == operations on identical',
         () => { expect(_bindSimpleValue('1 == 1')).toEqual(['propName=true']); });

      it('should support != operations',
         () => { expect(_bindSimpleValue('1 != 1')).toEqual(['propName=false']); });

      it('should support == operations on coerceible', () => {
        var expectedValue = IS_DARTIUM ? 'false' : 'true';
        expect(_bindSimpleValue('1 == true')).toEqual([`propName=${expectedValue}`]);
      });

      it('should support === operations on identical',
         () => { expect(_bindSimpleValue('1 === 1')).toEqual(['propName=true']); });

      it('should support !== operations',
         () => { expect(_bindSimpleValue('1 !== 1')).toEqual(['propName=false']); });

      it('should support === operations on coerceible',
         () => { expect(_bindSimpleValue('1 === true')).toEqual(['propName=false']); });

      it('should support true < operations',
         () => { expect(_bindSimpleValue('1 < 2')).toEqual(['propName=true']); });

      it('should support false < operations',
         () => { expect(_bindSimpleValue('2 < 1')).toEqual(['propName=false']); });

      it('should support false > operations',
         () => { expect(_bindSimpleValue('1 > 2')).toEqual(['propName=false']); });

      it('should support true > operations',
         () => { expect(_bindSimpleValue('2 > 1')).toEqual(['propName=true']); });

      it('should support true <= operations',
         () => { expect(_bindSimpleValue('1 <= 2')).toEqual(['propName=true']); });

      it('should support equal <= operations',
         () => { expect(_bindSimpleValue('2 <= 2')).toEqual(['propName=true']); });

      it('should support false <= operations',
         () => { expect(_bindSimpleValue('2 <= 1')).toEqual(['propName=false']); });

      it('should support true >= operations',
         () => { expect(_bindSimpleValue('2 >= 1')).toEqual(['propName=true']); });

      it('should support equal >= operations',
         () => { expect(_bindSimpleValue('2 >= 2')).toEqual(['propName=true']); });

      it('should support false >= operations',
         () => { expect(_bindSimpleValue('1 >= 2')).toEqual(['propName=false']); });

      it('should support true && operations',
         () => { expect(_bindSimpleValue('true && true')).toEqual(['propName=true']); });

      it('should support false && operations',
         () => { expect(_bindSimpleValue('true && false')).toEqual(['propName=false']); });

      it('should support true || operations',
         () => { expect(_bindSimpleValue('true || false')).toEqual(['propName=true']); });

      it('should support false || operations',
         () => { expect(_bindSimpleValue('false || false')).toEqual(['propName=false']); });

      it('should support negate',
         () => { expect(_bindSimpleValue('!true')).toEqual(['propName=false']); });

      it('should support double negate',
         () => { expect(_bindSimpleValue('!!true')).toEqual(['propName=true']); });

      it('should support true conditionals',
         () => { expect(_bindSimpleValue('1 < 2 ? 1 : 2')).toEqual(['propName=1']); });

      it('should support false conditionals',
         () => { expect(_bindSimpleValue('1 > 2 ? 1 : 2')).toEqual(['propName=2']); });

      it('should support keyed access to a list item',
         () => { expect(_bindSimpleValue('["foo", "bar"][0]')).toEqual(['propName=foo']); });

      it('should support keyed access to a map item',
         () => { expect(_bindSimpleValue('{"foo": "bar"}["foo"]')).toEqual(['propName=bar']); });

      it('should report all changes on the first run including uninitialized values', () => {
        expect(_bindSimpleValue('value', new Uninitialized())).toEqual(['propName=null']);
      });

      it('should report all changes on the first run including null values', () => {
        var td = new TestData(null);
        expect(_bindSimpleValue('a', td)).toEqual(['propName=null']);
      });

      it('should support simple chained property access', () => {
        var address = new Address('Grenoble');
        var person = new Person('Victor', address);

        expect(_bindSimpleValue('address.city', person)).toEqual(['propName=Grenoble']);
      });

      it('should support the safe navigation operator', () => {
        var person = new Person('Victor', null);

        expect(_bindSimpleValue('address?.city', person)).toEqual(['propName=null']);
        expect(_bindSimpleValue('address?.toString()', person)).toEqual(['propName=null']);

        person.address = new Address('MTV');

        expect(_bindSimpleValue('address?.city', person)).toEqual(['propName=MTV']);
        expect(_bindSimpleValue('address?.toString()', person)).toEqual(['propName=MTV']);
      });

      it("should support method calls", () => {
        var person = new Person('Victor');
        expect(_bindSimpleValue('sayHi("Jim")', person)).toEqual(['propName=Hi, Jim']);
      });

      it("should support function calls", () => {
        var td = new TestData(() => (a) => a);
        expect(_bindSimpleValue('a()(99)', td)).toEqual(['propName=99']);
      });

      it("should support chained method calls", () => {
        var person = new Person('Victor');
        var td = new TestData(person);
        expect(_bindSimpleValue('a.sayHi("Jim")', td)).toEqual(['propName=Hi, Jim']);
      });

      describe("Locals", () => {
        it('should read a value from locals',
           () => { expect(_bindSimpleValue('valueFromLocals')).toEqual(['propName=value']); });

        it('should invoke a function from local',
           () => { expect(_bindSimpleValue('functionFromLocals')).toEqual(['propName=value']); });

        it('should handle nested locals',
           () => { expect(_bindSimpleValue('nestedLocals')).toEqual(['propName=value']); });

        it("should fall back to a regular field read when the locals map" +
               "does not have the requested field",
           () => {
             expect(_bindSimpleValue('fallbackLocals', new Person("Jim")))
                 .toEqual(['propName=Jim']);
           });

        it('should correctly handle nested properties', () => {
          var address = new Address('Grenoble');
          var person = new Person('Victor', address);

          expect(_bindSimpleValue('contextNestedPropertyWithLocals', person))
              .toEqual(['propName=Grenoble']);
          expect(_bindSimpleValue('localPropertyWithSimilarContext', person))
              .toEqual(['propName=MTV']);
        });
      });
    });
  });

  describe("change detection", () => {
    StringMapWrapper.forEach(
        {
          "dynamic": (bindingRecords, variableBindings = null, directiveRecords = null,
                      registry = null, strategy = null) =>
                             new DynamicProtoChangeDetector(
                                 registry, new ChangeDetectorDefinition(
                                               null, strategy,
                                               isBlank(variableBindings) ? [] : variableBindings,
                                               isBlank(bindingRecords) ? [] : bindingRecords,
                                               isBlank(directiveRecords) ? [] : directiveRecords)),

          "JIT": (bindingRecords, variableBindings = null, directiveRecords = null, registry = null,
                  strategy = null) =>
                         new JitProtoChangeDetector(
                             registry, new ChangeDetectorDefinition(
                                           null,
                                           strategy, isBlank(variableBindings) ? [] :
                                                                                 variableBindings,
                                           isBlank(bindingRecords) ? [] : bindingRecords,
                                           isBlank(directiveRecords) ? [] : directiveRecords))

        },
        (createProtoChangeDetector, name) => {

          if (name == "JIT" && IS_DARTIUM) return;

          var parser = new Parser(new Lexer());

          function ast(exp: string, location: string = 'location') {
            return parser.parseBinding(exp, location);
          }

          function dirs(directives: List<any>) { return new FakeDirectives(directives, []); }

          function createChangeDetector(propName: string, exp: string, context = null,
                                        registry = null) {
            var dispatcher = new TestDispatcher();

            var locals = null;
            var variableBindings = [];

            var records = [BindingRecord.createForElement(ast(exp), 0, propName)];
            var pcd = createProtoChangeDetector(records, variableBindings, [], registry);
            var cd = pcd.instantiate(dispatcher);
            cd.hydrate(context, locals, null);

            return {"changeDetector": cd, "dispatcher": dispatcher};
          }

          describe(`${name} change detection`, () => {
            var dispatcher;

            beforeEach(() => { dispatcher = new TestDispatcher(); });

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

            it("should support interpolation", () => {
              var ast = parser.parseInterpolation("B{{a}}A", "location");
              var pcd = createProtoChangeDetector([BindingRecord.createForElement(ast, 0, "memo")]);

              var cd = pcd.instantiate(dispatcher);
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
                  var c = createChangeDetector('name', 'name | pipe', person, registry);
                  var cd = c["changeDetector"];
                  var dispatcher = c["dispatcher"];

                  cd.detectChanges();

                  expect(dispatcher.loggedValues).toEqual(['bob state:0']);
                });
              });

              describe("updating directives", () => {
                var dirRecord1 = new DirectiveRecord({
                  directiveIndex: new DirectiveIndex(0, 0),
                  callOnChange: true,
                  callOnCheck: true,
                  callOnAllChangesDone: true
                });

                var dirRecord2 = new DirectiveRecord({
                  directiveIndex: new DirectiveIndex(0, 1),
                  callOnChange: true,
                  callOnCheck: true,
                  callOnAllChangesDone: true
                });

                var dirRecordNoCallbacks = new DirectiveRecord({
                  directiveIndex: new DirectiveIndex(0, 0),
                  callOnChange: false,
                  callOnCheck: false,
                  callOnAllChangesDone: false
                });

                function updateA(exp: string, dirRecord) {
                  return BindingRecord.createForDirective(ast(exp), "a", (o, v) => o.a = v,
                                                          dirRecord);
                }

                function updateB(exp: string, dirRecord) {
                  return BindingRecord.createForDirective(ast(exp), "b", (o, v) => o.b = v,
                                                          dirRecord);
                }

                var directive1;
                var directive2;

                beforeEach(() => {
                  directive1 = new TestDirective();
                  directive2 = new TestDirective();
                });

                it("should happen directly, without invoking the dispatcher", () => {
                  var pcd =
                      createProtoChangeDetector([updateA("42", dirRecord1)], [], [dirRecord1]);

                  var cd = pcd.instantiate(dispatcher);

                  cd.hydrate(null, null, dirs([directive1]));

                  cd.detectChanges();

                  expect(dispatcher.loggedValues).toEqual([]);
                  expect(directive1.a).toEqual(42);
                });

                describe("onChange", () => {
                  it("should notify the directive when a group of records changes", () => {
                    var pcd = createProtoChangeDetector([
                      updateA("1", dirRecord1),
                      updateB("2", dirRecord1),
                      BindingRecord.createDirectiveOnChange(dirRecord1),
                      updateA("3", dirRecord2),
                      BindingRecord.createDirectiveOnChange(dirRecord2)
                    ],
                                                        [], [dirRecord1, dirRecord2]);

                    var cd = pcd.instantiate(dispatcher);

                    cd.hydrate(null, null, dirs([directive1, directive2]));

                    cd.detectChanges();

                    expect(directive1.changes).toEqual({'a': 1, 'b': 2});
                    expect(directive2.changes).toEqual({'a': 3});
                  });
                });

                describe("onCheck", () => {
                  it("should notify the directive when it is checked", () => {
                    var pcd = createProtoChangeDetector(
                        [BindingRecord.createDirectiveOnCheck(dirRecord1)], [], [dirRecord1]);


                    var cd = pcd.instantiate(dispatcher);

                    cd.hydrate(null, null, dirs([directive1]));

                    cd.detectChanges();

                    expect(directive1.onCheckCalled).toBe(true);

                    directive1.onCheckCalled = false;

                    cd.detectChanges();

                    expect(directive1.onCheckCalled).toBe(true);
                  });

                  it("should not call onCheck in detectNoChanges", () => {
                    var pcd = createProtoChangeDetector(
                        [BindingRecord.createDirectiveOnCheck(dirRecord1)], [], [dirRecord1]);


                    var cd = pcd.instantiate(dispatcher);

                    cd.hydrate(null, null, dirs([directive1]));

                    cd.checkNoChanges();

                    expect(directive1.onCheckCalled).toBe(false);
                  });
                });

                describe("onInit", () => {
                  it("should notify the directive after it has been checked the first time", () => {
                    var pcd = createProtoChangeDetector(
                        [BindingRecord.createDirectiveOnInit(dirRecord1)], [], [dirRecord1]);


                    var cd = pcd.instantiate(dispatcher);

                    cd.hydrate(null, null, dirs([directive1]));

                    cd.detectChanges();

                    expect(directive1.onInitCalled).toBe(true);

                    directive1.onInitCalled = false;

                    cd.detectChanges();

                    expect(directive1.onInitCalled).toBe(false);
                  });

                  it("should not call onInit in detectNoChanges", () => {
                    var pcd = createProtoChangeDetector(
                        [BindingRecord.createDirectiveOnInit(dirRecord1)], [], [dirRecord1]);


                    var cd = pcd.instantiate(dispatcher);

                    cd.hydrate(null, null, dirs([directive1]));

                    cd.checkNoChanges();

                    expect(directive1.onInitCalled).toBe(false);
                  });
                });

                describe("onAllChangesDone", () => {
                  it("should be called after processing all the children", () => {
                    var pcd = createProtoChangeDetector([], [], [dirRecord1, dirRecord2]);

                    var cd = pcd.instantiate(dispatcher);
                    cd.hydrate(null, null, dirs([directive1, directive2]));

                    cd.detectChanges();

                    expect(directive1.onChangesDoneCalled).toBe(true);
                    expect(directive2.onChangesDoneCalled).toBe(true);

                    // reset directives
                    directive1.onChangesDoneCalled = false;
                    directive2.onChangesDoneCalled = false;

                    // Verify that checking should not call them.
                    cd.checkNoChanges();

                    expect(directive1.onChangesDoneCalled).toBe(false);
                    expect(directive2.onChangesDoneCalled).toBe(false);

                    // re-verify that changes are still detected
                    cd.detectChanges();

                    expect(directive1.onChangesDoneCalled).toBe(true);
                    expect(directive2.onChangesDoneCalled).toBe(true);
                  });


                  it("should not be called when onAllChangesDone is false", () => {
                    var pcd = createProtoChangeDetector([updateA("1", dirRecordNoCallbacks)], [],
                                                        [dirRecordNoCallbacks]);

                    var cd = pcd.instantiate(dispatcher);

                    cd.hydrate(null, null, dirs([directive1]));

                    cd.detectChanges();

                    expect(directive1.onChangesDoneCalled).toEqual(false);
                  });

                  it("should be called in reverse order so the child is always notified before the parent",
                     () => {
                       var pcd = createProtoChangeDetector([], [], [dirRecord1, dirRecord2]);
                       var cd = pcd.instantiate(dispatcher);

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
                    var pcd = createProtoChangeDetector([], null, [dirRecord1]);
                    var shadowDomChildPCD =
                        createProtoChangeDetector([updateA("1", dirRecord1)], null, [dirRecord1]);

                    var parent = pcd.instantiate(dispatcher);

                    var child = shadowDomChildPCD.instantiate(dispatcher);
                    parent.addShadowDomChild(child);

                    var directiveInShadowDom = new TestDirective();
                    var parentDirective =
                        new TestDirective(() => { expect(directiveInShadowDom.a).toBe(null); });

                    parent.hydrate(null, null, dirs([parentDirective]));
                    child.hydrate(null, null, dirs([directiveInShadowDom]));

                    parent.detectChanges();
                  });
                });
              });
            });

            describe("reading directives", () => {
              var index = new DirectiveIndex(0, 0);
              var dirRecord = new DirectiveRecord({directiveIndex: new DirectiveIndex(0, 0)});

              it("should read directive properties", () => {
                var directive = new TestDirective();
                directive.a = "aaa";

                var pcd = createProtoChangeDetector(
                    [BindingRecord.createForHostProperty(index, ast("a"), "prop")], null,
                    [dirRecord]);
                var cd = pcd.instantiate(dispatcher);
                cd.hydrate(null, null, dirs([directive]));

                cd.detectChanges();

                expect(dispatcher.loggedValues).toEqual(['aaa']);
              });
            });

            describe("enforce no new changes", () => {
              it("should throw when a record gets changed after it has been checked", () => {
                var pcd =
                    createProtoChangeDetector([BindingRecord.createForElement(ast("a"), 0, "a")]);

                var dispatcher = new TestDispatcher();
                var cd = pcd.instantiate(dispatcher);
                cd.hydrate(new TestData('value'), null, null);

                expect(() => { cd.checkNoChanges(); })
                    .toThrowError(
                        new RegExp("Expression 'a in location' has changed after it was checked"));
              });

              it("should not break the next run", () => {
                var pcd =
                    createProtoChangeDetector([BindingRecord.createForElement(ast("a"), 0, "a")]);

                var dispatcher = new TestDispatcher();
                var cd = pcd.instantiate(dispatcher);
                cd.hydrate(new TestData('value'), null, null);

                expect(() => cd.checkNoChanges())
                    .toThrowError(
                        new RegExp("Expression 'a in location' has changed after it was checked."));

                cd.detectChanges();

                expect(dispatcher.loggedValues).toEqual(['value']);
              });
            });

            // TODO vsavkin: implement it
            describe("error handling", () => {
              xit("should wrap exceptions into ChangeDetectionError", () => {
                var pcd = createProtoChangeDetector();
                var cd = pcd.instantiate(
                    new TestDispatcher(),
                    [BindingRecord.createForElement(ast("invalidProp"), 0, "a")], null, []);
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

            describe("handle children", () => {
              var parent, child;

              beforeEach(() => {
                parent = createProtoChangeDetector([]).instantiate(null);
                child = createProtoChangeDetector([]).instantiate(null);
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

              it("should remove shadow dom children", () => {
                parent.addShadowDomChild(child);
                parent.removeShadowDomChild(child);

                expect(parent.shadowDomChildren.length).toEqual(0);
              });
            });
          });

          describe("mode", () => {
            it("should set the mode to CHECK_ALWAYS when the default change detection is used",
               () => {
                 var proto = createProtoChangeDetector([], [], [], null, DEFAULT);
                 var cd = proto.instantiate(null);

                 expect(cd.mode).toEqual(null);

                 cd.hydrate(null, null, null);

                 expect(cd.mode).toEqual(CHECK_ALWAYS);
               });

            it("should set the mode to CHECK_ONCE when the push change detection is used", () => {
              var proto = createProtoChangeDetector([], [], [], null, ON_PUSH);
              var cd = proto.instantiate(null);
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
              var cd = createProtoChangeDetector([]).instantiate(null);
              cd.mode = CHECK_ONCE;

              cd.detectChanges();

              expect(cd.mode).toEqual(CHECKED);
            });

            it("should not change the CHECK_ALWAYS", () => {
              var cd = createProtoChangeDetector([]).instantiate(null);
              cd.mode = CHECK_ALWAYS;

              cd.detectChanges();

              expect(cd.mode).toEqual(CHECK_ALWAYS);
            });

            describe("marking ON_PUSH detectors as CHECK_ONCE after an update", () => {
              var checkedDetector;
              var dirRecordWithOnPush;
              var updateDirWithOnPushRecord;
              var directives;

              beforeEach(() => {
                var proto = createProtoChangeDetector([], [], [], null, ON_PUSH);
                checkedDetector = proto.instantiate(null);
                checkedDetector.hydrate(null, null, null);
                checkedDetector.mode = CHECKED;

                // this directive is a component with ON_PUSH change detection
                dirRecordWithOnPush = new DirectiveRecord(
                    {directiveIndex: new DirectiveIndex(0, 0), changeDetection: ON_PUSH});

                // a record updating a component
                updateDirWithOnPushRecord = BindingRecord.createForDirective(
                    ast("42"), "a", (o, v) => o.a = v, dirRecordWithOnPush);

                var targetDirective = new TestData(null);
                directives = new FakeDirectives([targetDirective], [checkedDetector]);
              });

              it("should set the mode to CHECK_ONCE when a binding is updated", () => {
                var proto = createProtoChangeDetector([updateDirWithOnPushRecord], [],
                                                      [dirRecordWithOnPush]);

                var cd = proto.instantiate(null);
                cd.hydrate(null, null, directives);

                expect(checkedDetector.mode).toEqual(CHECKED);

                // evaluate the record, update the targetDirective, and mark its detector as
                // CHECK_ONCE
                cd.detectChanges();

                expect(checkedDetector.mode).toEqual(CHECK_ONCE);
              });
            });
          });

          describe("markPathToRootAsCheckOnce", () => {
            function changeDetector(mode, parent) {
              var cd = createProtoChangeDetector([]).instantiate(null);
              cd.mode = mode;
              if (isPresent(parent)) parent.addChild(cd);
              return cd;
            }

            it("should mark all checked detectors as CHECK_ONCE " + "until reaching a detached one",
               () => {

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
              var c = createChangeDetector("memo", "name");
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
              var c = createChangeDetector("memo", "name | pipe", new Person('bob'), registry);
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

              var c = createChangeDetector("memo", "name | pipe", ctx, registry);
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

              var c = createChangeDetector("memo", "name | pipe", ctx, registry);
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

              var c = createChangeDetector("memo", "name | pipe", ctx, registry);
              var cd = c["changeDetector"];

              cd.detectChanges();
              ctx.name = "Optimus Prime";
              cd.detectChanges();

              expect(pipe.destroyCalled).toEqual(true);
            });

            it("should inject the ChangeDetectorRef " + "of the encompassing component into a pipe",
               () => {

                 var registry = new FakePipeRegistry('pipe', () => new IdentityPipe());
                 var c = createChangeDetector("memo", "name | pipe", new Person('bob'), registry);
                 var cd = c["changeDetector"];

                 cd.detectChanges();

                 expect(registry.cdRef).toBe(cd.ref);
               });
          });

          it("should do nothing when no change", () => {
            var registry = new FakePipeRegistry('pipe', () => new IdentityPipe());
            var ctx = new Person("Megatron");

            var c = createChangeDetector("memo", "name | pipe", ctx, registry);
            var cd = c["changeDetector"];
            var dispatcher = c["dispatcher"];

            cd.detectChanges();

            expect(dispatcher.log).toEqual(['memo=Megatron']);

            dispatcher.clear();
            cd.detectChanges();

            expect(dispatcher.log).toEqual([]);
          });

          it("should unwrap the wrapped value", () => {
            var registry = new FakePipeRegistry('pipe', () => new WrappedPipe());
            var ctx = new Person("Megatron");

            var c = createChangeDetector("memo", "name | pipe", ctx, registry);
            var cd = c["changeDetector"];
            var dispatcher = c["dispatcher"];

            cd.detectChanges();

            expect(dispatcher.log).toEqual(['memo=Megatron']);
          });
        });
  });
}

class CountingPipe extends Pipe {
  state: number;

  constructor() {
    super();
    this.state = 0;
  }

  supports(newValue) { return true; }

  transform(value) { return `${value} state:${this.state ++}`; }
}

class OncePipe extends Pipe {
  called: boolean;
  destroyCalled: boolean;

  constructor() {
    super();
    this.called = false;
    this.destroyCalled = false;
  }

  supports(newValue) { return !this.called; }

  onDestroy() { this.destroyCalled = true; }

  transform(value) {
    this.called = true;
    return value;
  }
}

class IdentityPipe extends Pipe {
  transform(value) { return value; }
}

class WrappedPipe extends Pipe {
  transform(value) { return WrappedValue.wrap(value); }
}

class FakePipeRegistry extends PipeRegistry {
  numberOfLookups: number;
  pipeType: string;
  factory: Function;
  cdRef: any;

  constructor(pipeType, factory) {
    super({});
    this.pipeType = pipeType;
    this.factory = factory;
    this.numberOfLookups = 0;
  }

  get(type: string, obj, cdRef) {
    if (type != this.pipeType) return null;
    this.numberOfLookups++;
    this.cdRef = cdRef;
    return this.factory();
  }
}

class TestDirective {
  a;
  b;
  changes;
  onChangesDoneCalled;
  onChangesDoneSpy;
  onCheckCalled;
  onInitCalled;

  constructor(onChangesDoneSpy = null) {
    this.onChangesDoneCalled = false;
    this.onCheckCalled = false;
    this.onInitCalled = false;
    this.onChangesDoneSpy = onChangesDoneSpy;
    this.a = null;
    this.b = null;
    this.changes = null;
  }

  onCheck() { this.onCheckCalled = true; }

  onInit() { this.onInitCalled = true; }

  onChange(changes) {
    var r = {};
    StringMapWrapper.forEach(changes, (c, key) => r[key] = c.currentValue);
    this.changes = r;
  }

  onAllChangesDone() {
    this.onChangesDoneCalled = true;
    if (isPresent(this.onChangesDoneSpy)) {
      this.onChangesDoneSpy();
    }
  }
}

class Person {
  name: string;
  age: number;
  address: Address;
  constructor(name: string, address: Address = null) {
    this.name = name;
    this.address = address;
  }

  sayHi(m) { return `Hi, ${m}`; }

  toString(): string {
    var address = this.address == null ? '' : ' address=' + this.address.toString();

    return 'name=' + this.name + address;
  }
}

class Address {
  city: string;
  constructor(city: string) { this.city = city; }

  toString(): string { return isBlank(this.city) ? '-' : this.city }
}

class Uninitialized {
  value: any;
}

class TestData {
  a;

  constructor(a) { this.a = a; }
}

class FakeDirectives {
  constructor(public directives: List<TestData | TestDirective>,
              public detectors: List<ProtoChangeDetector>) {}

  getDirectiveFor(di: DirectiveIndex) { return this.directives[di.directiveIndex]; }

  getDetectorFor(di: DirectiveIndex) { return this.detectors[di.directiveIndex]; }
}

class TestDispatcher extends ChangeDispatcher {
  log: List<string>;
  loggedValues: List<any>;

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

  _asString(value) { return (isBlank(value) ? 'null' : value.toString()); }
}
