/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';

/**
 * InjectionToken that can be used to specify the global label options.
 * @deprecated Use `MAT_FORM_FIELD_DEFAULT_OPTIONS` injection token from
 *     `@angular/material/form-field` instead.
 * @breaking-change 11.0.0
 */
export const MAT_LABEL_GLOBAL_OPTIONS =
  new InjectionToken<LabelOptions>('mat-label-global-options');

/**
 * Type for the available floatLabel values.
 * @deprecated Use `FloatLabelType` from `@angular/material/form-field` instead.
 * @breaking-change 11.0.0
 */
export type FloatLabelType = 'always' | 'never' | 'auto';

/**
 * Configurable options for floating labels.
 * @deprecated Use `MatFormFieldDefaultOptions` from `@angular/material/form-field` instead.
 * @breaking-change 11.0.0
 */
export interface LabelOptions {
  /**
   * Whether the label should float `always`, `never`, or `auto` (only when necessary).
   * Default behavior is assumed to be `auto`.
   */
  float?: FloatLabelType;
}
