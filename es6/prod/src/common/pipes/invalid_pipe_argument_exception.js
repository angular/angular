import { BaseException } from 'angular2/src/facade/exceptions';
export class InvalidPipeArgumentException extends BaseException {
    constructor(type, value) {
        super(`Invalid argument '${value}' for pipe '${type}'`);
    }
}
