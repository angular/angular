/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {MatFormFieldControl} from '@angular/material/form-field';
import {MatInput as BaseMatInput} from '@angular/material/input';

// workaround until we have feature targeting for MDC text-field. At that
// point we can just use the actual "MatInput" class and apply the MDC text-field
// styles appropriately.

@Directive({
  selector: `input[matInput], textarea[matInput], select[matNativeControl],
      input[matNativeControl], textarea[matNativeControl]`,
  exportAs: 'matInput',
  host: {
    'class': 'mat-mdc-input-element',
    // The BaseMatInput parent class adds `mat-input-element`, `mat-form-field-control` and
    // `mat-form-field-autofill-control` to the CSS class list, but this should not be added for
    // this MDC equivalent input.
    '[class.mat-form-field-autofill-control]': 'false',
    '[class.mat-input-element]': 'false',
    '[class.mat-form-field-control]': 'false',
    '[class.mat-native-select-inline]': 'false',
    '[class.mat-input-server]': '_isServer',
    '[class.mat-mdc-form-field-textarea-control]': '_isInFormField && _isTextarea',
    '[class.mat-mdc-form-field-input-control]': '_isInFormField',
    '[class.mdc-text-field__input]': '_isInFormField',
    '[class.mat-mdc-native-select-inline]': '_isInlineSelect()',
    // Native input properties that are overwritten by Angular inputs need to be synced with
    // the native input element. Otherwise property bindings for those don't work.
    '[id]': 'id',
    '[disabled]': 'disabled',
    '[required]': 'required',
    '[attr.name]': 'name',
    '[attr.placeholder]': 'placeholder',
    '[attr.readonly]': 'readonly && !_isNativeSelect || null',
    // Only mark the input as invalid for assistive technology if it has a value since the
    // state usually overlaps with `aria-required` when the input is empty and can be redundant.
    '[attr.aria-invalid]': '(empty && required) ? null : errorState',
    '[attr.aria-required]': 'required',
  },
  providers: [{provide: MatFormFieldControl, useExisting: MatInput}],
})
export class MatInput extends BaseMatInput {}
