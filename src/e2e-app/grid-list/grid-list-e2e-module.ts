/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {GridListE2E} from './grid-list-e2e';

@NgModule({
  imports: [MatGridListModule],
  declarations: [GridListE2E],
})
export class GridListE2eModule {
}
