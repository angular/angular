/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LayoutModule} from '@angular/cdk/layout';
import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {SimpleSnackBar} from './simple-snack-bar';
import {MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBar} from './snack-bar';
import {MatSnackBarConfig} from './snack-bar-config';
import {MatSnackBarContainer} from './snack-bar-container';


/** @docs-private */
export function MAT_SNACK_BAR_DEFAULT_OPTIONS_PROVIDER_FACTORY() {
  return new MatSnackBarConfig();
}

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
  providers: [
    MatSnackBar,
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useFactory: MAT_SNACK_BAR_DEFAULT_OPTIONS_PROVIDER_FACTORY
    },
  ]
})
export class MatSnackBarModule {}
