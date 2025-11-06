/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Utility to create a Promise along with its resolve and reject functions.
 * This is a common pattern for managing promise lifecycles manually.
 */
export function promiseWithResolvers<T = void>(): [
  promise: Promise<T>,
  resolve: (v: T) => void,
  reject: (reason?: any) => void,
] {
  let resolve: (v: T) => void;
  let reject: () => void;
  const promise = new Promise<T>((r, rej) => {
    resolve = r;
    reject = rej;
  });
  return [promise, resolve!, reject!] as const;
}
