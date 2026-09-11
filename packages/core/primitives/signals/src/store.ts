/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * A wrapper around a module-level value.
 *
 * Safari 16-17 have a JIT bug where assigning to a module-level let/var can
 * sometimes fail to write the value.
 */
export declare interface Store<T> {
  [0]: T;
}

/** Makes a mutable data store */
export function make<T>(init: T): Store<T> {
  return [init];
}

/** Retrieves the value from a data store */
export function get<T>(store: Store<T>): T {
  return store[0];
}

/** Sets the value of a data store and returns the previous value */
export function set<T>(store: Store<T>, value: T): T {
  const prev = store[0];
  store[0] = value;
  return prev;
}
