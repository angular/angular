/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DataSource} from '@angular/cdk/table';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {Subscription} from 'rxjs/Subscription';
import {combineLatest, map, RxChain, startWith} from '@angular/cdk/rxjs';
import {empty} from 'rxjs/observable/empty';

/**
 * Data source that accepts a client-side data array and includes native support of filtering,
 * sorting (using MatSort), and pagination (using MatPaginator).
 *
 * Allows for sort customization by overriding sortingDataAccessor, which defines how data
 * properties are accessed. Also allows for filter customization by overriding filterTermAccessor,
 * which defines how row data is converted to a string for filter matching.
 */
export class MatTableDataSource<T> implements DataSource<T> {
  /** Stream that emits when a new data array is set on the data source. */
  private _data: BehaviorSubject<T[]>;

  /** Stream emitting render data to the table (depends on ordered data changes). */
  private _renderData = new BehaviorSubject<T[]>([]);

  /** Stream that emits when a new filter string is set on the data source. */
  private _filter = new BehaviorSubject<string>('');

  /**
   * Subscription to the changes that should trigger an update to the table's rendered rows, such
   * as filtering, sorting, pagination, or base data changes.
   */
  _renderChangesSubscription: Subscription;

  /** Array of data that should be rendered by the table, where each object represents one row. */
  set data(data: T[]) { this._data.next(data); }
  get data() { return this._data.value; }

  /**
   * Filter term that should be used to filter out objects from the data array. To override how
   * the filter matches data objects, provide a custom function on filterTermAccessor.
   */
  set filter(filter: string) { this._filter.next(filter); }
  get filter(): string { return this._filter.value; }

  /**
   * Instance of the MatSort directive used by the table to control its sorting. Sort changes
   * emitted by the MatSort will trigger an update to the table's rendered data.
   */
  set sort(sort: MatSort|null) {
    this._sort = sort;
    this._updateChangeSubscription();
  }
  get sort(): MatSort|null { return this._sort; }
  private _sort: MatSort|null;

  /**
   * Instance of the MatPaginator component used by the table to control what page of the data is
   * displayed. Page changes emitted by the MatPaginator will trigger an update to the
   * table's rendered data.
   *
   * Note that the data source uses the paginator's properties to calculate which page of data
   * should be displayed. If the paginator receives its properties as template inputs,
   * e.g. `[pageLength]=100` or `[pageIndex]=1`, then be sure that the paginator's view has been
   * initialized before assigning it to this data source.
   */
  set paginator(paginator: MatPaginator|null) {
    this._paginator = paginator;
    this._updateChangeSubscription();
  }
  get paginator(): MatPaginator|null { return this._paginator; }
  private _paginator: MatPaginator|null;

  /**
   * Data accessor function that is used for accessing data properties for sorting.
   * This default function assumes that the sort header IDs (which defaults to the column name)
   * matches the data's properties (e.g. column Xyz represents data['Xyz']).
   * May be set to a custom function for different behavior.
   * @param data Data object that is being accessed.
   * @param sortHeaderId The name of the column that represents the data.
   */
  sortingDataAccessor = (data: T, sortHeaderId: string): string|number => {
    const value: number|string = data[sortHeaderId];
    return isNaN(+value) ? value : +value;
  }

  /**
   * Transforms data objects into a filter term that will be used to check against the filter if
   * a filter is set. By default, the function will iterate over the values of the data object
   * and convert them to a lowercase string.
   * @param data Data object to convert to a string that checked for containing the filter term.
   */
  filterTermAccessor: ((data: T) => string) = (data: T): string => {
    const accumulator = (currentTerm, key) => currentTerm + data[key];
    return Object.keys(data).reduce(accumulator, '').toLowerCase();
  }

  constructor(initialData: T[] = []) {
    this._data = new BehaviorSubject<T[]>(initialData);
    this._updateChangeSubscription();
  }

