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
    'class': 'mat-mdc-input-element mdc-text-field__input',
    '[class.mat-input-server]': '_isServer',
    '[class.mat-mdc-textarea-input]': '_isTextarea()',
    // Native input properties that are overwritten by Angular inputs need to be synced with
    // the native input element. Otherwise property bindings for those don't work.
    '[id]': 'id',
    '[disabled]': 'disabled',
    '[required]': 'required',
    '[attr.placeholder]': 'placeholder',
    '[attr.readonly]': 'readonly && !_isNativeSelect || null',
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-invalid]': 'errorState',
    '[attr.aria-required]': 'required.toString()',
    '(blur)': '_focusChanged(false)',
    '(focus)': '_focusChanged(true)',
    '(input)': '_onInput()',
  },
  providers: [{provide: MatFormFieldControl, useExisting: MatInput}],
})
export class MatInput extends BaseMatInput {
  static ngAcceptInputType_disabled: boolean | string | null | undefined;
  static ngAcceptInputType_readonly: boolean | string | null | undefined;
  static ngAcceptInputType_required: boolean | string | null | undefined;
  static ngAcceptInputType_value: any;
}

