/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCommonModule} from '@angular/material/core';
import {A11yModule} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {LayoutModule} from '@angular/cdk/layout';
import {MatBottomSheetContainer} from './bottom-sheet-container';
import {MatBottomSheet} from './bottom-sheet';


@NgModule({
  imports: [
    A11yModule,
    CommonModule,
    OverlayModule,
    MatCommonModule,
    PortalModule,
    LayoutModule,
  ],
  exports: [MatBottomSheetContainer, MatCommonModule],
  declarations: [MatBottomSheetContainer],
  entryComponents: [MatBottomSheetContainer],
  providers: [MatBottomSheet],
})
export class MatBottomSheetModule {}
