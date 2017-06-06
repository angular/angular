import { Type } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
export declare class InvalidPipeArgumentException extends BaseException {
    constructor(type: Type, value: Object);
}
