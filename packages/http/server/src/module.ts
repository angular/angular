/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injectable, NgModule, Provider} from '@angular/core';
import {BrowserXhr, Connection, ConnectionBackend, Http, HttpModule, ReadyState, Request, RequestOptions, XHRBackend, XSRFStrategy,} from '@angular/http';
import {Observable, Observer, Subscription} from 'rxjs';

const xhr2: any = require('xhr2');

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

export abstract class ZoneMacroTaskWrapper<S, R> {
  wrap(request: S): Observable<R> {
    return new Observable((observer: Observer<R>) => {
      let task: Task = null !;
      let scheduled: boolean = false;
      let sub: Subscription|null = null;
      let savedResult: any = null;
      let savedError: any = null;

      const scheduleTask = (_task: Task) => {
        task = _task;
        scheduled = true;

        const delegate = this.delegate(request);
        sub = delegate.subscribe(
            res => savedResult = res,
            err => {
              if (!scheduled) {
                throw new Error(
                    'An http observable was completed twice. This shouldn\'t happen, please file a bug.');
              }
              savedError = err;
              scheduled = false;
              task.invoke();
            },
            () => {
              if (!scheduled) {
                throw new Error(
                    'An http observable was completed twice. This shouldn\'t happen, please file a bug.');
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

      // MockBackend for Http is synchronous, which means that if scheduleTask is by
      // scheduleMacroTask, the request will hit MockBackend and the response will be
      // sent, causing task.invoke() to be called.
      const _task = Zone.current.scheduleMacroTask(
          'ZoneMacroTaskWrapper.subscribe', onComplete, {}, () => null, cancelTask);
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

  protected abstract delegate(request: S): Observable<R>;
}

export class ZoneMacroTaskConnection extends ZoneMacroTaskWrapper<Request, Response> implements
    Connection {
  response: Observable<Response>;
  // TODO(issue/24571): remove '!'.
  lastConnection !: Connection;

  constructor(public request: Request, private backend: XHRBackend) {
    super();
    validateRequestUrl(request.url);
    this.response = this.wrap(request);
  }

  delegate(request: Request): Observable<Response> {
    this.lastConnection = this.backend.createConnection(request);
    return this.lastConnection.response as Observable<Response>;
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

/**
 * The ng module for the server.
 *
 * @deprecated
 * @publicApi
 */
@NgModule({imports: [HttpModule], providers: SERVER_HTTP_PROVIDERS})
export class ServerHttpModule {
}
