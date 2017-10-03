import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import {UserData} from './people-database';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import {PersonDataSource} from './person-data-source';

export interface DetailRow {
  detailRow: boolean;
  data: UserData;
}

export class PersonDetailDataSource extends DataSource<any> {
  constructor(private _personDataSource: PersonDataSource) {
    super();
  }

  connect(): Observable<(UserData|DetailRow)[]> {
    return this._personDataSource.connect().map(data => {
      const rows: (UserData|DetailRow)[] = [];

      // Interweave a detail data object for each row data object that will be used for displaying
      // row details. Contains the row data.
      data.forEach(person => rows.push(person, {detailRow: true, data: person}));

      return rows;
    });
  }

  disconnect() {
    // No-op
  }
}
