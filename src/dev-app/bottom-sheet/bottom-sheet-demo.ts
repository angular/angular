/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, TemplateRef, ViewChild} from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetConfig,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';


const defaultConfig = new MatBottomSheetConfig();

@Component({
  moduleId: module.id,
  selector: 'bottom-sheet-demo',
  styleUrls: ['bottom-sheet-demo.css'],
  templateUrl: 'bottom-sheet-demo.html',
})
export class BottomSheetDemo {
  config: MatBottomSheetConfig = {
    hasBackdrop: defaultConfig.hasBackdrop,
    disableClose: defaultConfig.disableClose,
    backdropClass: defaultConfig.backdropClass,
    direction: 'ltr'
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
  `
})
export class ExampleBottomSheet {
  constructor(private sheet: MatBottomSheetRef) {}

  handleClick(event: MouseEvent) {
    event.preventDefault();
    this.sheet.dismiss();
  }
}
