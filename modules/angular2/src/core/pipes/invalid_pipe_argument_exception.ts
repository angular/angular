import {CONST, Type} from 'angular2/src/core/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';

export class InvalidPipeArgumentException extends BaseException {
  constructor(type: Type, value: Object) {
    super(`Invalid argument '${value}' for pipe '${type}'`);
  }
}
