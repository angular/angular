/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Signal, WritableSignal} from '@angular/core';
import {MetadataKey} from '../logic_node';

/**
 * Symbol used to retain generic type information when it would otherwise be lost.
 */
declare const ɵɵTYPE: unique symbol;

/**
 * Indicates whether the form is unsubmitted, submitted, or currently submitting.
 */
export type SubmittedStatus = 'unsubmitted' | 'submitted' | 'submitting';

/**
 * A validation error on a form. All validation errors must have a `kind` that identifies what type
 * of error it is, and may optionally have a `message` string containing a human-readable error
 * message.
 */
export interface FormError {
  kind: string;
  message?: string;
}

/**
 * An error that is returned from the server when submitting the form. It contains a reference to
 * the validation errors as well as a reference to the `Form` node those errors should be associated
 * with.
 */
export interface ServerError {
  field: Form<unknown>;
  error: ValidationResult;
}

/**
 * The result of running a validation function. The result may be `undefined` to indicate no errors,
 * a single `FormError`, or a list of `FormError` which can be used to indicate multiple errors.
 */
export type ValidationResult = FormError | FormError[] | undefined;

/**
 * An object which is wrapped around the data type and gives access to the form state at any point
 * in the data structure. The structure of the form mimics the structure of the data type it is
 * wrapped around and allows accessing the `FormField` data at any point via the `$api` property.
 *
 * @template T The type of the data which the form is wrapped around. A `Form` that is wrapped
 * around a `Record` type has properties of the same name as the record properties, that give access
 * to the `Form` for that respective property. A `Form` that is wrapped around an `Array` type can
 * be indexed to get access to the `Form` for the respective index of the array.
 */
export type Form<T> = {
  $api: FormField<T>;
} & (T extends Array<infer U>
  ? Array<Form<U>>
  : T extends Record<PropertyKey, any>
    ? {[K in keyof T]: Form<T[K]>}
    : unknown);

/**
 * Contains all of the status information and metadata for a `Form`, exposed as signals.
 */
export interface FormField<T> {
  /**
   * A writable signal containing the value for this field. Updating this signal will update the
   * data model that the form is bound to.
   */
  readonly value: WritableSignal<T>;
  /**
   * A signal indicating whether the field has been touched by the user.
   */
  readonly touched: Signal<boolean>;
  /**
   * A signal indicating whether the field is currently disabled.
   */
  readonly disabled: Signal<boolean>;
  /**
   * A signal containing the current errors for the field.
   */
  readonly errors: Signal<FormError[]>;
  /**
   * A signal indicating whether the field's value is currently valid.
   */
  readonly valid: Signal<boolean>;
  /**
   * A signal indicating whether the field is currently unsubmitted, submitted, or in the process of
   * being submitted.
   */
  readonly submittedStatus: Signal<SubmittedStatus>;

  /**
   * Reactviely reads a metadata value from the field.
   * @param key The metadata key to read.
   */
  metadata<M>(key: MetadataKey<M>): M;

  /**
   * Sets the touched status of the field to `true`.
   */
  markAsTouched(): void;

  resetSubmittedStatus(): void;
}

/**
 * An object that represents a location in the form tree structure and is used to bind logic to a
 * particular part of the form structure prior to the creation of the actual form. Because the
 * FormPath exists prior to the form's creation, it cannot be used to access any of the data in the
 * form.
 *
 * @template T The type of the data which the form is wrapped around. A `FormPath` that is wrapped
 * around a `Record` type has properties of the same name as the record properties, that give access
 * to the `FormPath` for that respective property. A `FormPath` for any other type is considered
 * terminal and does not allow further navigation of the form structure.
 *
 * @template TRoots The list of `Form` nodes that will be made available to any logic functions
 * bound to this `FormPath`. Each call to `schema`, `array`, or `apply` will make the root `Form` of
 * that operation available on the `FormPath` going forward, prepending it `TRoots` such that the
 * available `Form` nodes are ordered from lowest available node up to the root node of the whole
 * form structure.
 */
export type FormPath<T> = {
  [ɵɵTYPE]: T;
} & (T extends any[]
  ? {}
  : T extends Record<PropertyKey, any>
    ? {[K in keyof T]: FormPath<T[K]>}
    : {});

/**
 * Contains logic form a `Form` of type `T`.
 */
export interface Schema<T> {
  readonly [ɵɵTYPE]: T;
}

/**
 * A function that binds schema logic to the given `FormPath`.
 */
export type SchemaFn<T> = (p: FormPath<T>) => void;

/**
 * A predefined schema, or a function used to bind schema logic.
 */
export type SchemaOrSchemaFn<T> = Schema<T> | SchemaFn<T>;

export type LogicFn<TValue, TReturn> = (arg: LogicArgument<TValue>) => TReturn;

export interface LogicArgument<T> {
  readonly value: Signal<T>;
  resolve: <U>(path: FormPath<U>) => Form<U>;
}
