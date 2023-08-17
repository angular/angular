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
 * Entry point for all animation APIs of the animation browser package.
 */

/**
 * Doing this no mark the re-export as deprecated
 */
import {ANIMATION_MODULE_TYPE } from '@angular/core';
const _ANIMATION_MODULE_TYPE = ANIMATION_MODULE_TYPE;

export {_ANIMATION_MODULE_TYPE as ANIMATION_MODULE_TYPE};
export {BrowserAnimationsModule, BrowserAnimationsModuleConfig, NoopAnimationsModule, provideAnimations, provideNoopAnimations} from './module';

export * from './private_export';
