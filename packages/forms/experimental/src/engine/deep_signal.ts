/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {untracked, WritableSignal} from '@angular/core';
import {SIGNAL} from '@angular/core/primitives/signals';

const RESOLVE = Symbol('RESOLVE');

export function deepSignal<S, K extends keyof S>(
  source: WritableSignal<S>,
  prop: K,
): WritableSignal<S[K]> {
  const read: WritableSignal<S[K]> = (() => {
    return source()[prop];
  }) as WritableSignal<S[K]>;

  read[SIGNAL] = source[SIGNAL];
  read.set = (value: S[K]) => {
    source.update((current) => valueForWrite(current, value, [prop]) as S);
  };

  read.update = (fn: (current: S[K]) => S[K]) => {
    read.set(fn(untracked(read)));
  };
  read.asReadonly = () => read;

  return read;
}

function valueForWrite(parentValue: unknown, leafValue: unknown, path: PropertyKey[]): unknown {
  if (path.length === 0) {
    return leafValue;
  }

  const prop = path.pop()!;
  const oldChildValue = (parentValue as any)[prop];
  const newChildValue = valueForWrite(oldChildValue, leafValue, path);

  if (parentValue instanceof Array) {
    parentValue = [...parentValue];
    (parentValue as any)[prop] = newChildValue;
  } else {
    parentValue = {...(parentValue as object), [prop]: newChildValue};
  }

  return parentValue;
}
