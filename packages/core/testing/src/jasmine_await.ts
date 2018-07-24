/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Converts an `async` function, with `await`, into a function which is compatible with Jasmine test
 * framework.
 *
 * For asynchronous function blocks, Jasmine expects `it` (and friends) to take a function which
 * takes a `done` callback. (Jasmine does not understand functions which return `Promise`.) The
 * `jasmineAwait()` wrapper converts the test function returning `Promise` into a function which
 * Jasmine understands.
 *
 *
 * Example:
 * ```
 * it('...', jasmineAwait(async() => {
 *   doSomething();
 *   await asyncFn();
 *   doSomethingAfter();
 * }));
 * ```
 *
 */
export function jasmineAwait(fn: () => Promise<any>):
    (done: {(): void; fail: (message?: Error | string) => void;}) => void {
  return function(done: {(): void; fail: (message?: Error | string) => void;}) {
    fn().then(done, done.fail);
  };
}
