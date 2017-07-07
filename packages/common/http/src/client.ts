/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {of } from 'rxjs/observable/of';
import {concatMap} from 'rxjs/operator/concatMap';
import {filter} from 'rxjs/operator/filter';
import {map} from 'rxjs/operator/map';

import {HttpHandler} from './backend';
import {HttpHeaders} from './headers';
import {HttpParams} from './params';
import {HttpRequest} from './request';
import {HttpEvent, HttpEventType, HttpResponse} from './response';


/**
 * Construct an instance of `HttpRequestOptions<T>` from a source `HttpMethodOptions` and
 * the given `body`. Basically, this clones the object and adds the body.
 */
function addBody<T>(
    options: {
      headers?: HttpHeaders,
      observe?: HttpObserve,
      params?: HttpParams,
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text',
      withCredentials?: boolean,
    },
    body: T | null): any {
  return {
    body,
    headers: options.headers,
    observe: options.observe,
    params: options.params,
    responseType: options.responseType,
    withCredentials: options.withCredentials,
  };
}

/**
 * @experimental
 */
export type HttpObserve = 'body' | 'events' | 'response';

/**
 * The main API for making outgoing HTTP requests.
 *
 * @experimental
 */
@Injectable()
export class HttpClient {
  constructor(private handler: HttpHandler) {}

