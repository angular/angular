import {Validator} from './validators';
import {Control} from '../model';

export function normalizeValidator(validator: Function | Validator): Function {
  if ((<Validator>validator).validate !== undefined) {
    return (c: Control) => (<Validator>validator).validate(c);
  } else {
    return <Function>validator;
  }
}
