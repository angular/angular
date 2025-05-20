/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Public Test Library for unit testing Angular applications. Assumes that you are running
 * with Jasmine, Mocha, or a similar framework which exports a beforeEach function and
 * allows tests to be asynchronous by either returning a promise or using a 'done' parameter.
 */

import {resetFakeAsyncZoneIfExists} from './fake_async';
import {TestBedImpl} from './test_bed';

// Reset the test providers and the fake async zone before each test.
// We keep a guard because somehow this file can make it into a bundle and be executed
// beforeEach is only defined when executing the tests
globalThis.beforeEach?.(getCleanupHook(false));

// We provide both a `beforeEach` and `afterEach`, because the updated behavior for
// tearing down the module is supposed to run after the test so that we can associate
// teardown errors with the correct test.
// We keep a guard because somehow this file can make it into a bundle and be executed
// afterEach is only defined when executing the tests
globalThis.afterEach?.(getCleanupHook(true));

export function getCleanupHook(expectedTeardownValue: boolean): VoidFunction {
  return () => {
    const testBed = TestBedImpl.INSTANCE;
    if (testBed.shouldTearDownTestingModule() === expectedTeardownValue) {
      testBed.resetTestingModule();
      resetFakeAsyncZoneIfExists();
    }
  };
}
