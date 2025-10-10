/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {JsonPipe} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'example-app',
  imports: [JsonPipe, FormsModule],
  template: `
    <form #f="ngForm">
      <input type="radio" value="beef" name="food" [(ngModel)]="myFood" /> Beef
      <input type="radio" value="lamb" name="food" [(ngModel)]="myFood" /> Lamb
      <input type="radio" value="fish" name="food" [(ngModel)]="myFood" /> Fish
    </form>

    <p>Form value: {{ f.value | json }}</p>
    <!-- {food: 'lamb' } -->
    <p>myFood value: {{ myFood }}</p>
    <!-- 'lamb' -->
  `,
})
export class RadioButtonComp {
  myFood = 'lamb';
}
