/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import type {SignalFormsConfig} from '../api/di';

/** Injection token for the signal forms configuration. */
export const SIGNAL_FORMS_CONFIG = new InjectionToken<SignalFormsConfig>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'SIGNAL_FORMS_CONFIG' : '',
);
