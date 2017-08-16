/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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

export const _MdCheckboxRequiredValidator = CheckboxRequiredValidator;

export const MD_CHECKBOX_REQUIRED_VALIDATOR: Provider = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MdCheckboxRequiredValidator),
  multi: true
};

/**
 * Validator for Material checkbox's required attribute in template-driven checkbox.
 * Current CheckboxRequiredValidator only work with `input type=checkbox` and does not
 * work with `md-checkbox`.
 */
@Directive({
  selector: `md-checkbox[required][formControlName],
             mat-checkbox[required][formControlName],
             md-checkbox[required][formControl], md-checkbox[required][ngModel],
             mat-checkbox[required][formControl], mat-checkbox[required][ngModel]`,
  providers: [MD_CHECKBOX_REQUIRED_VALIDATOR],
  host: {'[attr.required]': 'required ? "" : null'}
})
export class MdCheckboxRequiredValidator extends _MdCheckboxRequiredValidator {}