  /**
   * Subscribe to changes that should trigger an update to the table's rendered rows. When the
   * changes occur, process the current state of the filter, sort, and pagination along with
   * the provided base data and send it to the table for rendering.
   */
  _updateChangeSubscription() {
    // Sorting and/or pagination should be watched if MatSort and/or MatPaginator are provided.
    // Otherwise, use an empty observable stream to take their place.
    const sortChange = this._sort ? this._sort.sortChange : empty();
    const pageChange = this._paginator ? this._paginator.page : empty();

    if (this._renderChangesSubscription) { this._renderChangesSubscription.unsubscribe(); }
    this._renderChangesSubscription = RxChain.from(this._data)
    // Watch for base data or filter changes to provide a filtered set of data.
        .call(combineLatest, this._filter)
        .call(map, ([data]) => this._filterData(data))
        // Watch for filtered data or sort changes to provide an ordered set of data.
        .call(combineLatest, startWith.call(sortChange, null))
        .call(map, ([data]) => this._orderData(data))
        // Watch for ordered data or page changes to provide a paged set of data.
        .call(combineLatest, startWith.call(pageChange, null))
        .call(map, ([data]) => this._pageData(data))
        // Watched for paged data changes and send the result to the table to render.
        .subscribe(data => this._renderData.next(data));
  }

  /**
   * Returns a filtered data array where each filter object contains the filter string within
   * the result of the filterTermAccessor function. If no filter is set, returns the data array
   * as provided.
   */
  _filterData(data: T[]) {
    // If there is a filter string, filter out data that does not contain it.
    // Each data object is converted to a string using the function defined by filterTermAccessor.
    // May be overriden for customization.
    const filteredData = !this.filter ? data : data.filter(obj => {
      return this.filterTermAccessor(obj).indexOf(this.filter) != -1;
    });

    if (this.paginator) { this._updatePaginator(filteredData.length); }

    return filteredData;
  }

  /**
   * Returns a sorted copy of the data if MatSort has a sort applied, otherwise just returns the
   * data array as provided. Uses the default data accessor for data lookup, unless a
   * sortDataAccessor function is defined.
   */
  _orderData(data: T[]): T[] {
    // If there is no active sort or direction, return the data without trying to sort.
    if (!this.sort || !this.sort.active || this.sort.direction == '') { return data; }

    const active = this.sort.active;
    const direction = this.sort.direction;

    return data.slice().sort((a, b) => {
      let valueA = this.sortingDataAccessor(a, active);
      let valueB = this.sortingDataAccessor(b, active);
      return (valueA < valueB ? -1 : 1) * (direction == 'asc' ? 1 : -1);
    });
  }

  /**
   * Returns a paged splice of the provided data array according to the provided MatPaginator's page
   * index and length. If there is no paginator provided, returns the data array as provided.
   */
  _pageData(data: T[]): T[] {
    if (!this.paginator) { return data; }

    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.slice().splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Updates the paginator to reflect the length of the filtered data, and makes sure that the page
   * index does not exceed the paginator's last page. Values are changed in a resolved promise to
   * guard against making property changes within a round of change detection.
   */
  _updatePaginator(filteredDataLength: number) {
    Promise.resolve().then(() => {
      if (!this.paginator) { return; }

      this.paginator.length = filteredDataLength;

      // If the page index is set beyond the page, reduce it to the last page.
      if (this.paginator.pageIndex > 0) {
        const lastPageIndex = Math.ceil(this.paginator.length / this.paginator.pageSize) - 1 || 0;
        this.paginator.pageIndex = Math.min(this.paginator.pageIndex, lastPageIndex);
      }
    });
  }

  /**
   * Used by the MatTable. Called when it connects to the data source.
   * @docs-private
   */
  connect() { return this._renderData; }

  /**
   * Used by the MatTable. Called when it is destroyed. No-op.
   * @docs-private
   */
  disconnect() { }
}
