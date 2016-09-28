import {ApplicationRef, enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {bindAction, profile} from '../../util';
import {buildTable, emptyTable} from '../util';

import {AppModule, TableComponent} from './table';

export function main() {
  var table: TableComponent;
  var appRef: ApplicationRef;

  function destroyDom() {
    table.data = emptyTable;
    appRef.tick();
  }

  function createDom() {
    table.data = buildTable();
    appRef.tick();
  }

  function noop() {}

  function init() {
    enableProdMode();
    platformBrowserDynamic().bootstrapModule(AppModule).then((ref) => {
      var injector = ref.injector;
      appRef = injector.get(ApplicationRef);

      table = appRef.components[0].instance;
      bindAction('#destroyDom', destroyDom);
      bindAction('#createDom', createDom);
      bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
      bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
    });
  }

  init();
}
