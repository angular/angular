/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {concatMap, filter, map} from 'rxjs/operators';

import {HttpHandler} from './backend';
import {HttpHeaders} from './headers';
import {HttpParams, HttpParamsOptions} from './params';
import {HttpRequest} from './request';
import {HttpEvent, HttpResponse} from './response';

export type HttpObserve = 'body'|'events'|'response';
export type ResponseType = 'arraybuffer'|'blob'|'json'|'text';
export interface HttpRequestOptions {
  headers?: HttpHeaders|{[header: string]: string | string[]}, observe?: HttpObserve,
      params?: HttpParams|{[param: string]: string | string[]}, reportProgress?: boolean,
      responseType?: ResponseType, withCredentials?: boolean,
}
export type InferResponseTypeOption<O extends HttpRequestOptions, ResponseTypeOrAny> =
    O extends {responseType: 'arraybuffer'} ? ArrayBuffer : O extends {responseType: 'blob'} ?
    Blob :
    O extends {responseType: 'text'} ? string : O extends {responseType: 'json'} ?
    ResponseTypeOrAny :
    ResponseTypeOrAny
export type InferObserveOption<O extends HttpRequestOptions, ResponseTypeOrAny> =
    O extends {observe: 'events'} ? HttpEvent<ResponseTypeOrAny>: O extends {observe: 'response'} ?
    HttpResponse<ResponseTypeOrAny>:
    O extends {observe: 'body'} ? ResponseTypeOrAny : ResponseTypeOrAny;
