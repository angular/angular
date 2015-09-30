import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  tick,
  fakeAsync
} from 'angular2/test_lib';

import {SpyChangeDispatcher} from '../spies';

import {
  CONST_EXPR,
  isPresent,
  isBlank,
  isJsObject,
  FunctionWrapper,
  normalizeBool
} from 'angular2/src/core/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';
import {ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';

import {
  ChangeDispatcher,
  DehydratedException,
  DynamicChangeDetector,
  ChangeDetectionError,
  BindingRecord,
  DirectiveRecord,
  DirectiveIndex,
  PipeTransform,
  PipeOnDestroy,
  ChangeDetectionStrategy,
  WrappedValue,
  DynamicProtoChangeDetector,
  ChangeDetectorDefinition,
  Lexer,
  Parser,
  Locals,
  ProtoChangeDetector
} from 'angular2/src/core/change_detection/change_detection';

import {SelectedPipe, Pipes} from 'angular2/src/core/change_detection/pipes';
import {JitProtoChangeDetector} from 'angular2/src/core/change_detection/jit_proto_change_detector';

import {getDefinition} from './change_detector_config';
import {createObservableModel} from './change_detector_spec_util';
import {getFactoryById} from './generated/change_detector_classes';
import {IS_DART} from '../../platform';

const _DEFAULT_CONTEXT = CONST_EXPR(new Object());

/**
 * Tests in this spec run against three different implementations of `AbstractChangeDetector`,
 * `dynamic` (which use reflection to inspect objects), `JIT` (which are generated only for
 * Javascript at runtime using `eval`) and `Pregen` (which are generated only for Dart prior
 * to app deploy to avoid the need for reflection).
 *
 * Pre-generated classes require knowledge of the shape of the change detector at the time of Dart
 * transformation, so in these tests we abstract a `ChangeDetectorDefinition` out into the
 * change_detector_config library and define a build step which pre-generates the necessary change
 * detectors to execute these tests. Once that built step has run, those generated change detectors
 * can be found in the generated/change_detector_classes library.
 */
export function main() {
  ListWrapper.forEach(['dynamic', 'JIT', 'Pregen'], (cdType) => {
    if (cdType == "JIT" && IS_DART) return;
    if (cdType == "Pregen" && !IS_DART) return;

    describe(`${cdType} Change Detector`, () => {

      function _getProtoChangeDetector(def: ChangeDetectorDefinition) {
        switch (cdType) {
          case 'dynamic':
            return new DynamicProtoChangeDetector(def);
          case 'JIT':
            return new JitProtoChangeDetector(def);
          case 'Pregen':
            return getFactoryById(def.id)(def);
          default:
            return null;
        }
      }

      function _createWithoutHydrate(expression: string) {
        var dispatcher = new TestDispatcher();
        var cd = _getProtoChangeDetector(getDefinition(expression).cdDef).instantiate(dispatcher);
        return new _ChangeDetectorAndDispatcher(cd, dispatcher);
      }


      function _createChangeDetector(expression: string, context = _DEFAULT_CONTEXT,
                                     registry = null, dispatcher = null) {
        if (isBlank(dispatcher)) dispatcher = new TestDispatcher();
        var testDef = getDefinition(expression);
        var protoCd = _getProtoChangeDetector(testDef.cdDef);
        var cd = protoCd.instantiate(dispatcher);
        cd.hydrate(context, testDef.locals, null, registry);
        return new _ChangeDetectorAndDispatcher(cd, dispatcher);
      }

      function _bindSimpleValue(expression: string, context = _DEFAULT_CONTEXT) {
        var val = _createChangeDetector(expression, context);
        val.changeDetector.detectChanges();
        return val.dispatcher.log;
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
        var expectedValue = IS_DART ? 'false' : 'true';
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

      it('should support method calls', () => {
        var person = new Person('Victor');
        expect(_bindSimpleValue('sayHi("Jim")', person)).toEqual(['propName=Hi, Jim']);
      });

      it('should support function calls', () => {
        var td = new TestData(() => (a) => a);
        expect(_bindSimpleValue('a()(99)', td)).toEqual(['propName=99']);
      });

      it('should support chained method calls', () => {
        var person = new Person('Victor');
        var td = new TestData(person);
        expect(_bindSimpleValue('a.sayHi("Jim")', td)).toEqual(['propName=Hi, Jim']);
      });

      it('should do simple watching', () => {
        var person = new Person('misko');
        var val = _createChangeDetector('name', person);

        val.changeDetector.detectChanges();
        expect(val.dispatcher.log).toEqual(['propName=misko']);
        val.dispatcher.clear();

        val.changeDetector.detectChanges();
        expect(val.dispatcher.log).toEqual([]);
        val.dispatcher.clear();

        person.name = 'Misko';
        val.changeDetector.detectChanges();
        expect(val.dispatcher.log).toEqual(['propName=Misko']);
      });

      it('should support literal array', () => {
        var val = _createChangeDetector('[1, 2]');
        val.changeDetector.detectChanges();
        expect(val.dispatcher.loggedValues).toEqual([[1, 2]]);

        val = _createChangeDetector('[1, a]', new TestData(2));
        val.changeDetector.detectChanges();
        expect(val.dispatcher.loggedValues).toEqual([[1, 2]]);
      });

      it('should support literal maps', () => {
        var val = _createChangeDetector('{z: 1}');
        val.changeDetector.detectChanges();
        expect(val.dispatcher.loggedValues[0]['z']).toEqual(1);

        val = _createChangeDetector('{z: a}', new TestData(1));
        val.changeDetector.detectChanges();
        expect(val.dispatcher.loggedValues[0]['z']).toEqual(1);
      });

      it('should support interpolation', () => {
        var val = _createChangeDetector('interpolation', new TestData('value'));
        val.changeDetector.hydrate(new TestData('value'), null, null, null);

        val.changeDetector.detectChanges();

        expect(val.dispatcher.log).toEqual(['propName=BvalueA']);
      });

      it('should output empty strings for null values in interpolation', () => {
        var val = _createChangeDetector('interpolation', new TestData('value'));
        val.changeDetector.hydrate(new TestData(null), null, null, null);

        val.changeDetector.detectChanges();

        expect(val.dispatcher.log).toEqual(['propName=BA']);
      });

      it('should escape values in literals that indicate interpolation',
         () => { expect(_bindSimpleValue('"$"')).toEqual(['propName=$']); });

      describe('pure functions', () => {
        it('should preserve memoized result', () => {
          var person = new Person('bob');
          var val = _createChangeDetector('passThrough([12])', person);
          val.changeDetector.detectChanges();
          val.changeDetector.detectChanges();
          expect(val.dispatcher.loggedValues).toEqual([[12]]);
        });
      });

      describe('change notification', () => {
        describe('simple checks', () => {
          it('should pass a change record to the dispatcher', () => {
            var person = new Person('bob');
            var val = _createChangeDetector('name', person);
            val.changeDetector.detectChanges();
            expect(val.dispatcher.loggedValues).toEqual(['bob']);
          });
        });

        describe('pipes', () => {
          it('should pass a change record to the dispatcher', () => {
            var registry = new FakePipes('pipe', () => new CountingPipe());
            var person = new Person('bob');
            var val = _createChangeDetector('name | pipe', person, registry);
            val.changeDetector.detectChanges();
            expect(val.dispatcher.loggedValues).toEqual(['bob state:0']);
          });

          it('should support arguments in pipes', () => {
            var registry = new FakePipes('pipe', () => new MultiArgPipe());
            var address = new Address('two');
            var person = new Person('value', address);
            var val = _createChangeDetector("name | pipe:'one':address.city", person, registry);
            val.changeDetector.detectChanges();
            expect(val.dispatcher.loggedValues).toEqual(['value one two default']);
          });

          it('should not reevaluate pure pipes unless its context or arg changes', () => {
            var pipe = new CountingPipe();
            var registry = new FakePipes('pipe', () => pipe, {pure: true});
            var person = new Person('bob');
            var val = _createChangeDetector('name | pipe', person, registry);

            val.changeDetector.detectChanges();
            expect(pipe.state).toEqual(1);

            val.changeDetector.detectChanges();
            expect(pipe.state).toEqual(1);

            person.name = 'jim';
            val.changeDetector.detectChanges();
            expect(pipe.state).toEqual(2);
          });

          it('should reevaluate impure pipes neither context nor arg changes', () => {
            var pipe = new CountingPipe();
            var registry = new FakePipes('pipe', () => pipe, {pure: false});
            var person = new Person('bob');
            var val = _createChangeDetector('name | pipe', person, registry);

            val.changeDetector.detectChanges();
            expect(pipe.state).toEqual(1);

            val.changeDetector.detectChanges();
            expect(pipe.state).toEqual(2);
          });

          it('should support pipes as arguments to pure functions', () => {
            var registry = new FakePipes('pipe', () => new IdentityPipe());
            var person = new Person('bob');
            var val = _createChangeDetector('(name | pipe).length', person, registry);
            val.changeDetector.detectChanges();
            expect(val.dispatcher.loggedValues).toEqual([3]);
          });
        });

        it('should notify the dispatcher after content children have checked', () => {
          var val = _createChangeDetector('name', new Person('bob'));
          val.changeDetector.detectChanges();
          expect(val.dispatcher.afterContentCheckedCalled).toEqual(true);
        });

        it('should notify the dispatcher after view children have been checked', () => {
          var val = _createChangeDetector('name', new Person('bob'));
          val.changeDetector.detectChanges();
          expect(val.dispatcher.afterViewCheckedCalled).toEqual(true);
        });

        describe('updating directives', () => {
          var directive1;
          var directive2;

          beforeEach(() => {
            directive1 = new TestDirective();
            directive2 = new TestDirective();
          });

          it('should happen directly, without invoking the dispatcher', () => {
            var val = _createWithoutHydrate('directNoDispatcher');
            val.changeDetector.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []),
                                       null);
            val.changeDetector.detectChanges();
            expect(val.dispatcher.loggedValues).toEqual([]);
            expect(directive1.a).toEqual(42);
          });

          describe('lifecycle', () => {
            describe('onChanges', () => {
              it('should notify the directive when a group of records changes', () => {
                var cd = _createWithoutHydrate('groupChanges').changeDetector;
                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1, directive2], []),
                           null);
                cd.detectChanges();
                expect(directive1.changes).toEqual({'a': 1, 'b': 2});
                expect(directive2.changes).toEqual({'a': 3});
              });
            });

            describe('doCheck', () => {
              it('should notify the directive when it is checked', () => {
                var cd = _createWithoutHydrate('directiveDoCheck').changeDetector;

                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []), null);
                cd.detectChanges();

                expect(directive1.doCheckCalled).toBe(true);
                directive1.doCheckCalled = false;

                cd.detectChanges();
                expect(directive1.doCheckCalled).toBe(true);
              });

              it('should not call doCheck in detectNoChanges', () => {
                var cd = _createWithoutHydrate('directiveDoCheck').changeDetector;

                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []), null);

                cd.checkNoChanges();

                expect(directive1.doCheckCalled).toBe(false);
              });
            });

            describe('onInit', () => {
              it('should notify the directive after it has been checked the first time', () => {
                var cd = _createWithoutHydrate('directiveOnInit').changeDetector;

                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1, directive2], []),
                           null);

                cd.detectChanges();

                expect(directive1.onInitCalled).toBe(true);

                directive1.onInitCalled = false;

                cd.detectChanges();

                expect(directive1.onInitCalled).toBe(false);
              });

              it('should not call onInit in detectNoChanges', () => {
                var cd = _createWithoutHydrate('directiveOnInit').changeDetector;

                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []), null);

                cd.checkNoChanges();

                expect(directive1.onInitCalled).toBe(false);
              });
            });

            describe('afterContentInit', () => {
              it('should be called after processing the content children', () => {
                var cd = _createWithoutHydrate('emptyWithDirectiveRecords').changeDetector;
                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1, directive2], []),
                           null);

                cd.detectChanges();

                expect(directive1.afterContentInitCalled).toBe(true);
                expect(directive2.afterContentInitCalled).toBe(true);

                // reset directives
                directive1.afterContentInitCalled = false;
                directive2.afterContentInitCalled = false;

                // Verify that checking should not call them.
                cd.checkNoChanges();

                expect(directive1.afterContentInitCalled).toBe(false);
                expect(directive2.afterContentInitCalled).toBe(false);

                // re-verify that changes should not call them
                cd.detectChanges();

                expect(directive1.afterContentInitCalled).toBe(false);
                expect(directive2.afterContentInitCalled).toBe(false);
              });

              it('should not be called when afterContentInit is false', () => {
                var cd = _createWithoutHydrate('noCallbacks').changeDetector;

                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []), null);

                cd.detectChanges();

                expect(directive1.afterContentInitCalled).toEqual(false);
              });
            });

            describe('afterContentChecked', () => {
              it('should be called after processing all the children', () => {
                var cd = _createWithoutHydrate('emptyWithDirectiveRecords').changeDetector;
                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1, directive2], []),
                           null);

                cd.detectChanges();

                expect(directive1.afterContentCheckedCalled).toBe(true);
                expect(directive2.afterContentCheckedCalled).toBe(true);

                // reset directives
                directive1.afterContentCheckedCalled = false;
                directive2.afterContentCheckedCalled = false;

                // Verify that checking should not call them.
                cd.checkNoChanges();

                expect(directive1.afterContentCheckedCalled).toBe(false);
                expect(directive2.afterContentCheckedCalled).toBe(false);

                // re-verify that changes are still detected
                cd.detectChanges();

                expect(directive1.afterContentCheckedCalled).toBe(true);
                expect(directive2.afterContentCheckedCalled).toBe(true);
              });

              it('should not be called when afterContentChecked is false', () => {
                var cd = _createWithoutHydrate('noCallbacks').changeDetector;

                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []), null);

                cd.detectChanges();

                expect(directive1.afterContentCheckedCalled).toEqual(false);
              });

              it('should be called in reverse order so the child is always notified before the parent',
                 () => {
                   var cd = _createWithoutHydrate('emptyWithDirectiveRecords').changeDetector;

                   var onChangesDoneCalls = [];
                   var td1;
                   td1 = new TestDirective(() => onChangesDoneCalls.push(td1));
                   var td2;
                   td2 = new TestDirective(() => onChangesDoneCalls.push(td2));
                   cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([td1, td2], []), null);

                   cd.detectChanges();

                   expect(onChangesDoneCalls).toEqual([td2, td1]);
                 });

              it('should be called before processing view children', () => {
                var parent = _createWithoutHydrate('directNoDispatcher').changeDetector;
                var child = _createWithoutHydrate('directNoDispatcher').changeDetector;
                parent.addShadowDomChild(child);

                var orderOfOperations = [];

                var directiveInShadowDom;
                directiveInShadowDom =
                    new TestDirective(() => { orderOfOperations.push(directiveInShadowDom); });
                var parentDirective;
                parentDirective =
                    new TestDirective(() => { orderOfOperations.push(parentDirective); });

                parent.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([parentDirective], []),
                               null);
                child.hydrate(_DEFAULT_CONTEXT, null,
                              new FakeDirectives([directiveInShadowDom], []), null);

                parent.detectChanges();
                expect(orderOfOperations).toEqual([parentDirective, directiveInShadowDom]);
              });
            });


            describe('afterViewInit', () => {
              it('should be called after processing the view children', () => {
                var cd = _createWithoutHydrate('emptyWithDirectiveRecords').changeDetector;
                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1, directive2], []),
                           null);

                cd.detectChanges();

                expect(directive1.afterViewInitCalled).toBe(true);
                expect(directive2.afterViewInitCalled).toBe(true);

                // reset directives
                directive1.afterViewInitCalled = false;
                directive2.afterViewInitCalled = false;

                // Verify that checking should not call them.
                cd.checkNoChanges();

                expect(directive1.afterViewInitCalled).toBe(false);
                expect(directive2.afterViewInitCalled).toBe(false);

                // re-verify that changes should not call them
                cd.detectChanges();

                expect(directive1.afterViewInitCalled).toBe(false);
                expect(directive2.afterViewInitCalled).toBe(false);
              });


              it('should not be called when afterViewInit is false', () => {
                var cd = _createWithoutHydrate('noCallbacks').changeDetector;

                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []), null);

                cd.detectChanges();

                expect(directive1.afterViewInitCalled).toEqual(false);
              });
            });

            describe('afterViewChecked', () => {
              it('should be called after processing the view children', () => {
                var cd = _createWithoutHydrate('emptyWithDirectiveRecords').changeDetector;
                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1, directive2], []),
                           null);

                cd.detectChanges();

                expect(directive1.afterViewCheckedCalled).toBe(true);
                expect(directive2.afterViewCheckedCalled).toBe(true);

                // reset directives
                directive1.afterViewCheckedCalled = false;
                directive2.afterViewCheckedCalled = false;

                // Verify that checking should not call them.
                cd.checkNoChanges();

                expect(directive1.afterViewCheckedCalled).toBe(false);
                expect(directive2.afterViewCheckedCalled).toBe(false);

                // re-verify that changes should call them
                cd.detectChanges();

                expect(directive1.afterViewCheckedCalled).toBe(true);
                expect(directive2.afterViewCheckedCalled).toBe(true);
              });

              it('should not be called when afterViewChecked is false', () => {
                var cd = _createWithoutHydrate('noCallbacks').changeDetector;

                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []), null);

                cd.detectChanges();

                expect(directive1.afterViewCheckedCalled).toEqual(false);
              });

              it('should be called in reverse order so the child is always notified before the parent',
                 () => {
                   var cd = _createWithoutHydrate('emptyWithDirectiveRecords').changeDetector;

                   var onChangesDoneCalls = [];
                   var td1;
                   td1 = new TestDirective(null, () => onChangesDoneCalls.push(td1));
                   var td2;
                   td2 = new TestDirective(null, () => onChangesDoneCalls.push(td2));
                   cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([td1, td2], []), null);

                   cd.detectChanges();

                   expect(onChangesDoneCalls).toEqual([td2, td1]);
                 });

              it('should be called after processing view children', () => {
                var parent = _createWithoutHydrate('directNoDispatcher').changeDetector;
                var child = _createWithoutHydrate('directNoDispatcher').changeDetector;
                parent.addShadowDomChild(child);

                var orderOfOperations = [];

                var directiveInShadowDom;
                directiveInShadowDom = new TestDirective(
                    null, () => { orderOfOperations.push(directiveInShadowDom); });
                var parentDirective;
                parentDirective =
                    new TestDirective(null, () => { orderOfOperations.push(parentDirective); });

                parent.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([parentDirective], []),
                               null);
                child.hydrate(_DEFAULT_CONTEXT, null,
                              new FakeDirectives([directiveInShadowDom], []), null);

                parent.detectChanges();
                expect(orderOfOperations).toEqual([directiveInShadowDom, parentDirective]);
              });
            });
          });

        });
      });

      describe("logBindingUpdate", () => {
        it('should be called for element updates in the dev mode', () => {
          var person = new Person('bob');
          var val = _createChangeDetector('name', person);
          val.changeDetector.detectChanges();
          expect(val.dispatcher.debugLog).toEqual(['propName=bob']);
        });

        it('should be called for directive updates in the dev mode', () => {
          var val = _createWithoutHydrate('directNoDispatcher');
          val.changeDetector.hydrate(_DEFAULT_CONTEXT, null,
                                     new FakeDirectives([new TestDirective()], []), null);
          val.changeDetector.detectChanges();
          expect(val.dispatcher.debugLog).toEqual(["a=42"]);
        });

        it('should not be called in the prod mode', () => {
          var person = new Person('bob');
          var val = _createChangeDetector('updateElementProduction', person);
          val.changeDetector.detectChanges();
          expect(val.dispatcher.debugLog).toEqual([]);
        });

      });

      describe('reading directives', () => {
        it('should read directive properties', () => {
          var directive = new TestDirective();
          directive.a = 'aaa';

          var val = _createWithoutHydrate('readingDirectives');
          val.changeDetector.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive], []),
                                     null);

          val.changeDetector.detectChanges();

          expect(val.dispatcher.loggedValues).toEqual(['aaa']);
        });
      });

      describe('enforce no new changes', () => {
        it('should throw when a record gets changed after it has been checked', () => {
          var val = _createChangeDetector('a', new TestData('value'));
          expect(() => { val.changeDetector.checkNoChanges(); })
              .toThrowError(new RegExp(
                  'Expression [\'"]a in location[\'"] has changed after it was checked'));
        });

        it('should not break the next run', () => {
          var val = _createChangeDetector('a', new TestData('value'));
          expect(() => val.changeDetector.checkNoChanges())
              .toThrowError(new RegExp(
                  'Expression [\'"]a in location[\'"] has changed after it was checked.'));

          val.changeDetector.detectChanges();
          expect(val.dispatcher.loggedValues).toEqual(['value']);
        });
      });

      describe('error handling', () => {
        it('should wrap exceptions into ChangeDetectionError', () => {
          var val = _createChangeDetector('invalidFn(1)');
          try {
            val.changeDetector.detectChanges();
            throw new BaseException('fail');
          } catch (e) {
            expect(e).toBeAnInstanceOf(ChangeDetectionError);
            expect(e.location).toEqual('invalidFn(1) in location');
          }
        });

        it('should handle unexpected errors in the event handler itself', () => {
          var throwingDispatcher = new SpyChangeDispatcher();
          throwingDispatcher.spy("getDebugContext")
              .andCallFake((_, __) => { throw new BaseException('boom'); });

          var val =
              _createChangeDetector('invalidFn(1)', _DEFAULT_CONTEXT, null, throwingDispatcher);
          try {
            val.changeDetector.detectChanges();
            throw new BaseException('fail');
          } catch (e) {
            expect(e).toBeAnInstanceOf(ChangeDetectionError);
            expect(e.location).toEqual(null);
          }
        });
      });

      describe('Locals', () => {
        it('should read a value from locals',
           () => { expect(_bindSimpleValue('valueFromLocals')).toEqual(['propName=value']); });

        it('should invoke a function from local',
           () => { expect(_bindSimpleValue('functionFromLocals')).toEqual(['propName=value']); });

        it('should handle nested locals',
           () => { expect(_bindSimpleValue('nestedLocals')).toEqual(['propName=value']); });

        it('should fall back to a regular field read when the locals map' +
               'does not have the requested field',
           () => {
             expect(_bindSimpleValue('fallbackLocals', new Person('Jim')))
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

      describe('handle children', () => {
        var parent, child;

        beforeEach(() => {
          parent = _createChangeDetector('10').changeDetector;
          child = _createChangeDetector('"str"').changeDetector;
        });

        it('should add light dom children', () => {
          parent.addChild(child);

          expect(parent.lightDomChildren.length).toEqual(1);
          expect(parent.lightDomChildren[0]).toBe(child);
        });

        it('should add shadow dom children', () => {
          parent.addShadowDomChild(child);

          expect(parent.shadowDomChildren.length).toEqual(1);
          expect(parent.shadowDomChildren[0]).toBe(child);
        });

        it('should remove light dom children', () => {
          parent.addChild(child);
          parent.removeChild(child);

          expect(parent.lightDomChildren).toEqual([]);
        });

        it('should remove shadow dom children', () => {
          parent.addShadowDomChild(child);
          parent.removeShadowDomChild(child);

          expect(parent.shadowDomChildren.length).toEqual(0);
        });
      });

      describe('mode', () => {
        it('should set the mode to CheckAlways when the default change detection is used', () => {
          var cd = _createWithoutHydrate('emptyUsingDefaultStrategy').changeDetector;
          expect(cd.mode).toEqual(null);

          cd.hydrate(_DEFAULT_CONTEXT, null, null, null);
          expect(cd.mode).toEqual(ChangeDetectionStrategy.CheckAlways);
        });

        it('should set the mode to CheckOnce when the push change detection is used', () => {
          var cd = _createWithoutHydrate('emptyUsingOnPushStrategy').changeDetector;
          cd.hydrate(_DEFAULT_CONTEXT, null, null, null);

          expect(cd.mode).toEqual(ChangeDetectionStrategy.CheckOnce);
        });

        it('should not check a detached change detector', () => {
          var val = _createChangeDetector('a', new TestData('value'));

          val.changeDetector.hydrate(_DEFAULT_CONTEXT, null, null, null);
          val.changeDetector.mode = ChangeDetectionStrategy.Detached;
          val.changeDetector.detectChanges();

          expect(val.dispatcher.log).toEqual([]);
        });

        it('should not check a checked change detector', () => {
          var val = _createChangeDetector('a', new TestData('value'));

          val.changeDetector.hydrate(_DEFAULT_CONTEXT, null, null, null);
          val.changeDetector.mode = ChangeDetectionStrategy.Checked;
          val.changeDetector.detectChanges();

          expect(val.dispatcher.log).toEqual([]);
        });

        it('should change CheckOnce to Checked', () => {
          var cd = _createChangeDetector('10').changeDetector;
          cd.hydrate(_DEFAULT_CONTEXT, null, null, null);
          cd.mode = ChangeDetectionStrategy.CheckOnce;

          cd.detectChanges();

          expect(cd.mode).toEqual(ChangeDetectionStrategy.Checked);
        });

        it('should not change the CheckAlways', () => {
          var cd = _createChangeDetector('10').changeDetector;
          cd.hydrate(_DEFAULT_CONTEXT, null, null, null);
          cd.mode = ChangeDetectionStrategy.CheckAlways;

          cd.detectChanges();

          expect(cd.mode).toEqual(ChangeDetectionStrategy.CheckAlways);
        });

        describe('marking OnPush detectors as CheckOnce after an update', () => {
          var childDirectiveDetectorRegular;
          var childDirectiveDetectorOnPush;
          var directives;

          beforeEach(() => {
            childDirectiveDetectorRegular = _createWithoutHydrate('10').changeDetector;
            childDirectiveDetectorRegular.hydrate(_DEFAULT_CONTEXT, null, null, null);
            childDirectiveDetectorRegular.mode = ChangeDetectionStrategy.CheckAlways;

            childDirectiveDetectorOnPush =
                _createWithoutHydrate('emptyUsingOnPushStrategy').changeDetector;
            childDirectiveDetectorOnPush.hydrate(_DEFAULT_CONTEXT, null, null, null);
            childDirectiveDetectorOnPush.mode = ChangeDetectionStrategy.Checked;

            directives =
                new FakeDirectives([new TestData(null), new TestData(null)],
                                   [childDirectiveDetectorRegular, childDirectiveDetectorOnPush]);
          });

          it('should set the mode to CheckOnce when a binding is updated', () => {
            var parentDetector =
                _createWithoutHydrate('onPushRecordsUsingDefaultStrategy').changeDetector;
            parentDetector.hydrate(_DEFAULT_CONTEXT, null, directives, null);

            parentDetector.detectChanges();

            // making sure that we only change the status of OnPush components
            expect(childDirectiveDetectorRegular.mode).toEqual(ChangeDetectionStrategy.CheckAlways);

            expect(childDirectiveDetectorOnPush.mode).toEqual(ChangeDetectionStrategy.CheckOnce);
          });

          it('should mark OnPush detectors as CheckOnce after an event', () => {
            var cd = _createWithoutHydrate('onPushWithEvent').changeDetector;
            cd.hydrate(_DEFAULT_CONTEXT, null, directives, null);
            cd.mode = ChangeDetectionStrategy.Checked;

            cd.handleEvent("event", 0, null);

            expect(cd.mode).toEqual(ChangeDetectionStrategy.CheckOnce);
          });

          it('should mark OnPush detectors as CheckOnce after a host event', () => {
            var cd = _createWithoutHydrate('onPushWithHostEvent').changeDetector;
            cd.hydrate(_DEFAULT_CONTEXT, null, directives, null);

            cd.handleEvent("host-event", 0, null);

            expect(childDirectiveDetectorOnPush.mode).toEqual(ChangeDetectionStrategy.CheckOnce);
          });

          if (IS_DART) {
            describe('OnPushObserve', () => {
              it('should mark OnPushObserve detectors as CheckOnce when an observable fires an event',
                 fakeAsync(() => {
                   var context = new TestDirective();
                   context.a = createObservableModel();

                   var cd = _createWithoutHydrate('onPushObserveBinding').changeDetector;
                   cd.hydrate(context, null, directives, null);
                   cd.detectChanges();

                   expect(cd.mode).toEqual(ChangeDetectionStrategy.Checked);

                   context.a.pushUpdate();
                   tick();

                   expect(cd.mode).toEqual(ChangeDetectionStrategy.CheckOnce);
                 }));

              it('should mark OnPushObserve detectors as CheckOnce when an observable context fires an event',
                 fakeAsync(() => {
                   var context = createObservableModel();

                   var cd = _createWithoutHydrate('onPushObserveComponent').changeDetector;
                   cd.hydrate(context, null, directives, null);
                   cd.detectChanges();

                   expect(cd.mode).toEqual(ChangeDetectionStrategy.Checked);

                   context.pushUpdate();
                   tick();

                   expect(cd.mode).toEqual(ChangeDetectionStrategy.CheckOnce);
                 }));

              it('should mark OnPushObserve detectors as CheckOnce when an observable directive fires an event',
                 fakeAsync(() => {
                   var dir = createObservableModel();
                   var directives = new FakeDirectives([dir], []);

                   var cd = _createWithoutHydrate('onPushObserveDirective').changeDetector;
                   cd.hydrate(_DEFAULT_CONTEXT, null, directives, null);
                   cd.detectChanges();

                   expect(cd.mode).toEqual(ChangeDetectionStrategy.Checked);

                   dir.pushUpdate();
                   tick();

                   expect(cd.mode).toEqual(ChangeDetectionStrategy.CheckOnce);
                 }));

              it('should unsubscribe from an old observable when an object changes',
                 fakeAsync(() => {
                   var originalModel = createObservableModel();
                   var context = new TestDirective();
                   context.a = originalModel;

                   var cd = _createWithoutHydrate('onPushObserveBinding').changeDetector;
                   cd.hydrate(context, null, directives, null);
                   cd.detectChanges();

                   context.a = createObservableModel();
                   cd.mode = ChangeDetectionStrategy.CheckOnce;
                   cd.detectChanges();

                   // Updating this model will not reenable the detector. This model is not longer
                   // used.
                   originalModel.pushUpdate();
                   tick();
                   expect(cd.mode).toEqual(ChangeDetectionStrategy.Checked);
                 }));

              it('should unsubscribe from observables when dehydrating', fakeAsync(() => {
                   var originalModel = createObservableModel();
                   var context = new TestDirective();
                   context.a = originalModel;

                   var cd = _createWithoutHydrate('onPushObserveBinding').changeDetector;
                   cd.hydrate(context, null, directives, null);
                   cd.detectChanges();

                   cd.dehydrate();

                   context.a = "not an observable model";
                   cd.hydrate(context, null, directives, null);
                   cd.detectChanges();

                   // Updating this model will not reenable the detector. This model is not longer
                   // used.
                   originalModel.pushUpdate();
                   tick();
                   expect(cd.mode).toEqual(ChangeDetectionStrategy.Checked);
                 }));
            });
          }
        });
      });

      describe('markPathToRootAsCheckOnce', () => {
        function changeDetector(mode, parent) {
          var val = _createChangeDetector('10');
          val.changeDetector.mode = mode;
          if (isPresent(parent)) parent.addChild(val.changeDetector);
          return val.changeDetector;
        }

        it('should mark all checked detectors as CheckOnce until reaching a detached one', () => {
          var root = changeDetector(ChangeDetectionStrategy.CheckAlways, null);
          var disabled = changeDetector(ChangeDetectionStrategy.Detached, root);
          var parent = changeDetector(ChangeDetectionStrategy.Checked, disabled);
          var checkAlwaysChild = changeDetector(ChangeDetectionStrategy.CheckAlways, parent);
          var checkOnceChild = changeDetector(ChangeDetectionStrategy.CheckOnce, checkAlwaysChild);
          var checkedChild = changeDetector(ChangeDetectionStrategy.Checked, checkOnceChild);

          checkedChild.markPathToRootAsCheckOnce();

          expect(root.mode).toEqual(ChangeDetectionStrategy.CheckAlways);
          expect(disabled.mode).toEqual(ChangeDetectionStrategy.Detached);
          expect(parent.mode).toEqual(ChangeDetectionStrategy.CheckOnce);
          expect(checkAlwaysChild.mode).toEqual(ChangeDetectionStrategy.CheckAlways);
          expect(checkOnceChild.mode).toEqual(ChangeDetectionStrategy.CheckOnce);
          expect(checkedChild.mode).toEqual(ChangeDetectionStrategy.CheckOnce);
        });
      });

      describe('hydration', () => {
        it('should be able to rehydrate a change detector', () => {
          var cd = _createChangeDetector('name').changeDetector;

          cd.hydrate('some context', null, null, null);
          expect(cd.hydrated()).toBe(true);

          cd.dehydrate();
          expect(cd.hydrated()).toBe(false);

          cd.hydrate('other context', null, null, null);
          expect(cd.hydrated()).toBe(true);
        });

        it('should destroy all active pipes implementing onDestroy during dehyration', () => {
          var pipe = new PipeWithOnDestroy();
          var registry = new FakePipes('pipe', () => pipe);
          var cd = _createChangeDetector('name | pipe', new Person('bob'), registry).changeDetector;

          cd.detectChanges();
          cd.dehydrate();

          expect(pipe.destroyCalled).toBe(true);
        });

        it('should not call onDestroy all pipes that do not implement onDestroy', () => {
          var pipe = new CountingPipe();
          var registry = new FakePipes('pipe', () => pipe);
          var cd = _createChangeDetector('name | pipe', new Person('bob'), registry).changeDetector;

          cd.detectChanges();
          expect(() => cd.dehydrate()).not.toThrow();
        });

        it('should throw when detectChanges is called on a dehydrated detector', () => {
          var context = new Person('Bob');
          var val = _createChangeDetector('name', context);

          val.changeDetector.detectChanges();
          expect(val.dispatcher.log).toEqual(['propName=Bob']);

          val.changeDetector.dehydrate();
          expect(() => {val.changeDetector.detectChanges()})
              .toThrowErrorWith("Attempt to detect changes on a dehydrated detector");
          expect(val.dispatcher.log).toEqual(['propName=Bob']);
        });
      });

      it('should do nothing when no change', () => {
        var registry = new FakePipes('pipe', () => new IdentityPipe());
        var ctx = new Person('Megatron');

        var val = _createChangeDetector('name | pipe', ctx, registry);

        val.changeDetector.detectChanges();

        expect(val.dispatcher.log).toEqual(['propName=Megatron']);

        val.dispatcher.clear();
        val.changeDetector.detectChanges();

        expect(val.dispatcher.log).toEqual([]);
      });

      it('should unwrap the wrapped value', () => {
        var registry = new FakePipes('pipe', () => new WrappedPipe());
        var ctx = new Person('Megatron');

        var val = _createChangeDetector('name | pipe', ctx, registry);

        val.changeDetector.detectChanges();

        expect(val.dispatcher.log).toEqual(['propName=Megatron']);
      });

      describe('handleEvent', () => {
        var locals;
        var d: TestDirective;

        beforeEach(() => {
          locals = new Locals(null, MapWrapper.createFromStringMap({"$event": "EVENT"}));
          d = new TestDirective();
        });

        it('should execute events', () => {
          var val = _createChangeDetector('(event)="onEvent($event)"', d, null);
          val.changeDetector.handleEvent("event", 0, locals);
          expect(d.event).toEqual("EVENT");
        });

        it('should execute host events', () => {
          var val = _createWithoutHydrate('(host-event)="onEvent($event)"');
          val.changeDetector.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([d], []), null);
          val.changeDetector.handleEvent("host-event", 0, locals);
          expect(d.event).toEqual("EVENT");
        });

        it('should support field assignments', () => {
          var val = _createChangeDetector('(event)="b=a=$event"', d, null);
          val.changeDetector.handleEvent("event", 0, locals);
          expect(d.a).toEqual("EVENT");
          expect(d.b).toEqual("EVENT");
        });

        it('should support keyed assignments', () => {
          d.a = ["OLD"];
          var val = _createChangeDetector('(event)="a[0]=$event"', d, null);
          val.changeDetector.handleEvent("event", 0, locals);
          expect(d.a).toEqual(["EVENT"]);
        });

        it('should support chains', () => {
          d.a = 0;
          var val = _createChangeDetector('(event)="a=a+1; a=a+1;"', d, null);
          val.changeDetector.handleEvent("event", 0, locals);
          expect(d.a).toEqual(2);
        });

        // TODO: enable after chaning dart infrastructure for generating tests
        // it('should throw when trying to assign to a local', () => {
        //   expect(() => {
        //     _createChangeDetector('(event)="$event=1"', d, null)
        //   }).toThrowError(new RegExp("Cannot reassign a variable binding"));
        // });

        it('should return the prevent default value', () => {
          var val = _createChangeDetector('(event)="false"', d, null);
          var res = val.changeDetector.handleEvent("event", 0, locals);
          expect(res).toBe(true);

          val = _createChangeDetector('(event)="true"', d, null);
          res = val.changeDetector.handleEvent("event", 0, locals);
          expect(res).toBe(false);
        });
      });
    });
  });
}

