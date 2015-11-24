import { ChangeDetectorJITGenerator } from './change_detection_jit_generator';
export class JitProtoChangeDetector {
    constructor(definition) {
        this.definition = definition;
        this._factory = this._createFactory(definition);
    }
    static isSupported() { return true; }
    instantiate(dispatcher) { return this._factory(dispatcher); }
    /** @internal */
    _createFactory(definition) {
        return new ChangeDetectorJITGenerator(definition, 'util', 'AbstractChangeDetector', 'ChangeDetectorStatus')
            .generate();
    }
}
//# sourceMappingURL=jit_proto_change_detector.js.map