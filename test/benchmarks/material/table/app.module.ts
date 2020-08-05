/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {BrowserModule} from '@angular/platform-browser';
import {BasicTable} from './basic-table';
import {
  fiveCols, tenCols, twentyCols,
  tenRows, oneHundredRows, oneThousandRows,
} from './fake-table-data';

/** component: mat-table */

// tslint:disable:max-line-length
@Component({
  selector: 'app-root',
  template: `
    <button id="hide" (click)="hide()">Hide</button>
    <button id="show-10-rows-5-cols" (click)="showTenRowsFiveCols()">Show 10 Rows 5 Cols</button>
    <button id="show-100-rows-5-cols" (click)="showOneHundredRowsFiveCols()">Show 100 Rows 5 Cols</button>
    <button id="show-1000-rows-5-cols" (click)="showOneThousandRowsFiveCols()">Show 1000 Rows 5 Cols</button>
    <button id="show-10-rows-10-cols" (click)="showTenRowsTenCols()">Show 10 Rows 10 Cols</button>
    <button id="show-10-rows-20-cols" (click)="showTenRowsTwentyCols()">Show 10 Rows 20 Cols</button>

    <basic-table [rows]="tenRows" [cols]="fiveCols" *ngIf="isTenRowsFiveColsVisible"></basic-table>
    <basic-table [rows]="oneHundredRows" [cols]="fiveCols" *ngIf="isOneHundredRowsFiveColsVisible"></basic-table>
    <basic-table [rows]="oneThousandRows" [cols]="fiveCols" *ngIf="isOneThousandRowsFiveColsVisible"></basic-table>

    <basic-table [rows]="tenRows" [cols]="tenCols" *ngIf="isTenRowsTenColsVisible"></basic-table>
    <basic-table [rows]="tenRows" [cols]="twentyCols" *ngIf="isTenRowsTwentyColsVisible"></basic-table>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material/core/theming/prebuilt/indigo-pink.css'],
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

  showTenRowsFiveCols() { this.isTenRowsFiveColsVisible = true; }
  showOneHundredRowsFiveCols() { this.isOneHundredRowsFiveColsVisible = true; }
  showOneThousandRowsFiveCols() { this.isOneThousandRowsFiveColsVisible = true; }
  showTenRowsTenCols() { this.isTenRowsTenColsVisible = true; }
  showTenRowsTwentyCols() { this.isTenRowsTwentyColsVisible = true; }
}


@NgModule({
  declarations: [BasicTable, TableBenchmarkApp],
  imports: [
    BrowserModule,
    MatTableModule,
  ],
  bootstrap: [TableBenchmarkApp],
})
export class AppModule {}
