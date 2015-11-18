var decorators_1 = require('angular2/src/core/util/decorators');
var ClassDecoratorMeta = (function () {
    function ClassDecoratorMeta(value) {
        this.value = value;
    }
    return ClassDecoratorMeta;
})();
exports.ClassDecoratorMeta = ClassDecoratorMeta;
var ParamDecoratorMeta = (function () {
    function ParamDecoratorMeta(value) {
        this.value = value;
    }
    return ParamDecoratorMeta;
})();
exports.ParamDecoratorMeta = ParamDecoratorMeta;
var PropDecoratorMeta = (function () {
    function PropDecoratorMeta(value) {
        this.value = value;
    }
    return PropDecoratorMeta;
})();
exports.PropDecoratorMeta = PropDecoratorMeta;
function classDecorator(value) {
    return new ClassDecoratorMeta(value);
}
exports.classDecorator = classDecorator;
function paramDecorator(value) {
    return new ParamDecoratorMeta(value);
}
exports.paramDecorator = paramDecorator;
function propDecorator(value) {
    return new PropDecoratorMeta(value);
}
exports.propDecorator = propDecorator;
exports.ClassDecorator = decorators_1.makeDecorator(ClassDecoratorMeta);
exports.ParamDecorator = decorators_1.makeParamDecorator(ParamDecoratorMeta);
exports.PropDecorator = decorators_1.makePropDecorator(PropDecoratorMeta);
// used only in Dart
var HasGetterAndSetterDecorators = (function () {
    function HasGetterAndSetterDecorators() {
    }
    return HasGetterAndSetterDecorators;
})();
exports.HasGetterAndSetterDecorators = HasGetterAndSetterDecorators;
//# sourceMappingURL=reflector_common.js.map