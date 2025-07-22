/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal, untracked, WritableSignal} from '@angular/core';
import {SIGNAL} from '@angular/core/primitives/signals';
import {isArray} from './is_array';

/**
 * Creates a writable signal for a specific property on a source writeable signal.
 * @param source A writeable signal to derive from
 * @param prop A signal of a property key of the source value
 * @returns A writeable signal for the given property of the source value.
 * @template S The source value type
 * @template K The key type for S
 */
export function deepSignal<S, K extends keyof S>(
  source: WritableSignal<S>,
  prop: Signal<K>,
): WritableSignal<S[K]> {
  const read: WritableSignal<S[K]> = (() => {
    return source()[prop()];
  }) as WritableSignal<S[K]>;

  read[SIGNAL] = source[SIGNAL];
  read.set = (value: S[K]) => {
    source.update((current) => valueForWrite(current, value, prop()) as S);
  };

  read.update = (fn: (current: S[K]) => S[K]) => {
    read.set(fn(untracked(read)));
  };
  read.asReadonly = () => read;

  return read;
}

/**
 * Gets an updated root value to use when setting a value on a deepSignal with the given path.
 * @param sourceValue The current value of the deepSignal's source.
 * @param newPropValue The value being written to the deepSignal's property
 * @param prop The deepSignal's property key
 * @returns An updated value for the deepSignal's source
 */
function valueForWrite(sourceValue: unknown, newPropValue: unknown, prop: PropertyKey): unknown {
  if (isArray(sourceValue)) {
    const newValue = [...sourceValue];
    newValue[prop as number] = newPropValue;
    return newValue;
  } else {
    return {...(sourceValue as object), [prop]: newPropValue};
  }
}
