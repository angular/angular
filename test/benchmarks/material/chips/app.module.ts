/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatChipsModule} from '@angular/material/chips';

/** component: mat-chip */

@Component({
  selector: 'app-root',
  template: `
    <button id="show-single" (click)="showSingle()">Show Single</button>
    <button id="hide-single" (click)="hideSingle()">Hide Single</button>

    <button id="show-multiple" (click)="showMultiple()">Show Multiple</button>
    <button id="hide-multiple" (click)="hideMultiple()">Hide Multiple</button>

    <mat-chip *ngIf="isSingleVisible">One</mat-chip>

    <mat-chip-list *ngIf="isMultipleVisible">
      <mat-chip>One</mat-chip>
      <mat-chip>Two</mat-chip>
      <mat-chip>Three</mat-chip>
      <mat-chip>Four</mat-chip>
      <mat-chip>Five</mat-chip>
      <mat-chip>Six</mat-chip>
    </mat-chip-list>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material/core/theming/prebuilt/indigo-pink.css'],
})
export class ChipsBenchmarkApp {
  isSingleVisible = false;
  isMultipleVisible = false;

  showSingle() {
    this.isSingleVisible = true;
  }
  hideSingle() {
    this.isSingleVisible = false;
  }

  showMultiple() {
    this.isMultipleVisible = true;
  }
  hideMultiple() {
    this.isMultipleVisible = false;
  }
}

@NgModule({
  declarations: [ChipsBenchmarkApp],
  imports: [BrowserModule, MatChipsModule],
  bootstrap: [ChipsBenchmarkApp],
})
export class AppModule {}
