import {Validator} from './validators';
import {Control} from "../model";

export type ctrlFunc = ((c: Control) => {
  [key: string]: any
});

export function normalizeValidator(validator: (ctrlFunc | Validator)): ctrlFunc {
  if ((<Validator>validator).validate !== undefined) {
    return (c: Control) => (<Validator>validator).validate(c);
  } else {
    return <ctrlFunc>validator;
  }
}
