/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Routes} from '@angular/router';
import {TableDemo} from './table-demo';
import {CustomTableDemo} from './custom-table/custom-table';
import {DataInputTableDemo} from './data-input-table/data-input-table';
import {MatTableDataSourceDemo} from './mat-table-data-source/mat-table-data-source';
import {DynamicColumnsDemo} from './dynamic-columns/dynamic-columns';
import {RowContextDemo} from './row-context/row-context';
import {WhenRowsDemo} from './when-rows/when-rows';
import {ExpandableRowsDemo} from './expandable-rows/expandable-rows';

export const TABLE_DEMO_ROUTES: Routes = [
  {path: '', redirectTo: 'main-demo', pathMatch: 'full'},
  {path: 'main-demo', component: TableDemo},
  {path: 'custom-table', component: CustomTableDemo},
  {path: 'data-input-table', component: DataInputTableDemo},
  {path: 'mat-table-data-source', component: MatTableDataSourceDemo},
  {path: 'dynamic-columns', component: DynamicColumnsDemo},
  {path: 'row-context', component: RowContextDemo},
  {path: 'when-rows', component: WhenRowsDemo},
  {path: 'expandable-rows', component: ExpandableRowsDemo}
];
