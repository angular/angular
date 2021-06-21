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
export {createCustomElement, NgElementConfig, NgElementConstructor, WithProperties} from './src/create-custom-element';
export {NgElement, useReflectionBasedCustomElements as ɵuseReflectionBasedCustomElements} from './src/custom-element-impl';
export {NgElementStrategy, NgElementStrategyEvent, NgElementStrategyFactory} from './src/element-strategy';
export {VERSION} from './src/version';

// This file only reexports content of the `src` folder. Keep it that way.
