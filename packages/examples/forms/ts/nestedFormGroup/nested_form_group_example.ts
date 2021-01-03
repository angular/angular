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
      <p *ngIf="name.invalid">Name is invalid.</p>

      <div formGroupName="name">
        <input formControlName="first" placeholder="First name">
        <input formControlName="last" placeholder="Last name">
      </div>
      <input formControlName="email" placeholder="Email">
      <button type="submit">Submit</button>
    </form>

    <button (click)="setPreset()">Set preset</button>
`,
})
export class NestedFormGroupComp {
  form = new FormGroup({
    name: new FormGroup({
      first: new FormControl('Nancy', Validators.minLength(2)),
      last: new FormControl('Drew', Validators.required)
    }),
    email: new FormControl()
  });

  get first(): any {
    return this.form.get('name.first');
  }

  get name(): any {
    return this.form.get('name');
  }

  onSubmit() {
    console.log(this.first.value);  // 'Nancy'
    console.log(this.name.value);   // {first: 'Nancy', last: 'Drew'}
    console.log(this.form.value);   // {name: {first: 'Nancy', last: 'Drew'}, email: ''}
    console.log(this.form.status);  // VALID
  }

  setPreset() {
    this.name.setValue({first: 'Bess', last: 'Marvin'});
  }
}
// #enddocregion
