/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Direction, Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {CollectionViewer, DataSource, isDataSource} from '@angular/cdk/collections';
import {Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {
  AfterContentChecked,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  Inject,
  Input,
  isDevMode,
  IterableChangeRecord,
  IterableDiffer,
  IterableDiffers,
  OnDestroy,
  OnInit,
  Optional,
  QueryList,
  TemplateRef,
  TrackByFunction,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {BehaviorSubject, Observable, of as observableOf, Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CdkColumnDef} from './cell';
import {
  BaseRowDef,
  CdkCellOutlet,
  CdkCellOutletMultiRowContext,
  CdkCellOutletRowContext,
  CdkFooterRowDef,
  CdkHeaderRowDef,
  CdkRowDef
} from './row';
import {StickyStyler} from './sticky-styler';
import {
  getTableDuplicateColumnNameError,
  getTableMissingMatchingRowDefError,
  getTableMissingRowDefsError,
  getTableMultipleDefaultRowDefsError,
  getTableUnknownColumnError,
  getTableUnknownDataSourceError
} from './table-errors';

/** Interface used to provide an outlet for rows to be inserted into. */
export interface RowOutlet {
  viewContainer: ViewContainerRef;
}

/**
 * Union of the types that can be set as the data source for a `CdkTable`.
 * @docs-private
 */
type CdkTableDataSourceInput<T> =
    DataSource<T>|Observable<ReadonlyArray<T>|T[]>|ReadonlyArray<T>|T[];

/**
 * Provides a handle for the table to grab the view container's ng-container to insert data rows.
 * @docs-private
 */
@Directive({selector: '[rowOutlet]'})
export class DataRowOutlet implements RowOutlet {
  constructor(public viewContainer: ViewContainerRef, public elementRef: ElementRef) {}
}

/**
 * Provides a handle for the table to grab the view container's ng-container to insert the header.
 * @docs-private
 */
@Directive({selector: '[headerRowOutlet]'})
export class HeaderRowOutlet implements RowOutlet {
  constructor(public viewContainer: ViewContainerRef, public elementRef: ElementRef) {}
}

/**
 * Provides a handle for the table to grab the view container's ng-container to insert the footer.
 * @docs-private
 */
@Directive({selector: '[footerRowOutlet]'})
export class FooterRowOutlet implements RowOutlet {
  constructor(public viewContainer: ViewContainerRef, public elementRef: ElementRef) {}
}

/**
 * The table template that can be used by the mat-table. Should not be used outside of the
 * material library.
 * @docs-private
 */
export const CDK_TABLE_TEMPLATE =
    // Note that according to MDN, the `caption` element has to be projected as the **first**
    // element in the table. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/caption
    `
  <ng-content select="caption"></ng-content>
  <ng-container headerRowOutlet></ng-container>
  <ng-container rowOutlet></ng-container>
  <ng-container footerRowOutlet></ng-container>
`;

/**
 * Interface used to conveniently type the possible context interfaces for the render row.
 * @docs-private
 */
export interface RowContext<T> extends CdkCellOutletMultiRowContext<T>,
                                       CdkCellOutletRowContext<T> {}

/**
 * Class used to conveniently type the embedded view ref for rows with a context.
 * @docs-private
 */
abstract class RowViewRef<T> extends EmbeddedViewRef<RowContext<T>> {}

/**
 * Set of properties that represents the identity of a single rendered row.
 *
 * When the table needs to determine the list of rows to render, it will do so by iterating through
 * each data object and evaluating its list of row templates to display (when multiTemplateDataRows
 * is false, there is only one template per data object). For each pair of data object and row
 * template, a `RenderRow` is added to the list of rows to render. If the data object and row
 * template pair has already been rendered, the previously used `RenderRow` is added; else a new
 * `RenderRow` is * created. Once the list is complete and all data objects have been itereated
 * through, a diff is performed to determine the changes that need to be made to the rendered rows.
 *
 * @docs-private
 */
export interface RenderRow<T> {
  data: T;
  dataIndex: number;
  rowDef: CdkRowDef<T>;
}

/**
 * A data table that can render a header row, data rows, and a footer row.
 * Uses the dataSource input to determine the data to be rendered. The data can be provided either
 * as a data array, an Observable stream that emits the data array to render, or a DataSource with a
 * connect function that will return an Observable stream that emits the data array to render.
 */
@Component({
  moduleId: module.id,
  selector: 'cdk-table, table[cdk-table]',
  exportAs: 'cdkTable',
  template: CDK_TABLE_TEMPLATE,
  host: {
    'class': 'cdk-table',
  },
  encapsulation: ViewEncapsulation.None,
  // The "OnPush" status for the `MatTable` component is effectively a noop, so we are removing it.
  // The view for `MatTable` consists entirely of templates declared in other views. As they are
  // declared elsewhere, they are checked when their declaration points are checked.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CdkTable<T> implements AfterContentChecked, CollectionViewer, OnDestroy, OnInit {
  private _document: Document;

  /** Latest data provided by the data source. */
  protected _data: T[]|ReadonlyArray<T>;

  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

  /** List of the rendered rows as identified by their `RenderRow` object. */
  private _renderRows: RenderRow<T>[];

  /** Subscription that listens for the data provided by the data source. */
  private _renderChangeSubscription: Subscription|null;

  /**
   * Map of all the user's defined columns (header, data, and footer cell template) identified by
   * name. Collection populated by the column definitions gathered by `ContentChildren` as well as
   * any custom column definitions added to `_customColumnDefs`.
   */
  private _columnDefsByName = new Map<string, CdkColumnDef>();

  /**
   * Set of all row definitions that can be used by this table. Populated by the rows gathered by
   * using `ContentChildren` as well as any custom row definitions added to `_customRowDefs`.
   */
  private _rowDefs: CdkRowDef<T>[];

  /**
   * Set of all header row definitions that can be used by this table. Populated by the rows
   * gathered by using `ContentChildren` as well as any custom row definitions added to
   * `_customHeaderRowDefs`.
   */
  private _headerRowDefs: CdkHeaderRowDef[];

  /**
   * Set of all row definitions that can be used by this table. Populated by the rows gathered by
   * using `ContentChildren` as well as any custom row definitions added to
   * `_customFooterRowDefs`.
   */
  private _footerRowDefs: CdkFooterRowDef[];

  /** Differ used to find the changes in the data provided by the data source. */
  private _dataDiffer: IterableDiffer<RenderRow<T>>;

  /** Stores the row definition that does not have a when predicate. */
  private _defaultRowDef: CdkRowDef<T>|null;

  /**
   * Column definitions that were defined outside of the direct content children of the table.
   * These will be defined when, e.g., creating a wrapper around the cdkTable that has
   * column definitions as *it's* content child.
   */
  private _customColumnDefs = new Set<CdkColumnDef>();

  /**
   * Data row definitions that were defined outside of the direct content children of the table.
   * These will be defined when, e.g., creating a wrapper around the cdkTable that has
   * built-in data rows as *it's* content child.
   */
  private _customRowDefs = new Set<CdkRowDef<T>>();

  /**
   * Header row definitions that were defined outside of the direct content children of the table.
   * These will be defined when, e.g., creating a wrapper around the cdkTable that has
   * built-in header rows as *it's* content child.
   */
  private _customHeaderRowDefs = new Set<CdkHeaderRowDef>();

  /**
   * Footer row definitions that were defined outside of the direct content children of the table.
   * These will be defined when, e.g., creating a wrapper around the cdkTable that has a
   * built-in footer row as *it's* content child.
   */
  private _customFooterRowDefs = new Set<CdkFooterRowDef>();

  /**
   * Whether the header row definition has been changed. Triggers an update to the header row after
   * content is checked. Initialized as true so that the table renders the initial set of rows.
   */
  private _headerRowDefChanged = true;

  /**
   * Whether the footer row definition has been changed. Triggers an update to the footer row after
   * content is checked. Initialized as true so that the table renders the initial set of rows.
   */
  private _footerRowDefChanged = true;

  /**
   * Cache of the latest rendered `RenderRow` objects as a map for easy retrieval when constructing
   * a new list of `RenderRow` objects for rendering rows. Since the new list is constructed with
   * the cached `RenderRow` objects when possible, the row identity is preserved when the data
   * and row template matches, which allows the `IterableDiffer` to check rows by reference
   * and understand which rows are added/moved/removed.
   *
   * Implemented as a map of maps where the first key is the `data: T` object and the second is the
   * `CdkRowDef<T>` object. With the two keys, the cache points to a `RenderRow<T>` object that
   * contains an array of created pairs. The array is necessary to handle cases where the data
   * array contains multiple duplicate data objects and each instantiated `RenderRow` must be
   * stored.
   */
  private _cachedRenderRowsMap = new Map<T, WeakMap<CdkRowDef<T>, RenderRow<T>[]>>();

  /** Whether the table is applied to a native `<table>`. */
  private _isNativeHtmlTable: boolean;

  /**
   * Utility class that is responsible for applying the appropriate sticky positioning styles to
   * the table's rows and cells.
   */
  private _stickyStyler: StickyStyler;

  /**
   * CSS class added to any row or cell that has sticky positioning applied. May be overriden by
   * table subclasses.
   */
  protected stickyCssClass: string = 'cdk-table-sticky';

  /**
   * Tracking function that will be used to check the differences in data changes. Used similarly
   * to `ngFor` `trackBy` function. Optimize row operations by identifying a row based on its data
   * relative to the function to know if a row should be added/removed/moved.
   * Accepts a function that takes two parameters, `index` and `item`.
   */
  @Input()
  get trackBy(): TrackByFunction<T> {
    return this._trackByFn;
  }
  set trackBy(fn: TrackByFunction<T>) {
    if (isDevMode() && fn != null && typeof fn !== 'function' && <any>console &&
        <any>console.warn) {
      console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}.`);
    }
    this._trackByFn = fn;
  }
  private _trackByFn: TrackByFunction<T>;

  /**
   * The table's source of data, which can be provided in three ways (in order of complexity):
   *   - Simple data array (each object represents one table row)
   *   - Stream that emits a data array each time the array changes
   *   - `DataSource` object that implements the connect/disconnect interface.
   *
   * If a data array is provided, the table must be notified when the array's objects are
   * added, removed, or moved. This can be done by calling the `renderRows()` function which will
   * render the diff since the last table render. If the data array reference is changed, the table
   * will automatically trigger an update to the rows.
   *
   * When providing an Observable stream, the table will trigger an update automatically when the
   * stream emits a new array of data.
   *
   * Finally, when providing a `DataSource` object, the table will use the Observable stream
   * provided by the connect function and trigger updates when that stream emits new data array
   * values. During the table's ngOnDestroy or when the data source is removed from the table, the
   * table will call the DataSource's `disconnect` function (may be useful for cleaning up any
   * subscriptions registered during the connect process).
   */
  @Input()
  get dataSource(): CdkTableDataSourceInput<T> {
    return this._dataSource;
  }
  set dataSource(dataSource: CdkTableDataSourceInput<T>) {
    if (this._dataSource !== dataSource) {
      this._switchDataSource(dataSource);
    }
  }
  private _dataSource: CdkTableDataSourceInput<T>;

  /**
   * Whether to allow multiple rows per data object by evaluating which rows evaluate their 'when'
   * predicate to true. If `multiTemplateDataRows` is false, which is the default value, then each
   * dataobject will render the first row that evaluates its when predicate to true, in the order
   * defined in the table, or otherwise the default row which does not have a when predicate.
   */
  @Input()
  get multiTemplateDataRows(): boolean {
    return this._multiTemplateDataRows;
  }
  set multiTemplateDataRows(v: boolean) {
    this._multiTemplateDataRows = coerceBooleanProperty(v);
    if (this._rowOutlet.viewContainer.length) {
      this._forceRenderDataRows();
    }
  }
  _multiTemplateDataRows: boolean = false;

  // TODO(andrewseguin): Remove max value as the end index
  //   and instead calculate the view on init and scroll.
  /**
   * Stream containing the latest information on what rows are being displayed on screen.
   * Can be used by the data source to as a heuristic of what data should be provided.
   */
  viewChange: BehaviorSubject<{start: number, end: number}> =
      new BehaviorSubject<{start: number, end: number}>({start: 0, end: Number.MAX_VALUE});

  // Outlets in the table's template where the header, data rows, and footer will be inserted.
  @ViewChild(DataRowOutlet, {static: true}) _rowOutlet: DataRowOutlet;
  @ViewChild(HeaderRowOutlet, {static: true}) _headerRowOutlet: HeaderRowOutlet;
  @ViewChild(FooterRowOutlet, {static: true}) _footerRowOutlet: FooterRowOutlet;

  /**
   * The column definitions provided by the user that contain what the header, data, and footer
   * cells should render for each column.
   */
  @ContentChildren(CdkColumnDef) _contentColumnDefs: QueryList<CdkColumnDef>;

  /** Set of data row definitions that were provided to the table as content children. */
  @ContentChildren(CdkRowDef) _contentRowDefs: QueryList<CdkRowDef<T>>;

  /** Set of header row definitions that were provided to the table as content children. */
  @ContentChildren(CdkHeaderRowDef) _contentHeaderRowDefs: QueryList<CdkHeaderRowDef>;

  /** Set of footer row definitions that were provided to the table as content children. */
  @ContentChildren(CdkFooterRowDef) _contentFooterRowDefs: QueryList<CdkFooterRowDef>;

  constructor(
      protected readonly _differs: IterableDiffers,
      protected readonly _changeDetectorRef: ChangeDetectorRef,
      protected readonly _elementRef: ElementRef, @Attribute('role') role: string,
      @Optional() protected readonly _dir: Directionality,
      /**
       * @deprecated
       * @breaking-change 8.0.0 `_document` and `_platform` to
       *    be made into a required parameters.
       */
      @Inject(DOCUMENT) _document?: any, private _platform?: Platform) {
    if (!role) {
      this._elementRef.nativeElement.setAttribute('role', 'grid');
    }

    this._document = _document;
    this._isNativeHtmlTable = this._elementRef.nativeElement.nodeName === 'TABLE';
  }

  ngOnInit() {
    this._setupStickyStyler();

    if (this._isNativeHtmlTable) {
      this._applyNativeTableSections();
    }

    // Set up the trackBy function so that it uses the `RenderRow` as its identity by default. If
    // the user has provided a custom trackBy, return the result of that function as evaluated
    // with the values of the `RenderRow`'s data and index.
    this._dataDiffer = this._differs.find([]).create((_i: number, dataRow: RenderRow<T>) => {
      return this.trackBy ? this.trackBy(dataRow.dataIndex, dataRow.data) : dataRow;
    });
  }

  ngAfterContentChecked() {
    // Cache the row and column definitions gathered by ContentChildren and programmatic injection.
    this._cacheRowDefs();
    this._cacheColumnDefs();

    // Make sure that the user has at least added header, footer, or data row def.
    if (!this._headerRowDefs.length && !this._footerRowDefs.length && !this._rowDefs.length) {
      throw getTableMissingRowDefsError();
    }

    // Render updates if the list of columns have been changed for the header, row, or footer defs.
    this._renderUpdatedColumns();

    // If the header row definition has been changed, trigger a render to the header row.
    if (this._headerRowDefChanged) {
      this._forceRenderHeaderRows();
      this._headerRowDefChanged = false;
    }

    // If the footer row definition has been changed, trigger a render to the footer row.
    if (this._footerRowDefChanged) {
      this._forceRenderFooterRows();
      this._footerRowDefChanged = false;
    }

    // If there is a data source and row definitions, connect to the data source unless a
    // connection has already been made.
    if (this.dataSource && this._rowDefs.length > 0 && !this._renderChangeSubscription) {
      this._observeRenderChanges();
    }

    this._checkStickyStates();
  }

  ngOnDestroy() {
    this._rowOutlet.viewContainer.clear();
    this._headerRowOutlet.viewContainer.clear();
    this._footerRowOutlet.viewContainer.clear();

    this._cachedRenderRowsMap.clear();

    this._onDestroy.next();
    this._onDestroy.complete();

    if (isDataSource(this.dataSource)) {
      this.dataSource.disconnect(this);
    }
  }

  /**
   * Renders rows based on the table's latest set of data, which was either provided directly as an
   * input or retrieved through an Observable stream (directly or from a DataSource).
   * Checks for differences in the data since the last diff to perform only the necessary
   * changes (add/remove/move rows).
   *
   * If the table's data source is a DataSource or Observable, this will be invoked automatically
   * each time the provided Observable stream emits a new data array. Otherwise if your data is
   * an array, this function will need to be called to render any changes.
   */
  renderRows() {
    this._renderRows = this._getAllRenderRows();
    const changes = this._dataDiffer.diff(this._renderRows);
    if (!changes) {
      return;
    }

    const viewContainer = this._rowOutlet.viewContainer;

    changes.forEachOperation(
        (record: IterableChangeRecord<RenderRow<T>>, prevIndex: number|null,
         currentIndex: number|null) => {
          if (record.previousIndex == null) {
            this._insertRow(record.item, currentIndex!);
          } else if (currentIndex == null) {
            viewContainer.remove(prevIndex!);
          } else {
            const view = <RowViewRef<T>>viewContainer.get(prevIndex!);
            viewContainer.move(view!, currentIndex);
          }
        });

    // Update the meta context of a row's context data (index, count, first, last, ...)
    this._updateRowIndexContext();

    // Update rows that did not get added/removed/moved but may have had their identity changed,
    // e.g. if trackBy matched data on some property but the actual data reference changed.
    changes.forEachIdentityChange((record: IterableChangeRecord<RenderRow<T>>) => {
      const rowView = <RowViewRef<T>>viewContainer.get(record.currentIndex!);
      rowView.context.$implicit = record.item.data;
    });

    this.updateStickyColumnStyles();
  }

  /**
   * Sets the header row definition to be used. Overrides the header row definition gathered by
   * using `ContentChild`, if one exists. Sets a flag that will re-render the header row after the
   * table's content is checked.
   * @docs-private
   * @deprecated Use `addHeaderRowDef` and `removeHeaderRowDef` instead
   * @breaking-change 8.0.0
   */
  setHeaderRowDef(headerRowDef: CdkHeaderRowDef) {
    this._customHeaderRowDefs = new Set([headerRowDef]);
    this._headerRowDefChanged = true;
  }

  /**
   * Sets the footer row definition to be used. Overrides the footer row definition gathered by
   * using `ContentChild`, if one exists. Sets a flag that will re-render the footer row after the
   * table's content is checked.
   * @docs-private
   * @deprecated Use `addFooterRowDef` and `removeFooterRowDef` instead
   * @breaking-change 8.0.0
   */
  setFooterRowDef(footerRowDef: CdkFooterRowDef) {
    this._customFooterRowDefs = new Set([footerRowDef]);
    this._footerRowDefChanged = true;
  }

  /** Adds a column definition that was not included as part of the content children. */
  addColumnDef(columnDef: CdkColumnDef) {
    this._customColumnDefs.add(columnDef);
  }

  /** Removes a column definition that was not included as part of the content children. */
  removeColumnDef(columnDef: CdkColumnDef) {
    this._customColumnDefs.delete(columnDef);
  }

  /** Adds a row definition that was not included as part of the content children. */
  addRowDef(rowDef: CdkRowDef<T>) {
    this._customRowDefs.add(rowDef);
  }

  /** Removes a row definition that was not included as part of the content children. */
  removeRowDef(rowDef: CdkRowDef<T>) {
    this._customRowDefs.delete(rowDef);
  }

  /** Adds a header row definition that was not included as part of the content children. */
  addHeaderRowDef(headerRowDef: CdkHeaderRowDef) {
    this._customHeaderRowDefs.add(headerRowDef);
    this._headerRowDefChanged = true;
  }

  /** Removes a header row definition that was not included as part of the content children. */
  removeHeaderRowDef(headerRowDef: CdkHeaderRowDef) {
    this._customHeaderRowDefs.delete(headerRowDef);
    this._headerRowDefChanged = true;
  }

  /** Adds a footer row definition that was not included as part of the content children. */
  addFooterRowDef(footerRowDef: CdkFooterRowDef) {
    this._customFooterRowDefs.add(footerRowDef);
    this._footerRowDefChanged = true;
  }

  /** Removes a footer row definition that was not included as part of the content children. */
  removeFooterRowDef(footerRowDef: CdkFooterRowDef) {
    this._customFooterRowDefs.delete(footerRowDef);
    this._footerRowDefChanged = true;
  }

  /**
   * Updates the header sticky styles. First resets all applied styles with respect to the cells
   * sticking to the top. Then, evaluating which cells need to be stuck to the top. This is
   * automatically called when the header row changes its displayed set of columns, or if its
   * sticky input changes. May be called manually for cases where the cell content changes outside
   * of these events.
   */
  updateStickyHeaderRowStyles(): void {
    const headerRows = this._getRenderedRows(this._headerRowOutlet);
    const tableElement = this._elementRef.nativeElement as HTMLElement;

    // Hide the thead element if there are no header rows. This is necessary to satisfy
    // overzealous a11y checkers that fail because the `rowgroup` element does not contain
    // required child `row`.
    const thead = tableElement.querySelector('thead');
    if (thead) {
      thead.style.display = headerRows.length ? '' : 'none';
    }

    const stickyStates = this._headerRowDefs.map(def => def.sticky);
    this._stickyStyler.clearStickyPositioning(headerRows, ['top']);
    this._stickyStyler.stickRows(headerRows, stickyStates, 'top');

    // Reset the dirty state of the sticky input change since it has been used.
    this._headerRowDefs.forEach(def => def.resetStickyChanged());
  }

  /**
   * Updates the footer sticky styles. First resets all applied styles with respect to the cells
   * sticking to the bottom. Then, evaluating which cells need to be stuck to the bottom. This is
   * automatically called when the footer row changes its displayed set of columns, or if its
   * sticky input changes. May be called manually for cases where the cell content changes outside
   * of these events.
   */
  updateStickyFooterRowStyles(): void {
    const footerRows = this._getRenderedRows(this._footerRowOutlet);
    const tableElement = this._elementRef.nativeElement as HTMLElement;

    // Hide the tfoot element if there are no footer rows. This is necessary to satisfy
    // overzealous a11y checkers that fail because the `rowgroup` element does not contain
    // required child `row`.
    const tfoot = tableElement.querySelector('tfoot');
    if (tfoot) {
      tfoot.style.display = footerRows.length ? '' : 'none';
    }

    const stickyStates = this._footerRowDefs.map(def => def.sticky);
    this._stickyStyler.clearStickyPositioning(footerRows, ['bottom']);
    this._stickyStyler.stickRows(footerRows, stickyStates, 'bottom');
    this._stickyStyler.updateStickyFooterContainer(this._elementRef.nativeElement, stickyStates);

    // Reset the dirty state of the sticky input change since it has been used.
    this._footerRowDefs.forEach(def => def.resetStickyChanged());
  }

  /**
   * Updates the column sticky styles. First resets all applied styles with respect to the cells
   * sticking to the left and right. Then sticky styles are added for the left and right according
   * to the column definitions for each cell in each row. This is automatically called when
   * the data source provides a new set of data or when a column definition changes its sticky
   * input. May be called manually for cases where the cell content changes outside of these events.
   */
  updateStickyColumnStyles() {
    const headerRows = this._getRenderedRows(this._headerRowOutlet);
    const dataRows = this._getRenderedRows(this._rowOutlet);
    const footerRows = this._getRenderedRows(this._footerRowOutlet);

    // Clear the left and right positioning from all columns in the table across all rows since
    // sticky columns span across all table sections (header, data, footer)
    this._stickyStyler.clearStickyPositioning(
        [...headerRows, ...dataRows, ...footerRows], ['left', 'right']);

    // Update the sticky styles for each header row depending on the def's sticky state
    headerRows.forEach((headerRow, i) => {
      this._addStickyColumnStyles([headerRow], this._headerRowDefs[i]);
    });

    // Update the sticky styles for each data row depending on its def's sticky state
    this._rowDefs.forEach(rowDef => {
      // Collect all the rows rendered with this row definition.
      const rows: HTMLElement[] = [];
      for (let i = 0; i < dataRows.length; i++) {
        if (this._renderRows[i].rowDef === rowDef) {
          rows.push(dataRows[i]);
        }
      }

      this._addStickyColumnStyles(rows, rowDef);
    });

    // Update the sticky styles for each footer row depending on the def's sticky state
    footerRows.forEach((footerRow, i) => {
      this._addStickyColumnStyles([footerRow], this._footerRowDefs[i]);
    });

    // Reset the dirty state of the sticky input change since it has been used.
    Array.from(this._columnDefsByName.values()).forEach(def => def.resetStickyChanged());
  }

  /**
   * Get the list of RenderRow objects to render according to the current list of data and defined
   * row definitions. If the previous list already contained a particular pair, it should be reused
   * so that the differ equates their references.
   */
  private _getAllRenderRows(): RenderRow<T>[] {
    const renderRows: RenderRow<T>[] = [];

    // Store the cache and create a new one. Any re-used RenderRow objects will be moved into the
    // new cache while unused ones can be picked up by garbage collection.
    const prevCachedRenderRows = this._cachedRenderRowsMap;
    this._cachedRenderRowsMap = new Map();

    // For each data object, get the list of rows that should be rendered, represented by the
    // respective `RenderRow` object which is the pair of `data` and `CdkRowDef`.
    for (let i = 0; i < this._data.length; i++) {
      let data = this._data[i];
      const renderRowsForData = this._getRenderRowsForData(data, i, prevCachedRenderRows.get(data));

      if (!this._cachedRenderRowsMap.has(data)) {
        this._cachedRenderRowsMap.set(data, new WeakMap());
      }

      for (let j = 0; j < renderRowsForData.length; j++) {
        let renderRow = renderRowsForData[j];

        const cache = this._cachedRenderRowsMap.get(renderRow.data)!;
        if (cache.has(renderRow.rowDef)) {
          cache.get(renderRow.rowDef)!.push(renderRow);
        } else {
          cache.set(renderRow.rowDef, [renderRow]);
        }
        renderRows.push(renderRow);
      }
    }

    return renderRows;
  }

  /**
   * Gets a list of `RenderRow<T>` for the provided data object and any `CdkRowDef` objects that
   * should be rendered for this data. Reuses the cached RenderRow objects if they match the same
   * `(T, CdkRowDef)` pair.
   */
  private _getRenderRowsForData(
      data: T, dataIndex: number, cache?: WeakMap<CdkRowDef<T>, RenderRow<T>[]>): RenderRow<T>[] {
    const rowDefs = this._getRowDefs(data, dataIndex);

    return rowDefs.map(rowDef => {
      const cachedRenderRows = (cache && cache.has(rowDef)) ? cache.get(rowDef)! : [];
      if (cachedRenderRows.length) {
        const dataRow = cachedRenderRows.shift()!;
        dataRow.dataIndex = dataIndex;
        return dataRow;
      } else {
        return {data, rowDef, dataIndex};
      }
    });
  }

  /** Update the map containing the content's column definitions. */
  private _cacheColumnDefs() {
    this._columnDefsByName.clear();

    const columnDefs = mergeQueryListAndSet(this._contentColumnDefs, this._customColumnDefs);
    columnDefs.forEach(columnDef => {
      if (this._columnDefsByName.has(columnDef.name)) {
        throw getTableDuplicateColumnNameError(columnDef.name);
      }
      this._columnDefsByName.set(columnDef.name, columnDef);
    });
  }

  /** Update the list of all available row definitions that can be used. */
  private _cacheRowDefs() {
    this._headerRowDefs =
        mergeQueryListAndSet(this._contentHeaderRowDefs, this._customHeaderRowDefs);
    this._footerRowDefs =
        mergeQueryListAndSet(this._contentFooterRowDefs, this._customFooterRowDefs);
    this._rowDefs = mergeQueryListAndSet(this._contentRowDefs, this._customRowDefs);

    // After all row definitions are determined, find the row definition to be considered default.
    const defaultRowDefs = this._rowDefs.filter(def => !def.when);
    if (!this.multiTemplateDataRows && defaultRowDefs.length > 1) {
      throw getTableMultipleDefaultRowDefsError();
    }
    this._defaultRowDef = defaultRowDefs[0];
  }

  /**
   * Check if the header, data, or footer rows have changed what columns they want to display or
   * whether the sticky states have changed for the header or footer. If there is a diff, then
   * re-render that section.
   */
  private _renderUpdatedColumns() {
    const columnsDiffReducer = (acc: boolean, def: BaseRowDef) => acc || !!def.getColumnsDiff();

    // Force re-render data rows if the list of column definitions have changed.
    if (this._rowDefs.reduce(columnsDiffReducer, false)) {
      this._forceRenderDataRows();
    }

    // Force re-render header/footer rows if the list of column definitions have changed..
    if (this._headerRowDefs.reduce(columnsDiffReducer, false)) {
      this._forceRenderHeaderRows();
    }

    if (this._footerRowDefs.reduce(columnsDiffReducer, false)) {
      this._forceRenderFooterRows();
    }
  }

  /**
   * Switch to the provided data source by resetting the data and unsubscribing from the current
   * render change subscription if one exists. If the data source is null, interpret this by
   * clearing the row outlet. Otherwise start listening for new data.
   */
  private _switchDataSource(dataSource: CdkTableDataSourceInput<T>) {
    this._data = [];

    if (isDataSource(this.dataSource)) {
      this.dataSource.disconnect(this);
    }

    // Stop listening for data from the previous data source.
    if (this._renderChangeSubscription) {
      this._renderChangeSubscription.unsubscribe();
      this._renderChangeSubscription = null;
    }

    if (!dataSource) {
      if (this._dataDiffer) {
        this._dataDiffer.diff([]);
      }
      this._rowOutlet.viewContainer.clear();
    }

    this._dataSource = dataSource;
  }

  /** Set up a subscription for the data provided by the data source. */
  private _observeRenderChanges() {
    // If no data source has been set, there is nothing to observe for changes.
    if (!this.dataSource) {
      return;
    }

    let dataStream: Observable<T[]|ReadonlyArray<T>>|undefined;

    if (isDataSource(this.dataSource)) {
      dataStream = this.dataSource.connect(this);
    } else if (this.dataSource instanceof Observable) {
      dataStream = this.dataSource;
    } else if (Array.isArray(this.dataSource)) {
      dataStream = observableOf(this.dataSource);
    }

    if (dataStream === undefined) {
      throw getTableUnknownDataSourceError();
    }

    this._renderChangeSubscription = dataStream.pipe(takeUntil(this._onDestroy)).subscribe(data => {
      this._data = data || [];
      this.renderRows();
    });
  }

  /**
   * Clears any existing content in the header row outlet and creates a new embedded view
   * in the outlet using the header row definition.
   */
  private _forceRenderHeaderRows() {
    // Clear the header row outlet if any content exists.
    if (this._headerRowOutlet.viewContainer.length > 0) {
      this._headerRowOutlet.viewContainer.clear();
    }

    this._headerRowDefs.forEach((def, i) => this._renderRow(this._headerRowOutlet, def, i));
    this.updateStickyHeaderRowStyles();
    this.updateStickyColumnStyles();
  }
  /**
   * Clears any existing content in the footer row outlet and creates a new embedded view
   * in the outlet using the footer row definition.
   */
  private _forceRenderFooterRows() {
    // Clear the footer row outlet if any content exists.
    if (this._footerRowOutlet.viewContainer.length > 0) {
      this._footerRowOutlet.viewContainer.clear();
    }

    this._footerRowDefs.forEach((def, i) => this._renderRow(this._footerRowOutlet, def, i));
    this.updateStickyFooterRowStyles();
    this.updateStickyColumnStyles();
  }

  /** Adds the sticky column styles for the rows according to the columns' stick states. */
  private _addStickyColumnStyles(rows: HTMLElement[], rowDef: BaseRowDef) {
    const columnDefs = Array.from(rowDef.columns || []).map(columnName => {
      const columnDef = this._columnDefsByName.get(columnName);
      if (!columnDef) {
        throw getTableUnknownColumnError(columnName);
      }
      return columnDef!;
    });
    const stickyStartStates = columnDefs.map(columnDef => columnDef.sticky);
    const stickyEndStates = columnDefs.map(columnDef => columnDef.stickyEnd);
    this._stickyStyler.updateStickyColumns(rows, stickyStartStates, stickyEndStates);
  }

  /** Gets the list of rows that have been rendered in the row outlet. */
  _getRenderedRows(rowOutlet: RowOutlet): HTMLElement[] {
    const renderedRows: HTMLElement[] = [];

    for (let i = 0; i < rowOutlet.viewContainer.length; i++) {
      const viewRef = (rowOutlet.viewContainer.get(i)! as EmbeddedViewRef<any>);
      renderedRows.push(viewRef.rootNodes[0]);
    }

    return renderedRows;
  }

  /**
   * Get the matching row definitions that should be used for this row data. If there is only
   * one row definition, it is returned. Otherwise, find the row definitions that has a when
   * predicate that returns true with the data. If none return true, return the default row
   * definition.
   */
  _getRowDefs(data: T, dataIndex: number): CdkRowDef<T>[] {
    if (this._rowDefs.length == 1) {
      return [this._rowDefs[0]];
    }

    let rowDefs: CdkRowDef<T>[] = [];
    if (this.multiTemplateDataRows) {
      rowDefs = this._rowDefs.filter(def => !def.when || def.when(dataIndex, data));
    } else {
      let rowDef =
          this._rowDefs.find(def => def.when && def.when(dataIndex, data)) || this._defaultRowDef;
      if (rowDef) {
        rowDefs.push(rowDef);
      }
    }

    if (!rowDefs.length) {
      throw getTableMissingMatchingRowDefError(data);
    }

    return rowDefs;
  }

  /**
   * Create the embedded view for the data row template and place it in the correct index location
   * within the data row view container.
   */
  private _insertRow(renderRow: RenderRow<T>, renderIndex: number) {
    const rowDef = renderRow.rowDef;
    const context: RowContext<T> = {$implicit: renderRow.data};
    this._renderRow(this._rowOutlet, rowDef, renderIndex, context);
  }

  /**
   * Creates a new row template in the outlet and fills it with the set of cell templates.
   * Optionally takes a context to provide to the row and cells, as well as an optional index
   * of where to place the new row template in the outlet.
   */
  private _renderRow(
      outlet: RowOutlet, rowDef: BaseRowDef, index: number, context: RowContext<T> = {}) {
    // TODO(andrewseguin): enforce that one outlet was instantiated from createEmbeddedView
    outlet.viewContainer.createEmbeddedView(rowDef.template, context, index);

    for (let cellTemplate of this._getCellTemplates(rowDef)) {
      if (CdkCellOutlet.mostRecentCellOutlet) {
        CdkCellOutlet.mostRecentCellOutlet._viewContainer.createEmbeddedView(cellTemplate, context);
      }
    }

    this._changeDetectorRef.markForCheck();
  }

  /**
   * Updates the index-related context for each row to reflect any changes in the index of the rows,
   * e.g. first/last/even/odd.
   */
  private _updateRowIndexContext() {
    const viewContainer = this._rowOutlet.viewContainer;
    for (let renderIndex = 0, count = viewContainer.length; renderIndex < count; renderIndex++) {
      const viewRef = viewContainer.get(renderIndex) as RowViewRef<T>;
      const context = viewRef.context as RowContext<T>;
      context.count = count;
      context.first = renderIndex === 0;
      context.last = renderIndex === count - 1;
      context.even = renderIndex % 2 === 0;
      context.odd = !context.even;

      if (this.multiTemplateDataRows) {
        context.dataIndex = this._renderRows[renderIndex].dataIndex;
        context.renderIndex = renderIndex;
      } else {
        context.index = this._renderRows[renderIndex].dataIndex;
      }
    }
  }

  /** Gets the column definitions for the provided row def. */
  private _getCellTemplates(rowDef: BaseRowDef): TemplateRef<any>[] {
    if (!rowDef || !rowDef.columns) {
      return [];
    }
    return Array.from(rowDef.columns, columnId => {
      const column = this._columnDefsByName.get(columnId);

      if (!column) {
        throw getTableUnknownColumnError(columnId);
      }

      return rowDef.extractCellTemplate(column);
    });
  }

  /** Adds native table sections (e.g. tbody) and moves the row outlets into them. */
  private _applyNativeTableSections() {
    // @breaking-change 8.0.0 remove the `|| document` once the `_document` is a required param.
    const documentRef = this._document || document;
    const documentFragment = documentRef.createDocumentFragment();
    const sections = [
      {tag: 'thead', outlet: this._headerRowOutlet},
      {tag: 'tbody', outlet: this._rowOutlet},
      {tag: 'tfoot', outlet: this._footerRowOutlet},
    ];

    for (const section of sections) {
      const element = documentRef.createElement(section.tag);
      element.setAttribute('role', 'rowgroup');
      element.appendChild(section.outlet.elementRef.nativeElement);
      documentFragment.appendChild(element);
    }

    // Use a DocumentFragment so we don't hit the DOM on each iteration.
    this._elementRef.nativeElement.appendChild(documentFragment);
  }

  /**
   * Forces a re-render of the data rows. Should be called in cases where there has been an input
   * change that affects the evaluation of which rows should be rendered, e.g. toggling
   * `multiTemplateDataRows` or adding/removing row definitions.
   */
  private _forceRenderDataRows() {
    this._dataDiffer.diff([]);
    this._rowOutlet.viewContainer.clear();
    this.renderRows();
    this.updateStickyColumnStyles();
  }

  /**
   * Checks if there has been a change in sticky states since last check and applies the correct
   * sticky styles. Since checking resets the "dirty" state, this should only be performed once
   * during a change detection and after the inputs are settled (after content check).
   */
  private _checkStickyStates() {
    const stickyCheckReducer = (acc: boolean, d: CdkHeaderRowDef|CdkFooterRowDef|CdkColumnDef) => {
      return acc || d.hasStickyChanged();
    };

    // Note that the check needs to occur for every definition since it notifies the definition
    // that it can reset its dirty state. Using another operator like `some` may short-circuit
    // remaining definitions and leave them in an unchecked state.

    if (this._headerRowDefs.reduce(stickyCheckReducer, false)) {
      this.updateStickyHeaderRowStyles();
    }

    if (this._footerRowDefs.reduce(stickyCheckReducer, false)) {
      this.updateStickyFooterRowStyles();
    }

    if (Array.from(this._columnDefsByName.values()).reduce(stickyCheckReducer, false)) {
      this.updateStickyColumnStyles();
    }
  }

  /**
   * Creates the sticky styler that will be used for sticky rows and columns. Listens
   * for directionality changes and provides the latest direction to the styler. Re-applies column
   * stickiness when directionality changes.
   */
  private _setupStickyStyler() {
    const direction: Direction = this._dir ? this._dir.value : 'ltr';
    this._stickyStyler = new StickyStyler(
        this._isNativeHtmlTable,
        // @breaking-change 8.0.0 remove the null check for `this._platform`.
        this.stickyCssClass, direction, this._platform ? this._platform.isBrowser : true);
    (this._dir ? this._dir.change : observableOf<Direction>())
        .pipe(takeUntil(this._onDestroy))
        .subscribe(value => {
          this._stickyStyler.direction = value;
          this.updateStickyColumnStyles();
        });
  }
}

/** Utility function that gets a merged list of the entries in a QueryList and values of a Set. */
function mergeQueryListAndSet<T>(queryList: QueryList<T>, set: Set<T>): T[] {
  return queryList.toArray().concat(Array.from(set));
}
