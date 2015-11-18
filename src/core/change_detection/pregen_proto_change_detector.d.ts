import { ProtoChangeDetector, ChangeDetector } from './interfaces';
export { Function as PregenProtoChangeDetectorFactory };
export declare class PregenProtoChangeDetector implements ProtoChangeDetector {
    static isSupported(): boolean;
    instantiate(dispatcher: any): ChangeDetector;
}
