/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'stepper-demo',
  templateUrl: 'stepper-demo.html',
})
export class StepperDemo {
  isNonLinear = false;
  isNonEditable = false;
  disableRipple = false;
  showLabelBottom = false;
  isVertical = false;

  nameFormGroup = this._formBuilder.group({
    firstNameCtrl: ['', Validators.required],
    lastNameCtrl: ['', Validators.required],
  });

  emailFormGroup = this._formBuilder.group({
    emailCtrl: ['', Validators.email],
  });

  formGroup = this._formBuilder.group({
    formArray: this._formBuilder.array<
      | {firstNameFormCtrl?: string | null; lastNameFormCtrl?: string | null}
      | {emailFormCtrl?: string | null}
    >([
      this._formBuilder.group({
        firstNameFormCtrl: this._formBuilder.control('', [Validators.required]),
        lastNameFormCtrl: this._formBuilder.control('', [Validators.required]),
      }),
      this._formBuilder.group({
        emailFormCtrl: this._formBuilder.control('', [Validators.email]),
      }),
    ]),
  });

  steps = [
    {label: 'Confirm your name', content: 'Last name, First name.'},
    {label: 'Confirm your contact information', content: '123-456-7890'},
    {label: 'Confirm your address', content: '1600 Amphitheater Pkwy MTV'},
    {label: 'You are now done', content: 'Finished!'},
  ];

  availableThemes: {value: ThemePalette; name: string}[] = [
    {value: 'primary', name: 'Primary'},
    {value: 'accent', name: 'Accent'},
    {value: 'warn', name: 'Warn'},
  ];

  theme = this.availableThemes[0].value;

  /** Returns a FormArray with the name 'formArray'. */
  get formArray(): AbstractControl | null {
    return this.formGroup.get('formArray');
  }

  constructor(private _formBuilder: FormBuilder) {}
}
