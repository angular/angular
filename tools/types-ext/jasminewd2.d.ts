/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Extended typings for `jasminewd2`.
 * The currently used `jasminewd2` version (v2.1.0), supports passing a `done` callback to a spec,
 * but the latest typings do not reflect that.
 * Here, we overwrite the relevant function signatures to add a `done` callback.
 */
declare global {
  namespace jasmine {
  // `jasmine` typings do not export `DoneFn`. Re-implement in order to use below.
  interface DoneFn extends Function {
    (): void;
    fail: (message?: Error|string) => void;
  }
  }
}

// Overwrite signatures to add a `done` callback.
declare function it(
    expectation: string, assertion?: (done: DoneFn) => Promise<void>, timeout?: number): void;
    declare function fit(
        expectation: string, assertion?: (done: DoneFn) => Promise<void>, timeout?: number): void;
    declare function xit(
        expectation: string, assertion?: (done: DoneFn) => Promise<void>, timeout?: number): void;
    declare function beforeEach(action: (done: DoneFn) => Promise<void>, timeout?: number): void;
    declare function afterEach(action: (done: DoneFn) => Promise<void>, timeout?: number): void;
    declare function beforeAll(action: (done: DoneFn) => Promise<void>, timeout?: number): void;
    declare function afterAll(action: (done: DoneFn) => Promise<void>, timeout?: number): void;
