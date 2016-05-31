import {Type, stringify} from '../facade/lang';
import {BaseException} from '../facade/exceptions';

export class InvalidPipeArgumentException extends BaseException {
  constructor(type: Type, value: Object) {
    super(`Invalid argument '${value}' for pipe '${stringify(type)}'`);
  }
}
