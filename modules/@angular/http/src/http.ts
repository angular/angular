/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, NgModule} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {defer} from 'rxjs/observable/defer';
import {of } from 'rxjs/observable/of';
import {mergeMap} from 'rxjs/operator/mergeMap';

import {HttpBackend, XhrAdapter, XhrBackend} from './backend';
import {HttpHeaders, HttpHeadersMap} from './headers';
import {HTTP_INTERCEPTORS, HttpInterceptor, buildInterceptorChain} from './interceptor';
import {HttpBody, HttpMethod, HttpRequest, HttpResponse, HttpResponseTypeHint} from './request_response';
import {ArrayBuffer, Blob, FormData, URLSearchParams} from './scope';
import {HttpUrlParams} from './url_params';



/**
 * Plain Javascript object that can be passed into {@link HttpRequestMethodOpts}.
 */
export type HttpParamsMap = {
  [name: string]: string | string[]
};

/**
 * Options to set for an outgoing HTTP request with a specific method.
 */
export interface HttpRequestMethodOpts {
  /**
   * Headers to be sent with the outgoing request.
   */
  headers?: HttpHeaders|HttpHeadersMap;

  /**
   * Whether credentials should be sent with the outgoing request.
   */
  withCredentials?: boolean;

  /**
   * Parameters to be added to the URL of the outgoing request.
   */
  params?: HttpUrlParams|HttpParamsMap|string|Object;

  /**
   * A hint that the response will be of a particular type and should
   * be parsed as such.
   */
  responseTypeHint?: HttpResponseTypeHint;
}

/**
 * Options to be set for an outgoing HTTP request.
 */
export interface HttpRequestOpts extends HttpRequestMethodOpts {
  /**
   * HTTP method verb to be used for the request.
   */
  method?: HttpMethod;

  /**
   * Body to be sent with the request.
   */
  body?: HttpBody;
}

/**
 * Combine two {@link HttpRequestOpts} objects together.
 *
 * As {@link HttpRequestMethodOpts}
 */
function mergeOptions(baseOpts: HttpRequestOpts, mergeOpts: HttpRequestOpts): HttpRequestOpts {
  return {
    headers: mergeOpts.headers || baseOpts.headers,
    withCredentials: mergeOpts.withCredentials || baseOpts.withCredentials,
    body: mergeOpts.body || baseOpts.body,
    method: mergeOpts.method || baseOpts.method,
    params: mergeOpts.params || baseOpts.params,
    responseTypeHint: mergeOpts.responseTypeHint || baseOpts.responseTypeHint,
  };
}

/**
 *
 */
function paramsToString(params: HttpParamsMap): string {
  const usp = new HttpUrlParams();
  Object.keys(params).forEach(name => {
    const value = params[name];
    if (Array.isArray(value)) {
      value.forEach(v => usp.append(name, v));
    } else {
      usp.append(name, value);
    }
  });
  return usp.toString();
}

const symbolToStringTag: any = (Symbol as any).toStringTag;

export function detectContentType(body: HttpBody): string {
  if (!body) {
    return null;
  } else if (body instanceof FormData) {
    return 'multipart/form-data';
  } else if (body instanceof ArrayBuffer) {
    return null;
  } else if (body instanceof Blob) {
    return (body as Blob).type || null;
  } else if (body instanceof HttpUrlParams) {
    return 'application/x-www-form-urlencoded;charset=UTF-8';
  } else if (typeof body === 'object') {
    return 'application/json';
  } else {
    return 'text/plain';
  }
}

function hasContentType(headers?: HttpHeaders): boolean {
  return headers !== undefined && headers.has('content-type');
}

function makeHeaders(headers?: HttpHeaders | HttpHeadersMap): HttpHeaders {
  if (!headers) {
    return new HttpHeaders();
  }
  if (headers instanceof HttpHeaders) {
    return headers;
  }
  return new HttpHeaders(headers);
}

function maybeAugmentUrlWithParams(
    url: string, params: HttpParamsMap | HttpUrlParams | string | Object): string {
  if (!!params) {
    let str: string;
    if (params instanceof HttpUrlParams || params instanceof URLSearchParams ||
        typeof params === 'string') {
      str = params.toString();
    } else {
      let parsed = new HttpUrlParams();
      Object.keys(params).forEach(name => {
        const value = (params as HttpParamsMap)[name];
        if (Array.isArray(value)) {
          value.forEach(v => parsed.append(name, v));
        } else {
          parsed.append(name, value);
        }
      });
      str = parsed.toString();
    }
    if (str.length > 0) {
      let prefix = '?';
      if (url.indexOf('?') != -1) {
        prefix = (url[url.length - 1] == '&') ? '' : '&';
      }
      // TODO(alxhub): just delete search-query-looking string in url?
      return url + prefix + str;
    }
  }
  return url;
}

function makeRequest(url: string, opts: HttpRequestOpts): HttpRequest {
  let headers: HttpHeaders = makeHeaders(opts.headers);
  url = maybeAugmentUrlWithParams(url, opts.params);
  const req = new HttpRequest(url, {
    headers,
    body: opts.body,
    withCredentials: !!opts.withCredentials,
    method: (opts.method || 'GET').toUpperCase(),
  });
  return req;
}

function setDefaultHeaders(headers: HttpHeaders, body?: HttpBody): void {
  if (body !== undefined) {
    // Check if the Content-Type header is present, and try to
    // set one via auto-detection if it isn't.
    if (!hasContentType(headers)) {
      const detected = detectContentType(body);
      if (!!detected) {
        headers.set('Content-Type', detected);
      }
    }
  }
  if (!headers.has('Accept')) {
    headers.append('Accept', 'application/json, text/plain, */*');
  }
}

