'use strict';/**
 * Type literals is a Dart-only feature. This is here only so we can x-compile
 * to multiple languages.
 */
var TypeLiteral = (function () {
    function TypeLiteral() {
    }
    Object.defineProperty(TypeLiteral.prototype, "type", {
        get: function () { throw new Error("Type literals are only supported in Dart"); },
        enumerable: true,
        configurable: true
    });
    return TypeLiteral;
})();
exports.TypeLiteral = TypeLiteral;
//# sourceMappingURL=type_literal.js.map