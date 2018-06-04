/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/

import { NgZone, Injectable } from '@angular/core';
import { ConnectableObservable, Observable, race, ReplaySubject, timer } from 'rxjs';
import { concatMap, first, publishReplay } from 'rxjs/operators';
import { WebWorkerClient } from 'app/shared/web-worker';
import { SearchResults } from 'app/search/interfaces';

@Injectable()
export class SearchService {
  private ready: Observable<boolean>;
  private searchesSubject = new ReplaySubject<string>(1);
  private worker: WebWorkerClient;
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
    // Wait for the initDelay or the first search
    const ready = this.ready = race<any>(
        timer(initDelay),
        this.searchesSubject.asObservable().pipe(first()),
      )
      .pipe(
        concatMap(() => {
          // Create the worker and load the index
          this.worker = WebWorkerClient.create(workerUrl, this.zone);
          return this.worker.sendMessage<boolean>('load-index');
        }),
        publishReplay(1),
      );

    // Connect to the observable to kick off the timer
    (ready as ConnectableObservable<boolean>).connect();
    return ready;
  }

  /**
   * Search the index using the given query and emit results on the observable that is returned.
   * @param query The query to run against the index.
   * @returns an observable collection of search results
   */
  search(query: string): Observable<SearchResults> {
    // Trigger the searches subject to override the init delay timer
    this.searchesSubject.next(query);
    // Once the index has loaded, switch to listening to the searches coming in.
    return this.ready.pipe(concatMap(() => this.worker.sendMessage<SearchResults>('query-index', query)));
  }
}
