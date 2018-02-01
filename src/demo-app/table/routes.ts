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

export const TABLE_DEMO_ROUTES: Routes = [
  {path: '', redirectTo: 'main-demo', pathMatch: 'full'},
  {path: 'main-demo', component: TableDemo},
  {path: 'custom-table', component: CustomTableDemo},
  {path: 'data-input-table', component: DataInputTableDemo},
];
