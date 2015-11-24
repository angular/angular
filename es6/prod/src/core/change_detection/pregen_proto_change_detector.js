import { BaseException } from 'angular2/src/facade/exceptions';
export { Function as PregenProtoChangeDetectorFactory };
export class PregenProtoChangeDetector {
    static isSupported() { return false; }
    instantiate(dispatcher) {
        throw new BaseException('Pregen change detection not supported in Js');
    }
}
