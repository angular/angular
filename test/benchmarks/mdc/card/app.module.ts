/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatCardModule} from '@angular/material-experimental/mdc-card';

/** component: mdc-card */

@Component({
  selector: 'app-root',
  template: `
    <button id="show" (click)="show()">Show</button>
    <button id="hide" (click)="hide()">Hide</button>

    <mat-card *ngIf="isVisible">Simple card</mat-card>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material-experimental/mdc-core/theming/prebuilt/indigo-pink.css'],
})
export class CardBenchmarkApp {
  isVisible = false;

  show() {
    this.isVisible = true;
  }
  hide() {
    this.isVisible = false;
  }
}

@NgModule({
  declarations: [CardBenchmarkApp],
  imports: [BrowserModule, MatCardModule],
  bootstrap: [CardBenchmarkApp],
})
export class AppModule {}
