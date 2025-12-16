/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-forms',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="profileForm">
      <label>
        First Name:
        <input formControlName="firstName" />
      </label>

      <label>
        Last Name:
        <input formControlName="lastName" />
      </label>

      <button type="submit">Submit</button>
    </form>
  `,
})
export class FormsComponent {
  profileForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
  });
}
