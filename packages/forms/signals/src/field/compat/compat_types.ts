/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal, WritableSignal} from '@angular/core';
import {FieldState, PathKind, ReadonlyArrayLike, ɵɵTYPE} from '../../api/types';
import {AbstractControl} from '@angular/forms';

export type CompatMaybeField<TValue, TKey extends string | number = string | number> =
  | (TValue & undefined)
  | CompatField<Exclude<TValue, undefined>, TKey>;

export type UnwrapControl<TValue> = TValue extends AbstractControl<infer R> ? R : TValue;

export type CompatSubfields<TValue> = {
  readonly [K in keyof TValue as TValue[K] extends Function ? never : K]: CompatMaybeField<
    TValue[K],
    string
  >;
};

export interface InteropFieldState<TControl, TKey extends string | number = string | number>
  extends FieldState<UnwrapControl<TControl>, TKey> {
  readonly control: Signal<TControl>;
}

export type UnwrapInState<TValue, TKey extends string | number = string | number> = [
  TValue,
] extends [AbstractControl<unknown>]
  ? InteropFieldState<TValue, TKey>
  : FieldState<TValue, TKey>;

export type CompatMaybeFieldPath<TValue, TPathKind extends PathKind = PathKind.Root> =
  | (TValue & undefined)
  | CompatFieldPath<Exclude<TValue, undefined>, TPathKind>;

export type CompatFieldPath<
  TValue,
  TPathKind extends PathKind = PathKind.Root,
  TSupportsRules extends boolean = TValue extends AbstractControl<unknown> ? false : true,
> = {
  [ɵɵTYPE]: [TValue, TPathKind, TSupportsRules];
  compat: true,
} & (TValue extends Array<unknown>
  ? unknown
  : TValue extends Record<string, any>
    ? {[K in keyof TValue]: CompatMaybeFieldPath<TValue[K], PathKind.Child>}
    : unknown);

export type CompatField<
  TValue,
  TKey extends string | number = string | number,
> = (() => UnwrapInState<TValue, TKey>) &
  (TValue extends Array<infer U>
    ? ReadonlyArrayLike<CompatMaybeField<U, number>>
    : TValue extends Record<string, any>
      ? CompatSubfields<TValue>
      : unknown);

export type CompatSchemaFn<TValue, TPathKind extends PathKind = PathKind.Root> = (
  p: CompatFieldPath<TValue, TPathKind>,
) => void;

export type CompatSchema<in TValue, TPathKind extends PathKind = PathKind.Root> = {
  [ɵɵTYPE]: CompatSchemaFn<TValue, TPathKind>;
};

export type CompatSchemaOrSchemaFn<TValue, TPathKind extends PathKind = PathKind.Root> =
  | CompatSchema<TValue>
  | CompatSchemaFn<TValue, TPathKind>;
