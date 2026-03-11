/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, Signal, WritableSignal} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import type {FormField} from '../directive/form_field_directive';
import type {MetadataKey, ValidationError} from './rules';

/**
 * Symbol used to retain generic type information when it would otherwise be lost.
 */
declare const ɵɵTYPE: unique symbol;

/**
 * Options that can be specified when submitting a form.
 *
 * @experimental 21.2.0
 */
export interface FormSubmitOptions<TRootModel, TSubmittedModel> {
  /**
   * Function to run when submitting the form data (when form is valid).
   *
   * @param field The contextually relevant field for this action function (the root field when
   *   specified during form creation, and the submitted field when specified as part of the
   *   `submit()` call)
   * @param detail An object containing the root field of the submitted form as well as the
   *   submitted field itself
   */
  action: (
    field: FieldTree<TRootModel & TSubmittedModel>,
    detail: {root: FieldTree<TRootModel>; submitted: FieldTree<TSubmittedModel>},
  ) => Promise<TreeValidationResult>;
  /**
   * Function to run when attempting to submit the form data but validation is failing.
   *
   * @param field The contextually relevant field for this onInvalid function (the root field when
   *   specified during form creation, and the submitted field when specified as part of the
   *   `submit()` call)
   * @param detail An object containing the root field of the submitted form as well as the
   *   submitted field itself
   */
  onInvalid?: (
    field: FieldTree<TRootModel & TSubmittedModel>,
    detail: {root: FieldTree<TRootModel>; submitted: FieldTree<TSubmittedModel>},
  ) => void;
  /**
   * Whether to ignore any of the validators when submitting:
   * - 'pending': Will submit if there are no invalid validators, pending validators do not block submission (default)
   * - 'none': Will not submit unless all validators are passing, pending validators block submission
   * - 'ignore': Will always submit regardless of invalid or pending validators
   */
  ignoreValidators?: 'pending' | 'none' | 'all';
}

/**
 * A type that represents either a single value of type `T` or a readonly array of `T`.
 * @template T The type of the value(s).
 *
 * @experimental 21.0.0
 */
export type OneOrMany<T> = T | readonly T[];

/**
 * The kind of `FieldPath` (`Root`, `Child` of another `FieldPath`, or `Item` in a `FieldPath` array)
 *
 * @experimental 21.0.0
 */
export type PathKind = PathKind.Root | PathKind.Child | PathKind.Item;
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

/**
 * A reason for a field's disablement.
 *
 * @category logic
 * @experimental 21.0.0
 */
