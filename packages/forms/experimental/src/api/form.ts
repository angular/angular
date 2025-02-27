import {Signal, WritableSignal} from '@angular/core';
import {LogicNode} from '../engine/logic';
import {FormNode} from '../engine/node';
import {FormPath, schema} from './schema';

export interface FormControl<T> {
  readonly value: WritableSignal<T>;
  readonly touched: Signal<boolean>;
  readonly disabled: Signal<boolean>;
  markAsTouched(): void;
}

export type Form<T> = {
  $: FormControl<T>;
} & (T extends Array<infer U>
  ? Array<Form<U>>
  : T extends Record<PropertyKey, unknown>
    ? {[K in keyof T]: Form<T[K]>}
    : unknown);

export function form<T>(
  v: WritableSignal<T>,
  s?: NoInfer<((p: FormPath<T, [Form<T>]>) => void) | LogicNode>,
): Form<T> {
  if (typeof s === 'function') {
    s = schema(s);
  }
  return new FormNode(v, undefined, s).proxy as unknown as Form<T>;
}
