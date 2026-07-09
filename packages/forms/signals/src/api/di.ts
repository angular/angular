/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type Provider} from '@angular/core';
import {SIGNAL_FORMS_CONFIG} from '../field/di';
import type {FieldState} from './types';

/**
 * Configuration options for signal forms.
 *
 * @see [Automatic status classes](guide/forms/signals/migration#automatic-status-classes)
 *
 * @publicApi 22.0
 */
export interface SignalFormsConfig {
  /** A map of CSS class names to predicate functions that determine when to apply them. */
  classes?: {[className: string]: (state: FieldState<unknown>) => boolean};
}

/**
 * Provides configuration options for signal forms.
 *
 * @see [Automatic status classes](guide/forms/signals/migration#automatic-status-classes)
 *
 * @publicApi 22.0
 */
export function provideSignalFormsConfig(config: SignalFormsConfig): Provider[] {
  return [{provide: SIGNAL_FORMS_CONFIG, useValue: config}];
}
