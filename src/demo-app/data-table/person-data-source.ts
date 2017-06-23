import {CollectionViewer, DataSource, MdPaginator} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {PeopleDatabase, UserData} from './people-database';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

export class PersonDataSource extends DataSource<any> {
  /** Data that should be displayed by the table. */
  _displayData = new BehaviorSubject<UserData[]>([]);

  /** Cached data provided by the display data. */
  _renderedData: any[] = [];

  constructor(private _peopleDatabase: PeopleDatabase,
              private _paginator: MdPaginator) {
    super();

    // Subscribe to page changes and database changes by clearing the cached data and
    // determining the updated display data.
    Observable.merge(this._paginator.page, this._peopleDatabase.dataChange).subscribe(() => {
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
    const data = this._peopleDatabase.data.slice();

    // Grab the page's slice of data.
    const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
    const paginatedData = data.splice(startIndex, this._paginator.pageSize);

    this._displayData.next(paginatedData);
  }
}
