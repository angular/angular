/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatButtonToggleGroup, MatButtonToggleGroupMultiple, MatButtonToggle} from './button-toggle';
import {MatCommonModule} from '@angular/material/core';
import {UNIQUE_SELECTION_DISPATCHER_PROVIDER} from '@angular/cdk/collections';
import {A11yModule} from '@angular/cdk/a11y';


@NgModule({
  imports: [MatCommonModule, A11yModule],
  exports: [
    MatButtonToggleGroup,
    MatButtonToggleGroupMultiple,
    MatButtonToggle,
    MatCommonModule,
  ],
  declarations: [MatButtonToggleGroup, MatButtonToggleGroupMultiple, MatButtonToggle],
  providers: [UNIQUE_SELECTION_DISPATCHER_PROVIDER]
})
export class MatButtonToggleModule {}
