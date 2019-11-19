/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Expects the asynchronous function to throw an error that matches
 * the specified expectation.
 */
export async function expectAsyncError(fn: () => Promise<any>, expectation: RegExp | string) {
  let error: string|null = null;
  try {
    await fn();
  } catch (e) {
    error = e.toString();
  }
  expect(error).not.toBe(null);
  if (expectation instanceof RegExp) {
    expect(error!).toMatch(expectation, 'Expected error to be thrown.');
  } else {
    expect(error!).toBe(expectation, 'Expected error to be throw.');
  }
}
