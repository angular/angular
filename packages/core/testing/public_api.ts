/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="jasmine" />

/**
 * @module
 * @description
 * Entry point for all public APIs of this package.
 */
export * from './src/testing';
export * from './src/testing_private_export';
export {Log as ɵLog} from './src/testing_internal';
// This file only reexports content of the `src` folder. Keep it that way.
