/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatTableModule} from '@angular/material-experimental/mdc-table';
import {BrowserModule} from '@angular/platform-browser';
import {BasicTable} from './basic-table';
import {
  fiveCols,
  tenCols,
  twentyCols,
  tenRows,
  oneHundredRows,
  oneThousandRows,
} from './fake-table-data';

/** component: mdc-table */

@Component({
  selector: 'app-root',
  templateUrl: './app.module.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material-experimental/mdc-core/theming/prebuilt/indigo-pink.css'],
})
export class TableBenchmarkApp {
  fiveCols = fiveCols;
  tenCols = tenCols;
  twentyCols = twentyCols;

  tenRows = tenRows;
  oneHundredRows = oneHundredRows;
  oneThousandRows = oneThousandRows;

  isTenRowsFiveColsVisible = false;
  isOneHundredRowsFiveColsVisible = false;
  isOneThousandRowsFiveColsVisible = false;
  isTenRowsTenColsVisible = false;
  isTenRowsTwentyColsVisible = false;

  hide() {
    this.isTenRowsFiveColsVisible = false;
    this.isOneHundredRowsFiveColsVisible = false;
    this.isOneThousandRowsFiveColsVisible = false;
    this.isTenRowsTenColsVisible = false;
    this.isTenRowsTwentyColsVisible = false;
  }

  showTenRowsFiveCols() {
    this.isTenRowsFiveColsVisible = true;
  }
  showOneHundredRowsFiveCols() {
    this.isOneHundredRowsFiveColsVisible = true;
  }
  showOneThousandRowsFiveCols() {
    this.isOneThousandRowsFiveColsVisible = true;
  }
  showTenRowsTenCols() {
    this.isTenRowsTenColsVisible = true;
  }
  showTenRowsTwentyCols() {
    this.isTenRowsTwentyColsVisible = true;
  }
}

@NgModule({
  declarations: [BasicTable, TableBenchmarkApp],
  imports: [BrowserModule, MatTableModule],
  bootstrap: [TableBenchmarkApp],
})
export class AppModule {}
