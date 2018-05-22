/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkAutoSizeVirtualScroll} from './auto-size-virtual-scroll';
import {CdkFixedSizeVirtualScroll} from './fixed-size-virtual-scroll';
import {CdkVirtualForOf} from './virtual-for-of';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';


@NgModule({
  exports: [
    CdkAutoSizeVirtualScroll,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
  ],
  declarations: [
    CdkAutoSizeVirtualScroll,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
  ],
})
export class ScrollingModule {}
