/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// #docregion disabled-control
import {Component, Inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
// #enddocregion disabled-control

@Component({
  selector: 'example-app',
  template: `
    <form [formGroup]="form">
      <div formGroupName="name">
        <input formControlName="first" placeholder="First">
        <input formControlName="last" placeholder="Last">
      </div>
      <input formControlName="email" placeholder="Email">
      <button>Submit</button>
    </form>

    <p>Value: {{ form.value | json }}</p>
    <p>Validation status: {{ form.status }}</p>
  `
})
export class FormBuilderComp {
  form: FormGroup;

  constructor(@Inject(FormBuilder) fb: FormBuilder) {
    this.form = fb.group(
        {
          name: fb.group({
            first: ['Nancy', Validators.minLength(2)],
            last: 'Drew',
          }),
          email: '',
        },
        {updateOn: 'change'});
  }
}

// #docregion disabled-control
@Component({
  selector: 'app-disabled-form-control',
  template: `
    <input [formControl]="control" placeholder="First">
  `
})
export class DisabledFormControlComponent {
  control: FormControl;

  constructor(private fb: FormBuilder) {
    this.control = fb.control({value: 'my val', disabled: true});
  }
}
// #enddocregion disabled-control