/**
 * Performs http requests using `XMLHttpRequest` as the default backend.
 *
 * `Http` is available as an injectable class, with methods to perform http requests. Calling
 * `request` returns an `Observable` which will emit a single {@link HttpResponse} when a
 * response is received.
 *
 * ### Example
 *
 * ```typescript
 * import {Http, HTTP_PROVIDERS} from '@angular/http';
 * import 'rxjs/add/operator/mergeMap'
 * @Component({
 *   selector: 'http-app',
 *   viewProviders: [HTTP_PROVIDERS],
 *   templateUrl: 'people.html'
 * })
 * class PeopleComponent {
 *   constructor(http: Http) {
 *     http.get('people.json')
 *       // Call mergeMap on the response observable to get the parsed people object
 *       .mergeMap(res => res.json())
 *       // Subscribe to the observable to get the parsed people object and attach it to the
 *       // component
 *       .subscribe(people => this.people = people);
 *   }
 * }
 * ```
 *
 *
 * ### Example
 *
 * ```
 * http.get('people.json').subscribe((res:Response) => this.people = res.json());
 * ```
 *
 * The default construct used to perform requests, `XMLHttpRequest`, is abstracted as a "Backend" (
 * {@link HttpBackend} in this case), which could be mocked by replacing the {@link HttpBackend}
 * provider, as in the following example:
 *
 * ### Example
 *
 * ```typescript
 * import {Http} from '@angular/http';
 * import {MockBackend} from '@angular/http/testing';
 *
 * let backend = new MockBackend();
 * let http = new Http(mockBackend);
 * http.get('request-from-mock-backend.json').subscribe(res => doSomething(res));
 * ```
 *
 * @experimental
 */
@Injectable()
export class Http {
  private backend: HttpBackend;

  constructor(
      finalBackend: HttpBackend, @Inject(HTTP_INTERCEPTORS) interceptors: HttpInterceptor[] = []) {
    this.backend = buildInterceptorChain(interceptors, finalBackend);
  }

  /**
   * Performs any type of http request. First argument is required, and can either be a url or
   * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
   * object can be provided as the 2nd argument. The options object will be merged with the values
   * of {@link BaseRequestOptions} before performing the request.
   */
  request(url: string|HttpRequest, options?: HttpRequestOpts): Observable<HttpResponse> {
    let request: HttpRequest = null;
    if (typeof url === 'string') {
      const merged = mergeOptions({method: 'GET'}, options || {});
      request = makeRequest(url, merged);
    } else if (url instanceof HttpRequest) {
      request = url as HttpRequest;
    } else {
      throw new Error('First argument must be a url string or HttpRequest instance.');
    }
    setDefaultHeaders(request.headers, request.body);

    // Start the sequence with deferred Observable that clones the outgoing request.
    // This ensures that every subscription to this Observable receives its own copy
    // of the request (including a cloned copy of the body).
    return mergeMap.call(
        defer(() => of (request.clone())), (req: HttpRequest) => this.backend.handle(req));
  }

  private _request(url: string, options: HttpRequestMethodOpts, override: HttpRequestOpts):
      Observable<HttpResponse> {
    const merged = mergeOptions(options || {}, override);
    return this.request(makeRequest(url, merged));
  }

  /**
   * Performs a request with `get` http method.
   */
  get(url: string, options?: HttpRequestMethodOpts): Observable<HttpResponse> {
    return this._request(url, options, {method: 'GET'});
  }

  /**
   * Performs a request with `get` http method that returns JSON directly.
   */
  jsonGet<T>(url: string, options?: HttpRequestMethodOpts): Observable<T> {
    return mergeMap.call(
        this._request(url, options, {method: 'GET', responseTypeHint: 'json'}),
        (res: HttpResponse) => res.json());
  }

  /**
   * Performs a request with `post` http method.
   */
  post(url: string, body: HttpBody, options?: HttpRequestMethodOpts): Observable<HttpResponse> {
    return this._request(url, options, {body, method: 'POST'});
  }

  /**
   * Performs a request with `post` http method that returns JSON directly.
   */
  jsonPost<T>(url: string, body: HttpBody, options?: HttpRequestMethodOpts): Observable<T> {
    return mergeMap.call(
        this._request(url, options, {body, method: 'POST', responseTypeHint: 'json'}),
        (res: HttpResponse) => res.json());
  }

  /**
   * Performs a request with `put` http method.
   */
  put(url: string, body: HttpBody, options?: HttpRequestMethodOpts): Observable<HttpResponse> {
    return this._request(url, options, {body, method: 'PUT'});
  }

  /**
   * Performs a request with `delete` http method.
   */
  delete (url: string, options?: HttpRequestMethodOpts): Observable<HttpResponse> {
    return this._request(url, options, {method: 'DELETE'});
  }

  /**
   * Performs a request with `patch` http method.
   */
  patch(url: string, body: HttpBody, options?: HttpRequestMethodOpts): Observable<HttpResponse> {
    return this._request(url, options, {body, method: 'PATCH'});
  }

  /**
   * Performs a request with `head` http method.
   */
  head(url: string, options?: HttpRequestMethodOpts): Observable<HttpResponse> {
    return this._request(url, options, {method: 'HEAD'});
  }

  /**
   * Performs a request with `options` http method.
   */
  options(url: string, options?: HttpRequestMethodOpts): Observable<HttpResponse> {
    return this._request(url, options, {method: 'OPTIONS'});
  }
}

/**
 * The module that includes http's providers
 *
 * @experimental
 */
@NgModule({
  providers: [Http, XhrAdapter, XhrBackend, {provide: HttpBackend, useExisting: XhrBackend}],
})
export class HttpModule {
}
