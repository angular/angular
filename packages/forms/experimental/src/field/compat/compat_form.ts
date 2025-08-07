import {Signal, WritableSignal} from '@angular/core';
import {FieldPath, FieldState, PathKind, Schema, ɵɵTYPE} from '../../api/types';
import {AbstractControl, FormControl, FormControlState} from '@angular/forms';
import {form, FormOptions} from '../../api/structure';

type UnwrapControl<T> = T extends AbstractControl<infer V> ? UnwrapFormControlState<V> : T;

type UnwrapFormControlNested<TValue, TPathKind extends PathKind> = {
  [ɵɵTYPE]: [TValue, TPathKind, any];
} & (TValue extends FormControl<infer C>
  ? FieldPath<TValue, TPathKind, UnwrapControl<C>>
  : TValue extends object
    ? {[K in keyof TValue]: UnwrapFormControlNested<TValue[K], PathKind.Child>}
    : FieldPath<TValue>);

type PathToCompatPath<T> =
  T extends FieldPath<infer C, infer TKind> ? UnwrapFormControlNested<C, TKind> : never;

export type MaybeCompatField<TValue, TKey extends string | number = string | number> =
  | (TValue & undefined)
  | CompatField<Exclude<TValue, undefined>, TKey>;

type UnwrapFormControlState<T> = T extends FormControlState<infer V> ? V : T;

type ControlOrNoControl<T> = T extends AbstractControl<unknown> ? Signal<T> : never;

type CompatFieldState<T, K extends string | number = string | number> = Omit<
  FieldState<T, K>,
  'value'
> & {
  value: WritableSignal<UnwrapControl<T>>;
  control: ControlOrNoControl<T>;
};

export type CompatSchemaFn<TValue, TPathKind extends PathKind = PathKind.Root> = (
  p: PathToCompatPath<FieldPath<TValue, TPathKind>>,
) => void;

export type CompatSchemaOrSchemaFn<TValue, TPathKind extends PathKind = PathKind.Root> =
  | Schema<TValue>
  | CompatSchemaFn<TValue, TPathKind>;

export type CompatField<
  TValue,
  TKey extends string | number = string | number,
> = (() => CompatFieldState<TValue, TKey>) &
  (TValue extends Array<infer U>
    ? Array<MaybeCompatField<U, number>>
    : TValue extends Record<string, any>
      ? {[K in keyof TValue]: MaybeCompatField<TValue[K], string>}
      : unknown);

export function interopForm<TValue>(model: WritableSignal<TValue>): CompatField<TValue>;
export function interopForm<TValue>(
  model: WritableSignal<TValue>,
  schemaOrOptions: CompatSchemaOrSchemaFn<TValue> | FormOptions,
): CompatField<TValue>;
export function interopForm<TValue>(
  model: WritableSignal<TValue>,
  schema: CompatSchemaOrSchemaFn<TValue>,
  options: FormOptions,
): CompatField<TValue>;
export function interopForm<TValue>(...args: [any]): CompatField<TValue> {
  return form(...args) as any;
}
