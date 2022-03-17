/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ArrayDataSource,
  CollectionViewer,
  DataSource,
  ListRange,
  isDataSource,
  _RecycleViewRepeaterStrategy,
  _VIEW_REPEATER_STRATEGY,
  _ViewRepeaterItemInsertArgs,
} from '@angular/cdk/collections';
import {
  Directive,
  DoCheck,
  EmbeddedViewRef,
  Inject,
  Input,
  IterableChangeRecord,
  IterableChanges,
  IterableDiffer,
  IterableDiffers,
  NgIterable,
  NgZone,
  OnDestroy,
  SkipSelf,
  TemplateRef,
  TrackByFunction,
  ViewContainerRef,
} from '@angular/core';
import {coerceNumberProperty, NumberInput} from '@angular/cdk/coercion';
import {Observable, Subject, of as observableOf, isObservable} from 'rxjs';
import {pairwise, shareReplay, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {CdkVirtualScrollRepeater} from './virtual-scroll-repeater';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';

/** The context for an item rendered by `CdkVirtualForOf` */
export type CdkVirtualForOfContext<T> = {
  /** The item value. */
  $implicit: T;
  /** The DataSource, Observable, or NgIterable that was passed to *cdkVirtualFor. */
  cdkVirtualForOf: DataSource<T> | Observable<T[]> | NgIterable<T>;
  /** The index of the item in the DataSource. */
  index: number;
  /** The number of items in the DataSource. */
  count: number;
  /** Whether this is the first item in the DataSource. */
  first: boolean;
  /** Whether this is the last item in the DataSource. */
  last: boolean;
  /** Whether the index is even. */
  even: boolean;
  /** Whether the index is odd. */
  odd: boolean;
};

/** Helper to extract the offset of a DOM Node in a certain direction. */
function getOffset(orientation: 'horizontal' | 'vertical', direction: 'start' | 'end', node: Node) {
  const el = node as Element;
  if (!el.getBoundingClientRect) {
    return 0;
  }
  const rect = el.getBoundingClientRect();

  if (orientation === 'horizontal') {
    return direction === 'start' ? rect.left : rect.right;
  }

  return direction === 'start' ? rect.top : rect.bottom;
}

/**
 * A directive similar to `ngForOf` to be used for rendering data inside a virtual scrolling
 * container.
 */
@Directive({
  selector: '[cdkVirtualFor][cdkVirtualForOf]',
  providers: [{provide: _VIEW_REPEATER_STRATEGY, useClass: _RecycleViewRepeaterStrategy}],
})
export class CdkVirtualForOf<T>
  implements CdkVirtualScrollRepeater<T>, CollectionViewer, DoCheck, OnDestroy
{
  /** Emits when the rendered view of the data changes. */
  readonly viewChange = new Subject<ListRange>();

  /** Subject that emits when a new DataSource instance is given. */
  private readonly _dataSourceChanges = new Subject<DataSource<T>>();

  /** The DataSource to display. */
  @Input()
  get cdkVirtualForOf(): DataSource<T> | Observable<T[]> | NgIterable<T> | null | undefined {
    return this._cdkVirtualForOf;
  }
  set cdkVirtualForOf(value: DataSource<T> | Observable<T[]> | NgIterable<T> | null | undefined) {
    this._cdkVirtualForOf = value;
    if (isDataSource(value)) {
      this._dataSourceChanges.next(value);
    } else {
      // If value is an an NgIterable, convert it to an array.
      this._dataSourceChanges.next(
        new ArrayDataSource<T>(isObservable(value) ? value : Array.from(value || [])),
      );
    }
  }

  _cdkVirtualForOf: DataSource<T> | Observable<T[]> | NgIterable<T> | null | undefined;

  /**
   * The `TrackByFunction` to use for tracking changes. The `TrackByFunction` takes the index and
   * the item and produces a value to be used as the item's identity when tracking changes.
   */
  @Input()
  get cdkVirtualForTrackBy(): TrackByFunction<T> | undefined {
    return this._cdkVirtualForTrackBy;
  }
  set cdkVirtualForTrackBy(fn: TrackByFunction<T> | undefined) {
    this._needsUpdate = true;
    this._cdkVirtualForTrackBy = fn
      ? (index, item) => fn(index + (this._renderedRange ? this._renderedRange.start : 0), item)
      : undefined;
  }
  private _cdkVirtualForTrackBy: TrackByFunction<T> | undefined;

  /** The template used to stamp out new elements. */
  @Input()
  set cdkVirtualForTemplate(value: TemplateRef<CdkVirtualForOfContext<T>>) {
    if (value) {
      this._needsUpdate = true;
      this._template = value;
    }
  }

  /**
   * The size of the cache used to store templates that are not being used for re-use later.
   * Setting the cache size to `0` will disable caching. Defaults to 20 templates.
   */
  @Input()
  get cdkVirtualForTemplateCacheSize(): number {
    return this._viewRepeater.viewCacheSize;
  }
  set cdkVirtualForTemplateCacheSize(size: NumberInput) {
    this._viewRepeater.viewCacheSize = coerceNumberProperty(size);
  }

  /** Emits whenever the data in the current DataSource changes. */
  readonly dataStream: Observable<readonly T[]> = this._dataSourceChanges.pipe(
    // Start off with null `DataSource`.
    startWith(null),
    // Bundle up the previous and current data sources so we can work with both.
    pairwise(),
    // Use `_changeDataSource` to disconnect from the previous data source and connect to the
    // new one, passing back a stream of data changes which we run through `switchMap` to give
    // us a data stream that emits the latest data from whatever the current `DataSource` is.
    switchMap(([prev, cur]) => this._changeDataSource(prev, cur)),
    // Replay the last emitted data when someone subscribes.
    shareReplay(1),
  );

  /** The differ used to calculate changes to the data. */
  private _differ: IterableDiffer<T> | null = null;

  /** The most recent data emitted from the DataSource. */
  private _data: readonly T[];

  /** The currently rendered items. */
  private _renderedItems: T[];

  /** The currently rendered range of indices. */
  private _renderedRange: ListRange;

  /** Whether the rendered data should be updated during the next ngDoCheck cycle. */
  private _needsUpdate = false;

  private readonly _destroyed = new Subject<void>();

  constructor(
    /** The view container to add items to. */
    private _viewContainerRef: ViewContainerRef,
    /** The template to use when stamping out new items. */
    private _template: TemplateRef<CdkVirtualForOfContext<T>>,
    /** The set of available differs. */
    private _differs: IterableDiffers,
    /** The strategy used to render items in the virtual scroll viewport. */
    @Inject(_VIEW_REPEATER_STRATEGY)
    private _viewRepeater: _RecycleViewRepeaterStrategy<T, T, CdkVirtualForOfContext<T>>,
    /** The virtual scrolling viewport that these items are being rendered in. */
    @SkipSelf() private _viewport: CdkVirtualScrollViewport,
    ngZone: NgZone,
  ) {
    this.dataStream.subscribe(data => {
      this._data = data;
      this._onRenderedDataChange();
    });
    this._viewport.renderedRangeStream.pipe(takeUntil(this._destroyed)).subscribe(range => {
      this._renderedRange = range;
      if (this.viewChange.observers.length) {
        ngZone.run(() => this.viewChange.next(this._renderedRange));
      }
      this._onRenderedDataChange();
    });
    this._viewport.attach(this);
  }

  /**
   * Measures the combined size (width for horizontal orientation, height for vertical) of all items
   * in the specified range. Throws an error if the range includes items that are not currently
   * rendered.
   */
  measureRangeSize(range: ListRange, orientation: 'horizontal' | 'vertical'): number {
    if (range.start >= range.end) {
      return 0;
    }
    if (
      (range.start < this._renderedRange.start || range.end > this._renderedRange.end) &&
      (typeof ngDevMode === 'undefined' || ngDevMode)
    ) {
      throw Error(`Error: attempted to measure an item that isn't rendered.`);
    }

    // The index into the list of rendered views for the first item in the range.
    const renderedStartIndex = range.start - this._renderedRange.start;
    // The length of the range we're measuring.
    const rangeLen = range.end - range.start;

    // Loop over all the views, find the first and land node and compute the size by subtracting
    // the top of the first node from the bottom of the last one.
    let firstNode: HTMLElement | undefined;
    let lastNode: HTMLElement | undefined;

    // Find the first node by starting from the beginning and going forwards.
    for (let i = 0; i < rangeLen; i++) {
      const view = this._viewContainerRef.get(i + renderedStartIndex) as EmbeddedViewRef<
        CdkVirtualForOfContext<T>
      > | null;
      if (view && view.rootNodes.length) {
        firstNode = lastNode = view.rootNodes[0];
        break;
      }
    }

    // Find the last node by starting from the end and going backwards.
    for (let i = rangeLen - 1; i > -1; i--) {
      const view = this._viewContainerRef.get(i + renderedStartIndex) as EmbeddedViewRef<
        CdkVirtualForOfContext<T>
      > | null;
      if (view && view.rootNodes.length) {
        lastNode = view.rootNodes[view.rootNodes.length - 1];
        break;
      }
    }

    return firstNode && lastNode
      ? getOffset(orientation, 'end', lastNode) - getOffset(orientation, 'start', firstNode)
      : 0;
  }

  ngDoCheck() {
    if (this._differ && this._needsUpdate) {
      // TODO(mmalerba): We should differentiate needs update due to scrolling and a new portion of
      // this list being rendered (can use simpler algorithm) vs needs update due to data actually
      // changing (need to do this diff).
      const changes = this._differ.diff(this._renderedItems);
      if (!changes) {
        this._updateContext();
      } else {
        this._applyChanges(changes);
      }
      this._needsUpdate = false;
    }
  }

  ngOnDestroy() {
    this._viewport.detach();

    this._dataSourceChanges.next(undefined!);
    this._dataSourceChanges.complete();
    this.viewChange.complete();

    this._destroyed.next();
    this._destroyed.complete();
    this._viewRepeater.detach();
  }

  /** React to scroll state changes in the viewport. */
  private _onRenderedDataChange() {
    if (!this._renderedRange) {
      return;
    }
    this._renderedItems = this._data.slice(this._renderedRange.start, this._renderedRange.end);
    if (!this._differ) {
      // Use a wrapper function for the `trackBy` so any new values are
      // picked up automatically without having to recreate the differ.
      this._differ = this._differs.find(this._renderedItems).create((index, item) => {
        return this.cdkVirtualForTrackBy ? this.cdkVirtualForTrackBy(index, item) : item;
      });
    }
    this._needsUpdate = true;
  }

  /** Swap out one `DataSource` for another. */
  private _changeDataSource(
    oldDs: DataSource<T> | null,
    newDs: DataSource<T> | null,
  ): Observable<readonly T[]> {
    if (oldDs) {
      oldDs.disconnect(this);
    }

    this._needsUpdate = true;
    return newDs ? newDs.connect(this) : observableOf();
  }

  /** Update the `CdkVirtualForOfContext` for all views. */
  private _updateContext() {
    const count = this._data.length;
    let i = this._viewContainerRef.length;
    while (i--) {
      const view = this._viewContainerRef.get(i) as EmbeddedViewRef<CdkVirtualForOfContext<T>>;
      view.context.index = this._renderedRange.start + i;
      view.context.count = count;
      this._updateComputedContextProperties(view.context);
      view.detectChanges();
    }
  }

  /** Apply changes to the DOM. */
  private _applyChanges(changes: IterableChanges<T>) {
    this._viewRepeater.applyChanges(
      changes,
      this._viewContainerRef,
      (
        record: IterableChangeRecord<T>,
        _adjustedPreviousIndex: number | null,
        currentIndex: number | null,
      ) => this._getEmbeddedViewArgs(record, currentIndex!),
      record => record.item,
    );

    // Update $implicit for any items that had an identity change.
    changes.forEachIdentityChange((record: IterableChangeRecord<T>) => {
      const view = this._viewContainerRef.get(record.currentIndex!) as EmbeddedViewRef<
        CdkVirtualForOfContext<T>
      >;
      view.context.$implicit = record.item;
    });

    // Update the context variables on all items.
    const count = this._data.length;
    let i = this._viewContainerRef.length;
    while (i--) {
      const view = this._viewContainerRef.get(i) as EmbeddedViewRef<CdkVirtualForOfContext<T>>;
      view.context.index = this._renderedRange.start + i;
      view.context.count = count;
      this._updateComputedContextProperties(view.context);
    }
  }

  /** Update the computed properties on the `CdkVirtualForOfContext`. */
  private _updateComputedContextProperties(context: CdkVirtualForOfContext<any>) {
    context.first = context.index === 0;
    context.last = context.index === context.count - 1;
    context.even = context.index % 2 === 0;
    context.odd = !context.even;
  }

  private _getEmbeddedViewArgs(
    record: IterableChangeRecord<T>,
    index: number,
  ): _ViewRepeaterItemInsertArgs<CdkVirtualForOfContext<T>> {
    // Note that it's important that we insert the item directly at the proper index,
    // rather than inserting it and the moving it in place, because if there's a directive
    // on the same node that injects the `ViewContainerRef`, Angular will insert another
    // comment node which can throw off the move when it's being repeated for all items.
    return {
      templateRef: this._template,
      context: {
        $implicit: record.item,
        // It's guaranteed that the iterable is not "undefined" or "null" because we only
        // generate views for elements if the "cdkVirtualForOf" iterable has elements.
        cdkVirtualForOf: this._cdkVirtualForOf!,
        index: -1,
        count: -1,
        first: false,
        last: false,
        odd: false,
        even: false,
      },
      index,
    };
  }
}
