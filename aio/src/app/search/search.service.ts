/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/

import { NgZone, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/publishLast';
import 'rxjs/add/operator/concatMap';
import { WebWorkerClient } from 'app/shared/web-worker';

export interface QueryResults {
  query: string;
  results: Object[];
}

const SEARCH_WORKER_URL = 'app/search/search-worker.js';

@Injectable()
export class SearchService {
  private worker: WebWorkerClient;
  private ready: Observable<boolean>;
  private resultsSubject = new Subject<QueryResults>();
  get searchResults() { return this.resultsSubject.asObservable(); }

  constructor(private zone: NgZone) {
    this.worker = new WebWorkerClient(SEARCH_WORKER_URL, zone);
    const ready = this.ready = this.worker.sendMessage<boolean>('load-index').publishLast();
    // trigger the index to be loaded immediately
    ready.connect();
  }

  search(query: string) {
    this.ready.concatMap(ready => {
      return this.worker.sendMessage('query-index', query) as Observable<QueryResults>;
    }).subscribe(results => this.resultsSubject.next(results));
  }
}
