/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewChild} from '@angular/core';
import {Element, ELEMENT_DATA} from '../element-data';
import {CdkTable} from '@angular/cdk/table';
import {MatRadioChange, MatTable, MatTableDataSource} from '@angular/material';
import {Observable} from 'rxjs';
import {DataSource} from '@angular/cdk/collections';

@Component({
  moduleId: module.id,
  templateUrl: 'data-input-table.html',
  styleUrls: ['data-input-table.css'],
})
export class DataInputTableDemo {
  columnsToDisplay = ['name', 'weight', 'symbol', 'position'];

  inputType: 'source' | 'stream' | 'array' | null = 'array';
  data = ELEMENT_DATA.slice();
  tableDataSource = new MatTableDataSource(this.data);

  dataSourceInput: DataSource<Element> | Observable<Element[]> | Element[] | null = this.data;

  @ViewChild(CdkTable) cdkTable: CdkTable<Element>;
  @ViewChild(MatTable) matTable: MatTable<Element>;

  changeInput(e: MatRadioChange) {
    this.inputType = e.value;
    switch (this.inputType) {
      case 'array': this.dataSourceInput = this.data; break;
      case 'stream': this.dataSourceInput = this.tableDataSource.connect(); break;
      case 'source': this.dataSourceInput = this.tableDataSource; break;
    }
  }

  addRow() {
    this.data.push({name: 'new', weight: 0, symbol: 'New', position: 0});
    this.tableDataSource.data = this.data;
  }

  removeRow() {
    this.data.pop();
    this.tableDataSource.data = this.data;
  }

  reassignDataClone() {
    this.data = this.data.slice();

    if (this.dataSourceInput instanceof Array) {
      this.dataSourceInput = this.data;
    }
    this.tableDataSource.data = this.data;
  }

  renderRows() {
    this.cdkTable.renderRows();
    this.matTable.renderRows();
  }

  removeDataSource() {
    this.dataSourceInput = null;
    this.inputType = null;
  }
}
