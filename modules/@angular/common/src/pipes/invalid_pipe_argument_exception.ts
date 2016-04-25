import {Type, stringify} from '@angular/facade/lang';
import {BaseException} from '@angular/facade/exceptions';

export class InvalidPipeArgumentException extends BaseException {
  constructor(type: Type, value: Object) {
    super(`Invalid argument '${value}' for pipe '${stringify(type)}'`);
  }
}
