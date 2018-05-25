/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ListRange} from '@angular/cdk/collections';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {animationFrameScheduler, fromEvent, Observable, Subject} from 'rxjs';
import {sampleTime, take, takeUntil} from 'rxjs/operators';
import {CdkVirtualForOf} from './virtual-for-of';
import {VIRTUAL_SCROLL_STRATEGY, VirtualScrollStrategy} from './virtual-scroll-strategy';


/** Checks if the given ranges are equal. */
function rangesEqual(r1: ListRange, r2: ListRange): boolean {
  return r1.start == r2.start && r1.end == r2.end;
}


/** A viewport that virtualizes it's scrolling with the help of `CdkVirtualForOf`. */
@Component({
  moduleId: module.id,
  selector: 'cdk-virtual-scroll-viewport',
  templateUrl: 'virtual-scroll-viewport.html',
  styleUrls: ['virtual-scroll-viewport.css'],
  host: {
    'class': 'cdk-virtual-scroll-viewport',
    '[class.cdk-virtual-scroll-orientation-horizontal]': 'orientation === "horizontal"',
    '[class.cdk-virtual-scroll-orientation-vertical]': 'orientation === "vertical"',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkVirtualScrollViewport implements DoCheck, OnInit, OnDestroy {
  /** Emits when the viewport is detached from a CdkVirtualForOf. */
  private _detachedSubject = new Subject<void>();

  /** Emits when the rendered range changes. */
  private _renderedRangeSubject = new Subject<ListRange>();

  /** The direction the viewport scrolls. */
  @Input() orientation: 'horizontal' | 'vertical' = 'vertical';

  /** The element that wraps the rendered content. */
  @ViewChild('contentWrapper') _contentWrapper: ElementRef;

  /** A stream that emits whenever the rendered range changes. */
  renderedRangeStream: Observable<ListRange> = this._renderedRangeSubject.asObservable();

  /**
   * The total size of all content (in pixels), including content that is not currently rendered.
   */
  _totalContentSize = 0;

  /** The transform used to offset the rendered content wrapper element. */
  _renderedContentTransform: SafeStyle;

  /** The raw string version of the rendered content transform. */
  private _rawRenderedContentTransform: string;

  /** The currently rendered range of indices. */
  private _renderedRange: ListRange = {start: 0, end: 0};

  /** The length of the data bound to this viewport (in number of items). */
  private _dataLength = 0;

  /** The size of the viewport (in pixels). */
  private _viewportSize = 0;

  /** The pending scroll offset to be applied during the next change detection cycle. */
  private _pendingScrollOffset: number | null;

  /** the currently attached CdkVirtualForOf. */
  private _forOf: CdkVirtualForOf<any> | null;

  /** The last rendered content offset that was set. */
  private _renderedContentOffset = 0;

  /**
   * Whether the last rendered content offset was to the end of the content (and therefore needs to
   * be rewritten as an offset to the start of the content).
   */
  private _renderedContentOffsetNeedsRewrite = false;

  /** Observable that emits when the viewport is destroyed. */
  private _destroyed = new Subject<void>();

  constructor(public elementRef: ElementRef, private _changeDetectorRef: ChangeDetectorRef,
              private _ngZone: NgZone, private _sanitizer: DomSanitizer,
              @Inject(VIRTUAL_SCROLL_STRATEGY) private _scrollStrategy: VirtualScrollStrategy) {}

  ngOnInit() {
    // It's still too early to measure the viewport at this point. Deferring with a promise allows
    // the Viewport to be rendered with the correct size before we measure.
    Promise.resolve().then(() => {
      this._measureViewportSize();
      this._scrollStrategy.attach(this);

      this._ngZone.runOutsideAngular(() => {
        fromEvent(this.elementRef.nativeElement, 'scroll')
            // Sample the scroll stream at every animation frame. This way if there are multiple
            // scroll events in the same frame we only need to recheck our layout once.
            .pipe(sampleTime(0, animationFrameScheduler), takeUntil(this._destroyed))
            .subscribe(() => this._scrollStrategy.onContentScrolled());
      });
    });
  }

  ngDoCheck() {
    // In order to batch setting the scroll offset together with other DOM writes, we wait until a
    // change detection cycle to actually apply it.
    if (this._pendingScrollOffset != null) {
      if (this.orientation === 'horizontal') {
        this.elementRef.nativeElement.scrollLeft = this._pendingScrollOffset;
      } else {
        this.elementRef.nativeElement.scrollTop = this._pendingScrollOffset;
      }
    }
  }

  ngOnDestroy() {
    this.detach();
    this._scrollStrategy.detach();
    this._destroyed.next();

    // Complete all subjects
    this._renderedRangeSubject.complete();
    this._detachedSubject.complete();
    this._destroyed.complete();
  }

  /** Attaches a `CdkVirtualForOf` to this viewport. */
  attach(forOf: CdkVirtualForOf<any>) {
    if (this._forOf) {
      throw Error('CdkVirtualScrollViewport is already attached.');
    }
    this._forOf = forOf;

    // Subscribe to the data stream of the CdkVirtualForOf to keep track of when the data length
    // changes.
    this._forOf.dataStream.pipe(takeUntil(this._detachedSubject)).subscribe(data => {
      const len = data.length;
      if (len !== this._dataLength) {
        this._dataLength = len;
        this._scrollStrategy.onDataLengthChanged();
      }
    });
  }

  /** Detaches the current `CdkVirtualForOf`. */
  detach() {
    this._forOf = null;
    this._detachedSubject.next();
  }

  /** Gets the length of the data bound to this viewport (in number of items). */
  getDataLength(): number {
    return this._dataLength;
  }

  /** Gets the size of the viewport (in pixels). */
  getViewportSize(): number {
    return this._viewportSize;
  }

  // TODO(mmalerba): This is technically out of sync with what's really rendered until a render
  // cycle happens. I'm being careful to only call it after the render cycle is complete and before
  // setting it to something else, but its error prone and should probably be split into
  // `pendingRange` and `renderedRange`, the latter reflecting whats actually in the DOM.

  /** Get the current rendered range of items. */
  getRenderedRange(): ListRange {
    return this._renderedRange;
  }

  // TODO(mmalebra): Consider calling `detectChanges()` directly rather than the methods below.

  /**
   * Sets the total size of all content (in pixels), including content that is not currently
   * rendered.
   */
  setTotalContentSize(size: number) {
    if (this._totalContentSize !== size) {
      // Re-enter the Angular zone so we can mark for change detection.
      this._ngZone.run(() => {
        this._totalContentSize = size;
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  /** Sets the currently rendered range of indices. */
  setRenderedRange(range: ListRange) {
    if (!rangesEqual(this._renderedRange, range)) {
      // Re-enter the Angular zone so we can mark for change detection.
      this._ngZone.run(() => {
        this._renderedRangeSubject.next(this._renderedRange = range);
        this._changeDetectorRef.markForCheck();
      });
      // Queue this up in a `Promise.resolve()` so that if the user makes a series of calls
      // like:
      //
      // viewport.setRenderedRange(...);
      // viewport.setTotalContentSize(...);
      // viewport.setRenderedContentOffset(...);
      //
      // The call to `onContentRendered` will happen after all of the updates have been applied.
      this._ngZone.runOutsideAngular(() => this._ngZone.onStable.pipe(take(1)).subscribe(
          () => Promise.resolve().then(() => this._scrollStrategy.onContentRendered())));
    }
  }

  /**
   * Gets the offset from the start of the viewport to the start of the rendered data (in pixels).
   */
  getOffsetToRenderedContentStart(): number | null {
    return this._renderedContentOffsetNeedsRewrite ? null : this._renderedContentOffset;
  }

  /**
   * Sets the offset from the start of the viewport to either the start or end of the rendered data
   * (in pixels).
   */
  setRenderedContentOffset(offset: number, to: 'to-start' | 'to-end' = 'to-start') {
    const axis = this.orientation === 'horizontal' ? 'X' : 'Y';
    let transform = `translate${axis}(${Number(offset)}px)`;
    this._renderedContentOffset = offset;
    if (to === 'to-end') {
      // TODO(mmalerba): The viewport should rewrite this as a `to-start` offset on the next render
      // cycle. Otherwise elements will appear to expand in the wrong direction (e.g.
      // `mat-expansion-panel` would expand upward).
      transform += ` translate${axis}(-100%)`;
      this._renderedContentOffsetNeedsRewrite = true;
    }
    if (this._rawRenderedContentTransform != transform) {
      // Re-enter the Angular zone so we can mark for change detection.
      this._ngZone.run(() => {
        // We know this value is safe because we parse `offset` with `Number()` before passing it
        // into the string.
        this._rawRenderedContentTransform = transform;
        this._renderedContentTransform = this._sanitizer.bypassSecurityTrustStyle(transform);
        this._changeDetectorRef.markForCheck();

        // If the rendered content offset was specified as an offset to the end of the content,
        // rewrite it as an offset to the start of the content.
        this._ngZone.onStable.pipe(take(1)).subscribe(() => {
          if (this._renderedContentOffsetNeedsRewrite) {
            this._renderedContentOffset -= this.measureRenderedContentSize();
            this._renderedContentOffsetNeedsRewrite = false;
            this.setRenderedContentOffset(this._renderedContentOffset);
          } else {
            this._scrollStrategy.onRenderedOffsetChanged();
          }
        });
      });
    }
  }

  /** Sets the scroll offset on the viewport. */
  setScrollOffset(offset: number) {
    // Rather than setting the offset immediately, we batch it up to be applied along with other DOM
    // writes during the next change detection cycle.
    this._ngZone.run(() => {
      this._pendingScrollOffset = offset;
      this._changeDetectorRef.markForCheck();
    });
  }

  /** Gets the current scroll offset of the viewport (in pixels). */
  measureScrollOffset(): number {
    return this.orientation === 'horizontal' ?
        this.elementRef.nativeElement.scrollLeft : this.elementRef.nativeElement.scrollTop;
  }

  /** Measure the combined size of all of the rendered items. */
  measureRenderedContentSize(): number {
    const contentEl = this._contentWrapper.nativeElement;
    return this.orientation === 'horizontal' ? contentEl.offsetWidth : contentEl.offsetHeight;
  }

  /**
   * Measure the total combined size of the given range. Throws if the range includes items that are
   * not rendered.
   */
  measureRangeSize(range: ListRange): number {
    if (!this._forOf) {
      return 0;
    }
    return this._forOf.measureRangeSize(range, this.orientation);
  }

  /** Update the viewport dimensions and re-render. */
  checkViewportSize() {
    // TODO: Cleanup later when add logic for handling content resize
    this._measureViewportSize();
    this._scrollStrategy.onDataLengthChanged();
  }

  /** Measure the viewport size. */
  private _measureViewportSize() {
    const viewportEl = this.elementRef.nativeElement;
    this._viewportSize = this.orientation === 'horizontal' ?
        viewportEl.clientWidth : viewportEl.clientHeight;
  }
}
