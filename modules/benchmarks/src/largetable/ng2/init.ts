/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef} from '@angular/core';

import {bindAction, profile} from '../../util';
import {buildTable, emptyTable, initTableUtils} from '../util';

import {TableComponent} from './table';

export function init(appRef: ApplicationRef) {
  let table: TableComponent;

  function destroyDom() {
    table.data = emptyTable;
    appRef.tick();
  }

  function createDom() {
    table.data = buildTable();
    appRef.tick();
  }

  function noop() {}

  table = appRef.components[0].instance;

  initTableUtils();

  bindAction('#destroyDom', destroyDom);
  bindAction('#createDom', createDom);
  bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
  bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
}