class CountingPipe implements PipeTransform {
  state: number = 0;
  transform(value, args = null) { return `${value} state:${this.state ++}`; }
}

class PipeWithOnDestroy implements PipeTransform, PipeOnDestroy {
  destroyCalled: boolean = false;
  onDestroy() { this.destroyCalled = true; }

  transform(value, args = null) { return null; }
}

class IdentityPipe implements PipeTransform {
  transform(value, args = null) { return value; }
}

class WrappedPipe implements PipeTransform {
  transform(value, args = null) { return WrappedValue.wrap(value); }
}

class MultiArgPipe implements PipeTransform {
  transform(value, args = null) {
    var arg1 = args[0];
    var arg2 = args[1];
    var arg3 = args.length > 2 ? args[2] : 'default';
    return `${value} ${arg1} ${arg2} ${arg3}`;
  }
}

class FakePipes implements Pipes {
  numberOfLookups = 0;
  pure: boolean;

  constructor(public pipeType: string, public factory: Function, {pure}: {pure?: boolean} = {}) {
    this.pure = normalizeBool(pure);
  }

  get(type: string) {
    if (type != this.pipeType) return null;
    this.numberOfLookups++;
    return new SelectedPipe(this.factory(), this.pure);
  }
}

class TestDirective {
  a;
  b;
  changes;
  doCheckCalled = false;
  onInitCalled = false;

