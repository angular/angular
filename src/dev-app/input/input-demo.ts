/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {UntypedFormControl, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {FloatLabelType} from '@angular/material/form-field';

let max = 5;

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'input-demo',
  templateUrl: 'input-demo.html',
  styleUrls: ['input-demo.css'],
})
export class InputDemo {
  floatingLabel: FloatLabelType = 'auto';
  color: boolean;
  requiredField: boolean;
  hideRequiredMarker: boolean;
  ctrlDisabled = false;
  textareaNgModelValue: string;
  textareaAutosizeEnabled = false;
  placeholderTestControl = new UntypedFormControl('', Validators.required);

  name: string;
  errorMessageExample1: string;
  errorMessageExample2: string;
  errorMessageExample3: string;
  errorMessageExample4: string;
  dividerColorExample1: string;
  dividerColorExample2: string;
  dividerColorExample3: string;
  items: {value: number}[] = [{value: 10}, {value: 20}, {value: 30}, {value: 40}, {value: 50}];
  rows = 8;
  formControl = new UntypedFormControl('hello', Validators.required);
  emailFormControl = new UntypedFormControl('', [
    Validators.required,
    Validators.pattern(EMAIL_REGEX),
  ]);
  delayedFormControl = new UntypedFormControl('');
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
      this.items.push({value: ++max});
    }
  }

  customErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: UntypedFormControl | null) => {
      if (control) {
        const hasInteraction = control.dirty || control.touched;
        const isInvalid = control.invalid;

        return !!(hasInteraction && isInvalid);
      }

      return false;
    },
  };

  togglePlaceholderTestValue() {
    this.placeholderTestControl.setValue(this.placeholderTestControl.value === '' ? 'Value' : '');
  }

  togglePlaceholderTestTouched() {
    this.placeholderTestControl.touched
      ? this.placeholderTestControl.markAsUntouched()
      : this.placeholderTestControl.markAsTouched();
  }

  parseNumber(value: string): number {
    return Number(value);
  }
}
