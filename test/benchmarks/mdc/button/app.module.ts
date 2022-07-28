/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';

/** component: mdc-raised-button */

@Component({
  selector: 'app-root',
  template: `
    <button id="show" (click)="show()">Show</button>
    <button id="hide" (click)="hide()">Hide</button>
    <button *ngIf="isVisible" mat-raised-button>Basic</button>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material/core/theming/prebuilt/indigo-pink.css'],
})
export class ButtonBenchmarkApp {
  isChecked = false;
  isVisible = false;

  show() {
    this.isVisible = true;
  }
  hide() {
    this.isVisible = false;
  }
}

@NgModule({
  declarations: [ButtonBenchmarkApp],
  imports: [BrowserModule, MatButtonModule],
  bootstrap: [ButtonBenchmarkApp],
})
export class AppModule {}
