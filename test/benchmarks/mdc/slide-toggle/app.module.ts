/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatSlideToggleModule} from '@angular/material-experimental/mdc-slide-toggle';

/** component: mdc-slide-toggle */

@Component({
  selector: 'app-root',
  template: `
    <button id="show" (click)="show()">Show</button>
    <button id="hide" (click)="hide()">Hide</button>

    <ng-container *ngIf="isVisible">
      <mat-slide-toggle>Slide me!</mat-slide-toggle>
    </ng-container>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material-experimental/mdc-core/theming/prebuilt/indigo-pink.css'],
})
export class SlideToggleBenchmarkApp {
  isVisible = false;
  show() {
    this.isVisible = true;
  }
  hide() {
    this.isVisible = false;
  }
}

@NgModule({
  declarations: [SlideToggleBenchmarkApp],
  imports: [BrowserModule, MatSlideToggleModule],
  bootstrap: [SlideToggleBenchmarkApp],
})
export class AppModule {}
