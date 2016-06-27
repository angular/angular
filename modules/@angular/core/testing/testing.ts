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

import {TestInjector, getTestInjector} from './test_injector';

declare var global: any;

var _global = <any>(typeof window === 'undefined' ? global : window);

/**
 * @deprecated you no longer need to import jasmine functions from @angular/core/testing. Simply use
 * the globals.
 *
 * See http://jasmine.github.io/ for more details.
 */
export var expect: Function = _global.expect;

/**
 * @deprecated you no longer need to import jasmine functions from @angular/core/testing. Simply use
 * the globals.
 *
 * See http://jasmine.github.io/ for more details.
 */
export var afterEach: Function = _global.afterEach;

/**
 * @deprecated you no longer need to import jasmine functions from @angular/core/testing. Simply use
 * the globals.
 *
 * See http://jasmine.github.io/ for more details.
 */
export var describe: Function = _global.describe;

/**
 * @deprecated you no longer need to import jasmine functions from @angular/core/testing. Simply use
 * the globals.
 *
 * See http://jasmine.github.io/ for more details.
 */
export var fdescribe = _global.fdescribe;

/**
 * @deprecated you no longer need to import jasmine functions from @angular/core/testing. Simply use
 * the globals.
 *
 * See http://jasmine.github.io/ for more details.
 */
export var ddescribe = _global.ddescribe;

/**
 * @deprecated you no longer need to import jasmine functions from @angular/core/testing. Simply use
 * the globals.
 *
 * See http://jasmine.github.io/ for more details.
 */
export var xdescribe: Function = _global.xdescribe;

/**
 * @deprecated you no longer need to import jasmine functions from @angular/core/testing. Simply use
 * the globals.
 *
 * See http://jasmine.github.io/ for more details.
 */
export var beforeEach = _global.beforeEach;

/**
 * @deprecated you no longer need to import jasmine functions from @angular/core/testing. Simply use
 * the globals.
 *
 * See http://jasmine.github.io/ for more details.
 */
export var it = _global.it;

/**
 * @deprecated you no longer need to import jasmine functions from @angular/core/testing. Simply use
 * the globals.
 *
 * See http://jasmine.github.io/ for more details.
 */
export var fit = _global.fit;

/**
 * @deprecated you no longer need to import jasmine functions from @angular/core/testing. Simply use
 * the globals.
 *
 * See http://jasmine.github.io/ for more details.
 */
export var iit = _global.fit;

/**
 * @deprecated you no longer need to import jasmine functions from @angular/core/testing. Simply use
 * the globals.
 *
 * See http://jasmine.github.io/ for more details.
 */
export var xit = _global.xit;


var testInjector: TestInjector = getTestInjector();

// Reset the test providers before each test.
if (_global.beforeEach) {
  beforeEach(() => { testInjector.reset(); });
}

/**
 * Allows overriding default providers of the test injector,
 * which are defined in test_injector.js
 *
 * @stable
 */
export function addProviders(providers: Array<any>): void {
  if (!providers) return;
  try {
    testInjector.addProviders(providers);
  } catch (e) {
    throw new Error(
        'addProviders can\'t be called after the injector has been already created for this test. ' +
        'This is most likely because you\'ve already used the injector to inject a beforeEach or the ' +
        'current `it` function.');
  }
}

/**
 * @deprecated Use beforeEach(() => addProviders())
 */
export function beforeEachProviders(fn: () => Array<any>): void {
  beforeEach(() => { addProviders(fn()); });
}
