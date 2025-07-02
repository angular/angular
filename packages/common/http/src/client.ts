/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, ɵRuntimeError as RuntimeError} from '@angular/core';
import {Observable, of} from 'rxjs';
import {concatMap, filter, map} from 'rxjs/operators';

import {HttpHandler} from './backend';
import {HttpContext} from './context';
import {HttpHeaders} from './headers';
import {HttpParams, HttpParamsOptions} from './params';
import {HttpRequest} from './request';
import {HttpEvent, HttpResponse} from './response';
import {RuntimeErrorCode} from './errors';

/**
 * Constructs an instance of `HttpRequestOptions<T>` from a source `HttpMethodOptions` and
 * the given `body`. This function clones the object and adds the body.
 *
 * Note that the `responseType` *options* value is a String that identifies the
 * single data type of the response.
 * A single overload version of the method handles each response type.
 * The value of `responseType` cannot be a union, as the combined signature could imply.
 *
 */
function addBody<T>(
  options: {
    headers?: HttpHeaders | Record<string, string | string[]>;
    context?: HttpContext;
    observe?: 'body' | 'events' | 'response';
    params?:
      | HttpParams
      | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    reportProgress?: boolean;
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
    withCredentials?: boolean;
    credentials?: RequestCredentials;
    keepalive?: boolean;
    priority?: RequestPriority;
    cache?: RequestCache;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    integrity?: string;
    transferCache?: {includeHeaders?: string[]} | boolean;
  },
  body: T | null,
): any {
  return {
    body,
    headers: options.headers,
    context: options.context,
    observe: options.observe,
    params: options.params,
    reportProgress: options.reportProgress,
    responseType: options.responseType,
    withCredentials: options.withCredentials,
    transferCache: options.transferCache,
    keepalive: options.keepalive,
    priority: options.priority,
    cache: options.cache,
    mode: options.mode,
    redirect: options.redirect,
  };
}

/**
 * Performs HTTP requests.
 * This service is available as an injectable class, with methods to perform HTTP requests.
 * Each request method has multiple signatures, and the return type varies based on
 * the signature that is called (mainly the values of `observe` and `responseType`).
 *
 * Note that the `responseType` *options* value is a String that identifies the
 * single data type of the response.
 * A single overload version of the method handles each response type.
 * The value of `responseType` cannot be a union, as the combined signature could imply.
 *
 * @usageNotes
 *
 * ### HTTP Request Example
 *
 * ```ts
 *  // GET heroes whose name contains search term
 * searchHeroes(term: string): observable<Hero[]>{
 *
 *  const params = new HttpParams({fromString: 'name=term'});
 *    return this.httpClient.request('GET', this.heroesUrl, {responseType:'json', params});
 * }
 * ```
 *
 * Alternatively, the parameter string can be used without invoking HttpParams
 * by directly joining to the URL.
 * ```ts
 * this.httpClient.request('GET', this.heroesUrl + '?' + 'name=term', {responseType:'json'});
 * ```
 *
 *
 * ### JSONP Example
 * ```ts
 * requestJsonp(url, callback = 'callback') {
 *  return this.httpClient.jsonp(this.heroesURL, callback);
 * }
 * ```
 *
 * ### PATCH Example
 * ```ts
 * // PATCH one of the heroes' name
 * patchHero (id: number, heroName: string): Observable<{}> {
 * const url = `${this.heroesUrl}/${id}`;   // PATCH api/heroes/42
 *  return this.httpClient.patch(url, {name: heroName}, httpOptions)
 *    .pipe(catchError(this.handleError('patchHero')));
 * }
 * ```
 *
 * @see [HTTP Guide](guide/http)
 * @see [HTTP Request](api/common/http/HttpRequest)
 *
 * @publicApi
 */
@Injectable()
export class HttpClient {
  constructor(private handler: HttpHandler) {}

  /**
   * Sends an `HttpRequest` and returns a stream of `HttpEvent`s.
   *
   * @return An `Observable` of the response, with the response body as a stream of `HttpEvent`s.
   */
  request<R>(req: HttpRequest<any>): Observable<HttpEvent<R>>;

