/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewChild} from '@angular/core';
import {MatTable} from '@angular/material';

const DATA_LENGTH = 10;

export interface DemoDataObject {
  value: boolean;
}

@Component({
  selector: 'when-rows-demo',
  moduleId: module.id,
  templateUrl: 'when-rows.html',
})
export class WhenRowsDemo {
  columnsToDisplay = ['data', 'index', 'dataIndex', 'renderIndex'];
  data: DemoDataObject[] =
      (new Array(DATA_LENGTH) as DemoDataObject[]).fill({value: false}, 0, DATA_LENGTH);
  randomNumber = 0;
  multiTemplateDataRows = false;
  useTrackByValue = false;

  whenFn = (_i: number, d: DemoDataObject) => d.value;
  trackByValue = (_i: number, d: DemoDataObject) => d.value;

  @ViewChild(MatTable) table: MatTable<any>;

  constructor() {
    this.changeRandomNumber();
  }

  changeRandomNumber() {
    this.randomNumber = Math.floor(Math.random() * DATA_LENGTH);
    this.data = this.data.map((_d: DemoDataObject, i: number) => ({value: i < this.randomNumber}));
    if (this.table) {
      this.table.renderRows();
    }
  }

  shuffleArray() {
    let dataToShuffle = this.data.slice();
    let currentIndex = dataToShuffle.length;
    while (0 !== currentIndex) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // Swap
      let temp = dataToShuffle[currentIndex];
      dataToShuffle[currentIndex] = dataToShuffle[randomIndex];
      dataToShuffle[randomIndex] = temp;
    }

    this.data = dataToShuffle;
  }
}
