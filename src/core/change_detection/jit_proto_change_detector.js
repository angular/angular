'use strict';var change_detection_jit_generator_1 = require('./change_detection_jit_generator');
var JitProtoChangeDetector = (function () {
    function JitProtoChangeDetector(definition) {
        this.definition = definition;
        this._factory = this._createFactory(definition);
    }
    JitProtoChangeDetector.isSupported = function () { return true; };
    JitProtoChangeDetector.prototype.instantiate = function (dispatcher) { return this._factory(dispatcher); };
    /** @internal */
    JitProtoChangeDetector.prototype._createFactory = function (definition) {
        return new change_detection_jit_generator_1.ChangeDetectorJITGenerator(definition, 'util', 'AbstractChangeDetector', 'ChangeDetectorStatus')
            .generate();
    };
    return JitProtoChangeDetector;
})();
exports.JitProtoChangeDetector = JitProtoChangeDetector;
//# sourceMappingURL=jit_proto_change_detector.js.map