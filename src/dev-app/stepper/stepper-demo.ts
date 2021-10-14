/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, OnInit} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'stepper-demo',
  templateUrl: 'stepper-demo.html',
})
export class StepperDemo implements OnInit {
  formGroup: FormGroup;
  isNonLinear = false;
  isNonEditable = false;
  disableRipple = false;
  showLabelBottom = false;
  isVertical = false;

  nameFormGroup: FormGroup;
  emailFormGroup: FormGroup;

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

  ngOnInit() {
    this.formGroup = this._formBuilder.group({
      formArray: this._formBuilder.array([
        this._formBuilder.group({
          firstNameFormCtrl: ['', Validators.required],
          lastNameFormCtrl: ['', Validators.required],
        }),
        this._formBuilder.group({
          emailFormCtrl: ['', Validators.email],
        }),
      ]),
    });

    this.nameFormGroup = this._formBuilder.group({
      firstNameCtrl: ['', Validators.required],
      lastNameCtrl: ['', Validators.required],
    });

    this.emailFormGroup = this._formBuilder.group({
      emailCtrl: ['', Validators.email],
    });
  }
}
