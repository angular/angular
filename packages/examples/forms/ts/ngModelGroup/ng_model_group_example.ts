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
import {NgForm} from '@angular/forms';

@Component({
  selector: 'example-app',
  template: `
    <form #f="ngForm" (ngSubmit)="onSubmit(f)">
      <p *ngIf="nameCtrl.invalid">Name is invalid.</p>

      <div ngModelGroup="name" #nameCtrl="ngModelGroup">
        <input name="first" [ngModel]="name.first" minlength="2">
        <input name="middle" [ngModel]="name.middle" maxlength="2">
        <input name="last" [ngModel]="name.last" required>
      </div>

      <input name="email" ngModel>
      <button>Submit</button>
    </form>

    <button (click)="setValue()">Set value</button>
  `,
})
export class NgModelGroupComp {
  name = {first: 'Nancy', middle: 'J', last: 'Drew'};

  onSubmit(f: NgForm) {
    console.log(f.value);  // {name: {first: 'Nancy', middle: 'J', last: 'Drew'}, email: ''}
    console.log(f.valid);  // true
  }

  setValue() {
    this.name = {first: 'Bess', middle: 'S', last: 'Marvin'};
  }
}
// #enddocregion