  request<R>(req: HttpRequest<any>): Observable<HttpEvent<R>>;
  request(method: string, url: string, options: {
    body?: any,
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;
  request(method: string, url: string, options: {
    body?: any,
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;
  request(method: string, url: string, options: {
    body?: any,
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;
  request(method: string, url: string, options: {
    body?: any,
    headers?: HttpHeaders,
    params?: HttpParams,
    observe: 'events',
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;
  request(method: string, url: string, options: {
    body?: any,
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;
  request(method: string, url: string, options: {
    body?: any,
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;
  request<R>(method: string, url: string, options: {
    body?: any,
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpEvent<R>>;
  request(method: string, url: string, options: {
    body?: any,
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;
  request(method: string, url: string, options: {
    body?: any,
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;
  request(method: string, url: string, options: {
    body?: any,
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;
  request<R>(method: string, url: string, options: {
    body?: any,
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpResponse<R>>;
  request(method: string, url: string, options?: {
    body?: any,
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<Object>;
  request<R>(method: string, url: string, options?: {
    body?: any,
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<R>;
  request(method: string, url: string, options?: {
    body?: any,
    headers?: HttpHeaders,
    params?: HttpParams,
    observe?: HttpObserve,
    responseType?: 'arraybuffer'|'blob'|'json'|'text',
    withCredentials?: boolean,
  }): Observable<any>;
  /**
   * Constructs an `Observable` for a particular HTTP request that, when subscribed,
   * fires the request through the chain of registered interceptors and on to the
   * server.
   *
   * This method can be called in one of two ways. Either an `HttpRequest`
   * instance can be passed directly as the only parameter, or a method can be
   * passed as the first parameter, a string URL as the second, and an
   * options hash as the third.
   *
   * If a `HttpRequest` object is passed directly, an `Observable` of the
   * raw `HttpEvent` stream will be returned.
   *
   * If a request is instead built by providing a URL, the options object
   * determines the return type of `request()`. In addition to configuring
   * request parameters such as the outgoing headers and/or the body, the options
   * hash specifies two key pieces of information about the request: the
   * `responseType` and what to `observe`.
   *
   * The `responseType` value determines how a successful response body will be
   * parsed. If `responseType` is the default `json`, a type interface for the
   * resulting object may be passed as a type parameter to `request()`.
   *
   * The `observe` value determines the return type of `request()`, based on what
   * the consumer is interested in observing. A value of `events` will return an
   * `Observable<HttpEvent>` representing the raw `HttpEvent` stream,
   * including progress events by default. A value of `response` will return an
   * `Observable<HttpResponse<T>>` where the `T` parameter of `HttpResponse`
   * depends on the `responseType` and any optionally provided type parameter.
   * A value of `body` will return an `Observable<T>` with the same `T` body type.
   */
  request(first: string|HttpRequest<any>, url?: string, options: {
    body?: any,
    headers?: HttpHeaders,
    observe?: HttpObserve,
    params?: HttpParams,
    responseType?: 'arraybuffer'|'blob'|'json'|'text',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    let req: HttpRequest<any>;
    // Firstly, check whether the primary argument is an instance of `HttpRequest`.
    if (first instanceof HttpRequest) {
      // It is. The other arguments must be undefined (per the signatures) and can be
      // ignored.
      req = first as HttpRequest<any>;
    } else {
      // It's a string, so it represents a URL. Construct a request based on it,
      // and incorporate the remaining arguments (assuming GET unless a method is
      // provided.
      req = new HttpRequest(first, url !, options.body || null, {
        headers: options.headers,
        params: options.params,
        // By default, JSON is assumed to be returned for all calls.
        responseType: options.responseType || 'json',
        withCredentials: options.withCredentials,
      });
    }

    // Start with an Observable.of() the initial request, and run the handler (which
    // includes all interceptors) inside a concatMap(). This way, the handler runs
    // inside an Observable chain, which causes interceptors to be re-run on every
    // subscription (this also makes retries re-run the handler, including interceptors).
    const events$: Observable<HttpEvent<any>> =
        concatMap.call(of (req), (req: HttpRequest<any>) => this.handler.handle(req));

    // If coming via the API signature which accepts a previously constructed HttpRequest,
    // the only option is to get the event stream. Otherwise, return the event stream if
    // that is what was requested.
    if (first instanceof HttpRequest || options.observe === 'events') {
      return events$;
    }

    // The requested stream contains either the full response or the body. In either
    // case, the first step is to filter the event stream to extract a stream of
    // responses(s).
    const res$: Observable<HttpResponse<any>> =
        filter.call(events$, (event: HttpEvent<any>) => event instanceof HttpResponse);

    // Decide which stream to return.
    switch (options.observe || 'body') {
      case 'body':
        // The requested stream is the body. Map the response stream to the response
        // body. This could be done more simply, but a misbehaving interceptor might
        // transform the response body into a different format and ignore the requested
        // responseType. Guard against this by validating that the response is of the
        // requested type.
        switch (req.responseType) {
          case 'arraybuffer':
            return map.call(res$, (res: HttpResponse<any>) => {
              // Validate that the body is an ArrayBuffer.
              if (res.body !== null && !(res.body instanceof ArrayBuffer)) {
                throw new Error('Response is not an ArrayBuffer.');
              }
              return res.body;
            });
          case 'blob':
            return map.call(res$, (res: HttpResponse<any>) => {
              // Validate that the body is a Blob.
              if (res.body !== null && !(res.body instanceof Blob)) {
                throw new Error('Response is not a Blob.');
              }
              return res.body;
            });
          case 'text':
            return map.call(res$, (res: HttpResponse<any>) => {
              // Validate that the body is a string.
              if (res.body !== null && typeof res.body !== 'string') {
                throw new Error('Response is not a string.');
              }
              return res.body;
            });
          case 'json':
          default:
            // No validation needed for JSON responses, as they can be of any type.
            return map.call(res$, (res: HttpResponse<any>) => res.body);
        }
      case 'response':
        // The response stream was requested directly, so return it.
        return res$;
      default:
        // Guard against new future observe types being added.
        throw new Error(`Unreachable: unhandled observe type ${options.observe}}`);
    }
  }

  delete (url: string, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;
  delete (url: string, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;
  delete (url: string, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;
  delete (url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;
  delete (url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;
  delete (url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;
  delete (url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpEvent<Object>>;
  delete<T>(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpEvent<T>>;
  delete (url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;
  delete (url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;
  delete (url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;
  delete (url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpResponse<Object>>;
  delete<T>(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpResponse<T>>;
  delete (url: string, options?: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<Object>;
  delete<T>(url: string, options?: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<T>;
  /**
   * Constructs an `Observable` which, when subscribed, will cause the configured
   * DELETE request to be executed on the server. See {@link HttpClient#request} for
   * details of `delete()`'s return type based on the provided options.
   */
  delete (url: string, options: {
    headers?: HttpHeaders,
    observe?: HttpObserve,
    params?: HttpParams,
    responseType?: 'arraybuffer'|'blob'|'json'|'text',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    return this.request<any>('DELETE', url, options as any);
  }

  get(url: string, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;
  get(url: string, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;
  get(url: string, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;
  get(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;
  get(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;
  get(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;
  get(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpEvent<Object>>;
  get<T>(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpEvent<T>>;
  get(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;
  get(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;
  get(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;
  get(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpResponse<Object>>;
  get<T>(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpResponse<T>>;
  get(url: string, options?: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<Object>;
  get<T>(url: string, options?: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<T>;
  /**
   * Constructs an `Observable` which, when subscribed, will cause the configured
   * GET request to be executed on the server. See {@link HttpClient#request} for
   * details of `get()`'s return type based on the provided options.
   */
  get(url: string, options: {
    headers?: HttpHeaders,
    observe?: HttpObserve,
    params?: HttpParams,
    responseType?: 'arraybuffer'|'blob'|'json'|'text',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    return this.request<any>('GET', url, options as any);
  }

  head(url: string, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;
  head(url: string, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;
  head(url: string, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;
  head(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;
  head(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;
  head(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;
  head(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpEvent<Object>>;
  head<T>(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpEvent<T>>;
  head(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;
  head(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;
  head(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;
  head(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpResponse<Object>>;
  head<T>(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpResponse<T>>;
  head(url: string, options?: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<Object>;
  head<T>(url: string, options?: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<T>;
  /**
   * Constructs an `Observable` which, when subscribed, will cause the configured
   * HEAD request to be executed on the server. See {@link HttpClient#request} for
   * details of `head()`'s return type based on the provided options.
   */
  head(url: string, options: {
    headers?: HttpHeaders,
    observe?: HttpObserve,
    params?: HttpParams,
    responseType?: 'arraybuffer'|'blob'|'json'|'text',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    return this.request<any>('HEAD', url, options as any);
  }

  jsonp(url: string, callbackParam: string): Observable<any>;
  jsonp<T>(url: string, callbackParam: string): Observable<T>;
  /**
   * Constructs an `Observable` which, when subscribed, will cause a request
   * with the special method `JSONP` to be dispatched via the interceptor pipeline.
   *
   * A suitable interceptor must be installed (e.g. via the `HttpClientJsonpModule`).
   * If no such interceptor is reached, then the `JSONP` request will likely be
   * rejected by the configured backend.
   */
  jsonp<T>(url: string, callbackParam: string): Observable<T> {
    return this.request<any>('JSONP', url, {
      params: new HttpParams().append(callbackParam, 'JSONP_CALLBACK'),
      observe: 'body',
      responseType: 'json',
    });
  }

  options(url: string, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;
  options(url: string, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;
  options(url: string, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;
  options(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;
  options(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;
  options(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;
  options(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpEvent<Object>>;
  options<T>(url: string, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpEvent<T>>;
  options(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;
  options(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;
  options(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;
  options(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpResponse<Object>>;
  options<T>(url: string, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpResponse<T>>;
  options(url: string, options?: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<Object>;
  options<T>(url: string, options?: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<T>;
  /**
   * Constructs an `Observable` which, when subscribed, will cause the configured
   * OPTIONS request to be executed on the server. See {@link HttpClient#request} for
   * details of `options()`'s return type based on the provided options.
   */
  options(url: string, options: {
    headers?: HttpHeaders,
    observe?: HttpObserve,
    params?: HttpParams,
    responseType?: 'arraybuffer'|'blob'|'json'|'text',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    return this.request<any>('OPTIONS', url, options as any);
  }

  patch(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;
  patch(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;
  patch(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;
  patch(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;
  patch(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;
  patch(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;
  patch(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpEvent<Object>>;
  patch<T>(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpEvent<T>>;
  patch(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;
  patch(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;
  patch(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;
  patch(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpResponse<Object>>;
  patch<T>(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpResponse<T>>;
  patch(url: string, body: any|null, options?: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<Object>;
  patch<T>(url: string, body: any|null, options?: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<T>;
  /**
   * Constructs an `Observable` which, when subscribed, will cause the configured
   * PATCH request to be executed on the server. See {@link HttpClient#request} for
   * details of `patch()`'s return type based on the provided options.
   */
  patch(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe?: HttpObserve,
    params?: HttpParams,
    responseType?: 'arraybuffer'|'blob'|'json'|'text',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    return this.request<any>('PATCH', url, addBody(options, body));
  }

  post(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;
  post(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;
  post(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;
  post(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;
  post(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;
  post(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;
  post(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpEvent<Object>>;
  post<T>(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpEvent<T>>;
  post(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;
  post(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;
  post(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;
  post(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpResponse<Object>>;
  post<T>(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpResponse<T>>;
  post(url: string, body: any|null, options?: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<Object>;
  post<T>(url: string, body: any|null, options?: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<T>;
  /**
   * Constructs an `Observable` which, when subscribed, will cause the configured
   * POST request to be executed on the server. See {@link HttpClient#request} for
   * details of `post()`'s return type based on the provided options.
   */
  post(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe?: HttpObserve,
    params?: HttpParams,
    responseType?: 'arraybuffer'|'blob'|'json'|'text',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    return this.request<any>('POST', url, addBody(options, body));
  }

  put(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;
  put(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;
  put(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;
  put(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;
  put(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;
  put(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;
  put(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'events', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpEvent<Object>>;
  put<T>(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'events', responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpEvent<T>>;
  put(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;
  put(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;
  put(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;
  put(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpResponse<Object>>;
  put<T>(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe: 'response', params?: HttpParams, responseType?: 'json', withCredentials?: boolean,
  }): Observable<HttpResponse<T>>;
  put(url: string, body: any|null, options?: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<Object>;
  put<T>(url: string, body: any|null, options?: {
    headers?: HttpHeaders,
    observe?: 'body',
    params?: HttpParams,
    responseType?: 'json',
    withCredentials?: boolean,
  }): Observable<T>;
  /**
   * Constructs an `Observable` which, when subscribed, will cause the configured
   * POST request to be executed on the server. See {@link HttpClient#request} for
   * details of `post()`'s return type based on the provided options.
   */
  put(url: string, body: any|null, options: {
    headers?: HttpHeaders,
    observe?: HttpObserve,
    params?: HttpParams,
    responseType?: 'arraybuffer'|'blob'|'json'|'text',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    return this.request<any>('PUT', url, addBody(options, body));
  }
}
