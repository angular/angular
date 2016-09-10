/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

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
  
  `
})
export class FormControlNameComp {
  form = new FormGroup(
      {first: new FormControl('Nancy', Validators.minLength(2)), last: new FormControl('Drew')});

  get first() { return this.form.get('first'); }

  onSubmit(): void {
    console.log(this.form.value);  // {first: 'Nancy', last: 'Drew'}
  }
}


// #enddocregion
