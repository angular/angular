import { Validator, ValidatorFn, AsyncValidatorFn } from './validators';
export declare function normalizeValidator(validator: ValidatorFn | Validator): ValidatorFn;
export declare function normalizeAsyncValidator(validator: AsyncValidatorFn | Validator): AsyncValidatorFn;
