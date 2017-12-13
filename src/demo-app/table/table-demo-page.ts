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
  ];
}
