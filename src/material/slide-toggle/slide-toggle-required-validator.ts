/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  forwardRef,
  Provider,
} from '@angular/core';
import {
  CheckboxRequiredValidator,
  NG_VALIDATORS,
} from '@angular/forms';

export const MAT_SLIDE_TOGGLE_REQUIRED_VALIDATOR: Provider = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MatSlideToggleRequiredValidator),
  multi: true
};

/**
 * Validator for Material slide-toggle components with the required attribute in a
 * template-driven form. The default validator for required form controls asserts
 * that the control value is not undefined but that is not appropriate for a slide-toggle
 * where the value is always defined.
 *
 * Required slide-toggle form controls are valid when checked.
 */
@Directive({
  selector: `mat-slide-toggle[required][formControlName],
             mat-slide-toggle[required][formControl], mat-slide-toggle[required][ngModel]`,
  providers: [MAT_SLIDE_TOGGLE_REQUIRED_VALIDATOR],
})
export class MatSlideToggleRequiredValidator extends CheckboxRequiredValidator {}
