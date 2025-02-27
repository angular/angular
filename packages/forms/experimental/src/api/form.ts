import {Signal, WritableSignal} from '@angular/core';
import {LogicNode} from '../engine/logic';
import {FormNode, FormNodeImpl, IMPL} from '../engine/node';
import {FormPath, schema} from './schema';

export interface FormControl<T> extends FormNode {
  value: WritableSignal<T>;
  touched: Signal<boolean>;
  disabled: Signal<boolean>;
  markAsTouched(): void;
}

export type Form<T> = FormNode & {
  $: FormControl<T>;
} & (T extends any[]
    ? Form<T[keyof T & number]>[]
    : T extends Record<PropertyKey, unknown>
      ? {[K in keyof T]: Form<T[K]>}
      : {});

export function form<T>(
  v: WritableSignal<T>,
  s?: NoInfer<((p: FormPath<T, []>) => void) | LogicNode>,
): Form<T> {
  if (typeof s === 'function') {
    s = schema(s);
  }
  return wrap(new FormNodeImpl(v, undefined, s, wrap)) as Form<T>;
}

const handler: ProxyHandler<FormNode> = {
  get(target: FormNode, property: string | symbol) {
    if (property === '$' || property === IMPL) {
      return target[IMPL];
    }

    const child = target[IMPL].getChild(property);
    if (child !== undefined) {
      return child;
    }

    return Reflect.get(target[IMPL], property);
  },
};

function wrap<T>(n: FormNode) {
  return new Proxy<Form<T>>(n as Form<T>, handler);
}
