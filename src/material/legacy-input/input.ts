/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, inject, InjectFlags} from '@angular/core';
import {MatInput as BaseMatInput} from '@angular/material/input';
import {
  MatLegacyFormFieldControl,
  MatLegacyFormField,
  MAT_FORM_FIELD,
} from '@angular/material/legacy-form-field';

/** Directive that allows a native input to work inside a `MatFormField`. */
@Directive({
  selector: `input[matInput], textarea[matInput], select[matNativeControl],
      input[matNativeControl], textarea[matNativeControl]`,
  exportAs: 'matInput',
  host: {
    /**
     * @breaking-change 8.0.0 remove .mat-form-field-autofill-control in favor of AutofillMonitor.
     */
    'class': 'mat-input-element mat-form-field-autofill-control',
    '[class.mat-input-server]': '_isServer',
    // These classes are inherited from the base input class and need to be cleared.
    '[class.mat-mdc-input-element]': 'false',
    '[class.mat-mdc-form-field-textarea-control]': 'false',
    '[class.mat-mdc-form-field-input-control]': 'false',
    '[class.mdc-text-field__input]': 'false',
    '[class.mat-mdc-native-select-inline]': 'false',
    // At the time of writing, we have a lot of customer tests that look up the input based on its
    // placeholder. Since we sometimes omit the placeholder attribute from the DOM to prevent screen
    // readers from reading it twice, we have to keep it somewhere in the DOM for the lookup.
    '[attr.data-placeholder]': 'placeholder',
    '[class.mat-native-select-inline]': '_isInlineSelect()',
  },
  providers: [{provide: MatLegacyFormFieldControl, useExisting: MatLegacyInput}],
})
export class MatLegacyInput extends BaseMatInput {
  private _legacyFormField = inject<MatLegacyFormField>(MAT_FORM_FIELD, InjectFlags.Optional);

  protected override _getPlaceholder() {
    // If we're hiding the native placeholder, it should also be cleared from the DOM, otherwise
    // screen readers will read it out twice: once from the label and once from the attribute.
    // TODO: can be removed once we get rid of the `legacy` style for the form field, because it's
    // the only one that supports promoting the placeholder to a label.
    const formField = this._legacyFormField;
    return formField && formField.appearance === 'legacy' && !formField._hasLabel?.()
      ? null
      : this.placeholder;
  }
}
