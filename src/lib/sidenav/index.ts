/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {A11yModule} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';
import {MdCommonModule} from '../core';
import {MdSidenav, MdSidenavContainer} from './sidenav';


@NgModule({
  imports: [CommonModule, MdCommonModule, A11yModule, OverlayModule],
  exports: [MdSidenavContainer, MdSidenav, MdCommonModule],
  declarations: [MdSidenavContainer, MdSidenav],
})
export class MdSidenavModule {}


export * from './sidenav';
