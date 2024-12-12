import {Form, FormableKeys, FormableObject, ValidationError, Validator} from './form';

/**
 * A schema that defines the logic for a `FormNode`.
 */
export interface FormNodeSchema<T, R> {
  logic: FormLogic<T, R>[];
}

/**
 * A schema that defines the logic for a `FormGroup`.
 */
export interface FormGroupSchema<T extends FormableObject, R> extends FormNodeSchema<T, R> {
  fields: {[K in FormableKeys<T>]: FormSchema<T[K], R>};
}

/**
 * A schema that defines the logic for a `Form`.
 */
export type FormSchema<T, R> = T extends FormableObject
  ? FormGroupSchema<T, R>
  : FormNodeSchema<T, R>;

export interface PartialFormGroupSchema<T extends FormableObject, R> extends FormNodeSchema<T, R> {
  fields: {[K in FormableKeys<T>]?: PartialFormSchema<T[K], R>};
}

export type PartialFormSchema<T, R = T> = T extends FormableObject
  ? PartialFormGroupSchema<T, R>
  : FormNodeSchema<T, R>;

/**
 * Defines the logic for determing a field's value, validity, etc.
 */
export interface FormLogic<T, R> {
  value: (form: Form<R>) => T;
  validators: (form: Form<R>) => Validator<Form<R>>[];
  required: (form: Form<R>) => boolean;
  disabled: (form: Form<R>) => string | boolean | null;
  readonly: (form: Form<R>) => string | boolean | null;
  hidden: (form: Form<R>) => boolean;
}

/**
 * Functions to define pieces of FormSchema.
 */
export function group<T extends FormableObject, R = T>(
  ...args: [...FormLogic<T, R>[], {[K in FormableKeys<T>]: FormSchema<T[K], R>}]
): FormSchema<T, R> {
  return undefined!;
}
export function field<T, R = T>(...logic: Partial<FormLogic<T, R>>[]): FormSchema<T, R> {
  return undefined!;
}
export function value<T, R>(v: T | ((form: Form<R>) => T)): FormLogic<T, R> {
  return undefined!;
}
// Allow passed function to return:
// - null to indicate no error
// - string to indicate an error
// - ValidationError to indicate an error and allow returning custom ValidationError sub-class
// - Validator to provide a custom Validator sub-class that may contain metadata aside from the
//   error it produces (e.g. required, min, etc.)
export function validate<T, R>(
  v: (form: Form<R>) => Validator<Form<R>> | ValidationError | string | null,
): FormLogic<T, R> {
  return undefined!;
}
export function required<T, R>(v: string | ((form: Form<R>) => string | null)): FormLogic<T, R> {
  return undefined!;
}
export function hidden<T, R>(v: boolean | ((form: Form<R>) => boolean | null)): FormLogic<T, R> {
  return undefined!;
}

/**
 * Includes a separately defined FormSchema into another FormSchema.
 */
export function include<T extends FormableObject, R>(schema: FormSchema<T, T>): FormSchema<T, R>;
export function include<T extends FormableObject, R>(
  ...args: [
    FormSchema<T, T>,
    ...FormLogic<T, R>[],
    ...([{[K in FormableKeys<T>]?: PartialFormSchema<T[K], R>}] | []),
  ]
): FormSchema<T, R>;
export function include(...args: any[]) {
  return undefined!;
}

/**
 * Creates a Form from a FormSchema.
 */
export function form<T>(schema: FormSchema<T, T>): Form<T> {
  return undefined!;
}
