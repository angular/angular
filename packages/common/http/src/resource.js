/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  Injector,
  ɵResourceImpl as ResourceImpl,
  inject,
  linkedSignal,
  assertInInjectionContext,
  signal,
  computed,
  ɵRuntimeError,
  ɵencapsulateResourceError as encapsulateResourceError,
} from '@angular/core';
import {HttpRequest} from './request';
import {HttpClient} from './client';
import {HttpErrorResponse, HttpEventType} from './response';
import {HttpHeaders} from './headers';
import {HttpParams} from './params';
/**
 * `httpResource` makes a reactive HTTP request and exposes the request status and response value as
 * a `WritableResource`. By default, it assumes that the backend will return JSON data. To make a
 * request that expects a different kind of data, you can use a sub-constructor of `httpResource`,
 * such as `httpResource.text`.
 *
 * @experimental 19.2
 * @initializerApiFunction
 */
export const httpResource = (() => {
  const jsonFn = makeHttpResourceFn('json');
  jsonFn.arrayBuffer = makeHttpResourceFn('arraybuffer');
  jsonFn.blob = makeHttpResourceFn('blob');
  jsonFn.text = makeHttpResourceFn('text');
  return jsonFn;
})();
function makeHttpResourceFn(responseType) {
  return function httpResource(request, options) {
    if (ngDevMode && !options?.injector) {
      assertInInjectionContext(httpResource);
    }
    const injector = options?.injector ?? inject(Injector);
    return new HttpResourceImpl(
      injector,
      () => normalizeRequest(request, responseType),
      options?.defaultValue,
      options?.parse,
      options?.equal,
    );
  };
}
function normalizeRequest(request, responseType) {
  let unwrappedRequest = typeof request === 'function' ? request() : request;
  if (unwrappedRequest === undefined) {
    return undefined;
  } else if (typeof unwrappedRequest === 'string') {
    unwrappedRequest = {url: unwrappedRequest};
  }
  const headers =
    unwrappedRequest.headers instanceof HttpHeaders
      ? unwrappedRequest.headers
      : new HttpHeaders(unwrappedRequest.headers);
  const params =
    unwrappedRequest.params instanceof HttpParams
      ? unwrappedRequest.params
      : new HttpParams({fromObject: unwrappedRequest.params});
  return new HttpRequest(
    unwrappedRequest.method ?? 'GET',
    unwrappedRequest.url,
    unwrappedRequest.body ?? null,
    {
      headers,
      params,
      reportProgress: unwrappedRequest.reportProgress,
      withCredentials: unwrappedRequest.withCredentials,
      keepalive: unwrappedRequest.keepalive,
      cache: unwrappedRequest.cache,
      priority: unwrappedRequest.priority,
      mode: unwrappedRequest.mode,
      redirect: unwrappedRequest.redirect,
      responseType,
      context: unwrappedRequest.context,
      transferCache: unwrappedRequest.transferCache,
      credentials: unwrappedRequest.credentials,
      referrer: unwrappedRequest.referrer,
      integrity: unwrappedRequest.integrity,
      timeout: unwrappedRequest.timeout,
    },
  );
}
class HttpResourceImpl extends ResourceImpl {
  constructor(injector, request, defaultValue, parse, equal) {
    super(
      request,
      ({params: request, abortSignal}) => {
        let sub;
        // Track the abort listener so it can be removed if the Observable completes (as a memory
        // optimization).
        const onAbort = () => sub.unsubscribe();
        abortSignal.addEventListener('abort', onAbort);
        // Start off stream as undefined.
        const stream = signal({value: undefined});
        let resolve;
        const promise = new Promise((r) => (resolve = r));
        const send = (value) => {
          stream.set(value);
          resolve?.(stream);
          resolve = undefined;
        };
        sub = this.client.request(request).subscribe({
          next: (event) => {
            switch (event.type) {
              case HttpEventType.Response:
                this._headers.set(event.headers);
                this._statusCode.set(event.status);
                try {
                  send({value: parse ? parse(event.body) : event.body});
                } catch (error) {
                  send({error: encapsulateResourceError(error)});
                }
                break;
              case HttpEventType.DownloadProgress:
                this._progress.set(event);
                break;
            }
          },
          error: (error) => {
            if (error instanceof HttpErrorResponse) {
              this._headers.set(error.headers);
              this._statusCode.set(error.status);
            }
            send({error});
            abortSignal.removeEventListener('abort', onAbort);
          },
          complete: () => {
            if (resolve) {
              send({
                error: new ɵRuntimeError(
                  991 /* ɵRuntimeErrorCode.RESOURCE_COMPLETED_BEFORE_PRODUCING_VALUE */,
                  ngDevMode && 'Resource completed before producing a value',
                ),
              });
            }
            abortSignal.removeEventListener('abort', onAbort);
          },
        });
        return promise;
      },
      defaultValue,
      equal,
      injector,
    );
    this._headers = linkedSignal({
      source: this.extRequest,
      computation: () => undefined,
    });
    this._progress = linkedSignal({
      source: this.extRequest,
      computation: () => undefined,
    });
    this._statusCode = linkedSignal({
      source: this.extRequest,
      computation: () => undefined,
    });
    this.headers = computed(() =>
      this.status() === 'resolved' || this.status() === 'error' ? this._headers() : undefined,
    );
    this.progress = this._progress.asReadonly();
    this.statusCode = this._statusCode.asReadonly();
    this.client = injector.get(HttpClient);
  }
  set(value) {
    super.set(value);
    this._headers.set(undefined);
    this._progress.set(undefined);
    this._statusCode.set(undefined);
  }
}
//# sourceMappingURL=resource.js.map
