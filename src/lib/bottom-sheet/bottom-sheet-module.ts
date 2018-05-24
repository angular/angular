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
import {MatBottomSheetContainer} from './bottom-sheet-container';


@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    MatCommonModule,
    PortalModule,
  ],
  exports: [MatBottomSheetContainer, MatCommonModule],
  declarations: [MatBottomSheetContainer],
  entryComponents: [MatBottomSheetContainer],
})
export class MatBottomSheetModule {}
