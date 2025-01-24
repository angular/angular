import {type Signal} from '@angular/core';

export type DisabledReason = boolean | {reason: string};

export interface FormLogic<T> {
  readonly validate: (
    value: Signal<T>,
    previousErrors: FormValidationError[],
  ) => FormValidationError[];
  readonly disabled: (
    value: Signal<T>,
    previousDisabled: boolean | {reason: string},
  ) => boolean | {reason: string};
}

export interface FormLogic<T> {
  readonly validate: (
    value: Signal<T>,
    previousErrors: FormValidationError[],
  ) => FormValidationError[];
  readonly disabled: (
    value: Signal<T>,
    previousDisabled: boolean | {reason: string},
  ) => boolean | {reason: string};
}

export class FormLogicImpl<T> {
  validate: (value: Signal<T>) => FormValidationError[];
  disabled: (value: Signal<T>) => boolean | {reason: string};

  constructor(base?: FormLogic<T>) {
    this.validate = (value) => base?.validate(value, []) ?? [];
    this.disabled = (value) => base?.disabled(value, false) ?? false;
  }

  add({disabled, validate}: Partial<FormLogic<T>>) {
    if (disabled !== undefined) {
      const oldDisabled = this.disabled;
      this.disabled = (value) => disabled(value, oldDisabled(value));
    }
    if (validate !== undefined) {
      const oldValidate = this.validate;
      this.validate = (value) => validate(value, oldValidate(value));
    }
  }
}

export type FormValidationError = Record<PropertyKey, unknown> & {
  type: string;
  message: string;
};

export function error<T>(
  validator?:
    | string
    | FormValidationError
    | FormValidationError[]
    | ((
        value: Signal<T>,
        previousErrors: FormValidationError[],
      ) => null | string | FormValidationError | FormValidationError[]),
): Partial<FormLogic<T>> {
  return {
    validate: (value: Signal<T>, previousErrors: FormValidationError[]) =>
      normalizeErrors(
        typeof validator === 'function'
          ? (validator(value, previousErrors) ?? [])
          : (validator ?? {type: 'custom', message: ''}),
      ),
  };
}

export function disable<T>(
  disabled?:
    | boolean
    | string
    | {reason: string}
    | ((
        value: Signal<T>,
        previousDisabled: boolean | {reason: string},
      ) => boolean | string | {reason: string}),
): Partial<FormLogic<T>> {
  return {
    disabled: (value: Signal<T>, previousDisabled: boolean | {reason: string}) => {
      return normalizeDisabled(
        typeof disabled === 'function' ? disabled(value, previousDisabled) : (disabled ?? true),
      );
    },
  };
}

export function when<T>(
  condition: (value: Signal<T>) => boolean,
  logic: Partial<FormLogic<T>>,
): Partial<FormLogic<T>> {
  const result: Partial<FormLogic<T>> = {
    disabled:
      logic.disabled &&
      ((value, previous) => (condition(value) ? logic.disabled!(value, previous) : previous)),
    validate:
      logic.validate &&
      ((value, previous) => (condition(value) ? logic.validate!(value, previous) : previous)),
  };
  return result;
}

function normalizeErrors(value: string | FormValidationError | FormValidationError[]) {
  const errorObjs = typeof value === 'string' ? {type: 'custom', message: value} : value;
  return Array.isArray(errorObjs) ? errorObjs : [errorObjs];
}

function normalizeDisabled(value: boolean | string | {reason: string}) {
  return typeof value === 'string' ? {reason: value} : value;
}
