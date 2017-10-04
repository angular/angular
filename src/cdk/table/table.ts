/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  Input,
  isDevMode,
  IterableChangeRecord,
  IterableDiffer,
  IterableDiffers,
  NgIterable,
  QueryList,
  Renderer2,
  TrackByFunction,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {CdkCellOutlet, CdkCellOutletRowContext, CdkHeaderRowDef, CdkRowDef} from './row';
import {takeUntil} from 'rxjs/operator/takeUntil';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';
import {CdkCellDef, CdkColumnDef, CdkHeaderCellDef} from './cell';
import {
  getTableDuplicateColumnNameError, getTableMissingMatchingRowDefError,
  getTableMultipleDefaultRowDefsError,
  getTableUnknownColumnError
} from './table-errors';

/**
 * Provides a handle for the table to grab the view container's ng-container to insert data rows.
 * @docs-private
 */
@Directive({selector: '[rowPlaceholder]'})
export class RowPlaceholder {
  constructor(public viewContainer: ViewContainerRef) { }
}

/**
 * Provides a handle for the table to grab the view container's ng-container to insert the header.
 * @docs-private
 */
@Directive({selector: '[headerRowPlaceholder]'})
export class HeaderRowPlaceholder {
  constructor(public viewContainer: ViewContainerRef) { }
}

/**
 * The table template that can be used by the mat-table. Should not be used outside of the
 * material library.
 */
export const CDK_TABLE_TEMPLATE = `
  <ng-container headerRowPlaceholder></ng-container>
  <ng-container rowPlaceholder></ng-container>`;

/**
 * A data table that connects with a data source to retrieve data of type `T` and renders
 * a header row and data rows. Updates the rows when new data is provided by the data source.
 */
