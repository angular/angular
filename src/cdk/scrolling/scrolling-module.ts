/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BidiModule} from '@angular/cdk/bidi';
import {PlatformModule} from '@angular/cdk/platform';
import {NgModule} from '@angular/core';
import {CdkFixedSizeVirtualScroll} from './fixed-size-virtual-scroll';
import {CdkScrollable} from './scrollable';
import {CdkVirtualForOf} from './virtual-for-of';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';

@NgModule({
  imports: [BidiModule, PlatformModule],
  exports: [
    BidiModule,
    CdkFixedSizeVirtualScroll,
    CdkScrollable,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
  ],
  declarations: [
    CdkFixedSizeVirtualScroll,
    CdkScrollable,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
  ],
})
export class ScrollingModule {}

/**
 * @deprecated ScrollDispatchModule has been renamed to ScrollingModule.
 * @breaking-change 8.0.0 delete this alias
 */
@NgModule({
  imports: [ScrollingModule],
  exports: [ScrollingModule],
})
export class ScrollDispatchModule {}
