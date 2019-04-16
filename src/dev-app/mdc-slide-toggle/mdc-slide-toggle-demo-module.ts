/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatSlideToggleModule} from '@angular/material-experimental/mdc-slide-toggle';
import {RouterModule} from '@angular/router';
import {MdcSlideToggleDemo} from './mdc-slide-toggle-demo';

@NgModule({
  imports: [
    MatSlideToggleModule,
    RouterModule.forChild([{path: '', component: MdcSlideToggleDemo}]),
  ],
  declarations: [MdcSlideToggleDemo],
})
export class MdcSlideToggleDemoModule {
}
