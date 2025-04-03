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
 * the validation errors as well as a reference to the `Field` node those errors should be
 * associated with.
 */
export interface ServerError {
  field: Field<unknown>;
  error: ValidationResult;
}

/**
 * The result of running a validation function. The result may be `undefined` to indicate no errors,
 * a single `FormError`, or a list of `FormError` which can be used to indicate multiple errors.
 */
export type ValidationResult = FormError | FormError[] | undefined;

/**
 * An object that represents a single field in a form. This includes both primitive value fields
 * (e.g. fields that contain a `string` or `number`), as well as "grouping fields" that contain
 * sub-fields. `Field` objects are arranged in a tree whose structure mimics the structue of the
 * underlaying data. For example a `Field<{x: number}>` has a property `x` which contains a
 * `Field<number>`. To access the state associated with a field, use the special `$state` property.
 *
 * @template T The type of the data which the field is wrapped around.
 */
export type Field<T> = {
  $state: FieldState<T>;
} & (T extends Array<infer U>
  ? Array<Field<U>>
  : T extends Record<PropertyKey, any>
    ? {[K in keyof T]: Field<T[K]>}
    : unknown);

/**
 * Contains all of the state (e.g. value, statuses, metadata) associated with a `Field`, exposed as
 * signals.
 */
export interface FieldState<T> {
  /**
   * A writable signal containing the value for this field. Updating this signal will update the
   * data model that the field is bound to.
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
  /**
   * Resets the `submittedStatus` of the field and all descendant fields to unsubmitted.
   */
  resetSubmittedStatus(): void;
}

/**
 * An object that represents a location in the `Field` tree structure and is used to bind logic to a
 * particular part of the structure prior to the creation of the form. Because the `FieldPath`
 * exists prior to the form's creation, it cannot be used to access any of the field state.
 *
 * @template T The type of the data which the form is wrapped around.
 */
export type FieldPath<T> = {
  [ɵɵTYPE]: T;
} & (T extends any[]
  ? {}
  : T extends Record<PropertyKey, any>
    ? {[K in keyof T]: FieldPath<T[K]>}
    : {});

/**
 * Contains logic form a `Field` of type `T`.
 */
export interface Schema<T> {
  readonly [ɵɵTYPE]: T;
}

/**
 * A function that binds schema logic to the given `FieldPath`.
 */
export type SchemaFn<T> = (p: FieldPath<T>) => void;

/**
 * A predefined schema, or a function used to bind schema logic.
 */
export type SchemaOrSchemaFn<T> = Schema<T> | SchemaFn<T>;

/**
 * A function that recevies the `FieldContext` for the field the logic is bound to and returns
 * a specific result type.
 *
 * @template TValue The data type for the field the logic is bound to.
 * @template TReturn The type of the result returned by the logic function.
 */
export type LogicFn<TValue, TReturn> = (ctx: FieldContext<TValue>) => TReturn;

/**
 * An object containing context about the field a given logic function is bound to.
 */
export interface FieldContext<T> {
  /**
   * A signal of the value of the field that the logic function is bound to.
   */
  readonly value: Signal<T>;
  /**
   * A function that gets the `Field` for a given `FieldPath`.
   * This can be used by the `LogicFunction` to implement cross-field logic.
   */
  resolve: <U>(path: FieldPath<U>) => Field<U>;
}
