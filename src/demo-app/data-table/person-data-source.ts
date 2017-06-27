import {CollectionViewer, DataSource, MdPaginator, MdSort} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {PeopleDatabase, UserData} from './people-database';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/combineLatest';


export class PersonDataSource extends DataSource<any> {
  /** Data that should be displayed by the table. */
  _displayData = new BehaviorSubject<UserData[]>([]);

  /** Cached data provided by the display data. */
  _renderedData: any[] = [];

  constructor(private _peopleDatabase: PeopleDatabase,
              private _paginator: MdPaginator,
              private _sort: MdSort) {
    super();

    // Subscribe to paging, sorting, and database changes by clearing the cached data and
    // determining the updated display data.
    Observable.merge(this._paginator.page,
        this._peopleDatabase.dataChange,
        this._sort.mdSortChange).subscribe(() => {
      this._renderedData = [];
      this.updateDisplayData();
    });
  }

  connect(collectionViewer: CollectionViewer): Observable<UserData[]> {
    this.updateDisplayData();

    const streams = [collectionViewer.viewChange, this._displayData];
    return Observable.combineLatest(streams)
        .map((results: [{start: number, end: number}, UserData[]]) => {
          const [view, data] = results;

          // Set the rendered rows length to the virtual page size. Fill in the data provided
          // from the index start until the end index or pagination size, whichever is smaller.
          this._renderedData.length = data.length;

          const buffer = 20;
          let rangeStart = Math.max(0, view.start - buffer);
          let rangeEnd = Math.min(data.length, view.end + buffer);

          for (let i = rangeStart; i < rangeEnd; i++) {
            this._renderedData[i] = data[i];
          }

          return this._renderedData;
        });
  }

  updateDisplayData() {
    const data = this.getSortedData();

    // Grab the page's slice of data.
    const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
    const paginatedData = data.splice(startIndex, this._paginator.pageSize);

    this._displayData.next(paginatedData);
  }

  /** Returns a sorted copy of the database data. */
  getSortedData(): UserData[] {
    const data = this._peopleDatabase.data.slice();
    if (!this._sort.active || this._sort.direction == '') { return data; }

    return data.sort((a, b) => {
      let propertyA: number|string = '';
      let propertyB: number|string = '';

      switch (this._sort.active) {
        case 'userId': [propertyA, propertyB] = [a.id, b.id]; break;
        case 'userName': [propertyA, propertyB] = [a.name, b.name]; break;
        case 'progress': [propertyA, propertyB] = [a.progress, b.progress]; break;
        case 'color': [propertyA, propertyB] = [a.color, b.color]; break;
      }

      let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1);
    });
  }
}
