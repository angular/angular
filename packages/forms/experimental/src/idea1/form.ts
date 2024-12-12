import {Signal, WritableSignal} from '@angular/core';

export interface ValidationError {
  message: string;
}

export interface Validator<T> {
  error(t: T): ValidationError | null;
}

/**
 * Contains all info about a field's value, status, errors, etc.
 */
export interface FormField<T> extends WritableSignal<T> {
  valid: Signal<boolean>;
  validators: Signal<Validator<T>[]>;
  errors: Signal<ValidationError[]>;
  required: Signal<boolean>;
  disabled: Signal<false | {reason: string}>;
  readonly: Signal<false | {reason: string}>;
  hidden: Signal<boolean>;
  tocuhed: Signal<boolean>;
  dirty: Signal<boolean>;
}

/**
 * A node in the Form where we can get the value, validity, etc. This could be:
 * - The root form itself
 * - A nested sub-form
 * - A leaf input field
 */
export interface FormNode<T> {
  $: FormField<T>;
}

/**
 * A data object that can have its properties wrapped into `FormNode`s. This avoids trying to wrap
 * up properties of classes (e.g. `Date`).
 */
export type FormableObject = Record<PropertyKey, unknown> & {
  [K in keyof FormNode<unknown>]?: never;
};

/**
 * Extracts the keys for properties from a `FormableObject` that can be wrapped in `FormNode`s.
 */
export type FormableKeys<T extends FormableObject> = Exclude<keyof T, keyof FormNode<unknown>>;

/**
 * A `FormNode` with child properties.
 */
export type FormGroup<T extends FormableObject> = FormNode<T> & {
  [K in FormableKeys<T>]: Form<T[K]>;
};

/**
 * A complete form with the ability to access the value, validity, etc. at any sub-field.
 */
export type Form<T> = T extends FormableObject ? FormGroup<T> : FormNode<T>;
