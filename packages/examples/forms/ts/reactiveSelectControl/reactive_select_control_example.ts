/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// #docregion Component
import {JsonPipe} from '@angular/common';
import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'example-app',
  imports: [ReactiveFormsModule, JsonPipe],
  template: `
    <form [formGroup]="form">
      <select formControlName="state">
        @for (state of states; track $index) {
          <option [ngValue]="state">{{ state.abbrev }}</option>
        }
      </select>
    </form>

    <p>Form value: {{ form.value | json }}</p>
    <!-- {state: {name: 'New York', abbrev: 'NY'} } -->
  `,
})
export class ReactiveSelectComp {
  states = [
    {name: 'Arizona', abbrev: 'AZ'},
    {name: 'California', abbrev: 'CA'},
    {name: 'Colorado', abbrev: 'CO'},
    {name: 'New York', abbrev: 'NY'},
    {name: 'Pennsylvania', abbrev: 'PA'},
  ];

  form = new FormGroup({
    state: new FormControl(this.states[3]),
  });
}
// #enddocregion
