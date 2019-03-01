/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {ListRange} from '@angular/cdk/collections';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {animationFrameScheduler, asapScheduler, Observable, Subject, Observer} from 'rxjs';
import {auditTime, startWith, takeUntil} from 'rxjs/operators';
import {ScrollDispatcher} from './scroll-dispatcher';
import {CdkScrollable, ExtendedScrollToOptions} from './scrollable';
import {CdkVirtualForOf} from './virtual-for-of';
import {VIRTUAL_SCROLL_STRATEGY, VirtualScrollStrategy} from './virtual-scroll-strategy';


/** Checks if the given ranges are equal. */
function rangesEqual(r1: ListRange, r2: ListRange): boolean {
  return r1.start == r2.start && r1.end == r2.end;
}

/**
 * Scheduler to be used for scroll events. Needs to fall back to
 * something that doesn't rely on requestAnimationFrame on environments
 * that don't support it (e.g. server-side rendering).
 */
const SCROLL_SCHEDULER =
    typeof requestAnimationFrame !== 'undefined' ? animationFrameScheduler : asapScheduler;


/** A viewport that virtualizes it's scrolling with the help of `CdkVirtualForOf`. */
@Component({
  moduleId: module.id,
  selector: 'cdk-virtual-scroll-viewport',
  templateUrl: 'virtual-scroll-viewport.html',
  styleUrls: ['virtual-scroll-viewport.css'],
  host: {
    'class': 'cdk-virtual-scroll-viewport',
    '[class.cdk-virtual-scroll-orientation-horizontal]': 'orientation === "horizontal"',
    '[class.cdk-virtual-scroll-orientation-vertical]': 'orientation !== "horizontal"',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: CdkScrollable,
    useExisting: CdkVirtualScrollViewport,
  }]
})
export class CdkVirtualScrollViewport extends CdkScrollable implements OnInit, OnDestroy {
  /** Emits when the viewport is detached from a CdkVirtualForOf. */
  private _detachedSubject = new Subject<void>();

  /** Emits when the rendered range changes. */
  private _renderedRangeSubject = new Subject<ListRange>();

  /** The direction the viewport scrolls. */
  @Input() orientation: 'horizontal' | 'vertical' = 'vertical';

  // Note: we don't use the typical EventEmitter here because we need to subscribe to the scroll
  // strategy lazily (i.e. only if the user is actually listening to the events). We do this because
  // depending on how the strategy calculates the scrolled index, it may come at a cost to
  // performance.
  /** Emits when the index of the first element visible in the viewport changes. */
  @Output() scrolledIndexChange: Observable<number> =
      new Observable((observer: Observer<number>) =>
        this._scrollStrategy.scrolledIndexChange.subscribe(index =>
            Promise.resolve().then(() => this.ngZone.run(() => observer.next(index)))));

  /** The element that wraps the rendered content. */
  @ViewChild('contentWrapper', {static: true}) _contentWrapper: ElementRef<HTMLElement>;

  /** A stream that emits whenever the rendered range changes. */
  renderedRangeStream: Observable<ListRange> = this._renderedRangeSubject.asObservable();

  /**
   * The transform used to scale the spacer to the same size as all content, including content that
   * is not currently rendered.
   */
  _totalContentSizeTransform = '';

  /**
   * The total size of all content (in pixels), including content that is not currently rendered.
   */
  private _totalContentSize = 0;

  /**
   * The CSS transform applied to the rendered subset of items so that they appear within the bounds
   * of the visible viewport.
   */
  private _renderedContentTransform: string;

  /** The currently rendered range of indices. */
  private _renderedRange: ListRange = {start: 0, end: 0};

  /** The length of the data bound to this viewport (in number of items). */
  private _dataLength = 0;

  /** The size of the viewport (in pixels). */
  private _viewportSize = 0;

  /** the currently attached CdkVirtualForOf. */
  private _forOf: CdkVirtualForOf<any> | null;

  /** The last rendered content offset that was set. */
  private _renderedContentOffset = 0;

