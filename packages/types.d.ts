/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This file contains all ambient imports needed to compile the packages/ source code

/// <reference types="hammerjs" />
/// <reference lib="es2015" />
/// <reference path="./goog.d.ts" />
/// <reference path="./system.d.ts" />

// Do not included "node" and "jasmine" types here as we don't
// want these ambient types to be included everywhere.
// Tests will bring in ambient node & jasmine types with
// /packages/tsconfig-test.json when `testonly = True` is set
// and packages such as platform-server that need these types should
// use `/// <reference types="x">` in their main entry points

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
