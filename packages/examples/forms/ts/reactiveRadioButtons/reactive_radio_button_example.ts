/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// #docregion Reactive
import {Component} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'example-app',
  template: `
    <form [formGroup]="form">
      <input type="radio" formControlName="food" value="beef" > Beef
      <input type="radio" formControlName="food" name="food" value="lamb"> Lamb
      <input type="radio" formControlName="food" value="fish"> Fish
      <div formGroupName="group">
        <input type="radio" formControlName="food" value="beef" > Beef
        <input type="radio" formControlName="food" name="group.food" value="lamb"> Lamb
        <input type="radio" formControlName="food" value="fish"> Fish
      </div>
    </form>
    
    <p>Form value: {{ form.value | json }}</p>  <!-- {food: 'lamb' } -->
  `,
})
export class ReactiveRadioButtonComp {
  form = new FormGroup({
    food: new FormControl('lamb'),
    group: new FormGroup({
      food: new FormControl('lamb')
    })
  });
}
// #enddocregion
