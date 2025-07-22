/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal, WritableSignal} from '@angular/core';
import {AggregateProperty, Property} from './property';
import {ValidationError, WithField} from './validation_errors';

/**
 * Symbol used to retain generic type information when it would otherwise be lost.
 */
declare const ɵɵTYPE: unique symbol;

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export declare namespace PathKind {
  export interface Root {
    [ɵɵTYPE]: 'root' | 'child' | 'item';
  }
  export interface Child extends PathKind.Root {
    [ɵɵTYPE]: 'child' | 'item';
  }
  export interface Item extends PathKind.Child {
    [ɵɵTYPE]: 'item';
  }
}
export type PathKind = PathKind.Root | PathKind.Child | PathKind.Item;

/**
 * Indicates whether the form is unsubmitted, submitted, or currently submitting.
 */
export type SubmittedStatus = 'unsubmitted' | 'submitted' | 'submitting';

export interface DisabledReason {
  readonly field: Field<unknown>;
  readonly reason?: string;
}

/**
 * The result of running a validation function. The result may be `undefined` to indicate no errors,
 * a single `ValidationError`, or a list of `ValidationError` which can be used to indicate multiple
 * errors.
 */
export type ValidationResult =
  | readonly ValidationError[]
  | ValidationError
  | false
  | null
  | undefined;

export type TreeValidationResult =
  | readonly WithField<ValidationError>[]
  | WithField<ValidationError>
  | false
  | null
  | undefined;

export type AsyncValidationResult = TreeValidationResult | 'pending';

/**
 * An object that represents a single field in a form. This includes both primitive value fields
 * (e.g. fields that contain a `string` or `number`), as well as "grouping fields" that contain
 * sub-fields. `Field` objects are arranged in a tree whose structure mimics the structue of the
 * underlaying data. For example a `Field<{x: number}>` has a property `x` which contains a
 * `Field<number>`. To access the state associated with a field, call it as a function.
 *
 * @template TValue The type of the data which the field is wrapped around.
 * @template TKey The type of the property key which this field resides under in its parent.
 */
export type Field<TValue, TKey extends string | number = string | number> = (() => FieldState<
  TValue,
  TKey
>) &
  (TValue extends Array<infer U>
    ? Array<MaybeField<U, number>>
    : TValue extends Record<string, any>
      ? {[K in keyof TValue]: MaybeField<TValue[K], string>}
      : unknown);

export type MaybeField<T, TKey extends string | number = string | number> =
  | (T & undefined)
  | Field<Exclude<T, undefined>, TKey>;

/**
 * Contains all of the state (e.g. value, statuses, etc.) associated with a `Field`, exposed as
 * signals.
 */
export interface FieldState<TValue, TKey extends string | number = string | number> {
  /**
   * A writable signal containing the value for this field. Updating this signal will update the
   * data model that the field is bound to.
   */
  readonly value: WritableSignal<TValue>;
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
  readonly errors: Signal<ValidationError[]>;
  /**
   * A signal containing the current errors for the field.
   */
  readonly syncErrors: Signal<ValidationError[]>;
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
   * Reads a aggregate property value from the field.
   * @param prop The property to read.
   */
  property<M>(prop: AggregateProperty<M, any>): Signal<M>;

  /**
   * Reads a property value from the field.
   * @param prop The property key to read.
   */
  property<M>(prop: Property<M>): M | undefined;

  /**
   * Sets the touched status of the field to `true`.
   */
  markAsTouched(): void;

  /**
   * Sets the dirty status of the field to `true`.
   */
  markAsDirty(): void;

  /**
   * Resets the {@link touched} and {@link dirty} state of the field and its descendants.
   *
   * Note this does not change the data model, which can be reset directly if desired.
   */
  reset(): void;

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
 * @template TValue The type of the data which the form is wrapped around.
 * @template TPathKind The kind of path (root field, child field, or item of an array)
 */
export type FieldPath<TValue, TPathKind extends PathKind = PathKind.Root> = {
  [ɵɵTYPE]: [TValue, TPathKind];
} & (TValue extends any[]
  ? {}
  : TValue extends Record<PropertyKey, any>
    ? {[K in keyof TValue]: FieldPath<TValue[K], PathKind.Child>}
    : {});

/**
 * Defines logic for a form of type T.
 */
export type Schema<in TValue> = {
  [ɵɵTYPE]: SchemaFn<TValue, PathKind.Root>;
};

/**
 * Function that defines rules for a schema.
 */
export type SchemaFn<TValue, TPathKind extends PathKind = PathKind.Root> = (
  p: FieldPath<TValue, TPathKind>,
) => void;

/**
 * A schema or schema definition function.
 */
export type SchemaOrSchemaFn<TValue, TPathKind extends PathKind = PathKind.Root> =
  | Schema<TValue>
  | SchemaFn<TValue, TPathKind>;

/**
 * A function that recevies the `FieldContext` for the field the logic is bound to and returns
 * a specific result type.
 *
 * @template TValue The data type for the field the logic is bound to.
 * @template TReturn The type of the result returned by the logic function.
 * @template TPathKind The kind of path the logic is applied to (root field, child field, or item of an array)
 */
export type LogicFn<TValue, TReturn, TPathKind extends PathKind = PathKind.Root> = (
  ctx: FieldContext<TValue, TPathKind>,
) => TReturn;

/**
 * A Validator is a function that
 *  takes a `logic argument` and returns a validation result.
 *
 *  @template TValue Value type
 *  @template TPathKind The kind of path being validated (root field, child field, or item of an array)
 */
export type Validator<TValue, TPathKind extends PathKind = PathKind.Root> = LogicFn<
  TValue,
  ValidationResult,
  TPathKind
>;

export type TreeValidator<TValue, TPathKind extends PathKind = PathKind.Root> = LogicFn<
  TValue,
  TreeValidationResult,
  TPathKind
>;

export type FieldContext<
  TValue,
  TPathKind extends PathKind = PathKind.Root,
> = TPathKind extends PathKind.Item
  ? ItemFieldContext<TValue>
  : TPathKind extends PathKind.Child
    ? ChildFieldContext<TValue>
    : RootFieldContext<TValue>;

export interface RootFieldContext<TValue> {
  readonly value: Signal<TValue>;
  readonly state: FieldState<TValue>;
  readonly field: Field<TValue>;
  readonly valueOf: <P>(p: FieldPath<P>) => P;
  readonly stateOf: <P>(p: FieldPath<P>) => FieldState<P>;
  readonly fieldOf: <P>(p: FieldPath<P>) => Field<P>;
}

export interface ChildFieldContext<TValue> extends RootFieldContext<TValue> {
  readonly key: Signal<string>;
}

export interface ItemFieldContext<TValue> extends ChildFieldContext<TValue> {
  readonly index: Signal<number>;
}
