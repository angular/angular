/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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

// TODO(juliemr): remove this, only used because we need to export something to have compilation
// work.
export const __core_private_testing_placeholder__ = '';
