/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// #docregion Component
import {Component} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'example-app',
  template: `
     <input [formControl]="control">

     <p>Value: {{ control.value }}</p>
     <p>Validation status: {{ control.status }}</p>

     <button (click)="setValue()">Set value</button>
  `,
})
export class SimpleFormControl {
  control: FormControl = new FormControl('value', Validators.minLength(2));

  setValue() {
    this.control.setValue('new value');
  }
}
// #enddocregion
