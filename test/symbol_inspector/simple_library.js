// A library for the symbol inspector test
var A = (function () {
    function A(b) {
    }
    Object.defineProperty(A.prototype, "getter", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    A.prototype.method = function (p) { return null; };
    A.prototype.methodWithFunc = function (closure) { };
    A.staticMethod = function () { };
    A.staticField = null;
    return A;
})();
exports.A = A;
var ConsParamType = (function () {
    function ConsParamType() {
    }
    return ConsParamType;
})();
exports.ConsParamType = ConsParamType;
var FieldType = (function () {
    function FieldType() {
    }
    return FieldType;
})();
exports.FieldType = FieldType;
var GetterType = (function () {
    function GetterType() {
    }
    return GetterType;
})();
exports.GetterType = GetterType;
var MethodReturnType = (function () {
    function MethodReturnType() {
    }
    return MethodReturnType;
})();
exports.MethodReturnType = MethodReturnType;
var ParamType = (function () {
    function ParamType() {
    }
    return ParamType;
})();
exports.ParamType = ParamType;
var StaticFieldType = (function () {
    function StaticFieldType() {
    }
    return StaticFieldType;
})();
exports.StaticFieldType = StaticFieldType;
var ClosureReturn = (function () {
    function ClosureReturn() {
    }
    return ClosureReturn;
})();
exports.ClosureReturn = ClosureReturn;
var ClosureParam = (function () {
    function ClosureParam() {
    }
    return ClosureParam;
})();
exports.ClosureParam = ClosureParam;
var TypedefReturnType = (function () {
    function TypedefReturnType() {
    }
    return TypedefReturnType;
})();
exports.TypedefReturnType = TypedefReturnType;
var TypedefParam = (function () {
    function TypedefParam() {
    }
    return TypedefParam;
})();
exports.TypedefParam = TypedefParam;
var Generic = (function () {
    function Generic() {
    }
    Object.defineProperty(Generic.prototype, "getter", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    return Generic;
})();
exports.Generic = Generic;
//# sourceMappingURL=simple_library.js.map