  /**
   * Constructs a request that interprets the body as an `ArrayBuffer` and returns the response in
   * an `ArrayBuffer`.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   *
   * @return An `Observable` of the response, with the response body as an `ArrayBuffer`.
   */
  request(
    method: string,
    url: string,
    options: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<ArrayBuffer>;

  /**
   * Constructs a request that interprets the body as a blob and returns
   * the response as a blob.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with the response body of type `Blob`.
   */
  request(
    method: string,
    url: string,
    options: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<Blob>;

  /**
   * Constructs a request that interprets the body as a text string and
   * returns a string value.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with the response body of type string.
   */
  request(
    method: string,
    url: string,
    options: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<string>;

  /**
   * Constructs a request that interprets the body as an `ArrayBuffer` and returns the
   * the full event stream.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with the response body as an array of `HttpEvent`s for
   * the request.
   */
  request(
    method: string,
    url: string,
    options: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      observe: 'events';
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<ArrayBuffer>>;

  /**
   * Constructs a request that interprets the body as a `Blob` and returns
   * the full event stream.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of all `HttpEvent`s for the request,
   * with the response body of type `Blob`.
   */
  request(
    method: string,
    url: string,
    options: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<Blob>>;

  /**
   * Constructs a request which interprets the body as a text string and returns the full event
   * stream.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of all `HttpEvent`s for the request,
   * with the response body of type string.
   */
  request(
    method: string,
    url: string,
    options: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<string>>;

  /**
   * Constructs a request which interprets the body as a JavaScript object and returns the full
   * event stream.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the  request.
   *
   * @return An `Observable` of all `HttpEvent`s for the request,
   * with the response body of type `Object`.
   */
  request(
    method: string,
    url: string,
    options: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      reportProgress?: boolean;
      observe: 'events';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<any>>;

  /**
   * Constructs a request which interprets the body as a JavaScript object and returns the full
   * event stream.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of all `HttpEvent`s for the request,
   * with the response body of type `R`.
   */
  request<R>(
    method: string,
    url: string,
    options: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      reportProgress?: boolean;
      observe: 'events';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<R>>;

  /**
   * Constructs a request which interprets the body as an `ArrayBuffer`
   * and returns the full `HttpResponse`.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse`, with the response body as an `ArrayBuffer`.
   */
  request(
    method: string,
    url: string,
    options: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<ArrayBuffer>>;

  /**
   * Constructs a request which interprets the body as a `Blob` and returns the full `HttpResponse`.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse`, with the response body of type `Blob`.
   */
  request(
    method: string,
    url: string,
    options: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<Blob>>;

  /**
   * Constructs a request which interprets the body as a text stream and returns the full
   * `HttpResponse`.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the HTTP response, with the response body of type string.
   */
  request(
    method: string,
    url: string,
    options: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<string>>;

  /**
   * Constructs a request which interprets the body as a JavaScript object and returns the full
   * `HttpResponse`.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the full `HttpResponse`,
   * with the response body of type `Object`.
   */
  request(
    method: string,
    url: string,
    options: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      reportProgress?: boolean;
      observe: 'response';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<Object>>;

  /**
   * Constructs a request which interprets the body as a JavaScript object and returns
   * the full `HttpResponse` with the response body in the requested type.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return  An `Observable` of the full `HttpResponse`, with the response body of type `R`.
   */
  request<R>(
    method: string,
    url: string,
    options: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      reportProgress?: boolean;
      observe: 'response';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<R>>;

  /**
   * Constructs a request which interprets the body as a JavaScript object and returns the full
   * `HttpResponse` as a JavaScript object.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse`, with the response body of type `Object`.
   */
  request(
    method: string,
    url: string,
    options?: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      responseType?: 'json';
      reportProgress?: boolean;
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<Object>;

  /**
   * Constructs a request which interprets the body as a JavaScript object
   * with the response body of the requested type.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse`, with the response body of type `R`.
   */
  request<R>(
    method: string,
    url: string,
    options?: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      responseType?: 'json';
      reportProgress?: boolean;
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<R>;

  /**
   * Constructs a request where response type and requested observable are not known statically.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the requested response, with body of type `any`.
   */
  request(
    method: string,
    url: string,
    options?: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      observe?: 'body' | 'events' | 'response';
      reportProgress?: boolean;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<any>;

  /**
   * Constructs an observable for a generic HTTP request that, when subscribed,
   * fires the request through the chain of registered interceptors and on to the
   * server.
   *
   * You can pass an `HttpRequest` directly as the only parameter. In this case,
   * the call returns an observable of the raw `HttpEvent` stream.
   *
   * Alternatively you can pass an HTTP method as the first parameter,
   * a URL string as the second, and an options hash containing the request body as the third.
   * See `addBody()`. In this case, the specified `responseType` and `observe` options determine the
   * type of returned observable.
   *   * The `responseType` value determines how a successful response body is parsed.
   *   * If `responseType` is the default `json`, you can pass a type interface for the resulting
   * object as a type parameter to the call.
   *
   * The `observe` value determines the return type, according to what you are interested in
   * observing.
   *   * An `observe` value of events returns an observable of the raw `HttpEvent` stream, including
   * progress events by default.
   *   * An `observe` value of response returns an observable of `HttpResponse<T>`,
   * where the `T` parameter depends on the `responseType` and any optionally provided type
   * parameter.
   *   * An `observe` value of body returns an observable of `<T>` with the same `T` body type.
   *
   */
  request(
    first: string | HttpRequest<any>,
    url?: string,
    options: {
      body?: any;
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body' | 'events' | 'response';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    } = {},
  ): Observable<any> {
    let req: HttpRequest<any>;
    // First, check whether the primary argument is an instance of `HttpRequest`.
    if (first instanceof HttpRequest) {
      // It is. The other arguments must be undefined (per the signatures) and can be
      // ignored.
      req = first;
    } else {
      // It's a string, so it represents a URL. Construct a request based on it,
      // and incorporate the remaining arguments (assuming `GET` unless a method is
      // provided.

      // Figure out the headers.
      let headers: HttpHeaders | undefined = undefined;
      if (options.headers instanceof HttpHeaders) {
        headers = options.headers;
      } else {
        headers = new HttpHeaders(options.headers);
      }

      // Sort out parameters.
      let params: HttpParams | undefined = undefined;
      if (!!options.params) {
        if (options.params instanceof HttpParams) {
          params = options.params;
        } else {
          params = new HttpParams({fromObject: options.params} as HttpParamsOptions);
        }
      }
      // Construct the request.
      req = new HttpRequest(first, url!, options.body !== undefined ? options.body : null, {
        headers,
        context: options.context,
        params,
        reportProgress: options.reportProgress,
        // By default, JSON is assumed to be returned for all calls.
        responseType: options.responseType || 'json',
        withCredentials: options.withCredentials,
        transferCache: options.transferCache,
        keepalive: options.keepalive,
        priority: options.priority,
        cache: options.cache,
        mode: options.mode,
        redirect: options.redirect,
        credentials: options.credentials,
        referrer: options.referrer,
        integrity: options.integrity,
      });
    }
    // Start with an Observable.of() the initial request, and run the handler (which
    // includes all interceptors) inside a concatMap(). This way, the handler runs
    // inside an Observable chain, which causes interceptors to be re-run on every
    // subscription (this also makes retries re-run the handler, including interceptors).
    const events$: Observable<HttpEvent<any>> = of(req).pipe(
      concatMap((req: HttpRequest<any>) => this.handler.handle(req)),
    );

    // If coming via the API signature which accepts a previously constructed HttpRequest,
    // the only option is to get the event stream. Otherwise, return the event stream if
    // that is what was requested.
    if (first instanceof HttpRequest || options.observe === 'events') {
      return events$;
    }

    // The requested stream contains either the full response or the body. In either
    // case, the first step is to filter the event stream to extract a stream of
    // responses(s).
    const res$: Observable<HttpResponse<any>> = <Observable<HttpResponse<any>>>(
      events$.pipe(filter((event: HttpEvent<any>) => event instanceof HttpResponse))
    );

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
            return res$.pipe(
              map((res: HttpResponse<any>) => {
                // Validate that the body is an ArrayBuffer.
                if (res.body !== null && !(res.body instanceof ArrayBuffer)) {
                  throw new RuntimeError(
                    RuntimeErrorCode.RESPONSE_IS_NOT_AN_ARRAY_BUFFER,
                    ngDevMode && 'Response is not an ArrayBuffer.',
                  );
                }
                return res.body;
              }),
            );
          case 'blob':
            return res$.pipe(
              map((res: HttpResponse<any>) => {
                // Validate that the body is a Blob.
                if (res.body !== null && !(res.body instanceof Blob)) {
                  throw new RuntimeError(
                    RuntimeErrorCode.RESPONSE_IS_NOT_A_BLOB,
                    ngDevMode && 'Response is not a Blob.',
                  );
                }
                return res.body;
              }),
            );
          case 'text':
            return res$.pipe(
              map((res: HttpResponse<any>) => {
                // Validate that the body is a string.
                if (res.body !== null && typeof res.body !== 'string') {
                  throw new RuntimeError(
                    RuntimeErrorCode.RESPONSE_IS_NOT_A_STRING,
                    ngDevMode && 'Response is not a string.',
                  );
                }
                return res.body;
              }),
            );
          case 'json':
          default:
            // No validation needed for JSON responses, as they can be of any type.
            return res$.pipe(map((res: HttpResponse<any>) => res.body));
        }
      case 'response':
        // The response stream was requested directly, so return it.
        return res$;
      default:
        // Guard against new future observe types being added.
        throw new RuntimeError(
          RuntimeErrorCode.UNHANDLED_OBSERVE_TYPE,
          ngDevMode && `Unreachable: unhandled observe type ${options.observe}}`,
        );
    }
  }

  /**
   * Constructs a `DELETE` request that interprets the body as an `ArrayBuffer`
   *  and returns the response as an `ArrayBuffer`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return  An `Observable` of the response body as an `ArrayBuffer`.
   */
  delete(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    },
  ): Observable<ArrayBuffer>;

  /**
   * Constructs a `DELETE` request that interprets the body as a `Blob` and returns
   * the response as a `Blob`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response body as a `Blob`.
   */
  delete(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    },
  ): Observable<Blob>;

  /**
   * Constructs a `DELETE` request that interprets the body as a text string and returns
   * a string.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with the response body of type string.
   */
  delete(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    },
  ): Observable<string>;

  /**
   * Constructs a `DELETE` request that interprets the body as an `ArrayBuffer`
   *  and returns the full event stream.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of all `HttpEvent`s for the request,
   * with response body as an `ArrayBuffer`.
   */
  delete(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    },
  ): Observable<HttpEvent<ArrayBuffer>>;

  /**
   * Constructs a `DELETE` request that interprets the body as a `Blob`
   *  and returns the full event stream.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of all the `HttpEvent`s for the request, with the response body as a
   * `Blob`.
   */
  delete(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    },
  ): Observable<HttpEvent<Blob>>;

  /**
   * Constructs a `DELETE` request that interprets the body as a text string
   * and returns the full event stream.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of all `HttpEvent`s for the request, with the response
   * body of type string.
   */
  delete(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    },
  ): Observable<HttpEvent<string>>;

  /**
   * Constructs a `DELETE` request that interprets the body as JSON
   * and returns the full event stream.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of all `HttpEvent`s for the request, with response body of
   * type `Object`.
   */
  delete(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    },
  ): Observable<HttpEvent<Object>>;

  /**
   * Constructs a `DELETE`request that interprets the body as JSON
   * and returns the full event stream.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of all the `HttpEvent`s for the request, with a response
   * body in the requested type.
   */
  delete<T>(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | (string | number | boolean)[]>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    },
  ): Observable<HttpEvent<T>>;

  /**
   * Constructs a `DELETE` request that interprets the body as an `ArrayBuffer` and returns
   *  the full `HttpResponse`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the full `HttpResponse`, with the response body as an `ArrayBuffer`.
   */
  delete(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    },
  ): Observable<HttpResponse<ArrayBuffer>>;

  /**
   * Constructs a `DELETE` request that interprets the body as a `Blob` and returns the full
   * `HttpResponse`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse`, with the response body of type `Blob`.
   */
  delete(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    },
  ): Observable<HttpResponse<Blob>>;

  /**
   * Constructs a `DELETE` request that interprets the body as a text stream and
   *  returns the full `HttpResponse`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the full `HttpResponse`, with the response body of type string.
   */
  delete(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    },
  ): Observable<HttpResponse<string>>;

  /**
   * Constructs a `DELETE` request the interprets the body as a JavaScript object and returns
   * the full `HttpResponse`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse`, with the response body of type `Object`.
   *
   */
  delete(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    },
  ): Observable<HttpResponse<Object>>;

  /**
   * Constructs a `DELETE` request that interprets the body as JSON
   * and returns the full `HttpResponse`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse`, with the response body of the requested type.
   */
  delete<T>(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    },
  ): Observable<HttpResponse<T>>;

  /**
   * Constructs a `DELETE` request that interprets the body as JSON and
   * returns the response body as an object parsed from JSON.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with the response body of type `Object`.
   */
  delete(
    url: string,
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    },
  ): Observable<Object>;

  /**
   * Constructs a DELETE request that interprets the body as JSON and returns
   * the response in a given type.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse`, with response body in the requested type.
   */
  delete<T>(
    url: string,
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    },
  ): Observable<T>;

  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `DELETE` request to execute on the server. See the individual overloads for
   * details on the return type.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   */
  delete(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body' | 'events' | 'response';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      body?: any | null;
    } = {},
  ): Observable<any> {
    return this.request<any>('DELETE', url, options as any);
  }

  /**
   * Constructs a `GET` request that interprets the body as an `ArrayBuffer` and returns the
   * response in an `ArrayBuffer`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with the response body as an `ArrayBuffer`.
   */
  get(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<ArrayBuffer>;

  /**
   * Constructs a `GET` request that interprets the body as a `Blob`
   * and returns the response as a `Blob`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with the response body as a `Blob`.
   */
  get(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<Blob>;

  /**
   * Constructs a `GET` request that interprets the body as a text string
   * and returns the response as a string value.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with the response body of type string.
   */
  get(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<string>;

  /**
   * Constructs a `GET` request that interprets the body as an `ArrayBuffer` and returns
   *  the full event stream.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of all `HttpEvent`s for the request, with the response
   * body as an `ArrayBuffer`.
   */
  get(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<ArrayBuffer>>;

  /**
   * Constructs a `GET` request that interprets the body as a `Blob` and
   * returns the full event stream.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with the response body as a `Blob`.
   */
  get(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<Blob>>;

  /**
   * Constructs a `GET` request that interprets the body as a text string and returns
   * the full event stream.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with the response body of type string.
   */
  get(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<string>>;

  /**
   * Constructs a `GET` request that interprets the body as JSON
   * and returns the full event stream.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with the response body of type `Object`.
   */
  get(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<Object>>;

  /**
   * Constructs a `GET` request that interprets the body as JSON and returns the full
   * event stream.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with a response body in the requested type.
   */
  get<T>(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<T>>;

  /**
   * Constructs a `GET` request that interprets the body as an `ArrayBuffer` and
   * returns the full `HttpResponse`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with the response body as an `ArrayBuffer`.
   */
  get(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<ArrayBuffer>>;

  /**
   * Constructs a `GET` request that interprets the body as a `Blob` and
   * returns the full `HttpResponse`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with the response body as a `Blob`.
   */
  get(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<Blob>>;

  /**
   * Constructs a `GET` request that interprets the body as a text stream and
   * returns the full `HttpResponse`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with the response body of type string.
   */
  get(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<string>>;

  /**
   * Constructs a `GET` request that interprets the body as JSON and
   * returns the full `HttpResponse`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the full `HttpResponse`,
   * with the response body of type `Object`.
   */
  get(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<Object>>;

  /**
   * Constructs a `GET` request that interprets the body as JSON and
   * returns the full `HttpResponse`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the full `HttpResponse` for the request,
   * with a response body in the requested type.
   */
  get<T>(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<T>>;

  /**
   * Constructs a `GET` request that interprets the body as JSON and
   * returns the response body as an object parsed from JSON.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   *
   * @return An `Observable` of the response body as a JavaScript object.
   */
  get(
    url: string,
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<Object>;

  /**
   * Constructs a `GET` request that interprets the body as JSON and returns
   * the response body in a given type.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse`, with a response body in the requested type.
   */
  get<T>(
    url: string,
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<T>;

  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `GET` request to execute on the server. See the individual overloads for
   * details on the return type.
   */
  get(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body' | 'events' | 'response';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    } = {},
  ): Observable<any> {
    return this.request<any>('GET', url, options as any);
  }

  /**
   * Constructs a `HEAD` request that interprets the body as an `ArrayBuffer` and
   * returns the response as an `ArrayBuffer`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with the response body as an `ArrayBuffer`.
   */
  head(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<ArrayBuffer>;

  /**
   * Constructs a `HEAD` request that interprets the body as a `Blob` and returns
   * the response as a `Blob`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return  An `Observable` of the response, with the response body as a `Blob`.
   */

  head(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<Blob>;

  /**
   * Constructs a `HEAD` request that interprets the body as a text string and returns the response
   * as a string value.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with the response body of type string.
   */
  head(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<string>;

  /**
   * Constructs a `HEAD` request that interprets the body as an  `ArrayBuffer`
   *  and returns the full event stream.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of all `HttpEvent`s for the request,
   * with the response body as an `ArrayBuffer`.
   */
  head(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<ArrayBuffer>>;

  /**
   * Constructs a `HEAD` request that interprets the body as a `Blob` and
   * returns the full event stream.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of all `HttpEvent`s for the request,
   * with the response body as a `Blob`.
   */
  head(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<Blob>>;

  /**
   * Constructs a `HEAD` request that interprets the body as a text string
   * and returns the full event stream.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of all `HttpEvent`s for the request, with the response body of type
   * string.
   */
  head(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<string>>;

  /**
   * Constructs a `HEAD` request that interprets the body as JSON
   * and returns the full HTTP event stream.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of all `HttpEvent`s for the request, with a response body of
   * type `Object`.
   */
  head(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<Object>>;

  /**
   * Constructs a `HEAD` request that interprets the body as JSON and
   * returns the full event stream.
   *
   * @return An `Observable` of all the `HttpEvent`s for the request,
   * with a response body in the requested type.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   */
  head<T>(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<T>>;

  /**
   * Constructs a `HEAD` request that interprets the body as an `ArrayBuffer`
   *  and returns the full HTTP response.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with the response body as an `ArrayBuffer`.
   */
  head(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<ArrayBuffer>>;

  /**
   * Constructs a `HEAD` request that interprets the body as a `Blob` and returns
   * the full `HttpResponse`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with the response body as a blob.
   */
  head(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<Blob>>;

  /**
   * Constructs a `HEAD` request that interprets the body as text stream
   * and returns the full `HttpResponse`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with the response body of type string.
   */
  head(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<string>>;

  /**
   * Constructs a `HEAD` request that interprets the body as JSON and
   * returns the full `HttpResponse`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with the response body of type `Object`.
   */
  head(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;

      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<Object>>;

  /**
   * Constructs a `HEAD` request that interprets the body as JSON
   * and returns the full `HttpResponse`.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with a response body of the requested type.
   */
  head<T>(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<T>>;

  /**

   * Constructs a `HEAD` request that interprets the body as JSON and
   * returns the response body as an object parsed from JSON.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with the response body as an object parsed from JSON.
   */
  head(
    url: string,
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<Object>;

  /**
   * Constructs a `HEAD` request that interprets the body as JSON and returns
   * the response in a given type.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with a response body of the given type.
   */
  head<T>(
    url: string,
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<T>;

  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `HEAD` request to execute on the server. The `HEAD` method returns
   * meta information about the resource without transferring the
   * resource itself. See the individual overloads for
   * details on the return type.
   */
  head(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body' | 'events' | 'response';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    } = {},
  ): Observable<any> {
    return this.request<any>('HEAD', url, options as any);
  }

  /**
   * Constructs a `JSONP` request for the given URL and name of the callback parameter.
   *
   * @param url The resource URL.
   * @param callbackParam The callback function name.
   *
   * @return An `Observable` of the response object, with response body as an object.
   */
  jsonp(url: string, callbackParam: string): Observable<Object>;

  /**
   * Constructs a `JSONP` request for the given URL and name of the callback parameter.
   *
   * @param url The resource URL.
   * @param callbackParam The callback function name.
   *
   * You must install a suitable interceptor, such as one provided by `HttpClientJsonpModule`.
   * If no such interceptor is reached,
   * then the `JSONP` request can be rejected by the configured backend.
   *
   * @return An `Observable` of the response object, with response body in the requested type.
   */
  jsonp<T>(url: string, callbackParam: string): Observable<T>;

  /**
   * Constructs an `Observable` that, when subscribed, causes a request with the special method
   * `JSONP` to be dispatched via the interceptor pipeline.
   * The [JSONP pattern](https://en.wikipedia.org/wiki/JSONP) works around limitations of certain
   * API endpoints that don't support newer,
   * and preferable [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) protocol.
   * JSONP treats the endpoint API as a JavaScript file and tricks the browser to process the
   * requests even if the API endpoint is not located on the same domain (origin) as the client-side
   * application making the request.
   * The endpoint API must support JSONP callback for JSONP requests to work.
   * The resource API returns the JSON response wrapped in a callback function.
   * You can pass the callback function name as one of the query parameters.
   * Note that JSONP requests can only be used with `GET` requests.
   *
   * @param url The resource URL.
   * @param callbackParam The callback function name.
   *
   */
  jsonp<T>(url: string, callbackParam: string): Observable<T> {
    return this.request<any>('JSONP', url, {
      params: new HttpParams().append(callbackParam, 'JSONP_CALLBACK'),
      observe: 'body',
      responseType: 'json',
    });
  }

  /**
   * Constructs an `OPTIONS` request that interprets the body as an
   * `ArrayBuffer` and returns the response as an `ArrayBuffer`.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return An `Observable` of the response, with the response body as an `ArrayBuffer`.
   */
  options(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<ArrayBuffer>;

  /**
   * Constructs an `OPTIONS` request that interprets the body as a `Blob` and returns
   * the response as a `Blob`.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return An `Observable` of the response, with the response body as a `Blob`.
   */
  options(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<Blob>;

  /**
   * Constructs an `OPTIONS` request that interprets the body as a text string and
   * returns a string value.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return An `Observable` of the response, with the response body of type string.
   */
  options(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<string>;

  /**
   * Constructs an `OPTIONS` request that interprets the body as an `ArrayBuffer`
   *  and returns the full event stream.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return  An `Observable` of all `HttpEvent`s for the request,
   * with the response body as an `ArrayBuffer`.
   */
  options(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpEvent<ArrayBuffer>>;

  /**
   * Constructs an `OPTIONS` request that interprets the body as a `Blob` and
   * returns the full event stream.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return An `Observable` of all `HttpEvent`s for the request,
   * with the response body as a `Blob`.
   */
  options(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpEvent<Blob>>;

  /**
   * Constructs an `OPTIONS` request that interprets the body as a text string
   * and returns the full event stream.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return An `Observable` of all the `HttpEvent`s for the request,
   * with the response body of type string.
   */
  options(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpEvent<string>>;

  /**
   * Constructs an `OPTIONS` request that interprets the body as JSON
   * and returns the full event stream.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return An `Observable` of all the `HttpEvent`s for the request with the response
   * body of type `Object`.
   */
  options(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpEvent<Object>>;

  /**
   * Constructs an `OPTIONS` request that interprets the body as JSON and
   * returns the full event stream.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return An `Observable` of all the `HttpEvent`s for the request,
   * with a response body in the requested type.
   */
  options<T>(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpEvent<T>>;

  /**
   * Constructs an `OPTIONS` request that interprets the body as an `ArrayBuffer`
   *  and returns the full HTTP response.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with the response body as an `ArrayBuffer`.
   */
  options(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<ArrayBuffer>>;

  /**
   * Constructs an `OPTIONS` request that interprets the body as a `Blob`
   *  and returns the full `HttpResponse`.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with the response body as a `Blob`.
   */
  options(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<Blob>>;

  /**
   * Constructs an `OPTIONS` request that interprets the body as text stream
   * and returns the full `HttpResponse`.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with the response body of type string.
   */
  options(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<string>>;

  /**
   * Constructs an `OPTIONS` request that interprets the body as JSON
   * and returns the full `HttpResponse`.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with the response body of type `Object`.
   */
  options(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<Object>>;

  /**
   * Constructs an `OPTIONS` request that interprets the body as JSON and
   * returns the full `HttpResponse`.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with a response body in the requested type.
   */
  options<T>(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<T>>;

  /**

   * Constructs an `OPTIONS` request that interprets the body as JSON and returns the
   * response body as an object parsed from JSON.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return An `Observable` of the response, with the response body as an object parsed from JSON.
   */
  options(
    url: string,
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<Object>;

  /**
   * Constructs an `OPTIONS` request that interprets the body as JSON and returns the
   * response in a given type.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return An `Observable` of the `HttpResponse`, with a response body of the given type.
   */
  options<T>(
    url: string,
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<T>;

  /**
   * Constructs an `Observable` that, when subscribed, causes the configured
   * `OPTIONS` request to execute on the server. This method allows the client
   * to determine the supported HTTP methods and other capabilities of an endpoint,
   * without implying a resource action. See the individual overloads for
   * details on the return type.
   */
  options(
    url: string,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body' | 'events' | 'response';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    } = {},
  ): Observable<any> {
    return this.request<any>('OPTIONS', url, options as any);
  }

  /**
   * Constructs a `PATCH` request that interprets the body as an `ArrayBuffer` and returns
   * the response as an `ArrayBuffer`.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return An `Observable` of the response, with the response body as an `ArrayBuffer`.
   */
  patch(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<ArrayBuffer>;

  /**
   * Constructs a `PATCH` request that interprets the body as a `Blob` and returns the response
   * as a `Blob`.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return An `Observable` of the response, with the response body as a `Blob`.
   */
  patch(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<Blob>;

  /**
   * Constructs a `PATCH` request that interprets the body as a text string and
   * returns the response as a string value.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return An `Observable` of the response, with a response body of type string.
   */
  patch(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<string>;

  /**
   * Constructs a `PATCH` request that interprets the body as an `ArrayBuffer` and
   *  returns the full event stream.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return An `Observable` of all the `HttpEvent`s for the request,
   * with the response body as an `ArrayBuffer`.
   */

  patch(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpEvent<ArrayBuffer>>;

  /**
   * Constructs a `PATCH` request that interprets the body as a `Blob`
   *  and returns the full event stream.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return An `Observable` of all the `HttpEvent`s for the request, with the
   * response body as `Blob`.
   */
  patch(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpEvent<Blob>>;

  /**
   * Constructs a `PATCH` request that interprets the body as a text string and
   * returns the full event stream.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return An `Observable` of all the `HttpEvent`s for the request, with a
   * response body of type string.
   */
  patch(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpEvent<string>>;

  /**
   * Constructs a `PATCH` request that interprets the body as JSON
   * and returns the full event stream.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return An `Observable` of all the `HttpEvent`s for the request,
   * with a response body of type `Object`.
   */
  patch(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpEvent<Object>>;

  /**
   * Constructs a `PATCH` request that interprets the body as JSON
   * and returns the full event stream.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return An `Observable` of all the `HttpEvent`s for the request,
   * with a response body in the requested type.
   */
  patch<T>(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpEvent<T>>;

  /**
   * Constructs a `PATCH` request that interprets the body as an `ArrayBuffer`
   *  and returns the full `HttpResponse`.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return  An `Observable` of the `HttpResponse` for the request,
   * with the response body as an `ArrayBuffer`.
   */
  patch(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<ArrayBuffer>>;

  /**
   * Constructs a `PATCH` request that interprets the body as a `Blob` and returns the full
   * `HttpResponse`.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return  An `Observable` of the `HttpResponse` for the request,
   * with the response body as a `Blob`.
   */
  patch(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<Blob>>;

  /**
   * Constructs a `PATCH` request that interprets the body as a text stream and returns the
   * full `HttpResponse`.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return  An `Observable` of the `HttpResponse` for the request,
   * with a response body of type string.
   */
  patch(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<string>>;

  /**
   * Constructs a `PATCH` request that interprets the body as JSON
   * and returns the full `HttpResponse`.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with a response body in the requested type.
   */
  patch(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<Object>>;

  /**
   * Constructs a `PATCH` request that interprets the body as JSON
   * and returns the full `HttpResponse`.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with a response body in the given type.
   */
  patch<T>(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<T>>;

  /**

   * Constructs a `PATCH` request that interprets the body as JSON and
   * returns the response body as an object parsed from JSON.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return An `Observable` of the response, with the response body as an object parsed from JSON.
   */
  patch(
    url: string,
    body: any | null,
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<Object>;

  /**
   * Constructs a `PATCH` request that interprets the body as JSON
   * and returns the response in a given type.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return  An `Observable` of the `HttpResponse` for the request,
   * with a response body in the given type.
   */
  patch<T>(
    url: string,
    body: any | null,
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<T>;

  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `PATCH` request to execute on the server. See the individual overloads for
   * details on the return type.
   */
  patch(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body' | 'events' | 'response';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    } = {},
  ): Observable<any> {
    return this.request<any>('PATCH', url, addBody(options, body));
  }

  /**
   * Constructs a `POST` request that interprets the body as an `ArrayBuffer` and returns
   * an `ArrayBuffer`.
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options.
   *
   * @return An `Observable` of the response, with the response body as an `ArrayBuffer`.
   */
  post(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<ArrayBuffer>;

  /**
   * Constructs a `POST` request that interprets the body as a `Blob` and returns the
   * response as a `Blob`.
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options
   *
   * @return An `Observable` of the response, with the response body as a `Blob`.
   */
  post(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<Blob>;

  /**
   * Constructs a `POST` request that interprets the body as a text string and
   * returns the response as a string value.
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options
   *
   * @return An `Observable` of the response, with a response body of type string.
   */
  post(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<string>;

  /**
   * Constructs a `POST` request that interprets the body as an `ArrayBuffer` and
   * returns the full event stream.
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options
   *
   * @return An `Observable` of all `HttpEvent`s for the request,
   * with the response body as an `ArrayBuffer`.
   */
  post(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<ArrayBuffer>>;

  /**
   * Constructs a `POST` request that interprets the body as a `Blob`
   * and returns the response in an observable of the full event stream.
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options
   *
   * @return An `Observable` of all `HttpEvent`s for the request, with the response body as `Blob`.
   */
  post(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<Blob>>;

  /**
   * Constructs a `POST` request that interprets the body as a text string and returns the full
   * event stream.
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options
   *
   * @return  An `Observable` of all `HttpEvent`s for the request,
   * with a response body of type string.
   */
  post(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<string>>;

  /**
   * Constructs a POST request that interprets the body as JSON and returns the full
   * event stream.
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options
   *
   * @return  An `Observable` of all `HttpEvent`s for the request,
   * with a response body of type `Object`.
   */
  post(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<Object>>;

  /**
   * Constructs a POST request that interprets the body as JSON and returns the full
   * event stream.
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options
   *
   * @return An `Observable` of all `HttpEvent`s for the request,
   * with a response body in the requested type.
   */
  post<T>(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpEvent<T>>;

  /**
   * Constructs a POST request that interprets the body as an `ArrayBuffer`
   *  and returns the full `HttpResponse`.
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options
   *
   * @return  An `Observable` of the `HttpResponse` for the request, with the response body as an
   * `ArrayBuffer`.
   */
  post(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<ArrayBuffer>>;

  /**
   * Constructs a `POST` request that interprets the body as a `Blob` and returns the full
   * `HttpResponse`.
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with the response body as a `Blob`.
   */
  post(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<Blob>>;

  /**
   * Constructs a `POST` request that interprets the body as a text stream and returns
   * the full `HttpResponse`.
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options
   *
   * @return  An `Observable` of the `HttpResponse` for the request,
   * with a response body of type string.
   */
  post(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<string>>;

  /**
   * Constructs a `POST` request that interprets the body as JSON
   * and returns the full `HttpResponse`.
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options
   *
   * @return An `Observable` of the `HttpResponse` for the request, with a response body of type
   * `Object`.
   */
  post(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<Object>>;

  /**
   * Constructs a `POST` request that interprets the body as JSON and returns the
   * full `HttpResponse`.
   *
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options
   *
   * @return An `Observable` of the `HttpResponse` for the request, with a response body in the
   * requested type.
   */
  post<T>(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<HttpResponse<T>>;

  /**
   * Constructs a `POST` request that interprets the body as JSON
   * and returns the response body as an object parsed from JSON.
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options
   *
   * @return An `Observable` of the response, with the response body as an object parsed from JSON.
   */
  post(
    url: string,
    body: any | null,
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<Object>;

  /**
   * Constructs a `POST` request that interprets the body as JSON
   * and returns an observable of the response.
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options
   *
   * @return  An `Observable` of the `HttpResponse` for the request, with a response body in the
   * requested type.
   */
  post<T>(
    url: string,
    body: any | null,
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    },
  ): Observable<T>;

  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `POST` request to execute on the server. The server responds with the location of
   * the replaced resource. See the individual overloads for
   * details on the return type.
   */
  post(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body' | 'events' | 'response';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
      transferCache?: {includeHeaders?: string[]} | boolean;
    } = {},
  ): Observable<any> {
    return this.request<any>('POST', url, addBody(options, body));
  }

  /**
   * Constructs a `PUT` request that interprets the body as an `ArrayBuffer` and returns the
   * response as an `ArrayBuffer`.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` of the response, with the response body as an `ArrayBuffer`.
   */
  put(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<ArrayBuffer>;

  /**
   * Constructs a `PUT` request that interprets the body as a `Blob` and returns
   * the response as a `Blob`.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` of the response, with the response body as a `Blob`.
   */
  put(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<Blob>;

  /**
   * Constructs a `PUT` request that interprets the body as a text string and
   * returns the response as a string value.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` of the response, with a response body of type string.
   */
  put(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<string>;

  /**
   * Constructs a `PUT` request that interprets the body as an `ArrayBuffer` and
   * returns the full event stream.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` of all `HttpEvent`s for the request,
   * with the response body as an `ArrayBuffer`.
   */
  put(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpEvent<ArrayBuffer>>;

  /**
   * Constructs a `PUT` request that interprets the body as a `Blob` and returns the full event
   * stream.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` of all `HttpEvent`s for the request,
   * with the response body as a `Blob`.
   */
  put(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpEvent<Blob>>;

  /**
   * Constructs a `PUT` request that interprets the body as a text string and returns the full event
   * stream.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` of all `HttpEvent`s for the request, with a response body
   * of type string.
   */
  put(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpEvent<string>>;

  /**
   * Constructs a `PUT` request that interprets the body as JSON and returns the full
   * event stream.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` of all `HttpEvent`s for the request, with a response body of
   * type `Object`.
   */
  put(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpEvent<Object>>;

  /**
   * Constructs a `PUT` request that interprets the body as JSON and returns the
   * full event stream.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` of all `HttpEvent`s for the request,
   * with a response body in the requested type.
   */
  put<T>(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpEvent<T>>;

  /**
   * Constructs a `PUT` request that interprets the body as an
   * `ArrayBuffer` and returns an observable of the full HTTP response.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` of the `HttpResponse` for the request, with the response body as an
   * `ArrayBuffer`.
   */
  put(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<ArrayBuffer>>;

  /**
   * Constructs a `PUT` request that interprets the body as a `Blob` and returns the
   * full HTTP response.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with the response body as a `Blob`.
   */
  put(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<Blob>>;

  /**
   * Constructs a `PUT` request that interprets the body as a text stream and returns the
   * full HTTP response.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` of the `HttpResponse` for the request, with a response body of type
   * string.
   */
  put(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<string>>;

  /**
   * Constructs a `PUT` request that interprets the body as JSON and returns the full
   * HTTP response.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` of the `HttpResponse` for the request, with a response body
   * of type 'Object`.
   */
  put(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<Object>>;

  /**
   * Constructs a `PUT` request that interprets the body as an instance of the requested type and
   * returns the full HTTP response.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` of the `HttpResponse` for the request,
   * with a response body in the requested type.
   */
  put<T>(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<HttpResponse<T>>;

  /**
   * Constructs a `PUT` request that interprets the body as JSON
   * and returns an observable of JavaScript object.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` of the response as a JavaScript object.
   */
  put(
    url: string,
    body: any | null,
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<Object>;

  /**
   * Constructs a `PUT` request that interprets the body as an instance of the requested type
   * and returns an observable of the requested type.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` of the requested type.
   */
  put<T>(
    url: string,
    body: any | null,
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    },
  ): Observable<T>;

  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `PUT` request to execute on the server. The `PUT` method replaces an existing resource
   * with a new set of values.
   * See the individual overloads for details on the return type.
   */
  put(
    url: string,
    body: any | null,
    options: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      context?: HttpContext;
      observe?: 'body' | 'events' | 'response';
      params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      reportProgress?: boolean;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      referrer?: string;
      integrity?: string;
    } = {},
  ): Observable<any> {
    return this.request<any>('PUT', url, addBody(options, body));
  }
}
