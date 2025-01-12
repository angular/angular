import {type Signal} from '@angular/core';
import {
  type DisabledResult,
  type FormLogicSchema,
  FormValidationError,
  type ValidateResult,
} from './schema';

// The logic for a field.
export class FormLogic<T> {
  validate: (value: Signal<T>) => FormValidationError[] = () => [];
  disabled: (value: Signal<T>) => boolean | {reason: string} = () => false;

  add({disabled, validate}: Partial<FormLogicSchema<T>>) {
    if (disabled !== undefined) {
      const oldDisabled = this.disabled;
      this.disabled = (value) => normalizeDisabled(disabled(value)) ?? oldDisabled(value);
    }
    if (validate !== undefined) {
      const oldValidate = this.validate;
      this.validate = (value) => [...normalizeValidate(validate(value)), ...oldValidate(value)];
    }
  }
}

function normalizeDisabled(value: DisabledResult): boolean | {reason: string} | null {
  return typeof value === 'string' ? {reason: value} : value;
}

function normalizeValidate(value: ValidateResult): FormValidationError[] {
  if (typeof value === 'string') {
    return [new FormValidationError(value)];
  }
  if (value instanceof FormValidationError) {
    return [value];
  }
  return value ?? [];
}
