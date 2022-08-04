/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DialogModule} from '@angular/cdk/dialog';
import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MAT_LEGACY_DIALOG_SCROLL_STRATEGY_PROVIDER, MatLegacyDialog} from './dialog';
import {MatLegacyDialogContainer} from './dialog-container';
import {
  MatLegacyDialogActions,
  MatLegacyDialogClose,
  MatLegacyDialogContent,
  MatLegacyDialogTitle,
} from './dialog-content-directives';

@NgModule({
  imports: [DialogModule, OverlayModule, PortalModule, MatCommonModule],
  exports: [
    MatLegacyDialogContainer,
    MatLegacyDialogClose,
    MatLegacyDialogTitle,
    MatLegacyDialogContent,
    MatLegacyDialogActions,
    MatCommonModule,
  ],
  declarations: [
    MatLegacyDialogContainer,
    MatLegacyDialogClose,
    MatLegacyDialogTitle,
    MatLegacyDialogActions,
    MatLegacyDialogContent,
  ],
  providers: [MatLegacyDialog, MAT_LEGACY_DIALOG_SCROLL_STRATEGY_PROVIDER],
})
export class MatLegacyDialogModule {}
