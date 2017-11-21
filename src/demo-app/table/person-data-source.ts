/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MatPaginator, MatSort} from '@angular/material';
import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import {PeopleDatabase, UserData} from './people-database';
import {merge} from 'rxjs/observable/merge';
import {map} from 'rxjs/operators/map';

export class PersonDataSource extends DataSource<any> {
  constructor(private _peopleDatabase: PeopleDatabase,
              private _paginator: MatPaginator,
              private _sort: MatSort) {
    super();
  }

  connect(): Observable<UserData[]> {
    const displayDataChanges = [
      this._paginator.page,
      this._sort.sortChange,
      this._peopleDatabase.dataChange
    ];
    return merge(...displayDataChanges).pipe(map(() => {
      const data = this.getSortedData();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    }));
  }

  disconnect() {
    // No-op
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
