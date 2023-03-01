/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TableCell} from '../util';

// We load "IncrementalDOM" as a AMD global because the "incremental-dom" NPM package does not
// come with a named UMD module, and it's easier to just import the AMD file and use it globally.
declare const IncrementalDOM: any;
const {patch, elementOpen, elementClose, elementOpenStart, elementOpenEnd, attr, text} =
    IncrementalDOM;

export class TableComponent {
  constructor(private _rootEl: any) {}

  set data(data: TableCell[][]) {
    patch(this._rootEl, () => this._render(data));
  }

  private _render(data: TableCell[][]) {
    elementOpen('table');
    elementOpen('tbody');
    for (let r = 0; r < data.length; r++) {
      elementOpen('tr');
      const row = data[r];
      for (let c = 0; c < row.length; c++) {
        elementOpenStart('td');
        if (r % 2 === 0) {
          attr('style', 'background-color: grey');
        }
        elementOpenEnd('td');
        text(row[c].value);
        elementClose('td');
      }
      elementClose('tr');
    }
    elementClose('tbody');
    elementClose('table');
  }
}
