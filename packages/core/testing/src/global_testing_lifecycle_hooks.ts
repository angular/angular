/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Public Test Library for unit testing Angular applications. Assumes that you are running
 * with Jasmine, Mocha, or a similar framework which exports a beforeEach function and
 * allows tests to be asynchronous by either returning a promise or using a 'done' parameter.
 */

import {resetFakeAsyncZone} from './fake_async';
import {TestBed} from './test_bed';

declare var global: any;

const _global = <any>(typeof window === 'undefined' ? global : window);

// Reset the test providers and the fake async zone before each test.
if (_global.beforeEach) {
  _global.beforeEach(() => {
    TestBed.resetTestingModule();
    resetFakeAsyncZone();
  });
}

// Tear down the test module, destroying the test module and active fixtures after each test.
if (_global.afterEach) {
  _global.afterEach(() => {
    try {
      TestBed.tearDownTestModule();
    } catch (e) {
      console.error(
          'An error occured while tearing down the test module, in the future this will be a failure\n' +
          'Details:\n\n' + e.stack);
    }
  });
}

/**
 * This API should be removed. But doing so seems to break `google3` and so it requires a bit of
 * investigation.
 *
 * A work around is to mark it as `@codeGenApi` for now and investigate later.
 *
 * @codeGenApi
 */
// TODO(iminar): Remove this code in a safe way.
export const __core_private_testing_placeholder__ = '';
