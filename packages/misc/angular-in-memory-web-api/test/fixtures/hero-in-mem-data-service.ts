/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * This is an example of a Hero-oriented InMemoryDbService.
 *
 * For demonstration purposes, it can return the database
 * synchronously as an object (default),
 * as an observable, or as a promise.
 *
 * Add the following line to `AppModule.imports`
 *   InMemoryWebApiModule.forRoot(HeroInMemDataService) // or HeroInMemDataOverrideService
 */
import {Injectable} from '@angular/core';
import {InMemoryDbService, RequestInfo} from 'angular-in-memory-web-api';
import {Observable, of} from 'rxjs';
import {delay} from 'rxjs/operators';

interface Person {
  id: string|number;
  name: string;
}

interface PersonResponse {
  heroes: Person[];
  stringers: Person[];
  nobodies: Person[];
}

@Injectable()
export class HeroInMemDataService implements InMemoryDbService {
  createDb(reqInfo?: RequestInfo):
      Observable<PersonResponse>|Promise<PersonResponse>|PersonResponse {
    const heroes = [
      {id: 1, name: 'Windstorm'}, {id: 2, name: 'Bombasto'}, {id: 3, name: 'Magneta'},
      {id: 4, name: 'Tornado'}
    ];

    const nobodies: any[] = [];

    // entities with string ids that look like numbers
    const stringers = [{id: '10', name: 'Bob String'}, {id: '20', name: 'Jill String'}];

    // default returnType
    let returnType = 'object';
    // let returnType  = 'observable';
    // let returnType  = 'promise';

    // demonstrate POST commands/resetDb
    // this example clears the collections if the request body tells it to do so
    if (reqInfo) {
      const body = reqInfo.utils.getJsonBody(reqInfo.req) || {};
      if (body.clear === true) {
        heroes.length = 0;
        nobodies.length = 0;
        stringers.length = 0;
      }

      // 'returnType` can be 'object' | 'observable' | 'promise'
      returnType = body.returnType || 'object';
    }
    const db = {heroes, nobodies, stringers};

    switch (returnType) {
      case 'observable':
        return of(db).pipe(delay(10));
      case 'promise':
        return new Promise(resolve => setTimeout(() => resolve(db), 10));
      default:
        return db;
    }
  }
}
