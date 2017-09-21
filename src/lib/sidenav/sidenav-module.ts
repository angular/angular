/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MdCommonModule} from '@angular/material/core';
import {MdDrawer, MdDrawerContainer, MdDrawerContent} from './drawer';
import {MdSidenav, MdSidenavContainer, MdSidenavContent} from './sidenav';


@NgModule({
  imports: [CommonModule, MdCommonModule, A11yModule, OverlayModule],
  exports: [
    MdCommonModule,
    MdDrawer,
    MdDrawerContainer,
    MdDrawerContent,
    MdSidenav,
    MdSidenavContainer,
    MdSidenavContent,
  ],
  declarations: [
    MdDrawer,
    MdDrawerContainer,
    MdDrawerContent,
    MdSidenav,
    MdSidenavContainer,
    MdSidenavContent,
  ],
})
export class MdSidenavModule {}
