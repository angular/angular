/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {A11yModule} from '@angular/cdk/a11y';
import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatCheckboxModule} from '@angular/material/checkbox';

/**
 * @title Checkbox benchmark component.
 */
@Component({
  selector: 'app-root',
  template: `
    <button id="show" (click)="show()">Show</button>
    <button id="hide" (click)="hide()">Hide</button>
    <button id="indeterminate" (click)="indeterminate()">Indeterminate</button>

    <ng-container *ngIf="isVisible">
      <mat-checkbox
        [checked]="isChecked"
        [indeterminate]="isIndeterminate"
        (change)="toggleIsChecked()">
      Check me!</mat-checkbox>
    </ng-container>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material/core/theming/prebuilt/indigo-pink.css'],
})
export class CheckboxBenchmarkApp {
  isChecked = false;
  isVisible = false;
  isIndeterminate = false;

  show() { this.isVisible = true; }
  hide() { this.isVisible = false; }
  indeterminate() { this.isIndeterminate = true; }
  toggleIsChecked() { this.isChecked = !this.isChecked; }
}


@NgModule({
  declarations: [CheckboxBenchmarkApp],
  imports: [
    A11yModule,
    BrowserModule,
    MatCheckboxModule,
  ],
  providers: [],
  bootstrap: [CheckboxBenchmarkApp]
})
export class AppModule {}
