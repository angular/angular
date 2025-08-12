/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal, WritableSignal} from '@angular/core';
import type {Control} from '../controls/control';
import {AggregateProperty, Property} from './property';
import type {ValidationError, WithField} from './validation_errors';

/**
 * Symbol used to retain generic type information when it would otherwise be lost.
 */
declare const ɵɵTYPE: unique symbol;

/**
 * Creates a type based on the given type T, but with all readonly properties made writable.
 * @template T The type to create a mutable version of.
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * The kind of `FieldPath` (`Root`, `Child` of another `FieldPath`, or `Item` in a `FieldPath` array)
 */
export declare namespace PathKind {
  /**
   * The `PathKind` for a `FieldPath` that is at the root of its field tree.
   */
  export interface Root {
    /**
     * The `ɵɵTYPE` is constructed to allow the `extends` clause on `Child` and `Item` to narrow the
     * type. Another way to think about this is, if we have a function that expects this kind of
     * path, the `ɵɵTYPE` lists the kinds of path we are allowed to pass to it.
     */
    [ɵɵTYPE]: 'root' | 'child' | 'item';
  }

  /**
   * The `PathKind` for a `FieldPath` that is a child of another `FieldPath`.
   */
  export interface Child extends PathKind.Root {
    [ɵɵTYPE]: 'child' | 'item';
  }

  /**
   * The `PathKind` for a `FieldPath` that is an item in a `FieldPath` array.
   */
  export interface Item extends PathKind.Child {
    [ɵɵTYPE]: 'item';
  }
}
export type PathKind = PathKind.Root | PathKind.Child | PathKind.Item;
/**
 * A status indicating whether a field is unsubmitted, submitted, or currently submitting.
 */
export type SubmittedStatus = 'unsubmitted' | 'submitted' | 'submitting';

/**
 * A reason for a field's disablement.
 */
export interface DisabledReason {
  /** The field that is disabled. */
  readonly field: Field<unknown>;
  /** The reason for the disablement. */
  readonly reason?: string;
}

/**
 * The result of running a validation function. The result may be:
 * 1. `undefined`, `null`, or `false` to indicate no errors.
 * 2. A single `ValidationError` to indicate an error on the field being validated.
 * 3. A list of `ValidationError` to indicate multiple errors on the field being validated.
 *
 * @template E the type of `ValidationError` (defaults to any `ValidationError`).
 */
export type ValidationResult<E extends ValidationError = ValidationError> =
  | readonly E[]
  | E
  | null
  | undefined;

/**
 * The result of running a tree validation function. The result may be:
 * 1. `undefined`, `null`, or `false` to indicate no errors.
 * 2. A single `ValidationError` to indicate an error on the field being validated.
 * 3. A single `ValidationError` with a field to indicate an error on the target field.
 * 4. A list of `ValidationError` (potentially with a field) to indicate multiple errors.
 *
 * @template E the type of `ValidationError` (defaults to any `ValidationError`).
 */
export type TreeValidationResult<E extends ValidationError = ValidationError> =
  | readonly (E | WithField<E>)[]
  | E
  | WithField<E>
  | null
  | undefined;

/**
 * The result of running an async validation function. The result may be:
 * 1. `undefined`, `null`, or `false` to indicate no errors.
 * 2. A single `ValidationError` to indicate an error on the field being validated.
 * 3. A single `ValidationError` with a field to indicate an error on the target field.
 * 4. A list of `ValidationError` (potentially with a field) to indicate multiple errors.
 * 5. 'pending' if the validation is not yet resolved.
 *
 * @template E the type of `ValidationError` (defaults to any `ValidationError`).
 */
export type AsyncValidationResult<E extends ValidationError = ValidationError> =
  | TreeValidationResult<E>
  | 'pending';

/**
 * The same as `TreeValidationResult`, except that any errors **must** specify a target field.
 *
 * @template E the type of `ValidationError` (defaults to any `ValidationError`).
 */
export type TreeValidationResultWithField<E extends ValidationError = ValidationError> =
  | readonly WithField<E>[]
  | WithField<E>
  | null
  | undefined;

/**
 * The same as `AsyncValidationResult`, except that any errors **must** specify a target field.
 *
 * @template E the type of `ValidationError` (defaults to any `ValidationError`).
 */
export type AsyncValidationResultWithField = TreeValidationResultWithField | 'pending';

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
    ? ReadonlyArrayLike<MaybeField<U, number>>
    : TValue extends Record<string, any>
      ? Subfields<TValue>
      : unknown);

/**
 * The sub-fields that a user can navigate to from a `Field<TValue>`.
 *
 * @template TValue The type of the data which the parent field is wrapped around.
 */
export type Subfields<TValue> = {
  readonly [K in keyof TValue as TValue[K] extends Function ? never : K]: MaybeField<
    TValue[K],
    string
  >;
};

/**
 * An iterable object with the same shape as a readonly array.
 *
 * @template T The array item type.
 */
