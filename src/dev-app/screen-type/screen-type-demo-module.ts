/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LayoutModule} from '@angular/cdk/layout';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatGridListModule, MatIconModule} from '@angular/material';
import {ScreenTypeDemo} from './screen-type-demo';

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    MatGridListModule,
    MatIconModule,
  ],
  declarations: [ScreenTypeDemo],
})
export class ScreenTypeDemoModule {
}
