/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';

/**
 * Interface for configuring custom CSS classes based on field status.
 * Each property maps to a field state and accepts space-separated class names.
 */
export interface FieldStatusClasses {
  valid?: string;
  invalid?: string;
  pristine?: string;
  dirty?: string;
  touched?: string;
  untouched?: string;
  pending?: string;
}

/**
 * Injection token for providing custom CSS classes for field status.
 * Can be provided at component, module, or application level.
 */
export const FIELD_STATUS_CLASSES = new InjectionToken<FieldStatusClasses>('FIELD_STATUS_CLASSES');
