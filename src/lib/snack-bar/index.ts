/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {LIVE_ANNOUNCER_PROVIDER} from '@angular/cdk/a11y';
import {MdCommonModule} from '../core';
import {MdSnackBar} from './snack-bar';
import {MdSnackBarContainer} from './snack-bar-container';
import {SimpleSnackBar} from './simple-snack-bar';


@NgModule({
  imports: [
    OverlayModule,
    PortalModule,
    CommonModule,
    MdCommonModule,
  ],
  exports: [MdSnackBarContainer, MdCommonModule],
  declarations: [MdSnackBarContainer, SimpleSnackBar],
  entryComponents: [MdSnackBarContainer, SimpleSnackBar],
  providers: [MdSnackBar, LIVE_ANNOUNCER_PROVIDER]
})
export class MdSnackBarModule {}


export * from './snack-bar';
export * from './snack-bar-container';
export * from './snack-bar-config';
export * from './snack-bar-ref';
export * from './simple-snack-bar';
