/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatTabsModule} from '@angular/material-experimental/mdc-tabs';
import {RouterModule} from '@angular/router';
import {MdcTabsDemo} from './mdc-tabs-demo';

@NgModule({
  imports: [
    MatTabsModule,
    RouterModule.forChild([{path: '', component: MdcTabsDemo}]),
  ],
  declarations: [MdcTabsDemo],
})
export class MdcTabsDemoModule {
}
