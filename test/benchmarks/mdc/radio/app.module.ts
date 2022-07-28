/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatRadioModule} from '@angular/material-experimental/mdc-radio';

/** component: mdc-radio-button */

@Component({
  selector: 'app-root',
  template: `
    <button id="show-two" (click)="showTwo()">Show Two</button>
    <button id="hide-two" (click)="hideTwo()">Hide Two</button>

    <button id="show-ten" (click)="showTen()">Show Ten</button>
    <button id="hide-ten" (click)="hideTen()">Hide Ten</button>

    <mat-radio-group aria-label="Select an option" *ngIf="isTwoVisible">
      <mat-radio-button value="1" id="btn-1">Option 1</mat-radio-button>
      <mat-radio-button value="2" id="btn-2">Option 2</mat-radio-button>
    </mat-radio-group>

    <mat-radio-group aria-label="Select an option" *ngIf="isTenVisible">
      <mat-radio-button value="1">Option 1</mat-radio-button>
      <mat-radio-button value="2">Option 2</mat-radio-button>
      <mat-radio-button value="3">Option 3</mat-radio-button>
      <mat-radio-button value="4">Option 4</mat-radio-button>
      <mat-radio-button value="5">Option 5</mat-radio-button>
      <mat-radio-button value="6">Option 6</mat-radio-button>
      <mat-radio-button value="7">Option 7</mat-radio-button>
      <mat-radio-button value="8">Option 8</mat-radio-button>
      <mat-radio-button value="9">Option 9</mat-radio-button>
      <mat-radio-button value="10">Option 10</mat-radio-button>
    </mat-radio-group>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material/core/theming/prebuilt/indigo-pink.css'],
})
export class RadioBenchmarkApp {
  isTwoVisible = false;
  isTenVisible = false;

  showTwo() {
    this.isTwoVisible = true;
  }
  hideTwo() {
    this.isTwoVisible = false;
  }

  showTen() {
    this.isTenVisible = true;
  }
  hideTen() {
    this.isTenVisible = false;
  }
}

@NgModule({
  declarations: [RadioBenchmarkApp],
  imports: [BrowserModule, MatRadioModule],
  bootstrap: [RadioBenchmarkApp],
})
export class AppModule {}
