/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal, ɵFieldState} from '@angular/core';
import type {Field} from './field_directive';
import {PathKind} from './path_kind';
import {AggregateProperty, Property} from './property';
import type {ValidationError, WithOptionalField, WithoutField} from './validation_errors';

/**
 * Symbol used to retain generic type information when it would otherwise be lost.
 */
declare const ɵɵTYPE: unique symbol;

/**
 * A type that represents either a single value of type `T` or a readonly array of `T`.
 * @template T The type of the value(s).
 *
 * @experimental 21.0.0
 */
export type OneOrMany<T> = T | readonly T[];

/**
 * A status indicating whether a field is unsubmitted, submitted, or currently submitting.
 *
 * @category types
 * @experimental 21.0.0
 */
export type SubmittedStatus = 'unsubmitted' | 'submitted' | 'submitting';

/**
 * A reason for a field's disablement.
 *
 * @category logic
 * @experimental 21.0.0
 */
export interface DisabledReason {
  /** The field that is disabled. */
  readonly field: FieldTree<unknown>;
  /** A user-facing message describing the reason for the disablement. */
  readonly message?: string;
}

/**
 * The absence of an error which indicates a successful validation result.
 *
 * @category types
 * @experimental 21.0.0
 */
export type ValidationSuccess = null | undefined | void;

/**
 * The result of running a field validation function.
 *
 * The result may be one of the following:
 * 1. A {@link ValidationSuccess} to indicate no errors.
 * 2. A {@link ValidationError} without a field to indicate an error on the field being validated.
 * 3. A list of {@link ValidationError} without fields to indicate multiple errors on the field
 *    being validated.
 *
 * @template E the type of error (defaults to {@link ValidationError}).
 *
 * @category types
 * @experimental 21.0.0
 */
export type FieldValidationResult<E extends ValidationError = ValidationError> =
  | ValidationSuccess
  | OneOrMany<WithoutField<E>>;

/**
 * The result of running a tree validation function.
 *
 * The result may be one of the following:
 * 1. A {@link ValidationSuccess} to indicate no errors.
 * 2. A {@link ValidationError} without a field to indicate an error on the field being validated.
 * 3. A {@link ValidationError} with a field to indicate an error on the target field.
 * 4. A list of {@link ValidationError} with or without fields to indicate multiple errors.
 *
 * @template E the type of error (defaults to {@link ValidationError}).
 *
 * @category types
 * @experimental 21.0.0
 */
export type TreeValidationResult<E extends ValidationError = ValidationError> =
  | ValidationSuccess
  | OneOrMany<WithOptionalField<E>>;

/**
 * A validation result where all errors explicitly define their target field.
 *
 * The result may be one of the following:
 * 1. A {@link ValidationSuccess} to indicate no errors.
 * 2. A {@link ValidationError} with a field to indicate an error on the target field.
 * 3. A list of {@link ValidationError} with fields to indicate multiple errors.
 *
 * @template E the type of error (defaults to {@link ValidationError}).
 *
 * @category types
 * @experimental 21.0.0
 */
export type ValidationResult<E extends ValidationError = ValidationError> =
  | ValidationSuccess
  | OneOrMany<E>;

/**
 * An asynchronous validation result where all errors explicitly define their target field.
 *
 * The result may be one of the following:
 * 1. A {@link ValidationResult} to indicate the result if resolved.
 * 5. 'pending' if the validation is not yet resolved.
 *
 * @template E the type of error (defaults to {@link ValidationError}).
 *
 * @category types
 * @experimental 21.0.0
 */
export type AsyncValidationResult<E extends ValidationError = ValidationError> =
  | ValidationResult<E>
  | 'pending';

/**
 * An object that represents a tree of fields in a form. This includes both primitive value fields
 * (e.g. fields that contain a `string` or `number`), as well as "grouping fields" that contain
 * sub-fields. `FieldTree` objects are arranged in a tree whose structure mimics the structure of the
 * underlying data. For example a `FieldTree<{x: number}>` has a property `x` which contains a
 * `FieldTree<number>`. To access the state associated with a field, call it as a function.
 *
 * @template TValue The type of the data which the field is wrapped around.
 * @template TKey The type of the property key which this field resides under in its parent.
 *
 * @category types
 * @experimental 21.0.0
 */
export type FieldTree<TValue, TKey extends string | number = string | number> = (() => FieldState<
  TValue,
  TKey
>) &
  (TValue extends Array<infer U>
    ? ReadonlyArrayLike<MaybeFieldTree<U, number>>
    : TValue extends Record<string, any>
      ? Subfields<TValue>
      : unknown);

/**
 * The sub-fields that a user can navigate to from a `FieldTree<TValue>`.
 *
 * @template TValue The type of the data which the parent field is wrapped around.
 *
 * @experimental 21.0.0
 */
