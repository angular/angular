'use strict';// Note: This class is only here so that we can reference it from TypeScript code.
// The actual implementation lives under modules_dart.
// TODO(tbosch): Move the corresponding code into angular2/src/compiler once
// the new compiler is done.
var Codegen = (function () {
    function Codegen(moduleAlias) {
    }
    Codegen.prototype.generate = function (typeName, changeDetectorTypeName, def) {
        throw "Not implemented in JS";
    };
    Codegen.prototype.toString = function () { throw "Not implemented in JS"; };
    return Codegen;
})();
exports.Codegen = Codegen;
//# sourceMappingURL=change_detector_codegen.js.map