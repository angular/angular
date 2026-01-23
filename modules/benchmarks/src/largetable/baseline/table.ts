/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TableCell} from '../util';

export class TableComponent {
  private _renderCells!: any[][];

  constructor(private _rootEl: any) {}

  set data(data: TableCell[][]) {
    if (data.length === 0) {
      this._destroy();
    } else if (this._renderCells) {
      this._update(data);
    } else {
      this._create(data);
    }
  }

  private _destroy() {
    while (this._rootEl.lastChild) {
      this._rootEl.lastChild.remove();
    }
    this._renderCells = [];
  }

  private _update(data: TableCell[][]) {
    for (let r = 0; r < data.length; r++) {
      const dataRow = data[r];
      const renderRow = this._renderCells[r];
      for (let c = 0; c < dataRow.length; c++) {
        const dataCell = dataRow[c];
        const renderCell = renderRow[c];
        this._updateCell(renderCell, dataCell);
      }
    }
  }

  private _updateCell(renderCell: any, dataCell: TableCell) {
    renderCell.textContent = dataCell.value;
  }

  private _create(data: TableCell[][]) {
    const table = document.createElement('table');
    this._rootEl.appendChild(table);
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    this._renderCells = [];
    for (let r = 0; r < data.length; r++) {
      const dataRow = data[r];
      const tr = document.createElement('tr');
      tbody.appendChild(tr);
      const renderRow: any[] = [];
      this._renderCells[r] = renderRow;
      for (let c = 0; c < dataRow.length; c++) {
        const dataCell = dataRow[c];
        const renderCell = document.createElement('td');
        if (r % 2 === 0) {
          renderCell.style.backgroundColor = 'grey';
        }
        tr.appendChild(renderCell);
        renderRow[c] = renderCell;
        this._updateCell(renderCell, dataCell);
      }
    }
  }
}
