/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {ErrorStateMatcher, FloatLabelType} from '@angular/material/core';
import {MatFormFieldAppearance} from '@angular/material-experimental/mdc-form-field';


let max = 5;

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'mdc-input-demo',
  templateUrl: 'mdc-input-demo.html',
  styleUrls: ['mdc-input-demo.css'],
})
export class MdcInputDemo {
  floatingLabel: FloatLabelType = 'auto';
  color: boolean;
  requiredField: boolean;
  disableTextarea: boolean;
  hideRequiredMarker: boolean;
  ctrlDisabled = false;
  textareaNgModelValue: string;
  textareaAutosizeEnabled = false;
  appearance: MatFormFieldAppearance = 'fill';
  prefixSuffixAppearance: MatFormFieldAppearance = 'fill';
  placeholderTestControl = new FormControl('', Validators.required);
  options: string[] = ['One', 'Two', 'Three'];

  name: string;
  errorMessageExample1: string;
  errorMessageExample2: string;
  errorMessageExample3: string;
  errorMessageExample4: string;
  dividerColorExample1: string;
  dividerColorExample2: string;
  dividerColorExample3: string;
  items: {value: number}[] = [
    {value: 10},
    {value: 20},
    {value: 30},
    {value: 40},
    {value: 50},
  ];
  rows = 8;
  formControl = new FormControl('hello', Validators.required);
  emailFormControl = new FormControl('', [Validators.required, Validators.pattern(EMAIL_REGEX)]);
  delayedFormControl = new FormControl('');
  model = 'hello';
  isAutofilled = false;
  customAutofillStyle = true;

  legacyAppearance: string;
  standardAppearance: string;
  fillAppearance: string;
  outlineAppearance: string;

  constructor() {
    setTimeout(() => this.delayedFormControl.setValue('hello'), 100);
  }

  addABunch(n: number) {
    for (let x = 0; x < n; x++) {
      this.items.push({ value: ++max });
    }
  }

  customErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) => {
      if (control) {
        const hasInteraction = control.dirty || control.touched;
        const isInvalid = control.invalid;

        return !!(hasInteraction && isInvalid);
      }

      return false;
    }
  };

  togglePlaceholderTestValue() {
    this.placeholderTestControl.setValue(this.placeholderTestControl.value === '' ? 'Value' : '');
  }

  togglePlaceholderTestTouched() {
    this.placeholderTestControl.touched ?
      this.placeholderTestControl.markAsUntouched() :
      this.placeholderTestControl.markAsTouched();
  }

  parseNumber(value: string): number {
    return Number(value);
  }
}
