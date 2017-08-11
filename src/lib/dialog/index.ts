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
import {A11yModule} from '@angular/cdk/a11y';
import {MdCommonModule} from '../core';
import {MdDialog, MD_DIALOG_SCROLL_STRATEGY_PROVIDER} from './dialog';
import {MdDialogContainer} from './dialog-container';
import {
  MdDialogClose,
  MdDialogContent,
  MdDialogTitle,
  MdDialogActions
} from './dialog-content-directives';


@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    PortalModule,
    A11yModule,
    MdCommonModule,
  ],
  exports: [
    MdDialogContainer,
    MdDialogClose,
    MdDialogTitle,
    MdDialogContent,
    MdDialogActions,
    MdCommonModule,
  ],
  declarations: [
    MdDialogContainer,
    MdDialogClose,
    MdDialogTitle,
    MdDialogActions,
    MdDialogContent,
  ],
  providers: [
    MdDialog,
    MD_DIALOG_SCROLL_STRATEGY_PROVIDER,
  ],
  entryComponents: [MdDialogContainer],
})
export class MdDialogModule {}

export * from './dialog';
export * from './dialog-container';
export * from './dialog-content-directives';
export * from './dialog-config';
export * from './dialog-ref';
