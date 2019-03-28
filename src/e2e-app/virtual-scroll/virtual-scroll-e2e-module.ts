/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ScrollingModule as ExperimentalScrollingModule} from '@angular/cdk-experimental/scrolling';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {NgModule} from '@angular/core';
import {VirtualScrollE2E} from './virtual-scroll-e2e';

@NgModule({
  imports: [ScrollingModule, ExperimentalScrollingModule],
  declarations: [VirtualScrollE2E],
})
export class VirtualScrollE2eModule {
}
