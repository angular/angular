/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewportScroller} from '@angular/common';

/**
 * @whatItDoes Provides an empty implementation of the viewport scroller
 */
export class NullViewportScroller implements ViewportScroller {
  /**
   * @whatItDoes empty implementation
   */
  setOffset(offset: [number, number]|(() => [number, number])): void {}

  /**
   * @whatItDoes empty implementation
   */
  getScrollPosition(): [number, number] { return [0, 0]; }

  /**
   * @whatItDoes empty implementation
   */
  scrollToPosition(position: [number, number]): void {}

  /**
   * @whatItDoes empty implementation
   */
  scrollToAnchor(anchor: string): void {}

  /**
   * @whatItDoes empty implementation
   */
  setHistoryScrollRestoration(scrollRestoration: 'auto'|'manual'): void {}
}