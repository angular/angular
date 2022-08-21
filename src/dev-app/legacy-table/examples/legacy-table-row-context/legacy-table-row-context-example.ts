/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

/**
 * @title Table showing each row context properties.
 */
@Component({
  selector: 'legacy-table-row-context-example',
  styleUrls: ['legacy-table-row-context-example.css'],
  templateUrl: 'legacy-table-row-context-example.html',
})
export class LegacyTableRowContextExample {
  displayedColumns: string[] = ['$implicit', 'index', 'count', 'first', 'last', 'even', 'odd'];
  data: string[] = ['one', 'two', 'three', 'four', 'five'];
}
