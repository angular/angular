/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

export interface Dog {
  name: string;
  human: string;
}

@Component({
  moduleId: module.id,
  selector: 'grid-list-a11y',
  templateUrl: 'grid-list-a11y.html',
  styleUrls: ['grid-list-a11y.css'],
})
export class GridListAccessibilityDemo {
  dogs: Dog[] = [
    { name: 'Porter', human: 'Kara' },
    { name: 'Mal', human: 'Jeremy' },
    { name: 'Koby', human: 'Igor' },
    { name: 'Razzle', human: 'Ward' },
    { name: 'Molly', human: 'Rob' },
    { name: 'Husi', human: 'Matias' },
  ];

  tiles = [
    {text: 'Cappuccino', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Mocha', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Latte', cols: 1, rows: 1, color: 'lightpink'},
    {text: 'Iced coffee', cols: 2, rows: 1, color: '#DDBDF1'},
  ];

  fixedCols = 4;
  fixedRowHeight = 100;
  ratioGutter = 1;
  fitListHeight = '400px';
  ratio = '4:1';
}
