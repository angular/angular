/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @module
 * @description
 * Entry point for all animation APIs of the animation browser package.
 */
export {ANIMATION_MODULE_TYPE} from '@angular/core';
export {
  BrowserAnimationsModule,
  BrowserAnimationsModuleConfig,
  NoopAnimationsModule,
  provideAnimations,
  provideNoopAnimations,
} from './module';

export * from './private_export';
