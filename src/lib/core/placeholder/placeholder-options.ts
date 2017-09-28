/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { InjectionToken } from '@angular/core';

/** InjectionToken that can be used to specify the global placeholder options. */
export const MAT_PLACEHOLDER_GLOBAL_OPTIONS =
  new InjectionToken<PlaceholderOptions>('mat-placeholder-global-options');

/** Type for the available floatPlaceholder values. */
export type FloatPlaceholderType = 'always' | 'never' | 'auto';

export interface PlaceholderOptions {
  float?: FloatPlaceholderType;
}