export type Subfields<TValue> = {
  readonly [K in keyof TValue as TValue[K] extends Function ? never : K]: MaybeFieldTree<
    TValue[K],
    string
  >;
};

/**
 * An iterable object with the same shape as a readonly array.
 *
 * @template T The array item type.
 *
 * @experimental 21.0.0
 */
export type ReadonlyArrayLike<T> = Pick<
  ReadonlyArray<T>,
  number | 'length' | typeof Symbol.iterator
>;

/**
 * Helper type for defining `FieldTree`. Given a type `TValue` that may include `undefined`, it extracts
 * the `undefined` outside the `FieldTree` type.
 *
 * For example `MaybeField<{a: number} | undefined, TKey>` would be equivalent to
 * `undefined | FieldTree<{a: number}, TKey>`.
 *
 * @template TValue The type of the data which the field is wrapped around.
 * @template TKey The type of the property key which this field resides under in its parent.
 *
 * @experimental 21.0.0
 */
export type MaybeFieldTree<TValue, TKey extends string | number = string | number> =
  | (TValue & undefined)
  | FieldTree<Exclude<TValue, undefined>, TKey>;

/**
 * Contains all of the state (e.g. value, statuses, etc.) associated with a `FieldTree`, exposed as
 * signals.
 *
 * @category structure
 * @experimental 21.0.0
 */
export interface FieldState<TValue, TKey extends string | number = string | number>
  extends ɵFieldState<TValue> {
  /**
   * A signal indicating whether field value has been changed by user.
   */
  readonly dirty: Signal<boolean>;

  /**
   * A signal indicating whether a field is hidden.
   *
   * When a field is hidden it is ignored when determining the valid, touched, and dirty states.
   *
   * Note: This doesn't hide the field in the template, that must be done manually.
   * ```
   * @if (!field.hidden()) {
   *   ...
   * }
   * ```
   */
  readonly hidden: Signal<boolean>;
  readonly disabledReasons: Signal<readonly DisabledReason[]>;
  readonly errors: Signal<ValidationError[]>;

  /**
   * A signal containing the {@link errors} of the field and its descendants.
   */
  readonly errorSummary: Signal<ValidationError[]>;

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
   * A signal indicating whether the field is currently in the process of being submitted.
   */
  readonly submitting: Signal<boolean>;

  /**
   * The property key in the parent field under which this field is stored. If the parent field is
   * array-valued, for example, this is the index of this field in that array.
   */
  readonly keyInParent: Signal<TKey>;
  /**
   * The {@link Field} directives that bind this field to a UI control.
   */
  readonly fieldBindings: Signal<readonly Field<unknown>[]>;

  /**
   * Reads an aggregate property value from the field.
   * @param prop The property to read.
   */
  property<M>(prop: AggregateProperty<M, any>): Signal<M>;

  /**
   * Reads a property value from the field.
   * @param prop The property key to read.
   */
  property<M>(prop: Property<M>): M | undefined;

  /**
   * Checks whether the given metadata key has been defined for this field.
   */
  hasProperty(key: Property<any> | AggregateProperty<any, any>): boolean;

  /**
   * Resets the {@link touched} and {@link dirty} state of the field and its descendants.
   *
   * Note this does not change the data model, which can be reset directly if desired.
   */
  reset(): void;
}

/**
 * An object that represents a location in the `FieldTree` tree structure and is used to bind logic to a
 * particular part of the structure prior to the creation of the form. Because the `FieldPath`
 * exists prior to the form's creation, it cannot be used to access any of the field state.
 *
 * @template TValue The type of the data which the form is wrapped around.
 * @template TPathKind The kind of path (root field, child field, or item of an array)
 *
 * @category types
 * @experimental 21.0.0
 */
export type FieldPath<TValue, TPathKind extends PathKind = PathKind.Root> = {
  [ɵɵTYPE]: [TValue, TPathKind];
} & (TValue extends Array<unknown>
  ? unknown
  : TValue extends Record<string, any>
    ? {[K in keyof TValue]: MaybeFieldPath<TValue[K], PathKind.Child>}
    : unknown);

/**
 * Helper type for defining `FieldPath`. Given a type `TValue` that may include `undefined`, it
 * extracts the `undefined` outside the `FieldPath` type.
 *
 * For example `MaybeFieldPath<{a: number} | undefined, PathKind.Child>` would be equivalent to
 * `undefined | FieldTree<{a: number}, PathKind.child>`.
 *
 * @template TValue The type of the data which the field is wrapped around.
 * @template TPathKind The kind of path (root field, child field, or item of an array)
 *
 * @experimental 21.0.0
 */
export type MaybeFieldPath<TValue, TPathKind extends PathKind = PathKind.Root> =
  | (TValue & undefined)
  | FieldPath<Exclude<TValue, undefined>, TPathKind>;

/**
 * Defines logic for a form.
 *
 * @template TValue The type of data stored in the form that this schema is attached to.
 *
 * @category types
 * @experimental 21.0.0
 */