  /**
   * Whether the last rendered content offset was to the end of the content (and therefore needs to
   * be rewritten as an offset to the start of the content).
   */
  private _renderedContentOffsetNeedsRewrite = false;

  /** Whether there is a pending change detection cycle. */
  private _isChangeDetectionPending = false;

  /** A list of functions to run after the next change detection cycle. */
  private _runAfterChangeDetection: Function[] = [];

  constructor(public elementRef: ElementRef<HTMLElement>,
              private _changeDetectorRef: ChangeDetectorRef,
              ngZone: NgZone,
              @Optional() @Inject(VIRTUAL_SCROLL_STRATEGY)
                  private _scrollStrategy: VirtualScrollStrategy,
              @Optional() dir: Directionality,
              scrollDispatcher: ScrollDispatcher) {
    super(elementRef, scrollDispatcher, ngZone, dir);

    if (!_scrollStrategy) {
      throw Error('Error: cdk-virtual-scroll-viewport requires the "itemSize" property to be set.');
    }
  }

  ngOnInit() {
    super.ngOnInit();

    // It's still too early to measure the viewport at this point. Deferring with a promise allows
    // the Viewport to be rendered with the correct size before we measure. We run this outside the
    // zone to avoid causing more change detection cycles. We handle the change detection loop
    // ourselves instead.
    this.ngZone.runOutsideAngular(() => Promise.resolve().then(() => {
      this._measureViewportSize();
      this._scrollStrategy.attach(this);

      this.elementScrolled()
          .pipe(
              // Start off with a fake scroll event so we properly detect our initial position.
              startWith<Event | null>(null!),
              // Collect multiple events into one until the next animation frame. This way if
              // there are multiple scroll events in the same frame we only need to recheck
              // our layout once.
              auditTime(0, SCROLL_SCHEDULER))
          .subscribe(() => this._scrollStrategy.onContentScrolled());

      this._markChangeDetectionNeeded();
    }));
  }

  ngOnDestroy() {
    this.detach();
    this._scrollStrategy.detach();

    // Complete all subjects
    this._renderedRangeSubject.complete();
    this._detachedSubject.complete();

    super.ngOnDestroy();
  }

