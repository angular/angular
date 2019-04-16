/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material-experimental/mdc-card';
import {RouterModule} from '@angular/router';
import {MdcCardDemo} from './mdc-card-demo';

@NgModule({
  imports: [
    MatCardModule,
    RouterModule.forChild([{path: '', component: MdcCardDemo}]),
  ],
  declarations: [MdcCardDemo],
})
export class MdcCardDemoModule {
}
