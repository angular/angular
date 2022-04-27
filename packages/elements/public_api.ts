/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * Entry point for all public APIs of the `elements` package.
 */
export {createCustomElement, NgElement, NgElementConfig, NgElementConstructor, WithProperties} from './src/create-custom-element.js';
export {NgElementStrategy, NgElementStrategyEvent, NgElementStrategyFactory} from './src/element-strategy.js';
export {VERSION} from './src/version.js';

// This file only reexports content of the `src` folder. Keep it that way.
