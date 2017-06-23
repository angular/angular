import {CollectionViewer, DataSource} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {PeopleDatabase, UserData} from './people-database';

export class PersonDataSource extends DataSource<any> {
  _renderedData: any[] = [];

  constructor(private _peopleDatabase: PeopleDatabase) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<UserData[]> {
    const changeStreams = Observable.combineLatest(
        collectionViewer.viewChange,
        this._peopleDatabase.dataChange);
    return changeStreams.map((result: any[]) => {
      const view: {start: number, end: number} = result[0];

      // Set the rendered rows length to the virtual page size. Fill in the data provided
      // from the index start until the end index or pagination size, whichever is smaller.
      this._renderedData.length = this._peopleDatabase.data.length;

      const buffer = 20;
      let rangeStart = Math.max(0, view.start - buffer);
      let rangeEnd = Math.min(this._peopleDatabase.data.length, view.end + buffer);

      for (let i = rangeStart; i < rangeEnd; i++) {
        this._renderedData[i] = this._peopleDatabase.data[i];
      }

      return this._renderedData;
    });
  }
}
