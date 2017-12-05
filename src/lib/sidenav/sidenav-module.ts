/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {ScrollDispatchModule} from '@angular/cdk/scrolling';
import {PlatformModule} from '@angular/cdk/platform';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from './sidenav';
import {
  MatDrawer,
  MatDrawerContainer,
  MatDrawerContent,
  MAT_DRAWER_DEFAULT_AUTOSIZE,
} from './drawer';


@NgModule({
  imports: [
    CommonModule,
    MatCommonModule,
    A11yModule,
    OverlayModule,
    ScrollDispatchModule,
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
  providers: [
    {provide: MAT_DRAWER_DEFAULT_AUTOSIZE, useValue: false}
  ]
})
export class MatSidenavModule {}
