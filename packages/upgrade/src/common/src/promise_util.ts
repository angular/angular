/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isFunction} from './util';

export interface Thenable<T> {
  then(callback: (value: T) => any): any;
}

export function isThenable<T>(obj: unknown): obj is Thenable<T> {
  return !!obj && isFunction((obj as any).then);
}

/**
 * Synchronous, promise-like object.
 */
export class SyncPromise<T> {
  protected value: T|undefined;
  private resolved = false;
  private callbacks: ((value: T) => unknown)[] = [];

  static all<T>(valuesOrPromises: (T|Thenable<T>)[]): SyncPromise<T[]> {
    const aggrPromise = new SyncPromise<T[]>();

    let resolvedCount = 0;
    const results: T[] = [];
    const resolve = (idx: number, value: T) => {
      results[idx] = value;
      if (++resolvedCount === valuesOrPromises.length) aggrPromise.resolve(results);
    };

    valuesOrPromises.forEach((p, idx) => {
      if (isThenable(p)) {
        p.then(v => resolve(idx, v));
      } else {
        resolve(idx, p);
      }
    });

    return aggrPromise;
  }

  resolve(value: T): void {
    // Do nothing, if already resolved.
    if (this.resolved) return;

    this.value = value;
    this.resolved = true;

    // Run the queued callbacks.
    this.callbacks.forEach(callback => callback(value));
    this.callbacks.length = 0;
  }

  then(callback: (value: T) => unknown): void {
    if (this.resolved) {
      callback(this.value!);
    } else {
      this.callbacks.push(callback);
    }
  }
}
