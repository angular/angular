/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceNumberProperty} from '@angular/cdk/coercion';
import {ListRange} from '@angular/cdk/collections';
import {Directive, forwardRef, Input, OnChanges} from '@angular/core';
import {VIRTUAL_SCROLL_STRATEGY, VirtualScrollStrategy} from './virtual-scroll-strategy';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';


/** Virtual scrolling strategy for lists with items of known fixed size. */
export class FixedSizeVirtualScrollStrategy implements VirtualScrollStrategy {
  /** The attached viewport. */
  private _viewport: CdkVirtualScrollViewport | null = null;

  /** The size of the items in the virtually scrolling list. */
  private _itemSize: number;

  /** The number of buffer items to render beyond the edge of the viewport. */
  private _bufferSize: number;

  /**
   * @param itemSize The size of the items in the virtually scrolling list.
   * @param bufferSize The number of buffer items to render beyond the edge of the viewport.
   */
  constructor(itemSize: number, bufferSize: number) {
    this._itemSize = itemSize;
    this._bufferSize = bufferSize;
  }

  /**
   * Attaches this scroll strategy to a viewport.
   * @param viewport The viewport to attach this strategy to.
   */
  attach(viewport: CdkVirtualScrollViewport) {
    this._viewport = viewport;
    this._updateTotalContentSize();
    this._updateRenderedRange();
  }

  /** Detaches this scroll strategy from the currently attached viewport. */
  detach() {
    this._viewport = null;
  }

  /**
   * Update the item size and buffer size.
   * @param itemSize The size of the items in the virtually scrolling list.
   * @param bufferSize he number of buffer items to render beyond the edge of the viewport.
   */
  updateItemAndBufferSize(itemSize: number, bufferSize: number) {
    this._itemSize = itemSize;
    this._bufferSize = bufferSize;
    this._updateTotalContentSize();
    this._updateRenderedRange();
  }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onContentScrolled() {
    this._updateRenderedRange();
  }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onDataLengthChanged() {
    this._updateTotalContentSize();
    this._updateRenderedRange();
  }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onContentRendered() { /* no-op */ }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onRenderedOffsetChanged() { /* no-op */ }

  /** Update the viewport's total content size. */
  private _updateTotalContentSize() {
    if (!this._viewport) {
      return;
    }

    this._viewport.setTotalContentSize(this._viewport.getDataLength() * this._itemSize);
  }

  /** Update the viewport's rendered range. */
  private _updateRenderedRange() {
    if (!this._viewport) {
      return;
    }

    const scrollOffset = this._viewport.measureScrollOffset();
    const firstVisibleIndex = Math.floor(scrollOffset / this._itemSize);
    const firstItemRemainder = scrollOffset % this._itemSize;
    const range = this._expandRange(
        {start: firstVisibleIndex, end: firstVisibleIndex},
        this._bufferSize,
        Math.ceil((this._viewport.getViewportSize() + firstItemRemainder) / this._itemSize) +
            this._bufferSize);
    this._viewport.setRenderedRange(range);
    this._viewport.setRenderedContentOffset(this._itemSize * range.start);
  }

  /**
   * Expand the given range by the given amount in either direction.
   * @param range The range to expand
   * @param expandStart The number of items to expand the start of the range by.
   * @param expandEnd The number of items to expand the end of the range by.
   * @return The expanded range.
   */
  private _expandRange(range: ListRange, expandStart: number, expandEnd: number): ListRange {
    if (!this._viewport) {
      return {...range};
    }

    const start = Math.max(0, range.start - expandStart);
    const end = Math.min(this._viewport.getDataLength(), range.end + expandEnd);
    return {start, end};
  }
}


/**
 * Provider factory for `FixedSizeVirtualScrollStrategy` that simply extracts the already created
 * `FixedSizeVirtualScrollStrategy` from the given directive.
 * @param fixedSizeDir The instance of `CdkFixedSizeVirtualScroll` to extract the
 *     `FixedSizeVirtualScrollStrategy` from.
 */
export function _fixedSizeVirtualScrollStrategyFactory(fixedSizeDir: CdkFixedSizeVirtualScroll) {
  return fixedSizeDir._scrollStrategy;
}


/** A virtual scroll strategy that supports fixed-size items. */
@Directive({
  selector: 'cdk-virtual-scroll-viewport[itemSize]',
  providers: [{
    provide: VIRTUAL_SCROLL_STRATEGY,
    useFactory: _fixedSizeVirtualScrollStrategyFactory,
    deps: [forwardRef(() => CdkFixedSizeVirtualScroll)],
  }],
})
export class CdkFixedSizeVirtualScroll implements OnChanges {
  /** The size of the items in the list (in pixels). */
  @Input()
  get itemSize(): number { return this._itemSize; }
  set itemSize(value: number) { this._itemSize = coerceNumberProperty(value); }
  _itemSize = 20;

  /** The number of extra elements to render on either side of the scrolling viewport. */
  @Input()
  get bufferSize(): number { return this._bufferSize; }
  set bufferSize(value: number) { this._bufferSize = coerceNumberProperty(value); }
  _bufferSize = 5;

  /** The scroll strategy used by this directive. */
  _scrollStrategy = new FixedSizeVirtualScrollStrategy(this.itemSize, this.bufferSize);

  ngOnChanges() {
    this._scrollStrategy.updateItemAndBufferSize(this.itemSize, this.bufferSize);
  }
}