export type ReadonlyArrayLike<T> = Pick<
  ReadonlyArray<T>,
  number | 'length' | typeof Symbol.iterator
>;

/**
 * Helper type for defining `Field`. Given a type `TValue` that may include `undefined`, it extracts
 * the `undefined` outside the `Field` type.
 *
 * For example `MaybeField<{a: number} | undefined, TKey>` would be equivalent to
 * `undefined | Field<{a: number}, TKey>`.
 *
 * @template TValue The type of the data which the field is wrapped around.
 * @template TKey The type of the property key which this field resides under in its parent.
 */
export type MaybeField<TValue, TKey extends string | number = string | number> =
  | (TValue & undefined)
  | Field<Exclude<TValue, undefined>, TKey>;

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
   * A signal indicating whether a field is hidden.
   *
   * When a field is hidden it is ignored when determining the valid, touched, and dirty states.
   * TODO: Looks like touched/dirty is not implemented yet.
   *
   * Note: This doesn't hide the field in the template, that must be done manually.
   *
   *   @if (!field.hidden()) {
   *     ...
   *   }
   */
  readonly hidden: Signal<boolean>;

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
   * A signal of a unique name for the field, by default based on the name of its parent field.
   */
  readonly name: Signal<string>;

  /**
   * The property key in the parent field under which this field is stored. If the parent field is
   * array-valued, for example, this is the index of this field in that array.
   */
  readonly keyInParent: Signal<TKey>;
  /**
   * A signal containing the `Control` directives this field is currently bound to.
   */
  readonly controls: Signal<readonly Control<unknown>[]>;

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
 * `undefined | Field<{a: number}, PathKind.child>`.
 *
 * @template TValue The type of the data which the field is wrapped around.
 * @template TPathKind The kind of path (root field, child field, or item of an array)
 */
export type MaybeFieldPath<TValue, TPathKind extends PathKind = PathKind.Root> =
  | (TValue & undefined)
  | FieldPath<Exclude<TValue, undefined>, TPathKind>;

/**
 * Defines logic for a form.
 *
 * @template TValue The type of data stored in the form that this schema is attached to.
 */
export type Schema<in TValue> = {
  [ɵɵTYPE]: SchemaFn<TValue, PathKind.Root>;
};

/**
 * Function that defines rules for a schema.
 *
 * @template TValue The type of data stored in the form that this schema function is attached to.
 * @template TPathKind The kind of path this schema function can be bound to.
 */
export type SchemaFn<TValue, TPathKind extends PathKind = PathKind.Root> = (
  p: FieldPath<TValue, TPathKind>,
) => void;

/**
 * A schema or schema definition function.
 *
 * @template TValue The type of data stored in the form that this schema function is attached to.
 * @template TPathKind The kind of path this schema function can be bound to.
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
 * A function that takes the `FieldContext` for the field being validated and returns a
 * `ValidationResult` indicating errors for the field.
 *
 * @template TValue The type of value stored in the field being validated
 * @template TPathKind The kind of path being validated (root field, child field, or item of an array)
 */
export type Validator<TValue, TPathKind extends PathKind = PathKind.Root> = LogicFn<
  TValue,
  ValidationResult,
  TPathKind
>;

/**
 * A function that takes the `FieldContext` for the field being validated and returns a
 * `TreeValidationResult` indicating errors for the field and its sub-fields.
 *
 * @template TValue The type of value stored in the field being validated
 * @template TPathKind The kind of path being validated (root field, child field, or item of an array)
 */
export type TreeValidator<TValue, TPathKind extends PathKind = PathKind.Root> = LogicFn<
  TValue,
  TreeValidationResult,
  TPathKind
>;

/**
 * Provides access to the state of the current field as well as functions that can be used to look
 * up state of other fields based on a `FieldPath`.
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
 */
export interface RootFieldContext<TValue> {
  /** A signal containing the value of the current field. */
  readonly value: Signal<TValue>;
  /** The state of the current field. */
  readonly state: FieldState<TValue>;
  /** The current field. */
  readonly field: Field<TValue>;
  /** Gets the value of the field represented by the given path. */
  readonly valueOf: <P>(p: FieldPath<P>) => P;
  /** Gets the state of the field represented by the given path. */
  readonly stateOf: <P>(p: FieldPath<P>) => FieldState<P>;
  /** Gets the field represented by the given path. */
  readonly fieldOf: <P>(p: FieldPath<P>) => Field<P>;
}

/**
 * Field context that is available for all fields that are a child of another field.
 */
export interface ChildFieldContext<TValue> extends RootFieldContext<TValue> {
  /** The key of the current field in its parent field. */
  readonly key: Signal<string>;
}

/**
 * Field context that is available for all fields that are an item in an array field.
 */
export interface ItemFieldContext<TValue> extends ChildFieldContext<TValue> {
  /** The index of the current field in its parent field. */
  readonly index: Signal<number>;
}