export type Schema<in TValue> = {
  [ɵɵTYPE]: SchemaFn<TValue, PathKind.Root>;
};

/**
 * Function that defines rules for a schema.
 *
 * @template TValue The type of data stored in the form that this schema function is attached to.
 * @template TPathKind The kind of path this schema function can be bound to.
 *
 * @category types
 * @experimental 21.0.0
 */
export type SchemaFn<TValue, TPathKind extends PathKind = PathKind.Root> = (
  p: FieldPath<TValue, TPathKind>,
) => void;

/**
 * A schema or schema definition function.
 *
 * @template TValue The type of data stored in the form that this schema function is attached to.
 * @template TPathKind The kind of path this schema function can be bound to.
 *
 * @category types
 * @experimental 21.0.0
 */
export type SchemaOrSchemaFn<TValue, TPathKind extends PathKind = PathKind.Root> =
  | Schema<TValue>
  | SchemaFn<TValue, TPathKind>;

/**
 * A function that receives the `FieldContext` for the field the logic is bound to and returns
 * a specific result type.
 *
 * @template TValue The data type for the field the logic is bound to.
 * @template TReturn The type of the result returned by the logic function.
 * @template TPathKind The kind of path the logic is applied to (root field, child field, or item of an array)
 *
 * @category types
 * @experimental 21.0.0
 */
export type LogicFn<TValue, TReturn, TPathKind extends PathKind = PathKind.Root> = (
  ctx: FieldContext<TValue, TPathKind>,
) => TReturn;

/**
 * A function that takes the `FieldContext` for the field being validated and returns a
 * `ValidationResult` indicating errors for the field.
 *
 * @template TValue The type of value stored in the field being validated
 * @template TPathKind The kind of path being validated (root field, child field, or item of an array)
 *
 * @category validation
 * @experimental 21.0.0
 */
export type FieldValidator<TValue, TPathKind extends PathKind = PathKind.Root> = LogicFn<
  TValue,
  FieldValidationResult,
  TPathKind
>;

/**
 * A function that takes the `FieldContext` for the field being validated and returns a
 * `TreeValidationResult` indicating errors for the field and its sub-fields.
 *
 * @template TValue The type of value stored in the field being validated
 * @template TPathKind The kind of path being validated (root field, child field, or item of an array)
 *
 * @category types
 * @experimental 21.0.0
 */
export type TreeValidator<TValue, TPathKind extends PathKind = PathKind.Root> = LogicFn<
  TValue,
  TreeValidationResult,
  TPathKind
>;

/**
 * A function that takes the `FieldContext` for the field being validated and returns a
 * `ValidationResult` indicating errors for the field and its sub-fields. In a `Validator` all
 * errors must explicitly define their target field.
 *
 * @template TValue The type of value stored in the field being validated
 * @template TPathKind The kind of path being validated (root field, child field, or item of an array)
 *
 * @category types
 * @experimental 21.0.0
 */
export type Validator<TValue, TPathKind extends PathKind = PathKind.Root> = LogicFn<
  TValue,
  ValidationResult,
  TPathKind
>;

/**
 * Provides access to the state of the current field as well as functions that can be used to look
 * up state of other fields based on a `FieldPath`.
 *
 * @category types
 * @experimental 21.0.0
 */
export type FieldContext<
  TValue,
  TPathKind extends PathKind = PathKind.Root,
> = TPathKind extends PathKind.Item
  ? ItemFieldContext<TValue>
  : TPathKind extends PathKind.Child
    ? ChildFieldContext<TValue>
    : RootFieldContext<TValue>;

/**
 * The base field context that is available for all fields.
 *
 * @experimental 21.0.0
 */
export interface RootFieldContext<TValue> {
  /** A signal containing the value of the current field. */
  readonly value: Signal<TValue>;
  /** The state of the current field. */
  readonly state: FieldState<TValue>;
  /** The current field. */
  readonly field: FieldTree<TValue>;
  /** Gets the value of the field represented by the given path. */
  readonly valueOf: <P>(p: FieldPath<P>) => P;
  /** Gets the state of the field represented by the given path. */
  readonly stateOf: <P>(p: FieldPath<P>) => FieldState<P>;
  /** Gets the field represented by the given path. */
  readonly fieldOf: <P>(p: FieldPath<P>) => FieldTree<P>;
}

/**
 * Field context that is available for all fields that are a child of another field.
 *
 * @category structure
 * @experimental 21.0.0
 */
export interface ChildFieldContext<TValue> extends RootFieldContext<TValue> {
  /** The key of the current field in its parent field. */
  readonly key: Signal<string>;
}

/**
 * Field context that is available for all fields that are an item in an array field.
 *
 * @experimental 21.0.0
 */
export interface ItemFieldContext<TValue> extends ChildFieldContext<TValue> {
  /** The index of the current field in its parent field. */
  readonly index: Signal<number>;
}

export {PathKind};
