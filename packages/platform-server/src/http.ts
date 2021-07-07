/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {INITIAL_CONFIG, PlatformConfig} from './tokens';


const xhr2: any = require('xhr2');

import {Injectable, Injector, Provider} from '@angular/core';
import {PlatformLocation, XhrFactory} from '@angular/common';
import {HttpEvent, HttpRequest, HttpHandler, HttpBackend, ɵHttpInterceptingHandler as HttpInterceptingHandler} from '@angular/common/http';
import {Observable, Observer, Subscription} from 'rxjs';

// @see https://www.w3.org/Protocols/HTTP/1.1/draft-ietf-http-v11-spec-01#URI-syntax
const isAbsoluteUrl = /^[a-zA-Z\-\+.]+:\/\//;

@Injectable()
export class ServerXhr implements XhrFactory {
  build(): XMLHttpRequest {
    return new xhr2.XMLHttpRequest();
  }
}

export abstract class ZoneMacroTaskWrapper<S, R> {
  wrap(request: S): Observable<R> {
    return new Observable((observer: Observer<R>) => {
      let task: Task = null!;
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

export class ZoneClientBackend extends
    ZoneMacroTaskWrapper<HttpRequest<any>, HttpEvent<any>> implements HttpBackend {
  constructor(
      private backend: HttpBackend, private platformLocation: PlatformLocation,
      private config: PlatformConfig) {
    super();
  }

  handle(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    const {href, protocol, hostname, port} = this.platformLocation;
    if (this.config.useAbsoluteUrl && !isAbsoluteUrl.test(request.url) &&
        isAbsoluteUrl.test(href)) {
      const baseHref = this.platformLocation.getBaseHrefFromDOM() || href;
      const urlPrefix = `${protocol}//${hostname}` + (port ? `:${port}` : '');
      const baseUrl = new URL(baseHref, urlPrefix);
      const url = new URL(request.url, baseUrl);
      return this.wrap(request.clone({url: url.toString()}));
    }
    return this.wrap(request);
  }

  protected override delegate(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    return this.backend.handle(request);
  }
}

export function zoneWrappedInterceptingHandler(
    backend: HttpBackend, injector: Injector, platformLocation: PlatformLocation,
    config: PlatformConfig) {
  const realBackend: HttpBackend = new HttpInterceptingHandler(backend, injector);
  return new ZoneClientBackend(realBackend, platformLocation, config);
}

export const SERVER_HTTP_PROVIDERS: Provider[] = [
  {provide: XhrFactory, useClass: ServerXhr}, {
    provide: HttpHandler,
    useFactory: zoneWrappedInterceptingHandler,
    deps: [HttpBackend, Injector, PlatformLocation, INITIAL_CONFIG]
  }
];