  afterContentInitCalled = false;
  afterContentCheckedCalled = false;

  afterViewInitCalled = false;
  afterViewCheckedCalled = false;
  event;

  constructor(public afterContentCheckedSpy = null, public afterViewCheckedSpy = null) {}

  onEvent(event) { this.event = event; }

  doCheck() { this.doCheckCalled = true; }

  onInit() { this.onInitCalled = true; }

  onChanges(changes) {
    var r = {};
    StringMapWrapper.forEach(changes, (c, key) => r[key] = c.currentValue);
    this.changes = r;
  }

  afterContentInit() { this.afterContentInitCalled = true; }

  afterContentChecked() {
    this.afterContentCheckedCalled = true;
    if (isPresent(this.afterContentCheckedSpy)) {
      this.afterContentCheckedSpy();
    }
  }

  afterViewInit() { this.afterViewInitCalled = true; }

  afterViewChecked() {
    this.afterViewCheckedCalled = true;
    if (isPresent(this.afterViewCheckedSpy)) {
      this.afterViewCheckedSpy();
    }
  }
}

class Person {
  age: number;
  constructor(public name: string, public address: Address = null) {}

  sayHi(m) { return `Hi, ${m}`; }

  passThrough(val) { return val; }

  toString(): string {
    var address = this.address == null ? '' : ' address=' + this.address.toString();

    return 'name=' + this.name + address;
  }
}

