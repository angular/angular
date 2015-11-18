import { ProtoChangeDetector, ChangeDetector, ChangeDetectorDefinition } from './interfaces';
export declare class JitProtoChangeDetector implements ProtoChangeDetector {
    private definition;
    constructor(definition: ChangeDetectorDefinition);
    static isSupported(): boolean;
    instantiate(dispatcher: any): ChangeDetector;
}
