/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MdButtonToggleGroup, MdButtonToggleGroupMultiple, MdButtonToggle} from './button-toggle';
import {UNIQUE_SELECTION_DISPATCHER_PROVIDER, MdCommonModule} from '@angular/material/core';
import {A11yModule} from '@angular/cdk/a11y';


@NgModule({
  imports: [MdCommonModule, A11yModule],
  exports: [
    MdButtonToggleGroup,
    MdButtonToggleGroupMultiple,
    MdButtonToggle,
    MdCommonModule,
  ],
  declarations: [MdButtonToggleGroup, MdButtonToggleGroupMultiple, MdButtonToggle],
  providers: [UNIQUE_SELECTION_DISPATCHER_PROVIDER]
})
export class MdButtonToggleModule {}


export * from './button-toggle';
