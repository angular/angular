import { ChangeDetectorJITGenerator } from './change_detection_jit_generator';
export class JitProtoChangeDetector {
    constructor(definition) {
        this.definition = definition;
        this._factory = this._createFactory(definition);
    }
    static isSupported() { return true; }
    instantiate() { return this._factory(); }
    /** @internal */
    _createFactory(definition) {
        return new ChangeDetectorJITGenerator(definition, 'util', 'AbstractChangeDetector', 'ChangeDetectorStatus')
            .generate();
    }
}
