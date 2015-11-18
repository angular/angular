var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var testing_internal_1 = require('angular2/testing_internal');
var decorators_1 = require('angular2/src/core/util/decorators');
var lang_1 = require('angular2/src/facade/lang');
var angular2_1 = require('angular2/angular2');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var TestAnnotation = (function () {
    function TestAnnotation(arg) {
        this.arg = arg;
    }
    return TestAnnotation;
})();
var TerminalAnnotation = (function () {
    function TerminalAnnotation() {
        this.terminal = true;
    }
    return TerminalAnnotation;
})();
var DecoratedParent = (function () {
    function DecoratedParent() {
    }
    return DecoratedParent;
})();
var DecoratedChild = (function (_super) {
    __extends(DecoratedChild, _super);
    function DecoratedChild() {
        _super.apply(this, arguments);
    }
    return DecoratedChild;
})(DecoratedParent);
function main() {
    var Reflect = lang_1.global.Reflect;
    var TerminalDecorator = decorators_1.makeDecorator(TerminalAnnotation);
    var TestDecorator = decorators_1.makeDecorator(TestAnnotation, function (fn) { return fn.Terminal = TerminalDecorator; });
    testing_internal_1.describe('decorators', function () {
        testing_internal_1.it('should invoke as decorator', function () {
            function Type() { }
            TestDecorator({ marker: 'WORKS' })(Type);
            var annotations = Reflect.getMetadata('annotations', Type);
            testing_internal_1.expect(annotations[0].arg.marker).toEqual('WORKS');
        });
        testing_internal_1.it('should invoke as new', function () {
            var annotation = new TestDecorator({ marker: 'WORKS' });
            testing_internal_1.expect(annotation instanceof TestAnnotation).toEqual(true);
            testing_internal_1.expect(annotation.arg.marker).toEqual('WORKS');
        });
        testing_internal_1.it('should invoke as chain', function () {
            var chain = TestDecorator({ marker: 'WORKS' });
            testing_internal_1.expect(typeof chain.Terminal).toEqual('function');
            chain = chain.Terminal();
            testing_internal_1.expect(chain.annotations[0] instanceof TestAnnotation).toEqual(true);
            testing_internal_1.expect(chain.annotations[0].arg.marker).toEqual('WORKS');
            testing_internal_1.expect(chain.annotations[1] instanceof TerminalAnnotation).toEqual(true);
        });
        testing_internal_1.it('should not apply decorators from the prototype chain', function () {
            TestDecorator({ marker: 'parent' })(DecoratedParent);
            TestDecorator({ marker: 'child' })(DecoratedChild);
            var annotations = Reflect.getOwnMetadata('annotations', DecoratedChild);
            testing_internal_1.expect(annotations.length).toBe(1);
            testing_internal_1.expect(annotations[0].arg.marker).toEqual('child');
        });
        testing_internal_1.describe('Class', function () {
            testing_internal_1.it('should create a class', function () {
                var i0, i1;
                var MyClass = TestDecorator('test-works')
                    .Class({
                    extends: decorators_1.Class({
                        constructor: function () { },
                        extendWorks: function () { return 'extend ' + this.arg; }
                    }),
                    constructor: [String, function (arg) { this.arg = arg; }],
                    methodA: [i0 = new angular2_1.Inject(String), [i1 = angular2_1.Inject(String), Number], function (a, b) { }],
                    works: function () { return this.arg; },
                    prototype: 'IGNORE'
                });
                var obj = new MyClass('WORKS');
                testing_internal_1.expect(obj.arg).toEqual('WORKS');
                testing_internal_1.expect(obj.works()).toEqual('WORKS');
                testing_internal_1.expect(obj.extendWorks()).toEqual('extend WORKS');
                testing_internal_1.expect(reflection_1.reflector.parameters(MyClass)).toEqual([[String]]);
                testing_internal_1.expect(reflection_1.reflector.parameters(obj.methodA)).toEqual([[i0], [i1.annotation, Number]]);
                var proto = MyClass.prototype;
                testing_internal_1.expect(proto.extends).toEqual(undefined);
                testing_internal_1.expect(proto.prototype).toEqual(undefined);
                testing_internal_1.expect(reflection_1.reflector.annotations(MyClass)[0].arg).toEqual('test-works');
            });
            testing_internal_1.describe('errors', function () {
                testing_internal_1.it('should ensure that last constructor is required', function () {
                    testing_internal_1.expect(function () { decorators_1.Class({}); })
                        .toThrowError("Only Function or Array is supported in Class definition for key 'constructor' is 'undefined'");
                });
                testing_internal_1.it('should ensure that we dont accidently patch native objects', function () {
                    testing_internal_1.expect(function () { decorators_1.Class({ constructor: Object }); })
                        .toThrowError("Can not use native Object as constructor");
                });
                testing_internal_1.it('should ensure that last possition is function', function () {
                    testing_internal_1.expect(function () { decorators_1.Class({ constructor: [] }); })
                        .toThrowError("Last position of Class method array must be Function in key constructor was 'undefined'");
                });
                testing_internal_1.it('should ensure that annotation count matches paramaters count', function () {
                    testing_internal_1.expect(function () { decorators_1.Class({ constructor: [String, function MyType() { }] }); })
                        .toThrowError("Number of annotations (1) does not match number of arguments (0) in the function: MyType");
                });
                testing_internal_1.it('should ensure that only Function|Arrays are supported', function () {
                    testing_internal_1.expect(function () { decorators_1.Class({ constructor: function () { }, method: 'non_function' }); })
                        .toThrowError("Only Function or Array is supported in Class definition for key 'method' is 'non_function'");
                });
                testing_internal_1.it('should ensure that extends is a Function', function () {
                    testing_internal_1.expect(function () { decorators_1.Class({ extends: 'non_type', constructor: function () { } }); })
                        .toThrowError("Class definition 'extends' property must be a constructor function was: non_type");
                });
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=decorators_spec.js.map