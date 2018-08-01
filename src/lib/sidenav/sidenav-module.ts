/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PlatformModule} from '@angular/cdk/platform';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatDrawer, MatDrawerContainer, MatDrawerContent} from './drawer';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from './sidenav';


@NgModule({
  imports: [
    CommonModule,
    MatCommonModule,
    ScrollingModule,
    PlatformModule,
  ],
  exports: [
    MatCommonModule,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
  ],
  declarations: [
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
  ],
})
export class MatSidenavModule {}
