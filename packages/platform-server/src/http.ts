/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const xhr2: any = require('xhr2');

import {Injectable, Provider} from '@angular/core';
import {BrowserXhr, Connection, ConnectionBackend, Http, ReadyState, Request, RequestOptions, Response, XHRBackend, XSRFStrategy} from '@angular/http';

import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subscription} from 'rxjs/Subscription';

const isAbsoluteUrl = /^[a-zA-Z\-\+.]+:\/\//;

function validateRequestUrl(url: string): void {
  if (!isAbsoluteUrl.test(url)) {
    throw new Error(`URLs requested via Http on the server must be absolute. URL: ${url}`);
  }
}

@Injectable()
export class ServerXhr implements BrowserXhr {
  build(): XMLHttpRequest { return new xhr2.XMLHttpRequest(); }
}

@Injectable()
export class ServerXsrfStrategy implements XSRFStrategy {
  configureRequest(req: Request): void {}
}

export class ZoneMacroTaskConnection implements Connection {
  response: Observable<Response>;
  lastConnection: Connection;

  constructor(public request: Request, backend: XHRBackend) {
    validateRequestUrl(request.url);
    this.response = new Observable((observer: Observer<Response>) => {
      let task: Task = null !;
      let scheduled: boolean = false;
      let sub: Subscription|null = null;
      let savedResult: any = null;
      let savedError: any = null;

      const scheduleTask = (_task: Task) => {
        task = _task;
        scheduled = true;

        this.lastConnection = backend.createConnection(request);
        sub = (this.lastConnection.response as Observable<Response>)
                  .subscribe(
                      res => savedResult = res,
                      err => {
                        if (!scheduled) {
                          throw new Error('invoke twice');
                        }
                        savedError = err;
                        scheduled = false;
                        task.invoke();
                      },
                      () => {
                        if (!scheduled) {
                          throw new Error('invoke twice');
                        }
                        scheduled = false;
                        task.invoke();
                      });
      };

      const cancelTask = (_task: Task) => {
        if (!scheduled) {
          return;
        }
        scheduled = false;
        if (sub) {
          sub.unsubscribe();
          sub = null;
        }
      };

      const onComplete = () => {
        if (savedError !== null) {
          observer.error(savedError);
        } else {
          observer.next(savedResult);
          observer.complete();
        }
      };

      // MockBackend is currently synchronous, which means that if scheduleTask is by
      // scheduleMacroTask, the request will hit MockBackend and the response will be
      // sent, causing task.invoke() to be called.
      const _task = Zone.current.scheduleMacroTask(
          'ZoneMacroTaskConnection.subscribe', onComplete, {}, () => null, cancelTask);
      scheduleTask(_task);

      return () => {
        if (scheduled && task) {
          task.zone.cancelTask(task);
          scheduled = false;
        }
        if (sub) {
          sub.unsubscribe();
          sub = null;
        }
      };
    });
  }

  get readyState(): ReadyState {
    return !!this.lastConnection ? this.lastConnection.readyState : ReadyState.Unsent;
  }
}

export class ZoneMacroTaskBackend implements ConnectionBackend {
  constructor(private backend: XHRBackend) {}

  createConnection(request: any): ZoneMacroTaskConnection {
    return new ZoneMacroTaskConnection(request, this.backend);
  }
}

export function httpFactory(xhrBackend: XHRBackend, options: RequestOptions) {
  const macroBackend = new ZoneMacroTaskBackend(xhrBackend);
  return new Http(macroBackend, options);
}

export const SERVER_HTTP_PROVIDERS: Provider[] = [
  {provide: Http, useFactory: httpFactory, deps: [XHRBackend, RequestOptions]},
  {provide: BrowserXhr, useClass: ServerXhr},
  {provide: XSRFStrategy, useClass: ServerXsrfStrategy},
];
