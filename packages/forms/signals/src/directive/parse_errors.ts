/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, type Signal, type WritableSignal} from '@angular/core';
import type {ValidationError} from '../api/rules';

/**
 * DI token that provides a writable signal that controls can use to set the signal of parse errors
 * for the `FormField` directive. Used internally by `transformedValue`.
 *
 * @experimental 21.2.0
 */
export const FORM_FIELD_PARSE_ERRORS = new InjectionToken<
  WritableSignal<Signal<readonly ValidationError.WithoutFieldTree[]> | undefined>
>(typeof ngDevMode !== 'undefined' && ngDevMode ? 'FORM_FIELD_PARSE_ERRORS' : '');
