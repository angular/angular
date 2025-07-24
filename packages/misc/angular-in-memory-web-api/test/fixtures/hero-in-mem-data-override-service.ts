/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * This is an example of a Hero-oriented InMemoryDbService with method overrides.
 */
import {Injectable} from '@angular/core';
import {
  getStatusText,
  ParsedRequestUrl,
  RequestInfo,
  RequestInfoUtilities,
  ResponseOptions,
  STATUS,
} from 'angular-in-memory-web-api';
import {Observable} from 'rxjs';

import {HeroInMemDataService} from './hero-in-mem-data-service';

const villains = [
  // deliberately using string ids that look numeric
  {id: 100, name: 'Snidley Wipsnatch'},
  {id: 101, name: 'Boris Badenov'},
  {id: 103, name: 'Natasha Fatale'},
];

// Pseudo guid generator
function guid() {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

@Injectable()
export class HeroInMemDataOverrideService extends HeroInMemDataService {
  // Overrides id generator and delivers next available `id`, starting with 1001.
  genId<T extends {id: any}>(collection: T[], collectionName: string): any {
    if (collectionName === 'nobodies') {
      return guid();
    } else if (collection) {
      return 1 + collection.reduce((prev, curr) => Math.max(prev, curr.id || 0), 1000);
    }
  }

  // HTTP GET interceptor
  get(reqInfo: RequestInfo): Observable<any> | undefined {
    const collectionName = reqInfo.collectionName;
    if (collectionName === 'villains') {
      return this.getVillains(reqInfo);
    }
    return undefined; // let the default GET handle all others
  }

  // HTTP GET interceptor handles requests for villains
  private getVillains(reqInfo: RequestInfo) {
    return reqInfo.utils.createResponse$(() => {
      const collection = villains.slice();
      const dataEncapsulation = reqInfo.utils.getConfig().dataEncapsulation;
      const id = reqInfo.id;
      const data = id == null ? collection : reqInfo.utils.findById(collection, id);

      const options: ResponseOptions = data
        ? {body: dataEncapsulation ? {data} : data, status: STATUS.OK}
        : {body: {error: `'Villains' with id='${id}' not found`}, status: STATUS.NOT_FOUND};
      return this.finishOptions(options, reqInfo);
    });
  }

  // parseRequestUrl override
  // Do this to manipulate the request URL or the parsed result
  // into something your data store can handle.
  // This example turns a request for `/foo/heroes` into just `/heroes`.
  // It leaves other URLs untouched and forwards to the default parser.
  // It also logs the result of the default parser.
  parseRequestUrl(url: string, utils: RequestInfoUtilities): ParsedRequestUrl {
    const newUrl = url.replace(/\/foo\/heroes/, '/heroes');
    return utils.parseRequestUrl(newUrl);
  }

  responseInterceptor(resOptions: ResponseOptions, reqInfo: RequestInfo) {
    if (resOptions.headers) {
      resOptions.headers = resOptions.headers.set('x-test', 'test-header');
    }
    return resOptions;
  }

  private finishOptions(options: ResponseOptions, {headers, url}: RequestInfo) {
    options.statusText = options.status == null ? undefined : getStatusText(options.status);
    options.headers = headers;
    options.url = url;
    return options;
  }
}