export interface DisabledReason {
  /** The field that is disabled. */
  readonly fieldTree: ReadonlyFieldTree<unknown>;
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
export type TreeValidationResult<
  E extends ValidationError.WithOptionalFieldTree = ValidationError.WithOptionalFieldTree,
> = ValidationSuccess | OneOrMany<E>;

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
 * A field accessor function that returns the state of the field.
 *
 * @template TValue The type of the value stored in the field.
 * @template TKey The type of the property key which this field resides under in its parent.
 *
 * @category types
 * @experimental 21.2.0
 */
export type Field<TValue, TKey extends string | number = string | number> = () => FieldState<
  TValue,
  TKey
>;

/**
 * An object that represents a tree of fields in a form. This includes both primitive value fields
 * (e.g. fields that contain a `string` or `number`), as well as "grouping fields" that contain
 * sub-fields. `FieldTree` objects are arranged in a tree whose structure mimics the structure of
 * the underlying data. For example a `FieldTree<{x: number}>` has a property `x` which contains a
 * `FieldTree<number>`. To access the state associated with a field, call it as a function.
 *
 * @template TValue The type of the data which the field is wrapped around.
 * @template TKey The type of the property key which this field resides under in its parent.
 * @template TMode Determines whether the field state is readonly or writable. Defaults to writable.
 *   For readonly, use {@link ReadonlyFieldTree}.
 *
 * @category types
 * @experimental 21.0.0
 */
export type FieldTree<
  TModel,
  TKey extends string | number = string | number,
  TMode extends 'writable' | 'readonly' = 'writable',
> =
  // Note: We use `[TModel]` in several places below to avoid the condition from being distributed
  // over a recursive union type, which seems to result in infinite type recursion. By adding the
  // tuple we're not testing a naked type parameter, and thus the condition is not distributed.
  // (See https://typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types)
  // The example below demonstrates the problematic situation we want to avoid:
  //
  // ```
  // type RecursiveType = (number | RecursiveType)[]
  // type Test = FieldTree<RecursiveType> // Infinite type recursion if condition distributes.
  // ```
  (() => [TModel] extends [AbstractControl]
    ? CompatFieldState<TModel, TKey, TMode>
    : FieldStateByMode<TModel, TKey, TMode>) &
    // Children:
    ([TModel] extends [AbstractControl]
      ? object
      : [TModel] extends [ReadonlyArray<infer U>]
        ? ReadonlyArrayLike<MaybeFieldTree<U, number, TMode>>
        : TModel extends Record<string, any>
          ? Subfields<TModel, TMode>
          : object);

/**
 * A readonly {@link FieldTree}.
 *
 * @category types
 * @experimental 21.3.0
 */
export type ReadonlyFieldTree<TModel, TKey extends string | number = string | number> = FieldTree<
  TModel,
  TKey,
  'readonly'
>;

/**
 * The sub-fields that a user can navigate to from a `FieldTree<TModel>`.
 *
 * @template TModel The type of the data which the parent field is wrapped around.
 * @template TMode Determines whether the field state is readonly or writable.
 *
 * @experimental 21.0.0
 */
export type Subfields<TModel, TMode extends 'writable' | 'readonly' = 'writable'> = {
  readonly [K in keyof TModel as TModel[K] extends Function ? never : K]: MaybeFieldTree<
    TModel[K],
    string,
    TMode
  >;
} & {
  [Symbol.iterator](): Iterator<[string, MaybeFieldTree<TModel[keyof TModel], string, TMode>]>;
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
 * Helper type for defining `FieldTree`. Given a type `TValue` that may include `undefined`,
 * it extracts the `undefined` outside the `FieldTree` type.
 *
 * For example `MaybeFieldTree<{a: number} | undefined, TKey>` would be equivalent to
 * `undefined | FieldTree<{a: number}, TKey>`.
 *
 * @template TModel The type of the data which the field is wrapped around.
 * @template TKey The type of the property key which this field resides under in its parent.
 * @template TMode Determines whether the field state is readonly or writable.
 *
 * @experimental 21.3.0
 */
export type MaybeFieldTree<
  TModel,
  TKey extends string | number = string | number,
  TMode extends 'writable' | 'readonly' = 'writable',
> = (TModel & undefined) | FieldTree<Exclude<TModel, undefined>, TKey, TMode>;

/**
 * A readonly view of a {@link FieldTree}'s state.
 *
 * @template TValue The type of the data which the field is wrapped around.
 * @template TKey The type of the property key which this field resides under in its parent.
 *
 * @category structure
 * @experimental 21.3.0
 */
export interface ReadonlyFieldState<TValue, TKey extends string | number = string | number> {
  /**
   * The {@link FieldTree} associated with this field state.
   */
  readonly fieldTree: ReadonlyFieldTree<unknown, TKey>;

  /**
   * A writable signal containing the value for this field.
   *
   * Updating this signal will update the data model that the field is bound to.
   *
   * While updates from the UI control are eventually reflected here, they may be delayed if
   * debounced.
   */
  readonly value: Signal<TValue>;

  /**
   * A signal containing the value of the control to which this field is bound.
   *
   * This differs from {@link value} in that it's not subject to debouncing, and thus is used to
   * buffer debounced updates from the control to the field. This will also not take into account
   * the {@link controlValue} of children.
   */
  readonly controlValue: Signal<TValue>;

  /**
   * A signal indicating whether the field is currently disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * A signal indicating the field's maximum value, if applicable.
   *
   * Applies to `<input>` with a numeric or date `type` attribute and custom controls.
   */
  readonly max?: Signal<number | undefined>;

  /**
   * A signal indicating the field's maximum string length, if applicable.
   *
   * Applies to `<input>`, `<textarea>`, and custom controls.
   */
  readonly maxLength?: Signal<number | undefined>;

  /**
   * A signal indicating the field's minimum value, if applicable.
   *
   * Applies to `<input>` with a numeric or date `type` attribute and custom controls.
   */
  readonly min?: Signal<number | undefined>;

  /**
   * A signal indicating the field's minimum string length, if applicable.
   *
   * Applies to `<input>`, `<textarea>`, and custom controls.
   */
  readonly minLength?: Signal<number | undefined>;

  /**
   * A signal of a unique name for the field, by default based on the name of its parent field.
   */
  readonly name: Signal<string>;

  /**
   * A signal indicating the patterns the field must match.
   */
  readonly pattern: Signal<readonly RegExp[]>;

  /**
   * A signal indicating whether the field is currently readonly.
   */
  readonly readonly: Signal<boolean>;

  /**
   * A signal indicating whether the field is required.
   */
  readonly required: Signal<boolean>;

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
  readonly errors: Signal<ValidationError.WithFieldTree[]>;

  /**
   * A signal containing the {@link errors} of the field and its descendants.
   */
  readonly errorSummary: Signal<ValidationError.WithFieldTree[]>;

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
   * The {@link FormField} directives that bind this field to a UI control.
   */
  readonly formFieldBindings: Signal<readonly FormFieldBinding[]>;

  /**
   * Reads a metadata value from the field.
   * @param key The metadata key to read.
   */
  metadata<M>(key: MetadataKey<M, any, any>): M | undefined;

  /**
   * Checks whether a metadata value exists on the field.
   * @param key The metadata key to check.
   */
  hasMetadata(key: MetadataKey<any, any, any>): boolean;

  /**
   * Focuses the first UI control in the DOM that is bound to this field state.
   * If no UI control is bound, does nothing.
   * @param options Optional focus options to pass to the native focus() method.
   */
  focusBoundControl(options?: FocusOptions): void;
}

/**
 * A writable view of a {@link FieldTree}'s state.
 *
 * @template TValue The type of the data which the field is wrapped around.
 * @template TKey The type of the property key which this field resides under in its parent.
 *
 * @category structure
 * @experimental 21.0.0
 */
export interface FieldState<
  TValue,
  TKey extends string | number = string | number,
> extends ReadonlyFieldState<TValue, TKey> {
  /**
   * The {@link FieldTree} associated with this field state.
   */
  readonly fieldTree: FieldTree<unknown, TKey>;

  /**
   * A writable signal containing the value for this field.
   *
   * Updating this signal will update the data model that the field is bound to.
   *
   * While updates from the UI control are eventually reflected here, they may be delayed if
   * debounced.
   */
  readonly value: WritableSignal<TValue>;

  /**
   * A signal containing the value of the control to which this field is bound.
   *
   * This differs from {@link value} in that it's not subject to debouncing, and thus is used to
   * buffer debounced updates from the control to the field. This will also not take into account
   * the {@link controlValue} of children.
   */
  readonly controlValue: WritableSignal<TValue>;

  /**
   * Sets the dirty status of the field to `true`.
   */
  markAsDirty(): void;

  /**
   * Sets the touched status of the field to `true`.
   */
  markAsTouched(): void;

  /**
   * Resets the {@link touched} and {@link dirty} state of the field and its descendants.
   *
   * Note this does not change the data model, which can be reset directly if desired.
   *
   * @param value Optional value to set to the form. If not passed, the value will not be changed.
   */
  reset(value?: TValue): void;
}

/**
 * This is FieldState also providing access to the wrapped FormControl.
 *
 * @category interop
 * @experimental 21.0.0
 */
export type CompatFieldState<
  TControl extends AbstractControl,
  TKey extends string | number = string | number,
  TMode extends 'writable' | 'readonly' = 'writable',
> = FieldStateByMode<
  TControl extends AbstractControl<unknown, infer TValue> ? TValue : never,
  TKey,
  TMode
> & {
  control: Signal<TControl>;
};

/**
 * A readonly {@link CompatFieldState}.
 *
 * @category interop
 * @experimental 21.3.0
 */
export type ReadonlyCompatFieldState<
  TControl extends AbstractControl,
  TKey extends string | number = string | number,
> = CompatFieldState<TControl, TKey, 'readonly'>;

/**
 * Helper type that resolves to either a {@link FieldState} or {@link ReadonlyFieldState} based on
 * the access mode.
 *
 * @template TValue The type of the value stored in the field.
 * @template TKey The type of the property key.
 * @template TMode The access mode ('readonly' or 'writable').
 */
export type FieldStateByMode<
  TValue,
  TKey extends string | number,
  TMode extends 'writable' | 'readonly',
> = TMode extends 'writable' ? FieldState<TValue, TKey> : ReadonlyFieldState<TValue, TKey>;

/**
 * Represents a binding between a field and a UI control through a {@link FormField} directive.
 *
 * @experimental 21.3.0
 */
export interface FormFieldBinding {
  /**
   * The HTML element on which the {@link FormField} directive is applied.
   */
  readonly element: HTMLElement;

  /**
   * The node injector for the element hosting this field binding.
   */
  readonly injector: Injector;

  /**
   * The {@link FieldState} of the field bound to the {@link FormField} directive.
   */
  readonly state: Signal<ReadonlyFieldState<unknown>>;

  /**
   * Focuses this field binding.
   *
   * By default, this will focus {@link element}. However, custom controls can implement their own
   * focus behavior.
   */
  focus(options?: FocusOptions): void;
}

/**
 * Allows declaring whether the Rules are supported for a given path.
 *
 * @experimental 21.0.0
 **/
export type SchemaPathRules = SchemaPathRules.Supported | SchemaPathRules.Unsupported;

export declare namespace SchemaPathRules {
  /**
   * Used for paths that support settings rules.
   */
  type Supported = 1;

  /**
   * Used for paths that do not support settings rules, e.g., compatPath.
   */
  type Unsupported = 2;
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
export type SchemaPath<
  TValue,
  TSupportsRules extends SchemaPathRules = SchemaPathRules.Supported,
  TPathKind extends PathKind = PathKind.Root,
> = {
  [ɵɵTYPE]: {
    value: () => TValue;
    supportsRules: TSupportsRules;
    pathKind: TPathKind;
  };
};

/**
 * Schema path used if the value is an AbstractControl.
 *
 * @category interop
 * @experimental 21.0.0
 */
export type CompatSchemaPath<
  TControl extends AbstractControl,
  TPathKind extends PathKind = PathKind.Root,
> = SchemaPath<
  TControl extends AbstractControl<unknown, infer TValue> ? TValue : never,
  SchemaPathRules.Unsupported,
  TPathKind
> &
  // & also we capture the control type, so that `stateOf(p)` can unwrap
  // to a correctly typed `CompatFieldState`.
  {
    [ɵɵTYPE]: {control: TControl};
  };

/**
 * Nested schema path.
 *
 * It mirrors the structure of a given data structure, and allows applying rules to the appropriate
 * fields.
 *
 * @experimental 21.0.0
 */
export type SchemaPathTree<TModel, TPathKind extends PathKind = PathKind.Root> =
  // Note: We use `[TModel]` here to avoid distributing over a union type model.
  // (e.g. if we have a model of `number | string`, we want a `SchemaPath<number | string>`,
  // not a `SchemaPath<number> | SchemaPath<string>`.
  // See https://typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types)
  ([TModel] extends [AbstractControl]
    ? CompatSchemaPath<TModel, TPathKind>
    : SchemaPath<TModel, SchemaPathRules.Supported, TPathKind>) &
    // Subpaths
    (TModel extends AbstractControl
      ? unknown
      : // Array paths have no subpaths
        TModel extends ReadonlyArray<any>
        ? unknown
        : // Object subfields
          TModel extends Record<string, any>
          ? {[K in keyof TModel]: MaybeSchemaPathTree<TModel[K], PathKind.Child>}
          : // Primitive or other type - no subpaths
            unknown);

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
export type MaybeSchemaPathTree<TModel, TPathKind extends PathKind = PathKind.Root> =
  | (TModel & undefined)
  | SchemaPathTree<Exclude<TModel, undefined>, TPathKind>;

/**
 * A reusable schema that defines behavior and rules for a form.
 *
 * A `Schema` encapsulates form logic such as validation rules, disabled states, readonly states,
 * and other field-level behaviors.
 *
 * Unlike raw {@link SchemaFn}, a `Schema` is created using
 * the {@link schema} function and is cached per-form, even when applied to multiple fields.
 *
 * ### Creating a reusable schema
 *
 * ```typescript
 * interface Address {
 *   street: string;
 *   city: string;
 * }
 *
 * // Create a reusable schema for address fields
 * const addressSchema = schema<Address>((p) => {
 *   required(p.street);
 *   required(p.city);
 * });
 *
 * // Apply the schema to multiple forms
 * const shippingForm = form(shippingModel, addressSchema, {injector});
 * const billingForm = form(billingModel, addressSchema, {injector});
 * ```
 *
 * ### Passing a schema to a form
 *
 * A schema can also be passed as a second argument to the {@link form} function.
 *
 * ```typescript
 * readonly userForm = form(addressModel, addressSchema);
 * ```
 *
 * @template TModel Data type.
 *
 * @category types
 * @experimental 21.0.0
 */
export type Schema<in TModel> = {
  [ɵɵTYPE]: SchemaFn<TModel, PathKind.Root>;
};

/**
 * A function that receives a {@link SchemaPathTree} and applies rules to fields.
 *
 * A `SchemaFn` can be passed directly to {@link form} or to the {@link schema} function to create a
 * cached {@link Schema}.
 *
 * ```typescript
 * const userFormSchema: SchemaFn<User> = (p) => {
 *   required(p.name);
 *   disabled(p.email, ({valueOf}) => valueOf(p.name) === '');
 * };
 *
 * const f = form(userModel, userFormSchema, {injector});
 * ```
 *
 * @template TModel Data type.
 * @template TPathKind The kind of path this schema function can be bound to.
 *
 * @category types
 * @experimental 21.0.0
 */
export type SchemaFn<TModel, TPathKind extends PathKind = PathKind.Root> = (
  p: SchemaPathTree<TModel, TPathKind>,
) => void;

/**
 * A {@link Schema} or {@link SchemaFn}.
 *
 * @template TModel The type of data stored in the form that this schema function is attached to.
 * @template TPathKind The kind of path this schema function can be bound to.
 *
 * @category types
 * @experimental 21.0.0
 */
export type SchemaOrSchemaFn<TModel, TPathKind extends PathKind = PathKind.Root> =
  | Schema<TModel>
  | SchemaFn<TModel, TPathKind>;

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
  ValidationResult<ValidationError.WithoutFieldTree>,
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
 * @see [Signal Form Validation](/guide/forms/signals/validation)
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
  readonly state: ReadonlyFieldState<TValue>;
  /** The current field. */
  readonly fieldTree: ReadonlyFieldTree<TValue>;

  /** Gets the value of the field represented by the given path. */
  valueOf<PValue>(p: SchemaPath<PValue, SchemaPathRules>): PValue;

  /** Gets the state of the field represented by the given path. */
  stateOf<PControl extends AbstractControl>(
    p: CompatSchemaPath<PControl>,
  ): ReadonlyCompatFieldState<PControl>;
  stateOf<PValue>(p: SchemaPath<PValue, SchemaPathRules>): ReadonlyFieldState<PValue>;
  /** Gets the field represented by the given path. */
  fieldTreeOf<PModel>(p: SchemaPathTree<PModel>): ReadonlyFieldTree<PModel>;
  /** The list of keys that lead from the root field to the current field. */
  readonly pathKeys: Signal<readonly string[]>;
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

/**
 * Gets the item type of an object that is possibly an array.
 *
 * @experimental 21.0.0
 */
export type ItemType<T extends Object> = T extends ReadonlyArray<any> ? T[number] : T[keyof T];

/**
 * A function that defines custom debounce logic for a field.
 *
 * @param context The field context.
 * @param abortSignal An `AbortSignal` used to communicate that the debounced operation was aborted.
 * @returns A `Promise<void>` to debounce an update, or `void` to apply an update immediately.
 * @template TValue The type of value stored in the field.
 * @template TPathKind The kind of path the debouncer is applied to (root field, child field, or item of an array).
 *
 * @experimental 21.0.0
 */
export type Debouncer<TValue, TPathKind extends PathKind = PathKind.Root> = (
  context: FieldContext<TValue, TPathKind>,
  abortSignal: AbortSignal,
) => Promise<void> | void;
