/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// #docregion disabled-control
import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
// #enddocregion disabled-control

@Component({
  selector: 'example-app',
  template: `
    <form [formGroup]="form">
      <div formGroupName="name">
        <input formControlName="first" placeholder="First" />
        <input formControlName="last" placeholder="Last" />
      </div>
      <input formControlName="email" placeholder="Email" />
      <button>Submit</button>
    </form>

    <p>Value: {{ form.value | json }}</p>
    <p>Validation status: {{ form.status }}</p>
  `,
  standalone: false,
})
export class FormBuilderComp {
  form: FormGroup;

  constructor() {
    const formBuilder = inject(FormBuilder);
    this.form = formBuilder.group(
      {
        name: formBuilder.group({
          first: ['Nancy', Validators.minLength(2)],
          last: 'Drew',
        }),
        email: '',
      },
      {updateOn: 'change'},
    );
  }
}

// #docregion disabled-control
@Component({
  selector: 'app-disabled-form-control',
  template: ` <input [formControl]="control" placeholder="First" /> `,
  standalone: false,
})
export class DisabledFormControlComponent {
  control: FormControl;

  constructor(private formBuilder: FormBuilder) {
    this.control = formBuilder.control({value: 'my val', disabled: true});
  }
}
// #enddocregion disabled-control
