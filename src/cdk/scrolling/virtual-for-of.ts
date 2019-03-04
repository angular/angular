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
} from '@angular/cdk/collections';
import {
  Directive,
  DoCheck,
  EmbeddedViewRef,
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
import {Observable, Subject} from 'rxjs';
import {pairwise, shareReplay, startWith, switchMap, takeUntil} from 'rxjs/operators';
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


/** Helper to extract size from a DOM Node. */
function getSize(orientation: 'horizontal' | 'vertical', node: Node): number {
  const el = node as Element;
  if (!el.getBoundingClientRect) {
    return 0;
  }
  const rect = el.getBoundingClientRect();
  return orientation == 'horizontal' ? rect.width : rect.height;
}


/**
 * A directive similar to `ngForOf` to be used for rendering data inside a virtual scrolling
 * container.
 */
@Directive({
  selector: '[cdkVirtualFor][cdkVirtualForOf]',
})
export class CdkVirtualForOf<T> implements CollectionViewer, DoCheck, OnDestroy {
  /** Emits when the rendered view of the data changes. */
  viewChange = new Subject<ListRange>();

  /** Subject that emits when a new DataSource instance is given. */
  private _dataSourceChanges = new Subject<DataSource<T>>();

  /** The DataSource to display. */
  @Input()
  get cdkVirtualForOf(): DataSource<T> | Observable<T[]> | NgIterable<T> {
    return this._cdkVirtualForOf;
  }
  set cdkVirtualForOf(value: DataSource<T> | Observable<T[]> | NgIterable<T>) {
    this._cdkVirtualForOf = value;
    const ds = isDataSource(value) ? value :
        // Slice the value if its an NgIterable to ensure we're working with an array.
        new ArrayDataSource<T>(
            value instanceof Observable ? value : Array.prototype.slice.call(value || []));
    this._dataSourceChanges.next(ds);
  }
  _cdkVirtualForOf: DataSource<T> | Observable<T[]> | NgIterable<T>;

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
    this._cdkVirtualForTrackBy = fn ?
        (index, item) => fn(index + (this._renderedRange ? this._renderedRange.start : 0), item) :
        undefined;
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
  @Input() cdkVirtualForTemplateCacheSize: number = 20;

  /** Emits whenever the data in the current DataSource changes. */
  dataStream: Observable<T[] | ReadonlyArray<T>> = this._dataSourceChanges
      .pipe(
          // Start off with null `DataSource`.
          startWith<DataSource<T>>(null!),
          // Bundle up the previous and current data sources so we can work with both.
          pairwise(),
          // Use `_changeDataSource` to disconnect from the previous data source and connect to the
          // new one, passing back a stream of data changes which we run through `switchMap` to give
          // us a data stream that emits the latest data from whatever the current `DataSource` is.
          switchMap(([prev, cur]) => this._changeDataSource(prev, cur)),
          // Replay the last emitted data when someone subscribes.
          shareReplay(1));

  /** The differ used to calculate changes to the data. */
  private _differ: IterableDiffer<T> | null = null;

  /** The most recent data emitted from the DataSource. */
  private _data: T[] | ReadonlyArray<T>;

  /** The currently rendered items. */
  private _renderedItems: T[];

  /** The currently rendered range of indices. */
  private _renderedRange: ListRange;

  /**
   * The template cache used to hold on ot template instancess that have been stamped out, but don't
   * currently need to be rendered. These instances will be reused in the future rather than
   * stamping out brand new ones.
   */
  private _templateCache: EmbeddedViewRef<CdkVirtualForOfContext<T>>[] = [];

  /** Whether the rendered data should be updated during the next ngDoCheck cycle. */
  private _needsUpdate = false;

  private _destroyed = new Subject<void>();

  constructor(
      /** The view container to add items to. */
      private _viewContainerRef: ViewContainerRef,
      /** The template to use when stamping out new items. */
      private _template: TemplateRef<CdkVirtualForOfContext<T>>,
      /** The set of available differs. */
      private _differs: IterableDiffers,
      /** The virtual scrolling viewport that these items are being rendered in. */
      @SkipSelf() private _viewport: CdkVirtualScrollViewport,
      ngZone: NgZone) {
    this.dataStream.subscribe(data => {
      this._data = data;
      this._onRenderedDataChange();
    });
    this._viewport.renderedRangeStream.pipe(takeUntil(this._destroyed)).subscribe(range => {
      this._renderedRange = range;
      ngZone.run(() => this.viewChange.next(this._renderedRange));
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
    if (range.start < this._renderedRange.start || range.end > this._renderedRange.end) {
      throw Error(`Error: attempted to measure an item that isn't rendered.`);
    }

    // The index into the list of rendered views for the first item in the range.
    const renderedStartIndex = range.start - this._renderedRange.start;
    // The length of the range we're measuring.
    const rangeLen = range.end - range.start;

    // Loop over all root nodes for all items in the range and sum up their size.
    let totalSize = 0;
    let i = rangeLen;
    while (i--) {
      const view = this._viewContainerRef.get(i + renderedStartIndex) as
          EmbeddedViewRef<CdkVirtualForOfContext<T>> | null;
      let j = view ? view.rootNodes.length : 0;
      while (j--) {
        totalSize += getSize(orientation, view!.rootNodes[j]);
      }
    }

    return totalSize;
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

    this._dataSourceChanges.complete();
    this.viewChange.complete();

    this._destroyed.next();
    this._destroyed.complete();

    for (let view of this._templateCache) {
      view.destroy();
    }
  }

  /** React to scroll state changes in the viewport. */
  private _onRenderedDataChange() {
    if (!this._renderedRange) {
      return;
    }
    this._renderedItems = this._data.slice(this._renderedRange.start, this._renderedRange.end);
    if (!this._differ) {
      this._differ = this._differs.find(this._renderedItems).create(this.cdkVirtualForTrackBy);
    }
    this._needsUpdate = true;
  }

  /** Swap out one `DataSource` for another. */
  private _changeDataSource(oldDs: DataSource<T> | null, newDs: DataSource<T>):
    Observable<T[] | ReadonlyArray<T>> {

    if (oldDs) {
      oldDs.disconnect(this);
    }

    this._needsUpdate = true;
    return newDs.connect(this);
  }

  /** Update the `CdkVirtualForOfContext` for all views. */
  private _updateContext() {
    const count = this._data.length;
    let i = this._viewContainerRef.length;
    while (i--) {
      let view = this._viewContainerRef.get(i) as EmbeddedViewRef<CdkVirtualForOfContext<T>>;
      view.context.index = this._renderedRange.start + i;
      view.context.count = count;
      this._updateComputedContextProperties(view.context);
      view.detectChanges();
    }
  }

  /** Apply changes to the DOM. */
  private _applyChanges(changes: IterableChanges<T>) {
    // Rearrange the views to put them in the right location.
    changes.forEachOperation((record: IterableChangeRecord<T>,
                              adjustedPreviousIndex: number | null,
                              currentIndex: number | null) => {
      if (record.previousIndex == null) {  // Item added.
        const view = this._insertViewForNewItem(currentIndex!);
        view.context.$implicit = record.item;
      } else if (currentIndex == null) {  // Item removed.
        this._cacheView(this._detachView(adjustedPreviousIndex !));
      } else {  // Item moved.
        const view = this._viewContainerRef.get(adjustedPreviousIndex!) as
            EmbeddedViewRef<CdkVirtualForOfContext<T>>;
        this._viewContainerRef.move(view, currentIndex);
        view.context.$implicit = record.item;
      }
    });

    // Update $implicit for any items that had an identity change.
    changes.forEachIdentityChange((record: IterableChangeRecord<T>) => {
      const view = this._viewContainerRef.get(record.currentIndex!) as
          EmbeddedViewRef<CdkVirtualForOfContext<T>>;
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

  /** Cache the given detached view. */
  private _cacheView(view: EmbeddedViewRef<CdkVirtualForOfContext<T>>) {
    if (this._templateCache.length < this.cdkVirtualForTemplateCacheSize) {
      this._templateCache.push(view);
    } else {
      const index = this._viewContainerRef.indexOf(view);

      // It's very unlikely that the index will ever be -1, but just in case,
      // destroy the view on its own, otherwise destroy it through the
      // container to ensure that all the references are removed.
      if (index === -1) {
        view.destroy();
      } else {
        this._viewContainerRef.remove(index);
      }
    }
  }

  /** Inserts a view for a new item, either from the cache or by creating a new one. */
  private _insertViewForNewItem(index: number): EmbeddedViewRef<CdkVirtualForOfContext<T>> {
    return this._insertViewFromCache(index) || this._createEmbeddedViewAt(index);
  }

  /** Update the computed properties on the `CdkVirtualForOfContext`. */
  private _updateComputedContextProperties(context: CdkVirtualForOfContext<any>) {
    context.first = context.index === 0;
    context.last = context.index === context.count - 1;
    context.even = context.index % 2 === 0;
    context.odd = !context.even;
  }

  /** Creates a new embedded view and moves it to the given index */
  private _createEmbeddedViewAt(index: number): EmbeddedViewRef<CdkVirtualForOfContext<T>> {
    const view = this._viewContainerRef.createEmbeddedView(this._template, {
        $implicit: null!,
        cdkVirtualForOf: this._cdkVirtualForOf,
        index: -1,
        count: -1,
        first: false,
        last: false,
        odd: false,
        even: false
    });
    if (index < this._viewContainerRef.length) {
      this._viewContainerRef.move(view, index);
    }
    return view;
  }

  /** Inserts a recycled view from the cache at the given index. */
  private _insertViewFromCache(index: number): EmbeddedViewRef<CdkVirtualForOfContext<T>>|null {
    const cachedView = this._templateCache.pop();
    if (cachedView) {
      this._viewContainerRef.insert(cachedView, index);
    }
    return cachedView || null;
  }

  /** Detaches the embedded view at the given index. */
  private _detachView(index: number): EmbeddedViewRef<CdkVirtualForOfContext<T>> {
    return this._viewContainerRef.detach(index) as
        EmbeddedViewRef<CdkVirtualForOfContext<T>>;
  }
}
