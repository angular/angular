import {CONST, Type, stringify} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';

export class InvalidPipeArgumentException extends BaseException {
  constructor(type: Type, value: Object) {
    super(`Invalid argument '${value}' for pipe '${stringify(type)}'`);
  }
}