  /** Attaches a `CdkVirtualForOf` to this viewport. */
  attach(forOf: CdkVirtualForOf<any>) {
    if (this._forOf) {
      throw Error('CdkVirtualScrollViewport is already attached.');
    }

    // Subscribe to the data stream of the CdkVirtualForOf to keep track of when the data length
    // changes. Run outside the zone to avoid triggering change detection, since we're managing the
    // change detection loop ourselves.
    this.ngZone.runOutsideAngular(() => {
      this._forOf = forOf;
      this._forOf.dataStream.pipe(takeUntil(this._detachedSubject)).subscribe(data => {
        const newLength = data.length;
        if (newLength !== this._dataLength) {
          this._dataLength = newLength;
          this._scrollStrategy.onDataLengthChanged();
        }
        this._doChangeDetection();
      });
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

  /**
   * Sets the total size of all content (in pixels), including content that is not currently
   * rendered.
   */
  setTotalContentSize(size: number) {
    if (this._totalContentSize !== size) {
      this._totalContentSize = size;
      const axis = this.orientation == 'horizontal' ? 'X' : 'Y';
      this._totalContentSizeTransform = `scale${axis}(${this._totalContentSize})`;
      this._markChangeDetectionNeeded();
    }
  }

  /** Sets the currently rendered range of indices. */
  setRenderedRange(range: ListRange) {
    if (!rangesEqual(this._renderedRange, range)) {
      this._renderedRangeSubject.next(this._renderedRange = range);
      this._markChangeDetectionNeeded(() => this._scrollStrategy.onContentRendered());
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
    // For a horizontal viewport in a right-to-left language we need to translate along the x-axis
    // in the negative direction.
    const isRtl = this.dir && this.dir.value == 'rtl';
    const isHorizontal = this.orientation == 'horizontal';
    const axis = isHorizontal ? 'X' : 'Y';
    const axisDirection = isHorizontal && isRtl ? -1 : 1;
    let transform = `translate${axis}(${Number(axisDirection * offset)}px)`;
    this._renderedContentOffset = offset;
    if (to === 'to-end') {
      transform += ` translate${axis}(-100%)`;
      // The viewport should rewrite this as a `to-start` offset on the next render cycle. Otherwise
      // elements will appear to expand in the wrong direction (e.g. `mat-expansion-panel` would
      // expand upward).
      this._renderedContentOffsetNeedsRewrite = true;
    }
    if (this._renderedContentTransform != transform) {
      // We know this value is safe because we parse `offset` with `Number()` before passing it
      // into the string.
      this._renderedContentTransform = transform;
      this._markChangeDetectionNeeded(() => {
        if (this._renderedContentOffsetNeedsRewrite) {
          this._renderedContentOffset -= this.measureRenderedContentSize();
          this._renderedContentOffsetNeedsRewrite = false;
          this.setRenderedContentOffset(this._renderedContentOffset);
        } else {
          this._scrollStrategy.onRenderedOffsetChanged();
        }
      });
    }
  }

  /**
   * Scrolls to the given offset from the start of the viewport. Please note that this is not always
   * the same as setting `scrollTop` or `scrollLeft`. In a horizontal viewport with right-to-left
   * direction, this would be the equivalent of setting a fictional `scrollRight` property.
   * @param offset The offset to scroll to.
   * @param behavior The ScrollBehavior to use when scrolling. Default is behavior is `auto`.
   */
  scrollToOffset(offset: number, behavior: ScrollBehavior = 'auto') {
    const options: ExtendedScrollToOptions = {behavior};
    if (this.orientation === 'horizontal') {
      options.start = offset;
    } else {
      options.top = offset;
    }
    this.scrollTo(options);
  }

  /**
   * Scrolls to the offset for the given index.
   * @param index The index of the element to scroll to.
   * @param behavior The ScrollBehavior to use when scrolling. Default is behavior is `auto`.
   */
  scrollToIndex(index: number,  behavior: ScrollBehavior = 'auto') {
    this._scrollStrategy.scrollToIndex(index, behavior);
  }

  /**
   * Gets the current scroll offset from the start of the viewport (in pixels).
   * @param from The edge to measure the offset from. Defaults to 'top' in vertical mode and 'start'
   *     in horizontal mode.
   */
  measureScrollOffset(from?: 'top' | 'left' | 'right' | 'bottom' | 'start' | 'end'): number {
    return super.measureScrollOffset(
        from ? from : this.orientation === 'horizontal' ? 'start' : 'top');
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

  /** Queue up change detection to run. */
  private _markChangeDetectionNeeded(runAfter?: Function) {
    if (runAfter) {
      this._runAfterChangeDetection.push(runAfter);
    }

    // Use a Promise to batch together calls to `_doChangeDetection`. This way if we set a bunch of
    // properties sequentially we only have to run `_doChangeDetection` once at the end.
    if (!this._isChangeDetectionPending) {
      this._isChangeDetectionPending = true;
      this.ngZone.runOutsideAngular(() => Promise.resolve().then(() => {
        this._doChangeDetection();
      }));
    }
  }

  /** Run change detection. */
  private _doChangeDetection() {
    this._isChangeDetectionPending = false;

    // Apply changes to Angular bindings. Note: We must call `markForCheck` to run change detection
    // from the root, since the repeated items are content projected in. Calling `detectChanges`
    // instead does not properly check the projected content.
    this.ngZone.run(() => this._changeDetectorRef.markForCheck());
    // Apply the content transform. The transform can't be set via an Angular binding because
    // bypassSecurityTrustStyle is banned in Google. However the value is safe, it's composed of
    // string literals, a variable that can only be 'X' or 'Y', and user input that is run through
    // the `Number` function first to coerce it to a numeric value.
    this._contentWrapper.nativeElement.style.transform = this._renderedContentTransform;

    const runAfterChangeDetection = this._runAfterChangeDetection;
    this._runAfterChangeDetection = [];
    for (const fn of runAfterChangeDetection) {
      fn();
    }
  }
}
