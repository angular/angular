/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * Entry point for all public APIs of the `elements` package.
 */
export {ComponentFactoryNgElementStrategy, ComponentFactoryNgElementStrategyFactory, getConfigFromComponentFactory} from './src/component-factory-strategy';
export {NgElementStrategy, NgElementStrategyEvent, NgElementStrategyFactory} from './src/element-strategy';
export {NgElement, NgElementConfig, NgElementConstructor, createNgElementConstructor} from './src/ng-element-constructor';
export {VERSION} from './src/version';

// This file only reexports content of the `src` folder. Keep it that way.
