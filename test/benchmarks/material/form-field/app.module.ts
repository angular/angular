/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatLegacyInputModule} from '@angular/material/legacy-input';

/** component: mat-form-field */

@Component({
  selector: 'app-root',
  template: `
    <button id="show-input" (click)="showInput()">Show Input</button>
    <button id="show-select" (click)="showSelect()">Show Select</button>
    <button id="show-textarea" (click)="showTextarea()">Show Textarea</button>

    <button id="hide" (click)="hide()">Hide</button>

    <mat-form-field appearance="fill" *ngIf="isInputVisible">
      <mat-label>Input</mat-label>
      <input matInput>
    </mat-form-field>

    <mat-form-field appearance="fill" *ngIf="isSelectVisible">
      <mat-label>Select</mat-label>
      <mat-select>
        <mat-option value="option">Option</mat-option>
      </mat-select>
    </mat-form-field>

    <mat-form-field appearance="fill" *ngIf="isTextareaVisible">
      <mat-label>Textarea</mat-label>
      <textarea matInput></textarea>
    </mat-form-field>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material/core/theming/prebuilt/indigo-pink.css'],
})
export class FormFieldBenchmarkApp {
  isInputVisible = false;
  isSelectVisible = false;
  isTextareaVisible = false;

  showInput() {
    this.isInputVisible = true;
  }
  showSelect() {
    this.isSelectVisible = true;
  }
  showTextarea() {
    this.isTextareaVisible = true;
  }

  hide() {
    this.isInputVisible = false;
    this.isSelectVisible = false;
    this.isTextareaVisible = false;
  }
}

@NgModule({
  declarations: [FormFieldBenchmarkApp],
  imports: [BrowserModule, MatLegacyFormFieldModule, MatSelectModule, MatLegacyInputModule],
  bootstrap: [FormFieldBenchmarkApp],
})
export class AppModule {}
