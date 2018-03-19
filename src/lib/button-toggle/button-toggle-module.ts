/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@angular/cdk/a11y';
import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MatButtonToggle, MatButtonToggleGroup} from './button-toggle';


@NgModule({
  imports: [MatCommonModule, MatRippleModule, A11yModule],
  exports: [MatCommonModule, MatButtonToggleGroup, MatButtonToggle],
  declarations: [MatButtonToggleGroup, MatButtonToggle],
})
export class MatButtonToggleModule {}
