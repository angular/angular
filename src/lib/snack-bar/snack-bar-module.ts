/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {LIVE_ANNOUNCER_PROVIDER} from '@angular/cdk/a11y';
import {LayoutModule} from '@angular/cdk/layout';
import {MatCommonModule} from '@angular/material/core';
import {MatSnackBar} from './snack-bar';
import {MatSnackBarContainer} from './snack-bar-container';
import {SimpleSnackBar} from './simple-snack-bar';


@NgModule({
  imports: [
    OverlayModule,
    PortalModule,
    CommonModule,
    MatCommonModule,
    LayoutModule,
  ],
  exports: [MatSnackBarContainer, MatCommonModule],
  declarations: [MatSnackBarContainer, SimpleSnackBar],
  entryComponents: [MatSnackBarContainer, SimpleSnackBar],
  providers: [MatSnackBar, LIVE_ANNOUNCER_PROVIDER]
})
export class MatSnackBarModule {}
