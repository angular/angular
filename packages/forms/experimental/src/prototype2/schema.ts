import {type Signal} from '@angular/core';
import {type Form} from './form';
import {createOnAccessProxy} from './proxy';

export const ADD_LOGIC_FNS = Symbol('ADD_LOGIC_FNS');

// Schema for a form.
export type FormSchema<T> = {
  [ADD_LOGIC_FNS]: ((from: Form<T>) => void)[];
} & (T extends Record<PropertyKey, unknown> ? {[K in keyof T]: FormSchema<T[K]>} : {});

export function schema<T>(base: FormSchema<T>, definition: (root: Form<T>) => void): FormSchema<T>;
export function schema<T>(definition: (root: Form<T>) => void): FormSchema<T>;
export function schema<T>(
  ...args: [...([FormSchema<T>] | []), (root: Form<T>) => void]
): FormSchema<T> {
  const base = typeof args[0] === 'function' ? undefined : args[0];
  const definition = args[args.length - 1] as (root: Form<T>) => void;
  const root = makeSchema(base);
  root[ADD_LOGIC_FNS].push((form: Form<T>) => definition(form));
  return root;
}

export type ValidateResult = FormValidationError[] | FormValidationError | string | null;

export type DisabledResult = boolean | string | null;

export type FormLogicSchema<T> = {
  readonly validate: (value: Signal<T>) => ValidateResult;
  readonly disabled: (value: Signal<T>) => DisabledResult;
};

export class FormValidationError {
  constructor(readonly message: string) {}

  equals(other: FormValidationError) {
    return this.constructor === other.constructor && this.message === other.message;
  }
}

export function addLogic<T>(schema: FormSchema<T> | undefined, form: Form<T>) {
  for (const fn of schema?.[ADD_LOGIC_FNS] ?? []) {
    fn(form);
  }
}

export function isFormSchema(value: unknown): value is FormSchema<unknown> {
  return typeof value === 'object' && !!(value as FormSchema<unknown>)[ADD_LOGIC_FNS];
}

// Makes a new `FormSchema`, optionally based on an existing schema.
function makeSchema<T>(base?: FormSchema<T>): FormSchema<T> {
  return createOnAccessProxy({[ADD_LOGIC_FNS]: [...(base?.[ADD_LOGIC_FNS] ?? [])]}, (_, key) => {
    const property = key as keyof FormSchema<T>;
    const childSchema = base === undefined || !(property in base) ? undefined : base[property];
    return makeSchema(childSchema as FormSchema<T[keyof T]>) as FormSchema<T>;
  });
}
