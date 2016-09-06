import {bindAction, profile} from '../../util';
import {buildTable, emptyTable} from '../util';
import {TableComponent} from './table';

export function main() {
  var table: TableComponent;

  function destroyDom() { table.data = emptyTable; }

  function createDom() { table.data = buildTable(); }

  function noop() {}

  function init() {
    table = new TableComponent(document.querySelector('largetable'));

    bindAction('#destroyDom', destroyDom);
    bindAction('#createDom', createDom);

    bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
    bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
  }

  init();
}
