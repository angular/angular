/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatChipsModule} from '@angular/material-experimental/mdc-chips';

/** component: mdc-chip */

@Component({
  selector: 'app-root',
  templateUrl: './chips.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material-experimental/mdc-core/theming/prebuilt/indigo-pink.css'],
})
export class ChipsBenchmarkApp {
  isSingleChipVisible = false;
  isSetVisible = false;
  isGridVisible = false;
  isListboxVisible = false;

  showSingleChip() {
    this.isSingleChipVisible = true;
  }
  showSet() {
    this.isSetVisible = true;
  }
  showGrid() {
    this.isGridVisible = true;
  }
  showListbox() {
    this.isListboxVisible = true;
  }

  hide() {
    this.isSingleChipVisible = false;
    this.isSetVisible = false;
    this.isGridVisible = false;
    this.isListboxVisible = false;
  }
}

@NgModule({
  declarations: [ChipsBenchmarkApp],
  imports: [BrowserModule, MatChipsModule],
  bootstrap: [ChipsBenchmarkApp],
})
export class AppModule {}
