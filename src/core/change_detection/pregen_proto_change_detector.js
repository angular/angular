'use strict';var exceptions_1 = require('angular2/src/facade/exceptions');
var PregenProtoChangeDetector = (function () {
    function PregenProtoChangeDetector() {
    }
    PregenProtoChangeDetector.isSupported = function () { return false; };
    PregenProtoChangeDetector.prototype.instantiate = function (dispatcher) {
        throw new exceptions_1.BaseException('Pregen change detection not supported in Js');
    };
    return PregenProtoChangeDetector;
})();
exports.PregenProtoChangeDetector = PregenProtoChangeDetector;
//# sourceMappingURL=pregen_proto_change_detector.js.map