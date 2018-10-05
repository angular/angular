/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';
import {Observable} from 'rxjs';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';


/** The injection token used to specify the virtual scrolling strategy. */
export const VIRTUAL_SCROLL_STRATEGY =
    new InjectionToken<VirtualScrollStrategy>('VIRTUAL_SCROLL_STRATEGY');


/** A strategy that dictates which items should be rendered in the viewport. */
export interface VirtualScrollStrategy {
  /** Emits when the index of the first element visible in the viewport changes. */
  scrolledIndexChange: Observable<number>;

  /**
   * Attaches this scroll strategy to a viewport.
   * @param viewport The viewport to attach this strategy to.
   */
  attach(viewport: CdkVirtualScrollViewport): void;

  /** Detaches this scroll strategy from the currently attached viewport. */
  detach(): void;

  /** Called when the viewport is scrolled (debounced using requestAnimationFrame). */
  onContentScrolled(): void;

  /** Called when the length of the data changes. */
  onDataLengthChanged(): void;

  /** Called when the range of items rendered in the DOM has changed. */
  onContentRendered(): void;

  /** Called when the offset of the rendered items changed. */
  onRenderedOffsetChanged(): void;

  /**
   * Scroll to the offset for the given index.
   * @param index The index of the element to scroll to.
   * @param behavior The ScrollBehavior to use when scrolling.
   */
  scrollToIndex(index: number, behavior: ScrollBehavior): void;
}
