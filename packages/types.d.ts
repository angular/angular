/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This file contains all ambient imports needed to compile the packages/ source code

/// <reference types="hammerjs" />
/// <reference types="jasmine" />
/// <reference types="node" />
/// <reference types="zone.js" />
/// <reference path="./es6-subset.d.ts" />
/// <reference path="./goog.d.ts" />
/// <reference path="./system.d.ts" />

declare let isNode: boolean;
declare let isBrowser: boolean;

declare namespace jasmine {
  interface Matchers<T> {
    toHaveProperties(obj: any): boolean;
  }
}

/**
*Jasmine matching utilities. These are added in the a more recent version of
*the Jasmine typedefs than what we are using:
*https://github.com/DefinitelyTyped/DefinitelyTyped/pull/20771
*/
declare namespace jasmine {
  const matchersUtil: MatchersUtil;
}
