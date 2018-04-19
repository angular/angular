/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {Element, ELEMENT_DATA} from '../element-data';

@Component({
  moduleId: module.id,
  templateUrl: 'dynamic-columns.html',
})
export class DynamicColumnsDemo {
  definedColumns = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplay = this.definedColumns.slice();
  dataSource: Element[] = ELEMENT_DATA.slice();

  addColumn() {
    const randomColumn = Math.floor(Math.random() * 4);
    this.columnsToDisplay.push(this.definedColumns[randomColumn]);
  }

  removeColumn() {
    if (!this.columnsToDisplay.length) { return; }
    this.columnsToDisplay.pop();
  }

  shuffle() {
    let currentIndex = this.columnsToDisplay.length;
    while (0 !== currentIndex) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // Swap
      let temp = this.columnsToDisplay[currentIndex];
      this.columnsToDisplay[currentIndex] = this.columnsToDisplay[randomIndex];
      this.columnsToDisplay[randomIndex] = temp;
    }
  }
}
