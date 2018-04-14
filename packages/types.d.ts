/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This file contains all ambient imports needed to compile the modules/ source code

/// <reference path="../node_modules/zone.js/dist/zone.js.d.ts" />
/// <reference path="../node_modules/@types/hammerjs/index.d.ts" />
/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/selenium-webdriver/index.d.ts" />
/// <reference path="./es6-subset.d.ts" />
/// <reference path="./system.d.ts" />
/// <reference path="./goog.d.ts" />

declare let isNode: boolean;
declare let isBrowser: boolean;

declare namespace jasmine {
  interface Matchers {
    toHaveProperties(perfCounts: Partial<NgDevModePerfCounters>): boolean;
  }
}
