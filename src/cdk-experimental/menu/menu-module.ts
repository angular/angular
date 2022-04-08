/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {CdkMenu} from './menu';
import {CdkMenuBar} from './menu-bar';
import {CdkMenuItem} from './menu-item';
import {CdkMenuGroup} from './menu-group';
import {CdkMenuItemRadio} from './menu-item-radio';
import {CdkMenuItemCheckbox} from './menu-item-checkbox';
import {CdkMenuTrigger} from './menu-trigger';
import {CdkContextMenuTrigger} from './context-menu-trigger';
import {CdkTargetMenuAim} from './menu-aim';

/** The list of components and directives that should be declared and exported from this module. */
const EXPORTED_DECLARATIONS = [
  CdkMenuBar,
  CdkMenu,
  CdkMenuItem,
  CdkMenuItemRadio,
  CdkMenuItemCheckbox,
  CdkMenuTrigger,
  CdkMenuGroup,
  CdkContextMenuTrigger,
  CdkTargetMenuAim,
];

/** Module that declares components and directives for the CDK menu. */
@NgModule({
  imports: [OverlayModule],
  exports: EXPORTED_DECLARATIONS,
  declarations: EXPORTED_DECLARATIONS,
})
export class CdkMenuModule {}
