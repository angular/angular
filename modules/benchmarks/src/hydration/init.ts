/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, ComponentRef, createComponent, EnvironmentInjector} from '@angular/core';

import {bindAction, profile} from '../util';

import {TableComponent} from './table';
import {buildTable, emptyTable, initTableUtils, TableCell} from './util';

const DEFAULT_COLS_COUNT = '40';
const DEFAULT_ROWS_COUNT = '200';

function getUrlParamValue(name: string): string | null {
  const url = new URL(document.location.href);
  return url.searchParams.get(name);
}

export function syncUrlParamsToForm(): {cols: string; rows: string} {
  let cols = getUrlParamValue('cols') ?? DEFAULT_COLS_COUNT;
  let rows = getUrlParamValue('rows') ?? DEFAULT_ROWS_COUNT;
  (document.getElementById('cols') as HTMLInputElement).value = cols;
  (document.getElementById('rows') as HTMLInputElement).value = rows;
  return {cols, rows};
}

export function init(appRef: ApplicationRef, insertSsrContent = true) {
  let tableComponentRef: ComponentRef<TableComponent>;
  const injector = appRef.injector;
  const environmentInjector = injector.get(EnvironmentInjector);

  let data: TableCell[][] = [];

  const setInput = (data: TableCell[][]) => {
    if (tableComponentRef) {
      tableComponentRef.setInput('data', data);
      tableComponentRef.changeDetectorRef.detectChanges();
    }
  };

  function destroyDom() {
    setInput(emptyTable);
  }

  function updateDom() {
    data = buildTable();
    setInput(data);
  }

  function createDom() {
    const hostElement = document.getElementById('table');
    tableComponentRef = createComponent(TableComponent, {environmentInjector, hostElement});
    setInput(data);
  }

  function prepare() {
    destroyDom();
    data = buildTable();

    if (insertSsrContent) {
      // Prepare DOM structure, similar to what SSR would produce.
      const hostElement = document.getElementById('table');
      hostElement.setAttribute('ngh', '0');
      hostElement.textContent = ''; // clear existing DOM contents
      hostElement.appendChild(createTableDom(data));
    }
  }

  function noop() {}

  initTableUtils();

  bindAction('#prepare', prepare);
  bindAction('#createDom', createDom);
  bindAction('#updateDom', updateDom);
  bindAction('#createDomProfile', profile(createDom, prepare, 'create'));
  bindAction('#updateDomProfile', profile(updateDom, noop, 'update'));
}

/**
 * Creates DOM to represent a table, similar to what'd be generated
 * during the SSR.
 */
function createTableDom(data: TableCell[][]) {
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  this._renderCells = [];
  for (let r = 0; r < data.length; r++) {
    const dataRow = data[r];
    const tr = document.createElement('tr');
    // Mark created DOM nodes, so that we can verify that
    // they were *not* re-created during hydration.
    (tr as any).__existing = true;
    tbody.appendChild(tr);
    const renderRow = [];
    for (let c = 0; c < dataRow.length; c++) {
      const dataCell = dataRow[c];
      const renderCell = document.createElement('td');
      // Mark created DOM nodes, so that we can verify that
      // they were *not* re-created during hydration.
      (renderCell as any).__existing = true;
      if (r % 2 === 0) {
        renderCell.style.backgroundColor = 'grey';
      }
      tr.appendChild(renderCell);
      renderRow[c] = renderCell;
      renderCell.textContent = dataCell.value;
    }
    // View container anchor
    const comment = document.createComment('');
    tr.appendChild(comment);
  }
  // View container anchor
  const comment = document.createComment('');
  tbody.appendChild(comment);
  return table;
}
