/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Signal, WritableSignal} from '@angular/core';
import {DataDefinition} from './data';
import {ReactiveMetadataKey, StaticMetadataKey} from './metadata';

/**
 * Symbol used to retain generic type information when it would otherwise be lost.
 */
declare const ɵɵTYPE: unique symbol;

/**
 * Indicates whether the form is unsubmitted, submitted, or currently submitting.
 */
export type SubmittedStatus = 'unsubmitted' | 'submitted' | 'submitting';

export interface DisabledReason {
  readonly field: Field<unknown>;
  readonly reason?: string;
}

/**
 * A validation error on a form. All validation errors must have a `kind` that identifies what type
 * of error it is, and may optionally have a `message` string containing a human-readable error
 * message.
 */
export interface FormError {
  readonly kind: string;
  readonly message?: string;
  readonly field?: never;
}

export interface FormTreeError extends Omit<FormError, 'field'> {
  readonly field?: Field<unknown>;
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
export type ValidationResult = readonly FormError[] | FormError | undefined;

export type AsyncValidationResult =
  | readonly FormTreeError[]
  | FormTreeError
  | 'pending'
  | undefined;

/**
 * An object that represents a single field in a form. This includes both primitive value fields
 * (e.g. fields that contain a `string` or `number`), as well as "grouping fields" that contain
 * sub-fields. `Field` objects are arranged in a tree whose structure mimics the structue of the
 * underlaying data. For example a `Field<{x: number}>` has a property `x` which contains a
 * `Field<number>`. To access the state associated with a field, call it as a function.
 *
 * @template T The type of the data which the field is wrapped around.
 */
export type Field<T, TKey extends string | number = string | number> = (() => FieldState<T, TKey>) &
  (T extends Array<infer U>
    ? Array<MaybeField<U, number>>
    : T extends Record<string, any>
      ? {[K in keyof T]: MaybeField<T[K], string>}
      : unknown);

export type MaybeField<T, TKey extends string | number = string | number> =
  | (T & undefined)
  | Field<Exclude<T, undefined>, TKey>;

/**
 * Contains all of the state (e.g. value, statuses, metadata) associated with a `Field`, exposed as
 * signals.
 */
export interface FieldState<T, TKey extends string | number = string | number> {
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
   * A signal indicating whether field value has been changed by user.
   */
  readonly dirty: Signal<boolean>;
  /**
   * A signal indicating whether the field is currently disabled.
   */
  readonly disabled: Signal<boolean>;
  /**
   * A signal containing the reasons why the field is currently disabled.
   */
  readonly disabledReasons: Signal<readonly DisabledReason[]>;
  /**
   * A signal indicating whether the field is currently readonly.
   */
  readonly readonly: Signal<boolean>;
  /**
   * A signal containing the current errors for the field.
   */
  readonly errors: Signal<FormError[]>;
  /**
   * A signal containing the current errors for the field.
   */
  readonly syncErrors: Signal<FormError[]>;
  /**
   * A signal indicating whether the field's value is currently valid.
   *
   * Note: `valid()` is not the same as `!invalid()`.
   * - `valid()` is `true` when there are no validation errors *and* no pending validators.
   * - `invalid()` is `true` when there are validation errors, regardless of pending validators.
   *
   * Ex: consider the situation where a field has 3 validators, 2 of which have no errors and 1 of
   * which is still pending. In this case `valid()` is `false` because of the pending validator.
   * However `invalid()` is also `false` because there are no errors.
   */
  readonly valid: Signal<boolean>;
  /**
   * A signal indicating whether the field's value is currently invalid.
   *
   * Note: `invalid()` is not the same as `!valid()`.
   * - `invalid()` is `true` when there are validation errors, regardless of pending validators.
   * - `valid()` is `true` when there are no validation errors *and* no pending validators.
   *
   * Ex: consider the situation where a field has 3 validators, 2 of which have no errors and 1 of
   * which is still pending. In this case `invalid()` is `false` because there are no errors.
   * However `valid()` is also `false` because of the pending validator.
   */
  readonly invalid: Signal<boolean>;
  /**
   * Whether there are any validators still pending for this field.
   */
  readonly pending: Signal<boolean>;
  /**
   * A signal indicating whether the field's value is currently valid.
   */
  readonly syncValid: Signal<boolean>;
  /**
   * A signal indicating whether the field is currently unsubmitted, submitted, or in the process of
   * being submitted.
   */
  readonly submittedStatus: Signal<SubmittedStatus>;

  /**
   * The property key in the parent field under which this field is stored. If the parent field is
   * array-valued, for example, this is the index of this field in that array.
   *
   * @throws if the field is no longer connected to its parent, or if it's the root field of the
   * form (it has no parent).
   */
  readonly keyInParent: Signal<TKey>;

  /**
   * Reads a reactive metadata value from the field.
   * @param key The metadata key to read.
   */
  metadata<M>(key: ReactiveMetadataKey<M>): Signal<M>;

  /**
   * Reads a static metadata value from the field.
   * @param key The metadata key to read.
   */
  metadata<M>(key: StaticMetadataKey<M>): M | undefined;

  /**
   * Sets the touched status of the field to `true`.
   */
  markAsTouched(): void;

  /**
   * Sets the dirty status of the field to `true`.
   */
  markAsDirty(): void;
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
 * Defines logic for a form of type T.
 */
export type Schema<in T> = {
  // Save type as `T => void` rather than `T` since `Schema` is contravariant on `T`. */
  [ɵɵTYPE]: (_: T) => void;
};

/**
 * Function that defines rules for a schema.
 */
export type SchemaFn<T> = (p: FieldPath<T>) => void;

/**
 * A schema or schema definition function.
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
 * A Validator is a function that
 *  takes a `logic argument` and returns a validation result.
 *
 *  @template T Value type
 */
export type Validator<T> = LogicFn<T, ValidationResult>;

export type TreeValidator<T> = LogicFn<T, FormTreeError[]>;

/**
 * An object containing context about the field a given logic function is bound to.
 */
export interface FieldContext<T> {
  /**
   * A signal of the value of the field that the logic function is bound to.
   */
  readonly value: Signal<T>;
  readonly state: FieldState<T>;
  readonly field: Field<T>;
  readonly valueOf: <P>(p: FieldPath<P>) => P;
  readonly stateOf: <P>(p: FieldPath<P>) => FieldState<P>;
  readonly fieldOf: <P>(p: FieldPath<P>) => Field<P>;
  readonly data: <D>(key: DataDefinition<D>) => D | undefined;
  readonly dataOf: <P, D>(p: FieldPath<P>, key: DataDefinition<D>) => D | undefined;
}
