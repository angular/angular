/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/

import { NgZone, Injectable, Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/publishLast';
import 'rxjs/add/operator/concatMap';
import { WebWorkerClient } from 'app/shared/web-worker';

export interface SearchResults {
  query: string;
  results: SearchResult[];
}

export interface SearchResult {
  path: string;
  title: string;
  type: string;
  titleWords: string;
  keywords: string;
}


@Injectable()
export class SearchService {
  private worker: WebWorkerClient;
  private ready: Observable<boolean>;
  private resultsSubject = new ReplaySubject<SearchResults>(1);
  readonly searchResults = this.resultsSubject.asObservable();

  constructor(private zone: NgZone) {}

  initWorker(workerUrl) {
    this.worker = new WebWorkerClient(new Worker(workerUrl), this.zone);
  }

  loadIndex() {
    const ready = this.ready = this.worker.sendMessage<boolean>('load-index').publishLast();
    // trigger the index to be loaded immediately
    ready.connect();
  }

  search(query: string) {
    this.ready.concatMap(ready => {
      return this.worker.sendMessage('query-index', query) as Observable<SearchResults>;
    }).subscribe(results => this.resultsSubject.next(results));
  }
}
