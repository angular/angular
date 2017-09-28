/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatButtonToggleGroup, MatButtonToggleGroupMultiple, MatButtonToggle} from './button-toggle';
import {UNIQUE_SELECTION_DISPATCHER_PROVIDER, MatCommonModule} from '@angular/material/core';
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
