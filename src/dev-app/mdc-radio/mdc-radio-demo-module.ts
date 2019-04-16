/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatRadioModule} from '@angular/material-experimental/mdc-radio';
import {RouterModule} from '@angular/router';
import {MdcRadioDemo} from './mdc-radio-demo';

@NgModule({
  imports: [
    MatRadioModule,
    RouterModule.forChild([{path: '', component: MdcRadioDemo}]),
  ],
  declarations: [MdcRadioDemo],
})
export class MdcRadioDemoModule {
}
