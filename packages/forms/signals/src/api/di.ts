/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type Provider} from '@angular/core';
import {
  provideSignalFormsConfig as provideSignalFormsConfigFromConfig,
  type SignalFormsClassBinding,
} from '../../config/src/api';

/**
 * Configuration options for signal forms.
 *
 * @publicApi 22.0
 * @deprecated Import `SignalFormsConfig` from `@angular/forms/signals/config` instead.
 * Intent to remove in Angular v23.
 */
export interface SignalFormsConfig {
  /** A map of CSS class names to predicate functions that determine when to apply them. */
  classes?: {
    [className: string]: (formField: SignalFormsClassBinding) => boolean;
  };
}

/**
 * Provides configuration options for signal forms.
 *
 * @publicApi 22.0
 * @deprecated Import `provideSignalFormsConfig` from `@angular/forms/signals/config` instead.
 * Intent to remove in Angular v23.
 */
export function provideSignalFormsConfig(config: SignalFormsConfig): Provider[] {
  return provideSignalFormsConfigFromConfig(config);
}
