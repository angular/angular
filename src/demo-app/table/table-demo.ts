/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {PeriodicElement, ELEMENT_DATA} from './element-data';

@Component({
  moduleId: module.id,
  templateUrl: 'table-demo.html',
  styles: [`
    mat-card {
      max-height: 300px;
      overflow: auto;
      margin: 16px 0;
    }

    table {
      width: 100%;
    }
  `]
})
export class TableDemo {
  columns = ['name', 'weight', 'symbol', 'position'];
  dataSource: PeriodicElement[] = ELEMENT_DATA.slice();
}
