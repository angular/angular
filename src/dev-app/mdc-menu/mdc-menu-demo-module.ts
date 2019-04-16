/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatMenuModule} from '@angular/material-experimental/mdc-menu';
import {RouterModule} from '@angular/router';
import {MdcMenuDemo} from './mdc-menu-demo';

@NgModule({
  imports: [
    MatMenuModule,
    RouterModule.forChild([{path: '', component: MdcMenuDemo}]),
  ],
  declarations: [MdcMenuDemo],
})
export class MdcMenuDemoModule {
}
