/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/

import {NgZone} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/switchMap';


export interface QueryResults {}

export interface ResultsReadyMessage {
  type: 'query-results';
  id: number;
  query: string;
  results: QueryResults;
}

export class SearchWorkerClient {
  ready: Promise<boolean>;
  worker: Worker;
  private _queryId = 0;

  constructor(url: string, private zone: NgZone) {
    this.worker = new Worker(url);
    this.ready = this._waitForIndex(this.worker);
  }

  search(query: string) {
    return Observable.fromPromise(this.ready)
            .switchMap(() => this._createQuery(query));
  }

  private _waitForIndex(worker: Worker) {
    return new Promise((resolve, reject) => {

      worker.onmessage = (e) => {
        if(e.data.type === 'index-ready') {
          resolve(true);
          cleanup();
        }
      };

      worker.onerror = (e) => {
        reject(e);
        cleanup();
      };
    });

    function cleanup() {
      worker.onmessage = null;
      worker.onerror = null;
    }
  }

  private _createQuery(query: string) {
    return new Observable<QueryResults>((subscriber: Subscriber<QueryResults>) => {

      // get a new identifier for this query that we can match to results
      const id = this._queryId++;

      const handleMessage = (message: MessageEvent) => {
        const {type, id: queryId, results} = message.data as ResultsReadyMessage;
        if (type === 'query-results' && id === queryId) {
          this.zone.run(() => {
            subscriber.next(results);
            subscriber.complete();
          });
        }
      };

      const handleError = (error: ErrorEvent) => {
        this.zone.run(() => {
          subscriber.error(error);
        });
      };

      // Wire up the event listeners for this query
      this.worker.addEventListener('message', handleMessage);
      this.worker.addEventListener('error', handleError);

      // Post the query to the web worker
      this.worker.postMessage({query, id});

      // At completion/error unwire the event listeners
      return () => {
        this.worker.removeEventListener('message', handleMessage);
        this.worker.removeEventListener('error', handleError);
      };
    });
  }
}
