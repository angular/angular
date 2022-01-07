/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bindAction, profile} from '../../util';
import {buildTable, emptyTable, initTableUtils} from '../util';

import {TableComponent} from './table';

let table: TableComponent;

function destroyDom() {
  table.data = emptyTable;
}

function createDom() {
  table.data = buildTable();
}

function noop() {}

function init() {
  table = new TableComponent(document.querySelector('largetable'));

  initTableUtils();

  bindAction('#destroyDom', destroyDom);
  bindAction('#createDom', createDom);

  bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
  bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
}

init();