@Component({
  moduleId: module.id,
  selector: 'cdk-table',
  exportAs: 'cdkTable',
  template: CDK_TABLE_TEMPLATE,
  host: {
    'class': 'cdk-table',
  },
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkTable<T> implements CollectionViewer {
  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

  /** Latest data provided by the data source through the connect interface. */
  private _data: NgIterable<T> = [];

  /** Subscription that listens for the data provided by the data source. */
  private _renderChangeSubscription: Subscription | null;

  /** Map of all the user's defined columns (header and data cell template) identified by name. */
  private _columnDefsByName = new Map<string,  CdkColumnDef>();

  /** Differ used to find the changes in the data provided by the data source. */
  private _dataDiffer: IterableDiffer<T>;

  /** Stores the row definition that does not have a when predicate. */
  private _defaultRowDef: CdkRowDef<T> | null;

  /**
   * Tracking function that will be used to check the differences in data changes. Used similarly
   * to `ngFor` `trackBy` function. Optimize row operations by identifying a row based on its data
   * relative to the function to know if a row should be added/removed/moved.
   * Accepts a function that takes two parameters, `index` and `item`.
   */
  @Input()
  set trackBy(fn: TrackByFunction<T>) {
    if (isDevMode() &&
        fn != null && typeof fn !== 'function' &&
        <any>console && <any>console.warn) {
        console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}.`);
    }
    this._trackByFn = fn;
  }
  get trackBy(): TrackByFunction<T> { return this._trackByFn; }
  private _trackByFn: TrackByFunction<T>;

  /**
   * Provides a stream containing the latest data array to render. Influenced by the table's
   * stream of view window (what rows are currently on screen).
   */
  @Input()
  get dataSource(): DataSource<T> { return this._dataSource; }
  set dataSource(dataSource: DataSource<T>) {
    if (this._dataSource !== dataSource) {
      this._switchDataSource(dataSource);
    }
  }
  private _dataSource: DataSource<T>;

  // TODO(andrewseguin): Remove max value as the end index
  //   and instead calculate the view on init and scroll.
  /**
   * Stream containing the latest information on what rows are being displayed on screen.
   * Can be used by the data source to as a heuristic of what data should be provided.
   */
  viewChange =
      new BehaviorSubject<{start: number, end: number}>({start: 0, end: Number.MAX_VALUE});

  // Placeholders within the table's template where the header and data rows will be inserted.
  @ViewChild(RowPlaceholder) _rowPlaceholder: RowPlaceholder;
  @ViewChild(HeaderRowPlaceholder) _headerRowPlaceholder: HeaderRowPlaceholder;

  /**
   * The column definitions provided by the user that contain what the header and cells should
   * render for each column.
   */
  @ContentChildren(CdkColumnDef) _columnDefs: QueryList<CdkColumnDef>;

  /** Template definition used as the header container. */
  @ContentChild(CdkHeaderRowDef) _headerDef: CdkHeaderRowDef;

  /** Set of template definitions that used as the data row containers. */
  @ContentChildren(CdkRowDef) _rowDefs: QueryList<CdkRowDef<T>>;

  constructor(private readonly _differs: IterableDiffers,
              private readonly _changeDetectorRef: ChangeDetectorRef,
              elementRef: ElementRef,
              renderer: Renderer2,
              @Attribute('role') role: string) {
    if (!role) {
      renderer.setAttribute(elementRef.nativeElement, 'role', 'grid');
    }
  }

  ngOnInit() {
    // TODO(andrewseguin): Setup a listener for scrolling, emit the calculated view to viewChange
    this._dataDiffer = this._differs.find([]).create(this._trackByFn);
  }

  ngAfterContentInit() {
    this._cacheColumnDefsByName();
    this._columnDefs.changes.subscribe(() => this._cacheColumnDefsByName());
    this._renderHeaderRow();
  }

  ngAfterContentChecked() {
    this._renderUpdatedColumns();

    const defaultRowDefs = this._rowDefs.filter(def => !def.when);
    if (defaultRowDefs.length > 1) { throw getTableMultipleDefaultRowDefsError(); }
    this._defaultRowDef = defaultRowDefs[0];

    if (this.dataSource && !this._renderChangeSubscription) {
      this._observeRenderChanges();
    }
  }

  ngOnDestroy() {
    this._rowPlaceholder.viewContainer.clear();
    this._headerRowPlaceholder.viewContainer.clear();
    this._onDestroy.next();
    this._onDestroy.complete();

    if (this.dataSource) {
      this.dataSource.disconnect(this);
    }
  }

  /** Update the map containing the content's column definitions. */
  private _cacheColumnDefsByName() {
    this._columnDefsByName.clear();
    this._columnDefs.forEach(columnDef => {
      if (this._columnDefsByName.has(columnDef.name)) {
        throw getTableDuplicateColumnNameError(columnDef.name);
      }
      this._columnDefsByName.set(columnDef.name, columnDef);
    });
  }

  /**
   * Check if the header or rows have changed what columns they want to display. If there is a diff,
   * then re-render that section.
   */
  private _renderUpdatedColumns() {
    // Re-render the rows when the row definition columns change.
    this._rowDefs.forEach(def => {
      if (!!def.getColumnsDiff()) {
        // Reset the data to an empty array so that renderRowChanges will re-render all new rows.
        this._dataDiffer.diff([]);

        this._rowPlaceholder.viewContainer.clear();
        this._renderRowChanges();
      }
    });

    // Re-render the header row if there is a difference in its columns.
    if (this._headerDef.getColumnsDiff()) {
      this._headerRowPlaceholder.viewContainer.clear();
      this._renderHeaderRow();
    }
  }

  /**
   * Switch to the provided data source by resetting the data and unsubscribing from the current
   * render change subscription if one exists. If the data source is null, interpret this by
   * clearing the row placeholder. Otherwise start listening for new data.
   */
  private _switchDataSource(dataSource: DataSource<T>) {
    this._data = [];

    if (this.dataSource) {
      this.dataSource.disconnect(this);
    }

    // Stop listening for data from the previous data source.
    if (this._renderChangeSubscription) {
      this._renderChangeSubscription.unsubscribe();
      this._renderChangeSubscription = null;
    }

    // Remove the table's rows if there is now no data source
    if (!dataSource) {
      this._rowPlaceholder.viewContainer.clear();
    }

    this._dataSource = dataSource;
  }

  /** Set up a subscription for the data provided by the data source. */
  private _observeRenderChanges() {
    this._renderChangeSubscription = takeUntil.call(this.dataSource.connect(this), this._onDestroy)
      .subscribe(data => {
        this._data = data;
        this._renderRowChanges();
      });
  }

  /**
   * Create the embedded view for the header template and place it in the header row view container.
   */
  private _renderHeaderRow() {
    const cells = this._getHeaderCellTemplatesForRow(this._headerDef);
    if (!cells.length) { return; }

    // TODO(andrewseguin): add some code to enforce that exactly
    //   one CdkCellOutlet was instantiated as a result
    //   of `createEmbeddedView`.
    this._headerRowPlaceholder.viewContainer
        .createEmbeddedView(this._headerDef.template, {cells});

    cells.forEach(cell => {
      CdkCellOutlet.mostRecentCellOutlet._viewContainer.createEmbeddedView(cell.template, {});
    });

    this._changeDetectorRef.markForCheck();
  }

  /** Check for changes made in the data and render each change (row added/removed/moved). */
  private _renderRowChanges() {
    const changes = this._dataDiffer.diff(this._data);
    if (!changes) { return; }

    const viewContainer = this._rowPlaceholder.viewContainer;
    changes.forEachOperation(
        (item: IterableChangeRecord<any>, adjustedPreviousIndex: number, currentIndex: number) => {
          if (item.previousIndex == null) {
            this._insertRow(this._data[currentIndex], currentIndex);
          } else if (currentIndex == null) {
            viewContainer.remove(adjustedPreviousIndex);
          } else {
            const view = viewContainer.get(adjustedPreviousIndex);
            viewContainer.move(view!, currentIndex);
          }
        });

    this._updateRowContext();
  }

  /**
   * Finds the matching row definition that should be used for this row data. If there is only
   * one row definition, it is returned. Otherwise, find the row definition that has a when
   * predicate that returns true with the data. If none return true, return the default row
   * definition.
   */
  _getRowDef(data: T, i: number): CdkRowDef<T> {
    if (this._rowDefs.length == 1) { return this._rowDefs.first; }

    let rowDef = this._rowDefs.find(def => def.when && def.when(data, i)) || this._defaultRowDef;
    if (!rowDef) { throw getTableMissingMatchingRowDefError(); }

    return rowDef;
  }

  /**
   * Create the embedded view for the data row template and place it in the correct index location
   * within the data row view container.
   */
  private _insertRow(rowData: T, index: number) {
    const row = this._getRowDef(rowData, index);

    // Row context that will be provided to both the created embedded row view and its cells.
    const context: CdkCellOutletRowContext<T> = {$implicit: rowData};

    // TODO(andrewseguin): add some code to enforce that exactly one
    //   CdkCellOutlet was instantiated as a result  of `createEmbeddedView`.
    this._rowPlaceholder.viewContainer.createEmbeddedView(row.template, context, index);

    // Insert empty cells if there is no data to improve rendering time.
    const cells = rowData ? this._getCellTemplatesForRow(row) : [];

    cells.forEach(cell => {
      CdkCellOutlet.mostRecentCellOutlet._viewContainer.createEmbeddedView(cell.template, context);
    });

    this._changeDetectorRef.markForCheck();
  }

  /**
   * Updates the context for each row to reflect any data changes that may have caused
   * rows to be added, removed, or moved. The view container contains the same context
   * that was provided to each of its cells.
   */
  private _updateRowContext() {
    const viewContainer = this._rowPlaceholder.viewContainer;
    for (let index = 0, count = viewContainer.length; index < count; index++) {
      const viewRef = viewContainer.get(index) as EmbeddedViewRef<CdkCellOutletRowContext<T>>;
      viewRef.context.index = index;
      viewRef.context.count = count;
      viewRef.context.first = index === 0;
      viewRef.context.last = index === count - 1;
      viewRef.context.even = index % 2 === 0;
      viewRef.context.odd = !viewRef.context.even;
    }
  }

  /**
   * Returns the cell template definitions to insert into the header
   * as defined by its list of columns to display.
   */
  private _getHeaderCellTemplatesForRow(headerDef: CdkHeaderRowDef): CdkHeaderCellDef[] {
    if (!headerDef.columns) { return []; }
    return headerDef.columns.map(columnId => {
      const column = this._columnDefsByName.get(columnId);

      if (!column) {
        throw getTableUnknownColumnError(columnId);
      }

      return column.headerCell;
    });
  }

  /**
   * Returns the cell template definitions to insert in the provided row
   * as defined by its list of columns to display.
   */
  private _getCellTemplatesForRow(rowDef: CdkRowDef<T>): CdkCellDef[] {
    if (!rowDef.columns) { return []; }
    return rowDef.columns.map(columnId => {
      const column = this._columnDefsByName.get(columnId);

      if (!column) {
        throw getTableUnknownColumnError(columnId);
      }

      return column.cell;
    });
  }
}

