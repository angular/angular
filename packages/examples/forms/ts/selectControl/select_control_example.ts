/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// #docregion Component
import {Component} from '@angular/core';

@Component({
  selector: 'example-app',
  template: `
    <form #f="ngForm">
      <select name="state" ngModel>
        <option value="" disabled>Choose a state</option>
        <option *ngFor="let state of states" [ngValue]="state">
          {{ state.abbrev }}
        </option>
      </select>
    </form>

     <p>Form value: {{ f.value | json }}</p>
     <!-- example value: {state: {name: 'New York', abbrev: 'NY'} } -->
  `,
})
export class SelectControlComp {
  states = [
    {name: 'Arizona', abbrev: 'AZ'},
    {name: 'California', abbrev: 'CA'},
    {name: 'Colorado', abbrev: 'CO'},
    {name: 'New York', abbrev: 'NY'},
    {name: 'Pennsylvania', abbrev: 'PA'},
  ];
}
// #enddocregion
