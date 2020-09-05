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
import {CdkMenuPanel} from './menu-panel';
import {CdkMenuItem} from './menu-item';
import {CdkMenuGroup} from './menu-group';
import {CdkMenuItemRadio} from './menu-item-radio';
import {CdkMenuItemCheckbox} from './menu-item-checkbox';
import {CdkMenuItemTrigger} from './menu-item-trigger';
import {CdkContextMenuTrigger} from './context-menu';
import {CdkTargetMenuAim} from './menu-aim';

const EXPORTED_DECLARATIONS = [
  CdkMenuBar,
  CdkMenu,
  CdkMenuPanel,
  CdkMenuItem,
  CdkMenuItemRadio,
  CdkMenuItemCheckbox,
  CdkMenuItemTrigger,
  CdkMenuGroup,
  CdkContextMenuTrigger,
  CdkTargetMenuAim,
];
@NgModule({
  imports: [OverlayModule],
  exports: EXPORTED_DECLARATIONS,
  declarations: EXPORTED_DECLARATIONS,
})
export class CdkMenuModule {}
