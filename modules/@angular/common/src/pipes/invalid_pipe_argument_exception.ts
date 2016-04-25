import {Type, stringify} from '@angular/facade';
import {BaseException} from '@angular/facade';

export class InvalidPipeArgumentException extends BaseException {
  constructor(type: Type, value: Object) {
    super(`Invalid argument '${value}' for pipe '${stringify(type)}'`);
  }
}
