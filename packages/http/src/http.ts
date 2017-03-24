/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {BaseRequestOptions, RequestOptions} from './base_request_options';
import {RequestMethod} from './enums';
import {ConnectionBackend, RequestArgs, RequestOptionsArgs} from './interfaces';
import {Request} from './static_request';
import {Response} from './static_response';

function httpRequest(backend: ConnectionBackend, request: Request): Observable<Response> {
  return backend.createConnection(request).response;
}

function mergeOptions(
    defaultOpts: BaseRequestOptions, providedOpts: RequestOptionsArgs | undefined,
    method: RequestMethod, url: string): RequestArgs {
  const newOptions = defaultOpts;
  if (providedOpts) {
    // Hack so Dart can used named parameters
    return newOptions.merge(new RequestOptions({
      method: providedOpts.method || method,
      url: providedOpts.url || url,
      search: providedOpts.search,
      params: providedOpts.params,
      headers: providedOpts.headers,
      body: providedOpts.body,
      withCredentials: providedOpts.withCredentials,
      responseType: providedOpts.responseType
    })) as RequestArgs;
  }

  return newOptions.merge(new RequestOptions({method, url})) as RequestArgs;
}

/**
 * Performs http requests using `XMLHttpRequest` as the default backend.
 *
 * `Http` is available as an injectable class, with methods to perform http requests. Calling
 * `request` returns an `Observable` which will emit a single {@link Response} when a
 * response is received.
 *
 * ### Example
 *
 * ```typescript
 * import {Http, HTTP_PROVIDERS} from '@angular/http';
 * import 'rxjs/add/operator/map'
 * @Component({
 *   selector: 'http-app',
 *   viewProviders: [HTTP_PROVIDERS],
 *   templateUrl: 'people.html'
 * })
 * class PeopleComponent {
 *   constructor(http: Http) {
 *     http.get('people.json')
 *       // Call map on the response observable to get the parsed people object
 *       .map(res => res.json())
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
 * {@link XHRBackend} in this case), which could be mocked with dependency injection by replacing
 * the {@link XHRBackend} provider, as in the following example:
 *
 * ### Example
 *
 * ```typescript
 * import {BaseRequestOptions, Http} from '@angular/http';
 * import {MockBackend} from '@angular/http/testing';
 * var injector = Injector.resolveAndCreate([
 *   BaseRequestOptions,
 *   MockBackend,
 *   {provide: Http, useFactory:
 *       function(backend, defaultOptions) {
 *         return new Http(backend, defaultOptions);
 *       },
 *       deps: [MockBackend, BaseRequestOptions]}
 * ]);
 * var http = injector.get(Http);
 * http.get('request-from-mock-backend.json').subscribe((res:Response) => doSomething(res));
 * ```
 *
 * @experimental
 */
@Injectable()
export class Http {
  constructor(protected _backend: ConnectionBackend, protected _defaultOptions: RequestOptions) {}

  /**
   * Performs any type of http request. First argument is required, and can either be a url or
   * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
   * object can be provided as the 2nd argument. The options object will be merged with the values
   * of {@link BaseRequestOptions} before performing the request.
   */
  request(url: string|Request, options?: RequestOptionsArgs): Observable<Response> {
    let responseObservable: any;
    if (typeof url === 'string') {
      responseObservable = httpRequest(
          this._backend,
          new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Get, <string>url)));
    } else if (url instanceof Request) {
      responseObservable = httpRequest(this._backend, url);
    } else {
      throw new Error('First argument must be a url string or Request instance.');
    }
    return responseObservable;
  }

  /**
   * Performs a request with `get` http method.
   */
  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(
        new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Get, url)));
  }

  /**
   * Performs a request with `post` http method.
   */
  post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(new Request(mergeOptions(
        this._defaultOptions.merge(new RequestOptions({body: body})), options, RequestMethod.Post,
        url)));
  }

  /**
   * Performs a request with `put` http method.
   */
  put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(new Request(mergeOptions(
        this._defaultOptions.merge(new RequestOptions({body: body})), options, RequestMethod.Put,
        url)));
  }

  /**
   * Performs a request with `delete` http method.
   */
  delete (url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(
        new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Delete, url)));
  }

  /**
   * Performs a request with `patch` http method.
   */
  patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(new Request(mergeOptions(
        this._defaultOptions.merge(new RequestOptions({body: body})), options, RequestMethod.Patch,
        url)));
  }

  /**
   * Performs a request with `head` http method.
   */
  head(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(
        new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Head, url)));
  }

  /**
   * Performs a request with `options` http method.
   */
  options(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(
        new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Options, url)));
  }
}


/**
 * @experimental
 */
@Injectable()
export class Jsonp extends Http {
  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions);
  }

  /**
   * Performs any type of http request. First argument is required, and can either be a url or
   * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
   * object can be provided as the 2nd argument. The options object will be merged with the values
   * of {@link BaseRequestOptions} before performing the request.
   *
   * @security Regular XHR is the safest alternative to JSONP for most applications, and is
   * supported by all current browsers. Because JSONP creates a `<script>` element with
   * contents retrieved from a remote source, attacker-controlled data introduced by an untrusted
   * source could expose your application to XSS risks. Data exposed by JSONP may also be
   * readable by malicious third-party websites. In addition, JSONP introduces potential risk for
   * future security issues (e.g. content sniffing).  For more detail, see the
   * [Security Guide](http://g.co/ng/security).
   */
  request(url: string|Request, options?: RequestOptionsArgs): Observable<Response> {
    let responseObservable: any;
    if (typeof url === 'string') {
      url =
          new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Get, <string>url));
    }
    if (url instanceof Request) {
      if (url.method !== RequestMethod.Get) {
        throw new Error('JSONP requests must use GET request method.');
      }
      responseObservable = httpRequest(this._backend, url);
    } else {
      throw new Error('First argument must be a url string or Request instance.');
    }
    return responseObservable;
  }
}
