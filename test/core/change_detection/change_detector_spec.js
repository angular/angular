var testing_internal_1 = require('angular2/testing_internal');
var spies_1 = require('../spies');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var pipes_1 = require('angular2/src/core/change_detection/pipes');
var jit_proto_change_detector_1 = require('angular2/src/core/change_detection/jit_proto_change_detector');
var change_detector_config_1 = require('./change_detector_config');
var change_detector_spec_util_1 = require('./change_detector_spec_util');
var change_detector_classes_1 = require('./generated/change_detector_classes');
var lang_2 = require('angular2/src/facade/lang');
var _DEFAULT_CONTEXT = lang_1.CONST_EXPR(new Object());
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
function main() {
    ['dynamic', 'JIT', 'Pregen'].forEach(function (cdType) {
        if (cdType == "JIT" && lang_2.IS_DART)
            return;
        if (cdType == "Pregen" && !lang_2.IS_DART)
            return;
        testing_internal_1.describe(cdType + " Change Detector", function () {
            function _getChangeDetectorFactory(def) {
                switch (cdType) {
                    case 'dynamic':
                        var dynProto = new change_detection_1.DynamicProtoChangeDetector(def);
                        return function (dispatcher) { return dynProto.instantiate(dispatcher); };
                    case 'JIT':
                        var jitProto = new jit_proto_change_detector_1.JitProtoChangeDetector(def);
                        return function (dispatcher) { return jitProto.instantiate(dispatcher); };
                    case 'Pregen':
                        return change_detector_classes_1.getFactoryById(def.id);
                    default:
                        return null;
                }
            }
            function _createWithoutHydrate(expression) {
                var dispatcher = new TestDispatcher();
                var cd = _getChangeDetectorFactory(change_detector_config_1.getDefinition(expression).cdDef)(dispatcher);
                return new _ChangeDetectorAndDispatcher(cd, dispatcher);
            }
            function _createChangeDetector(expression, context, registry, dispatcher) {
                if (context === void 0) { context = _DEFAULT_CONTEXT; }
                if (registry === void 0) { registry = null; }
                if (dispatcher === void 0) { dispatcher = null; }
                if (lang_1.isBlank(dispatcher))
                    dispatcher = new TestDispatcher();
                var testDef = change_detector_config_1.getDefinition(expression);
                var cd = _getChangeDetectorFactory(testDef.cdDef)(dispatcher);
                cd.hydrate(context, testDef.locals, null, registry);
                return new _ChangeDetectorAndDispatcher(cd, dispatcher);
            }
            function _bindSimpleValue(expression, context) {
                if (context === void 0) { context = _DEFAULT_CONTEXT; }
                var val = _createChangeDetector(expression, context);
                val.changeDetector.detectChanges();
                return val.dispatcher.log;
            }
            testing_internal_1.describe('short-circuit', function () {
                testing_internal_1.it('should support short-circuit for the ternary operator', function () {
                    var address = new Address('Sunnyvale', '94085');
                    testing_internal_1.expect(_bindSimpleValue('true ? city : zipcode', address))
                        .toEqual(['propName=Sunnyvale']);
                    testing_internal_1.expect(address.cityGetterCalls).toEqual(1);
                    testing_internal_1.expect(address.zipCodeGetterCalls).toEqual(0);
                    address = new Address('Sunnyvale', '94085');
                    testing_internal_1.expect(_bindSimpleValue('false ? city : zipcode', address)).toEqual(['propName=94085']);
                    testing_internal_1.expect(address.cityGetterCalls).toEqual(0);
                    testing_internal_1.expect(address.zipCodeGetterCalls).toEqual(1);
                });
                testing_internal_1.it('should support short-circuit for the && operator', function () {
                    var logical = new Logical();
                    testing_internal_1.expect(_bindSimpleValue('getTrue() && getTrue()', logical)).toEqual(['propName=true']);
                    testing_internal_1.expect(logical.trueCalls).toEqual(2);
                    logical = new Logical();
                    testing_internal_1.expect(_bindSimpleValue('getFalse() && getTrue()', logical)).toEqual(['propName=false']);
                    testing_internal_1.expect(logical.falseCalls).toEqual(1);
                    testing_internal_1.expect(logical.trueCalls).toEqual(0);
                });
                testing_internal_1.it('should support short-circuit for the || operator', function () {
                    var logical = new Logical();
                    testing_internal_1.expect(_bindSimpleValue('getFalse() || getFalse()', logical)).toEqual(['propName=false']);
                    testing_internal_1.expect(logical.falseCalls).toEqual(2);
                    logical = new Logical();
                    testing_internal_1.expect(_bindSimpleValue('getTrue() || getFalse()', logical)).toEqual(['propName=true']);
                    testing_internal_1.expect(logical.falseCalls).toEqual(0);
                    testing_internal_1.expect(logical.trueCalls).toEqual(1);
                });
                testing_internal_1.it('should support nested short-circuits', function () {
                    var address = new Address('Sunnyvale', '94085');
                    var person = new Person('Victor', address);
                    testing_internal_1.expect(_bindSimpleValue('name == "Victor" ? (true ? address.city : address.zipcode) : address.zipcode', person))
                        .toEqual(['propName=Sunnyvale']);
                    testing_internal_1.expect(address.cityGetterCalls).toEqual(1);
                    testing_internal_1.expect(address.zipCodeGetterCalls).toEqual(0);
                });
            });
            testing_internal_1.it('should support literals', function () { testing_internal_1.expect(_bindSimpleValue('10')).toEqual(['propName=10']); });
            testing_internal_1.it('should strip quotes from literals', function () { testing_internal_1.expect(_bindSimpleValue('"str"')).toEqual(['propName=str']); });
            testing_internal_1.it('should support newlines in literals', function () { testing_internal_1.expect(_bindSimpleValue('"a\n\nb"')).toEqual(['propName=a\n\nb']); });
            testing_internal_1.it('should support + operations', function () { testing_internal_1.expect(_bindSimpleValue('10 + 2')).toEqual(['propName=12']); });
            testing_internal_1.it('should support - operations', function () { testing_internal_1.expect(_bindSimpleValue('10 - 2')).toEqual(['propName=8']); });
            testing_internal_1.it('should support * operations', function () { testing_internal_1.expect(_bindSimpleValue('10 * 2')).toEqual(['propName=20']); });
            testing_internal_1.it('should support / operations', function () {
                testing_internal_1.expect(_bindSimpleValue('10 / 2')).toEqual([("propName=" + 5.0)]);
            }); // dart exp=5.0, js exp=5
            testing_internal_1.it('should support % operations', function () { testing_internal_1.expect(_bindSimpleValue('11 % 2')).toEqual(['propName=1']); });
            testing_internal_1.it('should support == operations on identical', function () { testing_internal_1.expect(_bindSimpleValue('1 == 1')).toEqual(['propName=true']); });
            testing_internal_1.it('should support != operations', function () { testing_internal_1.expect(_bindSimpleValue('1 != 1')).toEqual(['propName=false']); });
            testing_internal_1.it('should support == operations on coerceible', function () {
                var expectedValue = lang_2.IS_DART ? 'false' : 'true';
                testing_internal_1.expect(_bindSimpleValue('1 == true')).toEqual([("propName=" + expectedValue)]);
            });
            testing_internal_1.it('should support === operations on identical', function () { testing_internal_1.expect(_bindSimpleValue('1 === 1')).toEqual(['propName=true']); });
            testing_internal_1.it('should support !== operations', function () { testing_internal_1.expect(_bindSimpleValue('1 !== 1')).toEqual(['propName=false']); });
            testing_internal_1.it('should support === operations on coerceible', function () { testing_internal_1.expect(_bindSimpleValue('1 === true')).toEqual(['propName=false']); });
            testing_internal_1.it('should support true < operations', function () { testing_internal_1.expect(_bindSimpleValue('1 < 2')).toEqual(['propName=true']); });
            testing_internal_1.it('should support false < operations', function () { testing_internal_1.expect(_bindSimpleValue('2 < 1')).toEqual(['propName=false']); });
            testing_internal_1.it('should support false > operations', function () { testing_internal_1.expect(_bindSimpleValue('1 > 2')).toEqual(['propName=false']); });
            testing_internal_1.it('should support true > operations', function () { testing_internal_1.expect(_bindSimpleValue('2 > 1')).toEqual(['propName=true']); });
            testing_internal_1.it('should support true <= operations', function () { testing_internal_1.expect(_bindSimpleValue('1 <= 2')).toEqual(['propName=true']); });
            testing_internal_1.it('should support equal <= operations', function () { testing_internal_1.expect(_bindSimpleValue('2 <= 2')).toEqual(['propName=true']); });
            testing_internal_1.it('should support false <= operations', function () { testing_internal_1.expect(_bindSimpleValue('2 <= 1')).toEqual(['propName=false']); });
            testing_internal_1.it('should support true >= operations', function () { testing_internal_1.expect(_bindSimpleValue('2 >= 1')).toEqual(['propName=true']); });
            testing_internal_1.it('should support equal >= operations', function () { testing_internal_1.expect(_bindSimpleValue('2 >= 2')).toEqual(['propName=true']); });
            testing_internal_1.it('should support false >= operations', function () { testing_internal_1.expect(_bindSimpleValue('1 >= 2')).toEqual(['propName=false']); });
            testing_internal_1.it('should support true && operations', function () { testing_internal_1.expect(_bindSimpleValue('true && true')).toEqual(['propName=true']); });
            testing_internal_1.it('should support false && operations', function () { testing_internal_1.expect(_bindSimpleValue('true && false')).toEqual(['propName=false']); });
            testing_internal_1.it('should support true || operations', function () { testing_internal_1.expect(_bindSimpleValue('true || false')).toEqual(['propName=true']); });
            testing_internal_1.it('should support false || operations', function () { testing_internal_1.expect(_bindSimpleValue('false || false')).toEqual(['propName=false']); });
            testing_internal_1.it('should support negate', function () { testing_internal_1.expect(_bindSimpleValue('!true')).toEqual(['propName=false']); });
            testing_internal_1.it('should support double negate', function () { testing_internal_1.expect(_bindSimpleValue('!!true')).toEqual(['propName=true']); });
            testing_internal_1.it('should support true conditionals', function () { testing_internal_1.expect(_bindSimpleValue('1 < 2 ? 1 : 2')).toEqual(['propName=1']); });
            testing_internal_1.it('should support false conditionals', function () { testing_internal_1.expect(_bindSimpleValue('1 > 2 ? 1 : 2')).toEqual(['propName=2']); });
            testing_internal_1.it('should support keyed access to a list item', function () { testing_internal_1.expect(_bindSimpleValue('["foo", "bar"][0]')).toEqual(['propName=foo']); });
            testing_internal_1.it('should support keyed access to a map item', function () { testing_internal_1.expect(_bindSimpleValue('{"foo": "bar"}["foo"]')).toEqual(['propName=bar']); });
            testing_internal_1.it('should report all changes on the first run including uninitialized values', function () {
                testing_internal_1.expect(_bindSimpleValue('value', new Uninitialized())).toEqual(['propName=null']);
            });
            testing_internal_1.it('should report all changes on the first run including null values', function () {
                var td = new TestData(null);
                testing_internal_1.expect(_bindSimpleValue('a', td)).toEqual(['propName=null']);
            });
            testing_internal_1.it('should support simple chained property access', function () {
                var address = new Address('Grenoble');
                var person = new Person('Victor', address);
                testing_internal_1.expect(_bindSimpleValue('address.city', person)).toEqual(['propName=Grenoble']);
            });
            testing_internal_1.it('should support the safe navigation operator', function () {
                var person = new Person('Victor', null);
                testing_internal_1.expect(_bindSimpleValue('address?.city', person)).toEqual(['propName=null']);
                testing_internal_1.expect(_bindSimpleValue('address?.toString()', person)).toEqual(['propName=null']);
                person.address = new Address('MTV');
                testing_internal_1.expect(_bindSimpleValue('address?.city', person)).toEqual(['propName=MTV']);
                testing_internal_1.expect(_bindSimpleValue('address?.toString()', person)).toEqual(['propName=MTV']);
            });
            testing_internal_1.it('should support method calls', function () {
                var person = new Person('Victor');
                testing_internal_1.expect(_bindSimpleValue('sayHi("Jim")', person)).toEqual(['propName=Hi, Jim']);
            });
            testing_internal_1.it('should support function calls', function () {
                var td = new TestData(function () { return function (a) { return a; }; });
                testing_internal_1.expect(_bindSimpleValue('a()(99)', td)).toEqual(['propName=99']);
            });
            testing_internal_1.it('should support chained method calls', function () {
                var person = new Person('Victor');
                var td = new TestData(person);
                testing_internal_1.expect(_bindSimpleValue('a.sayHi("Jim")', td)).toEqual(['propName=Hi, Jim']);
            });
            testing_internal_1.it('should support NaN', function () {
                var person = new Person('misko');
                person.age = lang_1.NumberWrapper.NaN;
                var val = _createChangeDetector('age', person);
                val.changeDetector.detectChanges();
                testing_internal_1.expect(val.dispatcher.log).toEqual(['propName=NaN']);
                val.dispatcher.clear();
                val.changeDetector.detectChanges();
                testing_internal_1.expect(val.dispatcher.log).toEqual([]);
            });
            testing_internal_1.it('should do simple watching', function () {
                var person = new Person('misko');
                var val = _createChangeDetector('name', person);
                val.changeDetector.detectChanges();
                testing_internal_1.expect(val.dispatcher.log).toEqual(['propName=misko']);
                val.dispatcher.clear();
                val.changeDetector.detectChanges();
                testing_internal_1.expect(val.dispatcher.log).toEqual([]);
                val.dispatcher.clear();
                person.name = 'Misko';
                val.changeDetector.detectChanges();
                testing_internal_1.expect(val.dispatcher.log).toEqual(['propName=Misko']);
            });
            testing_internal_1.it('should support literal array', function () {
                var val = _createChangeDetector('[1, 2]');
                val.changeDetector.detectChanges();
                testing_internal_1.expect(val.dispatcher.loggedValues).toEqual([[1, 2]]);
                val = _createChangeDetector('[1, a]', new TestData(2));
                val.changeDetector.detectChanges();
                testing_internal_1.expect(val.dispatcher.loggedValues).toEqual([[1, 2]]);
            });
            testing_internal_1.it('should support literal maps', function () {
                var val = _createChangeDetector('{z: 1}');
                val.changeDetector.detectChanges();
                testing_internal_1.expect(val.dispatcher.loggedValues[0]['z']).toEqual(1);
                val = _createChangeDetector('{z: a}', new TestData(1));
                val.changeDetector.detectChanges();
                testing_internal_1.expect(val.dispatcher.loggedValues[0]['z']).toEqual(1);
            });
            testing_internal_1.it('should support interpolation', function () {
                var val = _createChangeDetector('interpolation', new TestData('value'));
                val.changeDetector.hydrate(new TestData('value'), null, null, null);
                val.changeDetector.detectChanges();
                testing_internal_1.expect(val.dispatcher.log).toEqual(['propName=BvalueA']);
            });
            testing_internal_1.it('should output empty strings for null values in interpolation', function () {
                var val = _createChangeDetector('interpolation', new TestData('value'));
                val.changeDetector.hydrate(new TestData(null), null, null, null);
                val.changeDetector.detectChanges();
                testing_internal_1.expect(val.dispatcher.log).toEqual(['propName=BA']);
            });
            testing_internal_1.it('should escape values in literals that indicate interpolation', function () { testing_internal_1.expect(_bindSimpleValue('"$"')).toEqual(['propName=$']); });
            testing_internal_1.describe('pure functions', function () {
                testing_internal_1.it('should preserve memoized result', function () {
                    var person = new Person('bob');
                    var val = _createChangeDetector('passThrough([12])', person);
                    val.changeDetector.detectChanges();
                    val.changeDetector.detectChanges();
                    testing_internal_1.expect(val.dispatcher.loggedValues).toEqual([[12]]);
                });
            });
            testing_internal_1.describe('change notification', function () {
                testing_internal_1.describe('simple checks', function () {
                    testing_internal_1.it('should pass a change record to the dispatcher', function () {
                        var person = new Person('bob');
                        var val = _createChangeDetector('name', person);
                        val.changeDetector.detectChanges();
                        testing_internal_1.expect(val.dispatcher.loggedValues).toEqual(['bob']);
                    });
                });
                testing_internal_1.describe('pipes', function () {
                    testing_internal_1.it('should pass a change record to the dispatcher', function () {
                        var registry = new FakePipes('pipe', function () { return new CountingPipe(); });
                        var person = new Person('bob');
                        var val = _createChangeDetector('name | pipe', person, registry);
                        val.changeDetector.detectChanges();
                        testing_internal_1.expect(val.dispatcher.loggedValues).toEqual(['bob state:0']);
                    });
                    testing_internal_1.it('should support arguments in pipes', function () {
                        var registry = new FakePipes('pipe', function () { return new MultiArgPipe(); });
                        var address = new Address('two');
                        var person = new Person('value', address);
                        var val = _createChangeDetector("name | pipe:'one':address.city", person, registry);
                        val.changeDetector.detectChanges();
                        testing_internal_1.expect(val.dispatcher.loggedValues).toEqual(['value one two default']);
                    });
                    testing_internal_1.it('should associate pipes right-to-left', function () {
                        var registry = new FakePipes('pipe', function () { return new MultiArgPipe(); });
                        var person = new Person('value');
                        var val = _createChangeDetector("name | pipe:'a':'b' | pipe:0:1:2", person, registry);
                        val.changeDetector.detectChanges();
                        testing_internal_1.expect(val.dispatcher.loggedValues).toEqual(['value a b default 0 1 2']);
                    });
                    testing_internal_1.it('should not reevaluate pure pipes unless its context or arg changes', function () {
                        var pipe = new CountingPipe();
                        var registry = new FakePipes('pipe', function () { return pipe; }, { pure: true });
                        var person = new Person('bob');
                        var val = _createChangeDetector('name | pipe', person, registry);
                        val.changeDetector.detectChanges();
                        testing_internal_1.expect(pipe.state).toEqual(1);
                        val.changeDetector.detectChanges();
                        testing_internal_1.expect(pipe.state).toEqual(1);
                        person.name = 'jim';
                        val.changeDetector.detectChanges();
                        testing_internal_1.expect(pipe.state).toEqual(2);
                    });
                    testing_internal_1.it('should reevaluate impure pipes neither context nor arg changes', function () {
                        var pipe = new CountingPipe();
                        var registry = new FakePipes('pipe', function () { return pipe; }, { pure: false });
                        var person = new Person('bob');
                        var val = _createChangeDetector('name | pipe', person, registry);
                        val.changeDetector.detectChanges();
                        testing_internal_1.expect(pipe.state).toEqual(1);
                        val.changeDetector.detectChanges();
                        testing_internal_1.expect(pipe.state).toEqual(2);
                    });
                    testing_internal_1.it('should support pipes as arguments to pure functions', function () {
                        var registry = new FakePipes('pipe', function () { return new IdentityPipe(); });
                        var person = new Person('bob');
                        var val = _createChangeDetector('(name | pipe).length', person, registry);
                        val.changeDetector.detectChanges();
                        testing_internal_1.expect(val.dispatcher.loggedValues).toEqual([3]);
                    });
                });
                testing_internal_1.it('should notify the dispatcher after content children have checked', function () {
                    var val = _createChangeDetector('name', new Person('bob'));
                    val.changeDetector.detectChanges();
                    testing_internal_1.expect(val.dispatcher.afterContentCheckedCalled).toEqual(true);
                });
                testing_internal_1.it('should notify the dispatcher after view children have been checked', function () {
                    var val = _createChangeDetector('name', new Person('bob'));
                    val.changeDetector.detectChanges();
                    testing_internal_1.expect(val.dispatcher.afterViewCheckedCalled).toEqual(true);
                });
                testing_internal_1.describe('updating directives', function () {
                    var directive1;
                    var directive2;
                    var directive3;
                    testing_internal_1.beforeEach(function () {
                        directive1 = new TestDirective();
                        directive2 = new TestDirective();
                        directive3 = new TestDirective(null, null, true);
                    });
                    testing_internal_1.it('should happen directly, without invoking the dispatcher', function () {
                        var val = _createWithoutHydrate('directNoDispatcher');
                        val.changeDetector.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []), null);
                        val.changeDetector.detectChanges();
                        testing_internal_1.expect(val.dispatcher.loggedValues).toEqual([]);
                        testing_internal_1.expect(directive1.a).toEqual(42);
                    });
                    testing_internal_1.describe('lifecycle', function () {
                        testing_internal_1.describe('onChanges', function () {
                            testing_internal_1.it('should notify the directive when a group of records changes', function () {
                                var cd = _createWithoutHydrate('groupChanges').changeDetector;
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1, directive2], []), null);
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.changes).toEqual({ 'a': 1, 'b': 2 });
                                testing_internal_1.expect(directive2.changes).toEqual({ 'a': 3 });
                            });
                        });
                        testing_internal_1.describe('doCheck', function () {
                            testing_internal_1.it('should notify the directive when it is checked', function () {
                                var cd = _createWithoutHydrate('directiveDoCheck').changeDetector;
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []), null);
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.doCheckCalled).toBe(true);
                                directive1.doCheckCalled = false;
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.doCheckCalled).toBe(true);
                            });
                            testing_internal_1.it('should not call doCheck in detectNoChanges', function () {
                                var cd = _createWithoutHydrate('directiveDoCheck').changeDetector;
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []), null);
                                cd.checkNoChanges();
                                testing_internal_1.expect(directive1.doCheckCalled).toBe(false);
                            });
                        });
                        testing_internal_1.describe('onInit', function () {
                            testing_internal_1.it('should notify the directive after it has been checked the first time', function () {
                                var cd = _createWithoutHydrate('directiveOnInit').changeDetector;
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1, directive2], []), null);
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.onInitCalled).toBe(true);
                                directive1.onInitCalled = false;
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.onInitCalled).toBe(false);
                            });
                            testing_internal_1.it('should not call onInit in detectNoChanges', function () {
                                var cd = _createWithoutHydrate('directiveOnInit').changeDetector;
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []), null);
                                cd.checkNoChanges();
                                testing_internal_1.expect(directive1.onInitCalled).toBe(false);
                            });
                            testing_internal_1.it('should not call onInit again if it throws', function () {
                                var cd = _createWithoutHydrate('directiveOnInit').changeDetector;
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive3], []), null);
                                var errored = false;
                                // First pass fails, but onInit should be called.
                                try {
                                    cd.detectChanges();
                                }
                                catch (e) {
                                    errored = true;
                                }
                                testing_internal_1.expect(errored).toBe(true);
                                testing_internal_1.expect(directive3.onInitCalled).toBe(true);
                                directive3.onInitCalled = false;
                                // Second change detection also fails, but this time onInit should not be called.
                                try {
                                    cd.detectChanges();
                                }
                                catch (e) {
                                    throw new exceptions_1.BaseException("Second detectChanges() should not have run detection.");
                                }
                                testing_internal_1.expect(directive3.onInitCalled).toBe(false);
                            });
                        });
                        testing_internal_1.describe('afterContentInit', function () {
                            testing_internal_1.it('should be called after processing the content children', function () {
                                var cd = _createWithoutHydrate('emptyWithDirectiveRecords').changeDetector;
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1, directive2], []), null);
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.afterContentInitCalled).toBe(true);
                                testing_internal_1.expect(directive2.afterContentInitCalled).toBe(true);
                                // reset directives
                                directive1.afterContentInitCalled = false;
                                directive2.afterContentInitCalled = false;
                                // Verify that checking should not call them.
                                cd.checkNoChanges();
                                testing_internal_1.expect(directive1.afterContentInitCalled).toBe(false);
                                testing_internal_1.expect(directive2.afterContentInitCalled).toBe(false);
                                // re-verify that changes should not call them
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.afterContentInitCalled).toBe(false);
                                testing_internal_1.expect(directive2.afterContentInitCalled).toBe(false);
                            });
                            testing_internal_1.it('should not be called when afterContentInit is false', function () {
                                var cd = _createWithoutHydrate('noCallbacks').changeDetector;
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []), null);
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.afterContentInitCalled).toEqual(false);
                            });
                        });
                        testing_internal_1.describe('afterContentChecked', function () {
                            testing_internal_1.it('should be called after processing all the children', function () {
                                var cd = _createWithoutHydrate('emptyWithDirectiveRecords').changeDetector;
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1, directive2], []), null);
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.afterContentCheckedCalled).toBe(true);
                                testing_internal_1.expect(directive2.afterContentCheckedCalled).toBe(true);
                                // reset directives
                                directive1.afterContentCheckedCalled = false;
                                directive2.afterContentCheckedCalled = false;
                                // Verify that checking should not call them.
                                cd.checkNoChanges();
                                testing_internal_1.expect(directive1.afterContentCheckedCalled).toBe(false);
                                testing_internal_1.expect(directive2.afterContentCheckedCalled).toBe(false);
                                // re-verify that changes are still detected
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.afterContentCheckedCalled).toBe(true);
                                testing_internal_1.expect(directive2.afterContentCheckedCalled).toBe(true);
                            });
                            testing_internal_1.it('should not be called when afterContentChecked is false', function () {
                                var cd = _createWithoutHydrate('noCallbacks').changeDetector;
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []), null);
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.afterContentCheckedCalled).toEqual(false);
                            });
                            testing_internal_1.it('should be called in reverse order so the child is always notified before the parent', function () {
                                var cd = _createWithoutHydrate('emptyWithDirectiveRecords').changeDetector;
                                var onChangesDoneCalls = [];
                                var td1;
                                td1 = new TestDirective(function () { return onChangesDoneCalls.push(td1); });
                                var td2;
                                td2 = new TestDirective(function () { return onChangesDoneCalls.push(td2); });
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([td1, td2], []), null);
                                cd.detectChanges();
                                testing_internal_1.expect(onChangesDoneCalls).toEqual([td2, td1]);
                            });
                            testing_internal_1.it('should be called before processing view children', function () {
                                var parent = _createWithoutHydrate('directNoDispatcher').changeDetector;
                                var child = _createWithoutHydrate('directNoDispatcher').changeDetector;
                                parent.addViewChild(child);
                                var orderOfOperations = [];
                                var directiveInShadowDom;
                                directiveInShadowDom =
                                    new TestDirective(function () { orderOfOperations.push(directiveInShadowDom); });
                                var parentDirective;
                                parentDirective =
                                    new TestDirective(function () { orderOfOperations.push(parentDirective); });
                                parent.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([parentDirective], []), null);
                                child.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directiveInShadowDom], []), null);
                                parent.detectChanges();
                                testing_internal_1.expect(orderOfOperations).toEqual([parentDirective, directiveInShadowDom]);
                            });
                        });
                        testing_internal_1.describe('afterViewInit', function () {
                            testing_internal_1.it('should be called after processing the view children', function () {
                                var cd = _createWithoutHydrate('emptyWithDirectiveRecords').changeDetector;
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1, directive2], []), null);
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.afterViewInitCalled).toBe(true);
                                testing_internal_1.expect(directive2.afterViewInitCalled).toBe(true);
                                // reset directives
                                directive1.afterViewInitCalled = false;
                                directive2.afterViewInitCalled = false;
                                // Verify that checking should not call them.
                                cd.checkNoChanges();
                                testing_internal_1.expect(directive1.afterViewInitCalled).toBe(false);
                                testing_internal_1.expect(directive2.afterViewInitCalled).toBe(false);
                                // re-verify that changes should not call them
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.afterViewInitCalled).toBe(false);
                                testing_internal_1.expect(directive2.afterViewInitCalled).toBe(false);
                            });
                            testing_internal_1.it('should not be called when afterViewInit is false', function () {
                                var cd = _createWithoutHydrate('noCallbacks').changeDetector;
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []), null);
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.afterViewInitCalled).toEqual(false);
                            });
                        });
                        testing_internal_1.describe('afterViewChecked', function () {
                            testing_internal_1.it('should be called after processing the view children', function () {
                                var cd = _createWithoutHydrate('emptyWithDirectiveRecords').changeDetector;
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1, directive2], []), null);
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.afterViewCheckedCalled).toBe(true);
                                testing_internal_1.expect(directive2.afterViewCheckedCalled).toBe(true);
                                // reset directives
                                directive1.afterViewCheckedCalled = false;
                                directive2.afterViewCheckedCalled = false;
                                // Verify that checking should not call them.
                                cd.checkNoChanges();
                                testing_internal_1.expect(directive1.afterViewCheckedCalled).toBe(false);
                                testing_internal_1.expect(directive2.afterViewCheckedCalled).toBe(false);
                                // re-verify that changes should call them
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.afterViewCheckedCalled).toBe(true);
                                testing_internal_1.expect(directive2.afterViewCheckedCalled).toBe(true);
                            });
                            testing_internal_1.it('should not be called when afterViewChecked is false', function () {
                                var cd = _createWithoutHydrate('noCallbacks').changeDetector;
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive1], []), null);
                                cd.detectChanges();
                                testing_internal_1.expect(directive1.afterViewCheckedCalled).toEqual(false);
                            });
                            testing_internal_1.it('should be called in reverse order so the child is always notified before the parent', function () {
                                var cd = _createWithoutHydrate('emptyWithDirectiveRecords').changeDetector;
                                var onChangesDoneCalls = [];
                                var td1;
                                td1 = new TestDirective(null, function () { return onChangesDoneCalls.push(td1); });
                                var td2;
                                td2 = new TestDirective(null, function () { return onChangesDoneCalls.push(td2); });
                                cd.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([td1, td2], []), null);
                                cd.detectChanges();
                                testing_internal_1.expect(onChangesDoneCalls).toEqual([td2, td1]);
                            });
                            testing_internal_1.it('should be called after processing view children', function () {
                                var parent = _createWithoutHydrate('directNoDispatcher').changeDetector;
                                var child = _createWithoutHydrate('directNoDispatcher').changeDetector;
                                parent.addViewChild(child);
                                var orderOfOperations = [];
                                var directiveInShadowDom;
                                directiveInShadowDom = new TestDirective(null, function () { orderOfOperations.push(directiveInShadowDom); });
                                var parentDirective;
                                parentDirective =
                                    new TestDirective(null, function () { orderOfOperations.push(parentDirective); });
                                parent.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([parentDirective], []), null);
                                child.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directiveInShadowDom], []), null);
                                parent.detectChanges();
                                testing_internal_1.expect(orderOfOperations).toEqual([directiveInShadowDom, parentDirective]);
                            });
                        });
                    });
                });
            });
            testing_internal_1.describe("logBindingUpdate", function () {
                testing_internal_1.it('should be called for element updates in the dev mode', function () {
                    var person = new Person('bob');
                    var val = _createChangeDetector('name', person);
                    val.changeDetector.detectChanges();
                    testing_internal_1.expect(val.dispatcher.debugLog).toEqual(['propName=bob']);
                });
                testing_internal_1.it('should be called for directive updates in the dev mode', function () {
                    var val = _createWithoutHydrate('directNoDispatcher');
                    val.changeDetector.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([new TestDirective()], []), null);
                    val.changeDetector.detectChanges();
                    testing_internal_1.expect(val.dispatcher.debugLog).toEqual(["a=42"]);
                });
                testing_internal_1.it('should not be called in the prod mode', function () {
                    var person = new Person('bob');
                    var val = _createChangeDetector('updateElementProduction', person);
                    val.changeDetector.detectChanges();
                    testing_internal_1.expect(val.dispatcher.debugLog).toEqual([]);
                });
            });
            testing_internal_1.describe('reading directives', function () {
                testing_internal_1.it('should read directive properties', function () {
                    var directive = new TestDirective();
                    directive.a = 'aaa';
                    var val = _createWithoutHydrate('readingDirectives');
                    val.changeDetector.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([directive], []), null);
                    val.changeDetector.detectChanges();
                    testing_internal_1.expect(val.dispatcher.loggedValues).toEqual(['aaa']);
                });
            });
            testing_internal_1.describe('enforce no new changes', function () {
                testing_internal_1.it('should throw when a record gets changed after it has been checked', function () {
                    var val = _createChangeDetector('a', new TestData('value'));
                    testing_internal_1.expect(function () { val.changeDetector.checkNoChanges(); })
                        .toThrowError(new RegExp('Expression [\'"]a in location[\'"] has changed after it was checked'));
                });
                testing_internal_1.it('should not break the next run', function () {
                    var val = _createChangeDetector('a', new TestData('value'));
                    testing_internal_1.expect(function () { return val.changeDetector.checkNoChanges(); })
                        .toThrowError(new RegExp('Expression [\'"]a in location[\'"] has changed after it was checked.'));
                    val.changeDetector.detectChanges();
                    testing_internal_1.expect(val.dispatcher.loggedValues).toEqual(['value']);
                });
            });
            testing_internal_1.describe('error handling', function () {
                testing_internal_1.it('should wrap exceptions into ChangeDetectionError', function () {
                    var val = _createChangeDetector('invalidFn(1)');
                    try {
                        val.changeDetector.detectChanges();
                        throw new exceptions_1.BaseException('fail');
                    }
                    catch (e) {
                        testing_internal_1.expect(e).toBeAnInstanceOf(change_detection_1.ChangeDetectionError);
                        testing_internal_1.expect(e.location).toEqual('invalidFn(1) in location');
                    }
                });
                testing_internal_1.it('should handle unexpected errors in the event handler itself', function () {
                    var throwingDispatcher = new spies_1.SpyChangeDispatcher();
                    throwingDispatcher.spy("getDebugContext")
                        .andCallFake(function (_, __) { throw new exceptions_1.BaseException('boom'); });
                    var val = _createChangeDetector('invalidFn(1)', _DEFAULT_CONTEXT, null, throwingDispatcher);
                    try {
                        val.changeDetector.detectChanges();
                        throw new exceptions_1.BaseException('fail');
                    }
                    catch (e) {
                        testing_internal_1.expect(e).toBeAnInstanceOf(change_detection_1.ChangeDetectionError);
                        testing_internal_1.expect(e.location).toEqual(null);
                    }
                });
            });
            testing_internal_1.describe('Locals', function () {
                testing_internal_1.it('should read a value from locals', function () { testing_internal_1.expect(_bindSimpleValue('valueFromLocals')).toEqual(['propName=value']); });
                testing_internal_1.it('should invoke a function from local', function () { testing_internal_1.expect(_bindSimpleValue('functionFromLocals')).toEqual(['propName=value']); });
                testing_internal_1.it('should handle nested locals', function () { testing_internal_1.expect(_bindSimpleValue('nestedLocals')).toEqual(['propName=value']); });
                testing_internal_1.it('should fall back to a regular field read when the locals map' +
                    'does not have the requested field', function () {
                    testing_internal_1.expect(_bindSimpleValue('fallbackLocals', new Person('Jim')))
                        .toEqual(['propName=Jim']);
                });
                testing_internal_1.it('should correctly handle nested properties', function () {
                    var address = new Address('Grenoble');
                    var person = new Person('Victor', address);
                    testing_internal_1.expect(_bindSimpleValue('contextNestedPropertyWithLocals', person))
                        .toEqual(['propName=Grenoble']);
                    testing_internal_1.expect(_bindSimpleValue('localPropertyWithSimilarContext', person))
                        .toEqual(['propName=MTV']);
                });
            });
            testing_internal_1.describe('handle children', function () {
                var parent, child;
                testing_internal_1.beforeEach(function () {
                    parent = _createChangeDetector('10').changeDetector;
                    child = _createChangeDetector('"str"').changeDetector;
                });
                testing_internal_1.it('should add content children', function () {
                    parent.addContentChild(child);
                    testing_internal_1.expect(parent.contentChildren.length).toEqual(1);
                    testing_internal_1.expect(parent.contentChildren[0]).toBe(child);
                });
                testing_internal_1.it('should add view children', function () {
                    parent.addViewChild(child);
                    testing_internal_1.expect(parent.viewChildren.length).toEqual(1);
                    testing_internal_1.expect(parent.viewChildren[0]).toBe(child);
                });
                testing_internal_1.it('should remove content children', function () {
                    parent.addContentChild(child);
                    parent.removeContentChild(child);
                    testing_internal_1.expect(parent.contentChildren).toEqual([]);
                });
                testing_internal_1.it('should remove view children', function () {
                    parent.addViewChild(child);
                    parent.removeViewChild(child);
                    testing_internal_1.expect(parent.viewChildren.length).toEqual(0);
                });
            });
            testing_internal_1.describe('mode', function () {
                testing_internal_1.it('should set the mode to CheckAlways when the default change detection is used', function () {
                    var cd = _createWithoutHydrate('emptyUsingDefaultStrategy').changeDetector;
                    testing_internal_1.expect(cd.mode).toEqual(null);
                    cd.hydrate(_DEFAULT_CONTEXT, null, null, null);
                    testing_internal_1.expect(cd.mode).toEqual(change_detection_1.ChangeDetectionStrategy.CheckAlways);
                });
                testing_internal_1.it('should set the mode to CheckOnce when the push change detection is used', function () {
                    var cd = _createWithoutHydrate('emptyUsingOnPushStrategy').changeDetector;
                    cd.hydrate(_DEFAULT_CONTEXT, null, null, null);
                    testing_internal_1.expect(cd.mode).toEqual(change_detection_1.ChangeDetectionStrategy.CheckOnce);
                });
                testing_internal_1.it('should not check a detached change detector', function () {
                    var val = _createChangeDetector('a', new TestData('value'));
                    val.changeDetector.hydrate(_DEFAULT_CONTEXT, null, null, null);
                    val.changeDetector.mode = change_detection_1.ChangeDetectionStrategy.Detached;
                    val.changeDetector.detectChanges();
                    testing_internal_1.expect(val.dispatcher.log).toEqual([]);
                });
                testing_internal_1.it('should not check a checked change detector', function () {
                    var val = _createChangeDetector('a', new TestData('value'));
                    val.changeDetector.hydrate(_DEFAULT_CONTEXT, null, null, null);
                    val.changeDetector.mode = change_detection_1.ChangeDetectionStrategy.Checked;
                    val.changeDetector.detectChanges();
                    testing_internal_1.expect(val.dispatcher.log).toEqual([]);
                });
                testing_internal_1.it('should change CheckOnce to Checked', function () {
                    var cd = _createChangeDetector('10').changeDetector;
                    cd.hydrate(_DEFAULT_CONTEXT, null, null, null);
                    cd.mode = change_detection_1.ChangeDetectionStrategy.CheckOnce;
                    cd.detectChanges();
                    testing_internal_1.expect(cd.mode).toEqual(change_detection_1.ChangeDetectionStrategy.Checked);
                });
                testing_internal_1.it('should not change the CheckAlways', function () {
                    var cd = _createChangeDetector('10').changeDetector;
                    cd.hydrate(_DEFAULT_CONTEXT, null, null, null);
                    cd.mode = change_detection_1.ChangeDetectionStrategy.CheckAlways;
                    cd.detectChanges();
                    testing_internal_1.expect(cd.mode).toEqual(change_detection_1.ChangeDetectionStrategy.CheckAlways);
                });
                testing_internal_1.describe('marking OnPush detectors as CheckOnce after an update', function () {
                    var childDirectiveDetectorRegular;
                    var childDirectiveDetectorOnPush;
                    var directives;
                    testing_internal_1.beforeEach(function () {
                        childDirectiveDetectorRegular = _createWithoutHydrate('10').changeDetector;
                        childDirectiveDetectorRegular.hydrate(_DEFAULT_CONTEXT, null, null, null);
                        childDirectiveDetectorRegular.mode = change_detection_1.ChangeDetectionStrategy.CheckAlways;
                        childDirectiveDetectorOnPush =
                            _createWithoutHydrate('emptyUsingOnPushStrategy').changeDetector;
                        childDirectiveDetectorOnPush.hydrate(_DEFAULT_CONTEXT, null, null, null);
                        childDirectiveDetectorOnPush.mode = change_detection_1.ChangeDetectionStrategy.Checked;
                        directives =
                            new FakeDirectives([new TestData(null), new TestData(null)], [childDirectiveDetectorRegular, childDirectiveDetectorOnPush]);
                    });
                    testing_internal_1.it('should set the mode to CheckOnce when a binding is updated', function () {
                        var parentDetector = _createWithoutHydrate('onPushRecordsUsingDefaultStrategy').changeDetector;
                        parentDetector.hydrate(_DEFAULT_CONTEXT, null, directives, null);
                        parentDetector.detectChanges();
                        // making sure that we only change the status of OnPush components
                        testing_internal_1.expect(childDirectiveDetectorRegular.mode).toEqual(change_detection_1.ChangeDetectionStrategy.CheckAlways);
                        testing_internal_1.expect(childDirectiveDetectorOnPush.mode).toEqual(change_detection_1.ChangeDetectionStrategy.CheckOnce);
                    });
                    testing_internal_1.it('should mark OnPush detectors as CheckOnce after an event', function () {
                        var cd = _createWithoutHydrate('onPushWithEvent').changeDetector;
                        cd.hydrate(_DEFAULT_CONTEXT, null, directives, null);
                        cd.mode = change_detection_1.ChangeDetectionStrategy.Checked;
                        cd.handleEvent("event", 0, null);
                        testing_internal_1.expect(cd.mode).toEqual(change_detection_1.ChangeDetectionStrategy.CheckOnce);
                    });
                    testing_internal_1.it('should mark OnPush detectors as CheckOnce after a host event', function () {
                        var cd = _createWithoutHydrate('onPushWithHostEvent').changeDetector;
                        cd.hydrate(_DEFAULT_CONTEXT, null, directives, null);
                        cd.handleEvent("host-event", 0, null);
                        testing_internal_1.expect(childDirectiveDetectorOnPush.mode).toEqual(change_detection_1.ChangeDetectionStrategy.CheckOnce);
                    });
                    if (lang_2.IS_DART) {
                        testing_internal_1.describe('OnPushObserve', function () {
                            testing_internal_1.it('should mark OnPushObserve detectors as CheckOnce when an observable fires an event', testing_internal_1.fakeAsync(function () {
                                var context = new TestDirective();
                                context.a = change_detector_spec_util_1.createObservableModel();
                                var cd = _createWithoutHydrate('onPushObserveBinding').changeDetector;
                                cd.hydrate(context, null, directives, null);
                                cd.detectChanges();
                                testing_internal_1.expect(cd.mode).toEqual(change_detection_1.ChangeDetectionStrategy.Checked);
                                context.a.pushUpdate();
                                testing_internal_1.tick();
                                testing_internal_1.expect(cd.mode).toEqual(change_detection_1.ChangeDetectionStrategy.CheckOnce);
                            }));
                            testing_internal_1.it('should mark OnPushObserve detectors as CheckOnce when an observable context fires an event', testing_internal_1.fakeAsync(function () {
                                var context = change_detector_spec_util_1.createObservableModel();
                                var cd = _createWithoutHydrate('onPushObserveComponent').changeDetector;
                                cd.hydrate(context, null, directives, null);
                                cd.detectChanges();
                                testing_internal_1.expect(cd.mode).toEqual(change_detection_1.ChangeDetectionStrategy.Checked);
                                context.pushUpdate();
                                testing_internal_1.tick();
                                testing_internal_1.expect(cd.mode).toEqual(change_detection_1.ChangeDetectionStrategy.CheckOnce);
                            }));
                            testing_internal_1.it('should mark OnPushObserve detectors as CheckOnce when an observable directive fires an event', testing_internal_1.fakeAsync(function () {
                                var dir = change_detector_spec_util_1.createObservableModel();
                                var directives = new FakeDirectives([dir], []);
                                var cd = _createWithoutHydrate('onPushObserveDirective').changeDetector;
                                cd.hydrate(_DEFAULT_CONTEXT, null, directives, null);
                                cd.detectChanges();
                                testing_internal_1.expect(cd.mode).toEqual(change_detection_1.ChangeDetectionStrategy.Checked);
                                dir.pushUpdate();
                                testing_internal_1.tick();
                                testing_internal_1.expect(cd.mode).toEqual(change_detection_1.ChangeDetectionStrategy.CheckOnce);
                            }));
                            testing_internal_1.it('should unsubscribe from an old observable when an object changes', testing_internal_1.fakeAsync(function () {
                                var originalModel = change_detector_spec_util_1.createObservableModel();
                                var context = new TestDirective();
                                context.a = originalModel;
                                var cd = _createWithoutHydrate('onPushObserveBinding').changeDetector;
                                cd.hydrate(context, null, directives, null);
                                cd.detectChanges();
                                context.a = change_detector_spec_util_1.createObservableModel();
                                cd.mode = change_detection_1.ChangeDetectionStrategy.CheckOnce;
                                cd.detectChanges();
                                // Updating this model will not reenable the detector. This model is not longer
                                // used.
                                originalModel.pushUpdate();
                                testing_internal_1.tick();
                                testing_internal_1.expect(cd.mode).toEqual(change_detection_1.ChangeDetectionStrategy.Checked);
                            }));
                            testing_internal_1.it('should unsubscribe from observables when dehydrating', testing_internal_1.fakeAsync(function () {
                                var originalModel = change_detector_spec_util_1.createObservableModel();
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
                                testing_internal_1.tick();
                                testing_internal_1.expect(cd.mode).toEqual(change_detection_1.ChangeDetectionStrategy.Checked);
                            }));
                        });
                    }
                });
            });
            testing_internal_1.describe('markPathToRootAsCheckOnce', function () {
                function changeDetector(mode, parent) {
                    var val = _createChangeDetector('10');
                    val.changeDetector.mode = mode;
                    if (lang_1.isPresent(parent))
                        parent.addContentChild(val.changeDetector);
                    return val.changeDetector;
                }
                testing_internal_1.it('should mark all checked detectors as CheckOnce until reaching a detached one', function () {
                    var root = changeDetector(change_detection_1.ChangeDetectionStrategy.CheckAlways, null);
                    var disabled = changeDetector(change_detection_1.ChangeDetectionStrategy.Detached, root);
                    var parent = changeDetector(change_detection_1.ChangeDetectionStrategy.Checked, disabled);
                    var checkAlwaysChild = changeDetector(change_detection_1.ChangeDetectionStrategy.CheckAlways, parent);
                    var checkOnceChild = changeDetector(change_detection_1.ChangeDetectionStrategy.CheckOnce, checkAlwaysChild);
                    var checkedChild = changeDetector(change_detection_1.ChangeDetectionStrategy.Checked, checkOnceChild);
                    checkedChild.markPathToRootAsCheckOnce();
                    testing_internal_1.expect(root.mode).toEqual(change_detection_1.ChangeDetectionStrategy.CheckAlways);
                    testing_internal_1.expect(disabled.mode).toEqual(change_detection_1.ChangeDetectionStrategy.Detached);
                    testing_internal_1.expect(parent.mode).toEqual(change_detection_1.ChangeDetectionStrategy.CheckOnce);
                    testing_internal_1.expect(checkAlwaysChild.mode).toEqual(change_detection_1.ChangeDetectionStrategy.CheckAlways);
                    testing_internal_1.expect(checkOnceChild.mode).toEqual(change_detection_1.ChangeDetectionStrategy.CheckOnce);
                    testing_internal_1.expect(checkedChild.mode).toEqual(change_detection_1.ChangeDetectionStrategy.CheckOnce);
                });
            });
            testing_internal_1.describe('hydration', function () {
                testing_internal_1.it('should be able to rehydrate a change detector', function () {
                    var cd = _createChangeDetector('name').changeDetector;
                    cd.hydrate('some context', null, null, null);
                    testing_internal_1.expect(cd.hydrated()).toBe(true);
                    cd.dehydrate();
                    testing_internal_1.expect(cd.hydrated()).toBe(false);
                    cd.hydrate('other context', null, null, null);
                    testing_internal_1.expect(cd.hydrated()).toBe(true);
                });
                testing_internal_1.it('should destroy all active pipes implementing onDestroy during dehyration', function () {
                    var pipe = new PipeWithOnDestroy();
                    var registry = new FakePipes('pipe', function () { return pipe; });
                    var cd = _createChangeDetector('name | pipe', new Person('bob'), registry).changeDetector;
                    cd.detectChanges();
                    cd.dehydrate();
                    testing_internal_1.expect(pipe.destroyCalled).toBe(true);
                });
                testing_internal_1.it('should not call onDestroy all pipes that do not implement onDestroy', function () {
                    var pipe = new CountingPipe();
                    var registry = new FakePipes('pipe', function () { return pipe; });
                    var cd = _createChangeDetector('name | pipe', new Person('bob'), registry).changeDetector;
                    cd.detectChanges();
                    testing_internal_1.expect(function () { return cd.dehydrate(); }).not.toThrow();
                });
                testing_internal_1.it('should throw when detectChanges is called on a dehydrated detector', function () {
                    var context = new Person('Bob');
                    var val = _createChangeDetector('name', context);
                    val.changeDetector.detectChanges();
                    testing_internal_1.expect(val.dispatcher.log).toEqual(['propName=Bob']);
                    val.changeDetector.dehydrate();
                    testing_internal_1.expect(function () { val.changeDetector.detectChanges(); })
                        .toThrowErrorWith("Attempt to detect changes on a dehydrated detector");
                    testing_internal_1.expect(val.dispatcher.log).toEqual(['propName=Bob']);
                });
            });
            testing_internal_1.it('should do nothing when no change', function () {
                var registry = new FakePipes('pipe', function () { return new IdentityPipe(); });
                var ctx = new Person('Megatron');
                var val = _createChangeDetector('name | pipe', ctx, registry);
                val.changeDetector.detectChanges();
                testing_internal_1.expect(val.dispatcher.log).toEqual(['propName=Megatron']);
                val.dispatcher.clear();
                val.changeDetector.detectChanges();
                testing_internal_1.expect(val.dispatcher.log).toEqual([]);
            });
            testing_internal_1.it('should unwrap the wrapped value', function () {
                var registry = new FakePipes('pipe', function () { return new WrappedPipe(); });
                var ctx = new Person('Megatron');
                var val = _createChangeDetector('name | pipe', ctx, registry);
                val.changeDetector.detectChanges();
                testing_internal_1.expect(val.dispatcher.log).toEqual(['propName=Megatron']);
            });
            testing_internal_1.describe('handleEvent', function () {
                var locals;
                var d;
                testing_internal_1.beforeEach(function () {
                    locals = new change_detection_1.Locals(null, collection_1.MapWrapper.createFromStringMap({ "$event": "EVENT" }));
                    d = new TestDirective();
                });
                testing_internal_1.it('should execute events', function () {
                    var val = _createChangeDetector('(event)="onEvent($event)"', d, null);
                    val.changeDetector.handleEvent("event", 0, locals);
                    testing_internal_1.expect(d.event).toEqual("EVENT");
                });
                testing_internal_1.it('should execute host events', function () {
                    var val = _createWithoutHydrate('(host-event)="onEvent($event)"');
                    val.changeDetector.hydrate(_DEFAULT_CONTEXT, null, new FakeDirectives([d], []), null);
                    val.changeDetector.handleEvent("host-event", 0, locals);
                    testing_internal_1.expect(d.event).toEqual("EVENT");
                });
                testing_internal_1.it('should support field assignments', function () {
                    var val = _createChangeDetector('(event)="b=a=$event"', d, null);
                    val.changeDetector.handleEvent("event", 0, locals);
                    testing_internal_1.expect(d.a).toEqual("EVENT");
                    testing_internal_1.expect(d.b).toEqual("EVENT");
                });
                testing_internal_1.it('should support keyed assignments', function () {
                    d.a = ["OLD"];
                    var val = _createChangeDetector('(event)="a[0]=$event"', d, null);
                    val.changeDetector.handleEvent("event", 0, locals);
                    testing_internal_1.expect(d.a).toEqual(["EVENT"]);
                });
                testing_internal_1.it('should support chains', function () {
                    d.a = 0;
                    var val = _createChangeDetector('(event)="a=a+1; a=a+1;"', d, null);
                    val.changeDetector.handleEvent("event", 0, locals);
                    testing_internal_1.expect(d.a).toEqual(2);
                });
                // TODO: enable after chaning dart infrastructure for generating tests
                // it('should throw when trying to assign to a local', () => {
                //   expect(() => {
                //     _createChangeDetector('(event)="$event=1"', d, null)
                //   }).toThrowError(new RegExp("Cannot reassign a variable binding"));
                // });
                testing_internal_1.it('should return the prevent default value', function () {
                    var val = _createChangeDetector('(event)="false"', d, null);
                    var res = val.changeDetector.handleEvent("event", 0, locals);
                    testing_internal_1.expect(res).toBe(true);
                    val = _createChangeDetector('(event)="true"', d, null);
                    res = val.changeDetector.handleEvent("event", 0, locals);
                    testing_internal_1.expect(res).toBe(false);
                });
                testing_internal_1.it('should support short-circuiting', function () {
                    d.a = 0;
                    var val = _createChangeDetector('(event)="true ? a = a + 1 : a = a + 1"', d, null);
                    val.changeDetector.handleEvent("event", 0, locals);
                    testing_internal_1.expect(d.a).toEqual(1);
                });
            });
        });
    });
}
exports.main = main;
var CountingPipe = (function () {
    function CountingPipe() {
        this.state = 0;
    }
    CountingPipe.prototype.transform = function (value, args) {
        if (args === void 0) { args = null; }
        return value + " state:" + this.state++;
    };
    return CountingPipe;
})();
var PipeWithOnDestroy = (function () {
    function PipeWithOnDestroy() {
        this.destroyCalled = false;
    }
    PipeWithOnDestroy.prototype.onDestroy = function () { this.destroyCalled = true; };
    PipeWithOnDestroy.prototype.transform = function (value, args) {
        if (args === void 0) { args = null; }
        return null;
    };
    return PipeWithOnDestroy;
})();
var IdentityPipe = (function () {
    function IdentityPipe() {
    }
    IdentityPipe.prototype.transform = function (value, args) {
        if (args === void 0) { args = null; }
        return value;
    };
    return IdentityPipe;
})();
var WrappedPipe = (function () {
    function WrappedPipe() {
    }
    WrappedPipe.prototype.transform = function (value, args) {
        if (args === void 0) { args = null; }
        return change_detection_1.WrappedValue.wrap(value);
    };
    return WrappedPipe;
})();
var MultiArgPipe = (function () {
    function MultiArgPipe() {
    }
    MultiArgPipe.prototype.transform = function (value, args) {
        if (args === void 0) { args = null; }
        var arg1 = args[0];
        var arg2 = args[1];
        var arg3 = args.length > 2 ? args[2] : 'default';
        return value + " " + arg1 + " " + arg2 + " " + arg3;
    };
    return MultiArgPipe;
})();
var FakePipes = (function () {
    function FakePipes(pipeType, factory, _a) {
        var pure = (_a === void 0 ? {} : _a).pure;
        this.pipeType = pipeType;
        this.factory = factory;
        this.numberOfLookups = 0;
        this.pure = lang_1.normalizeBool(pure);
    }
    FakePipes.prototype.get = function (type) {
        if (type != this.pipeType)
            return null;
        this.numberOfLookups++;
        return new pipes_1.SelectedPipe(this.factory(), this.pure);
    };
    return FakePipes;
})();
var TestDirective = (function () {
    function TestDirective(afterContentCheckedSpy, afterViewCheckedSpy, throwOnInit) {
        if (afterContentCheckedSpy === void 0) { afterContentCheckedSpy = null; }
        if (afterViewCheckedSpy === void 0) { afterViewCheckedSpy = null; }
        if (throwOnInit === void 0) { throwOnInit = false; }
        this.afterContentCheckedSpy = afterContentCheckedSpy;
        this.afterViewCheckedSpy = afterViewCheckedSpy;
        this.throwOnInit = throwOnInit;
        this.doCheckCalled = false;
        this.onInitCalled = false;
        this.afterContentInitCalled = false;
        this.afterContentCheckedCalled = false;
        this.afterViewInitCalled = false;
        this.afterViewCheckedCalled = false;
    }
    TestDirective.prototype.onEvent = function (event) { this.event = event; };
    TestDirective.prototype.doCheck = function () { this.doCheckCalled = true; };
    TestDirective.prototype.onInit = function () {
        this.onInitCalled = true;
        if (this.throwOnInit) {
            throw "simulated onInit failure";
        }
    };
    TestDirective.prototype.onChanges = function (changes) {
        var r = {};
        collection_1.StringMapWrapper.forEach(changes, function (c, key) { return r[key] = c.currentValue; });
        this.changes = r;
    };
    TestDirective.prototype.afterContentInit = function () { this.afterContentInitCalled = true; };
    TestDirective.prototype.afterContentChecked = function () {
        this.afterContentCheckedCalled = true;
        if (lang_1.isPresent(this.afterContentCheckedSpy)) {
            this.afterContentCheckedSpy();
        }
    };
    TestDirective.prototype.afterViewInit = function () { this.afterViewInitCalled = true; };
    TestDirective.prototype.afterViewChecked = function () {
        this.afterViewCheckedCalled = true;
        if (lang_1.isPresent(this.afterViewCheckedSpy)) {
            this.afterViewCheckedSpy();
        }
    };
    return TestDirective;
})();
var Person = (function () {
    function Person(name, address) {
        if (address === void 0) { address = null; }
        this.name = name;
        this.address = address;
    }
    Person.prototype.sayHi = function (m) { return "Hi, " + m; };
    Person.prototype.passThrough = function (val) { return val; };
    Person.prototype.toString = function () {
        var address = this.address == null ? '' : ' address=' + this.address.toString();
        return 'name=' + this.name + address;
    };
    return Person;
})();
var Address = (function () {
    function Address(_city, _zipcode) {
        if (_zipcode === void 0) { _zipcode = null; }
        this._city = _city;
        this._zipcode = _zipcode;
        this.cityGetterCalls = 0;
        this.zipCodeGetterCalls = 0;
    }
    Object.defineProperty(Address.prototype, "city", {
        get: function () {
            this.cityGetterCalls++;
            return this._city;
        },
        set: function (v) { this._city = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Address.prototype, "zipcode", {
        get: function () {
            this.zipCodeGetterCalls++;
            return this._zipcode;
        },
        set: function (v) { this._zipcode = v; },
        enumerable: true,
        configurable: true
    });
    Address.prototype.toString = function () { return lang_1.isBlank(this.city) ? '-' : this.city; };
    return Address;
})();
var Logical = (function () {
    function Logical() {
        this.trueCalls = 0;
        this.falseCalls = 0;
    }
    Logical.prototype.getTrue = function () {
        this.trueCalls++;
        return true;
    };
    Logical.prototype.getFalse = function () {
        this.falseCalls++;
        return false;
    };
    return Logical;
})();
var Uninitialized = (function () {
    function Uninitialized() {
    }
    return Uninitialized;
})();
var TestData = (function () {
    function TestData(a) {
        this.a = a;
    }
    return TestData;
})();
var FakeDirectives = (function () {
    function FakeDirectives(directives, detectors) {
        this.directives = directives;
        this.detectors = detectors;
    }
    FakeDirectives.prototype.getDirectiveFor = function (di) { return this.directives[di.directiveIndex]; };
    FakeDirectives.prototype.getDetectorFor = function (di) { return this.detectors[di.directiveIndex]; };
    return FakeDirectives;
})();
var TestDispatcher = (function () {
    function TestDispatcher() {
        this.afterContentCheckedCalled = false;
        this.afterViewCheckedCalled = false;
        this.clear();
    }
    TestDispatcher.prototype.clear = function () {
        this.log = [];
        this.debugLog = [];
        this.loggedValues = [];
        this.afterContentCheckedCalled = true;
    };
    TestDispatcher.prototype.notifyOnBinding = function (target, value) {
        this.log.push(target.name + "=" + this._asString(value));
        this.loggedValues.push(value);
    };
    TestDispatcher.prototype.logBindingUpdate = function (target, value) { this.debugLog.push(target.name + "=" + this._asString(value)); };
    TestDispatcher.prototype.notifyAfterContentChecked = function () { this.afterContentCheckedCalled = true; };
    TestDispatcher.prototype.notifyAfterViewChecked = function () { this.afterViewCheckedCalled = true; };
    TestDispatcher.prototype.getDebugContext = function (a, b) { return null; };
    TestDispatcher.prototype._asString = function (value) {
        if (lang_1.isNumber(value) && lang_1.NumberWrapper.isNaN(value)) {
            return 'NaN';
        }
        return lang_1.isBlank(value) ? 'null' : value.toString();
    };
    return TestDispatcher;
})();
var _ChangeDetectorAndDispatcher = (function () {
    function _ChangeDetectorAndDispatcher(changeDetector, dispatcher) {
        this.changeDetector = changeDetector;
        this.dispatcher = dispatcher;
    }
    return _ChangeDetectorAndDispatcher;
})();
//# sourceMappingURL=change_detector_spec.js.map