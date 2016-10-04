import {ApplicationRef, NgModuleRef} from '@angular/core';

import {bindAction, profile} from '../../util';
import {buildTable, emptyTable} from '../util';

import {AppModule, TableComponent} from './table';

export function init(moduleRef: NgModuleRef<AppModule>) {
  let table: TableComponent;
  let appRef: ApplicationRef;

  function destroyDom() {
    table.data = emptyTable;
    appRef.tick();
  }

  function createDom() {
    table.data = buildTable();
    appRef.tick();
  }

  function noop() {}

  const injector = moduleRef.injector;
  appRef = injector.get(ApplicationRef);

  table = appRef.components[0].instance;
  bindAction('#destroyDom', destroyDom);
  bindAction('#createDom', createDom);
  bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
  bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
}
