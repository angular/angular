/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  templateUrl: 'table-demo-page.html',
})
export class TableDemoPage {
  links = [
    {name: 'Main Page', link: 'main-demo'},
    {name: 'Custom Table', link: 'custom-table'},
    {name: 'Direct Data', link: 'data-input-table'},
    {name: 'MatTableDataSource', link: 'mat-table-data-source'},
    {name: 'Dynamic Columns', link: 'dynamic-columns'},
    {name: 'Row Context', link: 'row-context'},
    {name: 'When Rows', link: 'when-rows'},
    {name: 'Expandable Rows', link: 'expandable-rows'}
  ];
}