export type InferHttpResponse<O extends HttpRequestOptions, ResponseTypeOrAny> =
    InferObserveOption<O, InferResponseTypeOption<O, ResponseTypeOrAny>>

        /**
         * Constructs an instance of `HttpRequestOptions` from a source `HttpMethodOptions` and
         * the given `body`. This function clones the object and adds the body.
         *
         * Note that the `responseType` *options* value is a String that identifies the
         * single data type of the response.
         * A single overload version of the method handles each response type.
         * The value of `responseType` cannot be a union, as the combined signature could imply.
         *
         */
        function addBody(options: HttpRequestOptions, body: any): HttpRequestOptions&{
          body: any
        } {
  return {
    body,
    headers: options.headers,
    observe: options.observe,
    params: options.params,
    reportProgress: options.reportProgress,
    responseType: options.responseType,
    withCredentials: options.withCredentials,
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
 * Sample HTTP requests for the [Tour of Heroes](/tutorial/toh-pt0) application.
 *
 * ### HTTP Request Example
 *
 * ```
 *  // GET heroes whose name contains search term
 * searchHeroes(term: string): observable<Hero[]>{
 *
 *  const params = new HttpParams({fromString: 'name=term'});
 *    return this.httpClient.request('GET', this.heroesUrl, {responseType:'json', params});
 * }
 * ```
 * ### JSONP Example
 * ```
 * requestJsonp(url, callback = 'callback') {
 *  return this.httpClient.jsonp(this.heroesURL, callback);
 * }
 * ```
 *
 * ### PATCH Example
 * ```
 * // PATCH one of the heroes' name
 * patchHero (id: number, heroName: string): Observable<{}> {
 * const url = `${this.heroesUrl}/${id}`;   // PATCH api/heroes/42
 *  return this.httpClient.patch(url, {name: heroName}, httpOptions)
 *    .pipe(catchError(this.handleError('patchHero')));
 * }
 * ```
 *
 * @see [HTTP Guide](guide/http)
 *
 * @publicApi
 */
@Injectable()
export class HttpClient {
  constructor(private handler: HttpHandler) {}

  /**
   * Sends an `HTTPRequest` and returns a stream of `HTTPEvents`.
   *
   * @return An `Observable` of the response, with the response body as a stream of `HTTPEvents`.
   */
  request<R>(req: HttpRequest<any>): Observable<HttpEvent<R>>;
  request<R = Object, O extends HttpRequestOptions&{body?: any} = object>(
      method: string, url: string, options?: O): Observable<InferHttpResponse<O, R>>;

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
  request(first: string|HttpRequest<any>, url?: string, options: HttpRequestOptions&{
    body?: any
  } = {}): Observable<any> {
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
      let headers: HttpHeaders|undefined = undefined;
      if (options.headers instanceof HttpHeaders) {
        headers = options.headers;
      } else {
        headers = new HttpHeaders(options.headers);
      }

      // Sort out parameters.
      let params: HttpParams|undefined = undefined;
      if (!!options.params) {
        if (options.params instanceof HttpParams) {
          params = options.params;
        } else {
          params = new HttpParams({fromObject: options.params} as HttpParamsOptions);
        }
      }

      // Construct the request.
      req = new HttpRequest(first, url!, (options.body !== undefined ? options.body : null), {
        headers,
        params,
        reportProgress: options.reportProgress,
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
        of(req).pipe(concatMap((req: HttpRequest<any>) => this.handler.handle(req)));

    // If coming via the API signature which accepts a previously constructed HttpRequest,
    // the only option is to get the event stream. Otherwise, return the event stream if
    // that is what was requested.
    if (first instanceof HttpRequest || options.observe === 'events') {
      return events$;
    }

    // The requested stream contains either the full response or the body. In either
    // case, the first step is to filter the event stream to extract a stream of
    // responses(s).
    const res$: Observable<HttpResponse<any>> = <Observable<HttpResponse<any>>>events$.pipe(
        filter((event: HttpEvent<any>) => event instanceof HttpResponse));

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
            return res$.pipe(map((res: HttpResponse<any>) => {
              // Validate that the body is an ArrayBuffer.
              if (res.body !== null && !(res.body instanceof ArrayBuffer)) {
                throw new Error('Response is not an ArrayBuffer.');
              }
              return res.body;
            }));
          case 'blob':
            return res$.pipe(map((res: HttpResponse<any>) => {
              // Validate that the body is a Blob.
              if (res.body !== null && !(res.body instanceof Blob)) {
                throw new Error('Response is not a Blob.');
              }
              return res.body;
            }));
          case 'text':
            return res$.pipe(map((res: HttpResponse<any>) => {
              // Validate that the body is a string.
              if (res.body !== null && typeof res.body !== 'string') {
                throw new Error('Response is not a string.');
              }
              return res.body;
            }));
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
        throw new Error(`Unreachable: unhandled observe type ${options.observe}}`);
    }
  }

  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `DELETE` request to execute on the server.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` that emits the response body
   *   The response is configurable via options:
   *     `{responseType: 'arraybuffer'|'blob'|'json'|'text'}` alters the type into an ArrayBuffer,
   * Blob or a string
   *     `{observe: 'response'}` wraps the response into an `HttpResponse`
   *     `{observe: 'events'}` wraps the response into multiple `HttpEvent`, including the progress
   */
  delete<R = Object, O extends HttpRequestOptions = object>(url: string, options?: O):
      Observable<InferHttpResponse<O, R>> {
    return this.request('DELETE', url, options);
  }

  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `GET` request to execute on the server.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` that emits the response body
   *   The response is configurable via options:
   *     `{responseType: 'arraybuffer'|'blob'|'json'|'text'}` alters the type into an ArrayBuffer,
   * Blob or a string
   *     `{observe: 'response'}` wraps the response into an `HttpResponse`
   *     `{observe: 'events'}` wraps the response into multiple `HttpEvent`, including the progress
   */
  get<R = Object, O extends HttpRequestOptions = object>(url: string, options?: O):
      Observable<InferHttpResponse<O, R>> {
    return this.request('GET', url, options);
  }

  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `HEAD` request to execute on the server.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` that emits the response body
   *   The response is configurable via options:
   *     `{responseType: 'arraybuffer'|'blob'|'json'|'text'}` alters the type into an ArrayBuffer,
   * Blob or a string
   *     `{observe: 'response'}` wraps the response into an `HttpResponse`
   *     `{observe: 'events'}` wraps the response into multiple `HttpEvent`, including the progress
   */
  head<R = Object, O extends HttpRequestOptions = object>(url: string, options?: O):
      Observable<InferHttpResponse<O, R>> {
    return this.request('HEAD', url, options);
  }

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
   * You must install a suitable interceptor, such as one provided by `HttpClientJsonpModule`.
   * If no such interceptor is reached,
   * then the `JSONP` request can be rejected by the configured backend.
   *
   * @return An `Observable` of the response object, with response body as an object.
   */
  jsonp<R = Object>(url: string, callbackParam: string): Observable<R> {
    return this.request<R>('JSONP', url, {
      params: new HttpParams().append(callbackParam, 'JSONP_CALLBACK'),
      observe: 'body',
      responseType: 'json',
    });
  }

  /**
   * Constructs an `Observable` that, when subscribed, causes the configured
   * `OPTIONS` request to execute on the server. This method allows the client
   * to determine the supported HTTP methods and other capabilites of an endpoint,
   * without implying a resource action. See the individual overloads for
   * details on the return type.
   *
   * @param url The endpoint URL.
   * @param options HTTP options.
   *
   * @return An `Observable` that emits the response body
   *   The response is configurable via options:
   *     `{responseType: 'arraybuffer'|'blob'|'json'|'text'}` alters the type into an ArrayBuffer,
   * Blob or a string
   *     `{observe: 'response'}` wraps the response into an `HttpResponse`
   *     `{observe: 'events'}` wraps the response into multiple `HttpEvent`, including the progress
   */
  options<R = Object, O extends HttpRequestOptions = object>(url: string, options?: O):
      Observable<InferHttpResponse<O, R>> {
    return this.request('OPTIONS', url, options);
  }

  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `PATCH` request to execute on the server. See the individual overloads for
   * details on the return type.
   *
   * @param url The endpoint URL.
   * @param body The resources to edit.
   * @param options HTTP options.
   *
   * @return An `Observable` that emits the response body
   *   The response is configurable via options:
   *     `{responseType: 'arraybuffer'|'blob'|'json'|'text'}` alters the type into an ArrayBuffer,
   * Blob or a string
   *     `{observe: 'response'}` wraps the response into an `HttpResponse`
   *     `{observe: 'events'}` wraps the response into multiple `HttpEvent`, including the progress
   */
  patch<R = Object, O extends HttpRequestOptions = object>(url: string, body: any, options?: O):
      Observable<InferHttpResponse<O, R>> {
    return this.request<any>('PATCH', url, addBody(options || {}, body));
  }

  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `POST` request to execute on the server. The server responds with the location of
   * the replaced resource. See the individual overloads for
   * details on the return type.
   *
   * @param url The endpoint URL.
   * @param body The content to replace with.
   * @param options HTTP options
   *
   * @return An `Observable` that emits the response body
   *   The response is configurable via options:
   *     `{responseType: 'arraybuffer'|'blob'|'json'|'text'}` alters the type into an ArrayBuffer,
   * Blob or a string
   *     `{observe: 'response'}` wraps the response into an `HttpResponse`
   *     `{observe: 'events'}` wraps the response into multiple `HttpEvent`, including the progress
   */
  post<R = Object, O extends HttpRequestOptions = object>(url: string, body: any, options?: O):
      Observable<InferHttpResponse<O, R>> {
    return this.request<any>('POST', url, addBody(options || {}, body));
  }

  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `PUT` request to execute on the server. The `PUT` method replaces an existing resource
   * with a new set of values.
   * See the individual overloads for details on the return type.
   *
   * @param url The endpoint URL.
   * @param body The resources to add/update.
   * @param options HTTP options
   *
   * @return An `Observable` that emits the response body
   *   The response is configurable via options:
   *     `{responseType: 'arraybuffer'|'blob'|'json'|'text'}` alters the type into an ArrayBuffer,
   * Blob or a string
   *     `{observe: 'response'}` wraps the response into an `HttpResponse`
   *     `{observe: 'events'}` wraps the response into multiple `HttpEvent`, including the progress
   */
  put<R = Object, O extends HttpRequestOptions = object>(url: string, body: any, options?: O):
      Observable<InferHttpResponse<O, R>> {
    return this.request<any>('PUT', url, addBody(options || {}, body));
  }
}
