/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewChild} from '@angular/core';
import {MatSort, MatTableDataSource} from '@angular/material';
import {Element, ELEMENT_DATA} from '../element-data';

@Component({
  moduleId: module.id,
  templateUrl: 'custom-table.html',
  styleUrls: ['custom-table.css'],
})
export class CustomTableDemo {
  columnsToDisplay = ['name', 'weight', 'symbol', 'position'];
  simpleTableDataSource = new MatTableDataSource<Element>(ELEMENT_DATA);
  wrapperTableDataSource = new MatTableDataSource<Element>(ELEMENT_DATA);
  getWeight = (data: Element) => '~' + data.weight;

  @ViewChild('simpleTableSort') simpleTableSort: MatSort;
  @ViewChild('wrapperTableSort') wrapperTableSort: MatSort;

  ngAfterViewInit() {
    this.simpleTableDataSource.sort = this.simpleTableSort;
    this.wrapperTableDataSource.sort = this.wrapperTableSort;
  }
}