class Address {
  constructor(public city: string) {}

  toString(): string { return isBlank(this.city) ? '-' : this.city }
}

class Uninitialized {
  value: any;
}

class TestData {
  constructor(public a: any) {}
}

class FakeDirectives {
  constructor(public directives: Array<TestData | TestDirective>,
              public detectors: ProtoChangeDetector[]) {}

  getDirectiveFor(di: DirectiveIndex) { return this.directives[di.directiveIndex]; }

  getDetectorFor(di: DirectiveIndex) { return this.detectors[di.directiveIndex]; }
}

class TestDispatcher implements ChangeDispatcher {
  log: string[];
  debugLog: string[];
  loggedValues: any[];
  afterContentCheckedCalled: boolean = false;
  afterViewCheckedCalled: boolean = false;

  constructor() { this.clear(); }

  clear() {
    this.log = [];
    this.debugLog = [];
    this.loggedValues = [];
    this.afterContentCheckedCalled = true;
  }

  notifyOnBinding(target, value) {
    this.log.push(`${target.name}=${this._asString(value)}`);
    this.loggedValues.push(value);
  }

  logBindingUpdate(target, value) { this.debugLog.push(`${target.name}=${this._asString(value)}`); }

  notifyAfterContentChecked() { this.afterContentCheckedCalled = true; }
  notifyAfterViewChecked() { this.afterViewCheckedCalled = true; }

  getDebugContext(a, b) { return null; }

  _asString(value) { return (isBlank(value) ? 'null' : value.toString()); }
}

class _ChangeDetectorAndDispatcher {
  constructor(public changeDetector: any, public dispatcher: any) {}
}
