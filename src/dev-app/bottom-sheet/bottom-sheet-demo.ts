/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, TemplateRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  MatBottomSheet,
  MatBottomSheetConfig,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import {MatButtonModule} from '@angular/material/button';
import {MatLegacyCardModule} from '@angular/material/legacy-card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';

const defaultConfig = new MatBottomSheetConfig();

@Component({
  selector: 'bottom-sheet-demo',
  styleUrls: ['bottom-sheet-demo.css'],
  templateUrl: 'bottom-sheet-demo.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatLegacyCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
  ],
})
export class BottomSheetDemo {
  config: MatBottomSheetConfig = {
    hasBackdrop: defaultConfig.hasBackdrop,
    disableClose: defaultConfig.disableClose,
    backdropClass: defaultConfig.backdropClass,
    direction: 'ltr',
    ariaLabel: 'Example bottom sheet',
  };

  @ViewChild(TemplateRef) template: TemplateRef<any>;

  constructor(private _bottomSheet: MatBottomSheet) {}

  openComponent() {
    this._bottomSheet.open(ExampleBottomSheet, this.config);
  }

  openTemplate() {
    this._bottomSheet.open(this.template, this.config);
  }
}

@Component({
  template: `
    <mat-nav-list>
      <a href="#" mat-list-item (click)="handleClick($event)" *ngFor="let action of [1, 2, 3]">
        <span mat-line>Action {{ action }}</span>
        <span mat-line>Description</span>
      </a>
    </mat-nav-list>
  `,
  standalone: true,
  imports: [CommonModule, MatListModule],
})
export class ExampleBottomSheet {
  constructor(private _bottomSheet: MatBottomSheetRef) {}

  handleClick(event: MouseEvent) {
    event.preventDefault();
    this._bottomSheet.dismiss();
  }
}
