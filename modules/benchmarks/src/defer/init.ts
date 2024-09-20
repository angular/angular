/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef} from '@angular/core';

import {bindAction, profile} from '../util';

import {buildTable, emptyTable, initTableUtils} from './util';

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

export function init(appRef: ApplicationRef) {
  const table = appRef.components[0].instance;

  function destroyDom() {
    table.data = emptyTable;
    appRef.tick();
  }

  function createDom() {
    table.data = buildTable();
    appRef.tick();
  }

  function noop() {}

  initTableUtils();

  bindAction('#destroyDom', destroyDom);
  bindAction('#createDom', createDom);
  bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
  bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
}
