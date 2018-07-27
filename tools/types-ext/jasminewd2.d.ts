/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="jasminewd2" />

/**
 * Extended typings for `jasminewd2`.
 *
 * The currently used `jasminewd2` version (v2.1.0), supports passing a `done` callback to a spec,
 * but the latest typings on [DefinitelyTyped][1] do not reflect that.
 * Overwrite the relevant function signatures to add a `done` callback.
 *
 * [1]:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/566e0394859fdc1dc893658ccec6b06372d56a91/types/jasminewd2/index.d.ts#L9-L15
 */
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
