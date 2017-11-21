/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import {UserData} from './people-database';
import {map} from 'rxjs/operators/map';
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
    return this._personDataSource.connect().pipe(map(data => {
      const rows: (UserData|DetailRow)[] = [];

      // Interweave a detail data object for each row data object that will be used for displaying
      // row details. Contains the row data.
      data.forEach(person => rows.push(person, {detailRow: true, data: person}));

      return rows;
    }));
  }

  disconnect() {
    // No-op
  }
}
