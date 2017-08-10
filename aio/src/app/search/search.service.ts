/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/

import { NgZone, Injectable, Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/observable/race';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/publish';
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
  private searchesSubject = new ReplaySubject<string>(1);
  searchResults: Observable<SearchResults>;

  constructor(private zone: NgZone) {}

  /**
   * Initialize the search engine. We offer an `initDelay` to prevent the search initialisation from delaying the
   * initial rendering of the web page. Triggering a search will override this delay and cause the index to be
   * loaded immediately.
   *
   * @param workerUrl the url of the WebWorker script that runs the searches
   * @param initDelay the number of milliseconds to wait before we load the WebWorker and generate the search index
   */
  initWorker(workerUrl: string, initDelay: number) {
    const searchResults = Observable
      // Wait for the initDelay or the first search
      .race(
        Observable.timer(initDelay),
        this.searchesSubject.first()
      )
      .concatMap(() => {
        // Create the worker and load the index
        const worker = WebWorkerClient.create(workerUrl, this.zone);
        return worker.sendMessage('load-index').concatMap(() =>
          // Once the index has loaded, switch to listening to the searches coming in
          this.searchesSubject.switchMap((query) =>
            // Each search gets switched to a web worker message, whose results are returned via an observable
            worker.sendMessage<SearchResults>('query-index', query)
          )
        );
      }).publish();

      // Connect to the observable to kick off the timer
    searchResults.connect();

    // Expose the connected observable to the rest of the world
    this.searchResults = searchResults;
  }

  /**
   * Send a search query to the index.
   * The results will appear on the `searchResults` observable.
   */
  search(query: string) {
    this.searchesSubject.next(query);
  }
}
