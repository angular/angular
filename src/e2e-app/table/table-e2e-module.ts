/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {TableE2e} from './table-e2e';

@NgModule({
  imports: [MatTableModule],
  declarations: [TableE2e],
})
export class TableE2eModule {}
