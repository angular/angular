/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatSidenavModule} from '@angular/material-experimental/mdc-sidenav';
import {RouterModule} from '@angular/router';
import {MdcSidenavDemo} from './mdc-sidenav-demo';

@NgModule({
  imports: [
    MatSidenavModule,
    RouterModule.forChild([{path: '', component: MdcSidenavDemo}]),
  ],
  declarations: [MdcSidenavDemo],
})
export class MdcSidenavDemoModule {
}
