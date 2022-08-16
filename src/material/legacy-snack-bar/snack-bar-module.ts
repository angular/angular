/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {LegacySimpleSnackBar} from './simple-snack-bar';
import {MatLegacySnackBarContainer} from './snack-bar-container';

@NgModule({
  imports: [OverlayModule, PortalModule, CommonModule, MatLegacyButtonModule, MatCommonModule],
  exports: [MatLegacySnackBarContainer, MatCommonModule],
  declarations: [MatLegacySnackBarContainer, LegacySimpleSnackBar],
})
export class MatLegacySnackBarModule {}
