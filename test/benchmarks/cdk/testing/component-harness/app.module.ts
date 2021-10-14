/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatButtonModule} from '@angular/material/button';
import {NUM_BUTTONS} from './constants';

/** component: component-harness-test */

@Component({
  selector: 'app-root',
  template: `
    <button *ngFor="let val of vals" mat-button> {{ val }} </button>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../../../../src/material/core/theming/prebuilt/indigo-pink.css'],
})
export class ButtonHarnessTest {
  vals = Array.from({length: NUM_BUTTONS}, (_, i) => i);
}

@NgModule({
  declarations: [ButtonHarnessTest],
  imports: [BrowserModule, MatButtonModule],
  bootstrap: [ButtonHarnessTest],
})
export class AppModule {}
