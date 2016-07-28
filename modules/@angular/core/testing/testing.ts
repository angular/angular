/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Public Test Library for unit testing Angular2 Applications. Assumes that you are running
 * with Jasmine, Mocha, or a similar framework which exports a beforeEach function and
 * allows tests to be asynchronous by either returning a promise or using a 'done' parameter.
 */

import {SchemaMetadata} from '../index';

import {TestBed, TestModuleMetadata, getTestBed} from './test_bed';

declare var global: any;

var _global = <any>(typeof window === 'undefined' ? global : window);

// Reset the test providers before each test.
if (_global.beforeEach) {
  _global.beforeEach(() => { TestBed.resetTestingModule(); });
}

/**
 * Allows overriding default providers of the test injector,
 * which are defined in test_injector.js
 *
 * @deprecated Use `TestBed.configureTestingModule instead.
 */
export function addProviders(providers: Array<any>): void {
  if (!providers) return;
  TestBed.configureTestingModule({providers: providers});
}
