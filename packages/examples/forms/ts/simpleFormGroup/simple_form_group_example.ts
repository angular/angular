/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* tslint:disable:no-console  */
// #docregion Component
import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'example-app',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div *ngIf="first.invalid"> Name is too short. </div>

      <input formControlName="first" placeholder="First name">
      <input formControlName="last" placeholder="Last name">

      <button type="submit">Submit</button>
   </form>
   <button (click)="setValue()">Set preset value</button>
  `,
})
export class SimpleFormGroup {
  form = new FormGroup({
    first: new FormControl('Nancy', Validators.minLength(2)),
    last: new FormControl('Drew'),
  });

  get first(): any {
    return this.form.get('first');
  }

  onSubmit(): void {
    console.log(this.form.value);  // {first: 'Nancy', last: 'Drew'}
  }

  setValue() {
    this.form.setValue({first: 'Carson', last: 'Drew'});
  }
}


// #enddocregion
