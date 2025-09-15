/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal} from '@angular/core';
import {FieldState, PathKind, ReadonlyArrayLike, ControlValue, ɵɵTYPE} from '../../src/api/types';
import {AbstractControl} from '@angular/forms';

/**
 * The types here copy-pasted from regular form types, with the only difference of these types
 * being aware of AbstractControl.
 *
 * We're not merging them with the original types because unwrapping AbstractControl makes generic
 * types harder. e.g., below wouldn't work with compat types.
 *
 * ```
 * function setValue<T>(f: CompatFieldTree<T>, value: T){
 *   f().value.set(value); // Doesn't work, because we don't know if T extends AbstractControl.
 *.}
 * ```
 *
 * And we want developers to be able to do this with regular FieldTree.
 *
 */
export type CompatMaybeFieldTree<TValue, TKey extends string | number = string | number> =
  | (TValue & undefined)
  | CompatFieldTree<Exclude<TValue, undefined>, TKey>;

export type CompatSubfields<TValue> = {
  readonly [K in keyof TValue as TValue[K] extends Function ? never : K]: CompatMaybeFieldTree<
    TValue[K],
    string
  >;
};

/**
 * Field state, with a control property included.
 */
export interface CompatFieldState<TControl, TKey extends string | number = string | number>
  extends FieldState<ControlValue<TControl>, TKey> {
  readonly control: Signal<TControl>;
}

/**
 * Returns  compat or regular FieldState depending on whether the value contains abstract control.
 */
export type UnwrapFieldState<TValue, TKey extends string | number = string | number> = [
  TValue,
] extends [AbstractControl<unknown>]
  ? CompatFieldState<TValue, TKey>
  : FieldState<TValue, TKey>;

export type CompatMaybeFieldPath<TValue, TPathKind extends PathKind = PathKind.Root> =
  | (TValue & undefined)
  | CompatFieldPath<Exclude<TValue, undefined>, TPathKind>;

export type CompatFieldPath<
  TValue,
  TPathKind extends PathKind = PathKind.Root,
  TSupportsRules extends boolean = TValue extends AbstractControl<unknown> ? false : true,
> = {
  [ɵɵTYPE]: {value: TValue; pathKind: TPathKind; supportsRules: TSupportsRules; compat: true};
} & (TValue extends Array<unknown>
  ? unknown
  : TValue extends Record<string, any>
    ? {[K in keyof TValue]: CompatMaybeFieldPath<TValue[K], PathKind.Child>}
    : unknown);

/** This is the same as Field, except field containing abstract control */
export type CompatFieldTree<
  TValue,
  TKey extends string | number = string | number,
> = (() => UnwrapFieldState<TValue, TKey>) &
  (TValue extends Array<infer U>
    ? ReadonlyArrayLike<CompatMaybeFieldTree<U, number>>
    : TValue extends Record<string, any>
      ? CompatSubfields<TValue>
      : unknown);

/** Compat wrapper */
export type CompatSchemaFn<TValue, TPathKind extends PathKind = PathKind.Root> = (
  p: CompatFieldPath<TValue, TPathKind>,
) => void;

/** Compat wrapper */
export type CompatSchema<in TValue, TPathKind extends PathKind = PathKind.Root> = {
  [ɵɵTYPE]: CompatSchemaFn<TValue, TPathKind>;
};

/** Compat wrapper  */
export type CompatSchemaOrSchemaFn<TValue, TPathKind extends PathKind = PathKind.Root> =
  | CompatSchema<TValue>
  | CompatSchemaFn<TValue, TPathKind>;
