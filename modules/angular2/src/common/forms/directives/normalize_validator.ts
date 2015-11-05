import {Validator} from './validators';

export function normalizeValidator(validator: Function | Validator): Function {
  if ((<Validator>validator).validate !== undefined) {
    return (c) => (<Validator>validator).validate(c);
  } else {
    return <Function>validator;
  }
}
