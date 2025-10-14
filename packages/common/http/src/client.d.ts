/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Observable } from 'rxjs';
import { HttpHandler } from './backend';
import { HttpContext } from './context';
import { HttpHeaders } from './headers';
import { HttpParams } from './params';
import { HttpRequest } from './request';
import { HttpEvent, HttpResponse } from './response';
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
export declare class HttpClient {
    private handler;
    constructor(handler: HttpHandler);
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
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<ArrayBuffer>;
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
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<Blob>;
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
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<string>;
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
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<ArrayBuffer>>;
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
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<Blob>>;
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
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<string>>;
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
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        reportProgress?: boolean;
        observe: 'events';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<any>>;
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
    request<R>(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        reportProgress?: boolean;
        observe: 'events';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<R>>;
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
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<ArrayBuffer>>;
    /**
     * Constructs a request which interprets the body as a `Blob` and returns the full `HttpResponse`.
     *
     * @param method  The HTTP method.
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the `HttpResponse`, with the response body of type `Blob`.
     */
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<Blob>>;
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
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<string>>;
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
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        reportProgress?: boolean;
        observe: 'response';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<Object>>;
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
    request<R>(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        reportProgress?: boolean;
        observe: 'response';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
    }): Observable<HttpResponse<R>>;
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
    request(method: string, url: string, options?: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<Object>;
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
    request<R>(method: string, url: string, options?: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<R>;
    /**
     * Constructs a request where response type and requested observable are not known statically.
     *
     * @param method  The HTTP method.
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the requested response, with body of type `any`.
     */
    request(method: string, url: string, options?: {
        body?: any;
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<any>;
    /**
     * Constructs a `DELETE` request that interprets the body as an `ArrayBuffer`
     *  and returns the response as an `ArrayBuffer`.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return  An `Observable` of the response body as an `ArrayBuffer`.
     */
    delete(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
    }): Observable<ArrayBuffer>;
    /**
     * Constructs a `DELETE` request that interprets the body as a `Blob` and returns
     * the response as a `Blob`.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the response body as a `Blob`.
     */
    delete(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
        body?: any | null;
    }): Observable<Blob>;
    /**
     * Constructs a `DELETE` request that interprets the body as a text string and returns
     * a string.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the response, with the response body of type string.
     */
    delete(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
        body?: any | null;
    }): Observable<string>;
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
    delete(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
        body?: any | null;
    }): Observable<HttpEvent<ArrayBuffer>>;
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
    delete(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
        body?: any | null;
    }): Observable<HttpEvent<Blob>>;
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
    delete(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
        body?: any | null;
    }): Observable<HttpEvent<string>>;
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
    delete(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
        body?: any | null;
    }): Observable<HttpEvent<Object>>;
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
    delete<T>(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | (string | number | boolean)[]>;
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
        timeout?: number;
        body?: any | null;
    }): Observable<HttpEvent<T>>;
    /**
     * Constructs a `DELETE` request that interprets the body as an `ArrayBuffer` and returns
     *  the full `HttpResponse`.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the full `HttpResponse`, with the response body as an `ArrayBuffer`.
     */
    delete(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
        body?: any | null;
    }): Observable<HttpResponse<ArrayBuffer>>;
    /**
     * Constructs a `DELETE` request that interprets the body as a `Blob` and returns the full
     * `HttpResponse`.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the `HttpResponse`, with the response body of type `Blob`.
     */
    delete(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
        body?: any | null;
    }): Observable<HttpResponse<Blob>>;
    /**
     * Constructs a `DELETE` request that interprets the body as a text stream and
     *  returns the full `HttpResponse`.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the full `HttpResponse`, with the response body of type string.
     */
    delete(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
        body?: any | null;
    }): Observable<HttpResponse<string>>;
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
    delete(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
        body?: any | null;
    }): Observable<HttpResponse<Object>>;
    /**
     * Constructs a `DELETE` request that interprets the body as JSON
     * and returns the full `HttpResponse`.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the `HttpResponse`, with the response body of the requested type.
     */
    delete<T>(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
        body?: any | null;
    }): Observable<HttpResponse<T>>;
    /**
     * Constructs a `DELETE` request that interprets the body as JSON and
     * returns the response body as an object parsed from JSON.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the response, with the response body of type `Object`.
     */
    delete(url: string, options?: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
        body?: any | null;
    }): Observable<Object>;
    /**
     * Constructs a DELETE request that interprets the body as JSON and returns
     * the response in a given type.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the `HttpResponse`, with response body in the requested type.
     */
    delete<T>(url: string, options?: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
        body?: any | null;
    }): Observable<T>;
    /**
     * Constructs a `GET` request that interprets the body as an `ArrayBuffer` and returns the
     * response in an `ArrayBuffer`.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the response, with the response body as an `ArrayBuffer`.
     */
    get(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<ArrayBuffer>;
    /**
     * Constructs a `GET` request that interprets the body as a `Blob`
     * and returns the response as a `Blob`.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the response, with the response body as a `Blob`.
     */
    get(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<Blob>;
    /**
     * Constructs a `GET` request that interprets the body as a text string
     * and returns the response as a string value.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the response, with the response body of type string.
     */
    get(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<string>;
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
    get(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<ArrayBuffer>>;
    /**
     * Constructs a `GET` request that interprets the body as a `Blob` and
     * returns the full event stream.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the response, with the response body as a `Blob`.
     */
    get(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<Blob>>;
    /**
     * Constructs a `GET` request that interprets the body as a text string and returns
     * the full event stream.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the response, with the response body of type string.
     */
    get(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<string>>;
    /**
     * Constructs a `GET` request that interprets the body as JSON
     * and returns the full event stream.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the response, with the response body of type `Object`.
     */
    get(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<Object>>;
    /**
     * Constructs a `GET` request that interprets the body as JSON and returns the full
     * event stream.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the response, with a response body in the requested type.
     */
    get<T>(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<T>>;
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
    get(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<ArrayBuffer>>;
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
    get(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<Blob>>;
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
    get(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<string>>;
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
    get(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<Object>>;
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
    get<T>(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<T>>;
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
    get(url: string, options?: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<Object>;
    /**
     * Constructs a `GET` request that interprets the body as JSON and returns
     * the response body in a given type.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the `HttpResponse`, with a response body in the requested type.
     */
    get<T>(url: string, options?: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<T>;
    /**
     * Constructs a `HEAD` request that interprets the body as an `ArrayBuffer` and
     * returns the response as an `ArrayBuffer`.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the response, with the response body as an `ArrayBuffer`.
     */
    head(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<ArrayBuffer>;
    /**
     * Constructs a `HEAD` request that interprets the body as a `Blob` and returns
     * the response as a `Blob`.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return  An `Observable` of the response, with the response body as a `Blob`.
     */
    head(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<Blob>;
    /**
     * Constructs a `HEAD` request that interprets the body as a text string and returns the response
     * as a string value.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the response, with the response body of type string.
     */
    head(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<string>;
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
    head(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<ArrayBuffer>>;
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
    head(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<Blob>>;
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
    head(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<string>>;
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
    head(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<Object>>;
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
    head<T>(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<T>>;
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
    head(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<ArrayBuffer>>;
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
    head(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<Blob>>;
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
    head(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<string>>;
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
    head(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<Object>>;
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
    head<T>(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<T>>;
    /**
  
     * Constructs a `HEAD` request that interprets the body as JSON and
     * returns the response body as an object parsed from JSON.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the response, with the response body as an object parsed from JSON.
     */
    head(url: string, options?: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<Object>;
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
    head<T>(url: string, options?: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<T>;
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
     * Constructs an `OPTIONS` request that interprets the body as an
     * `ArrayBuffer` and returns the response as an `ArrayBuffer`.
     *
     * @param url The endpoint URL.
     * @param options HTTP options.
     *
     * @return An `Observable` of the response, with the response body as an `ArrayBuffer`.
     */
    options(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<ArrayBuffer>;
    /**
     * Constructs an `OPTIONS` request that interprets the body as a `Blob` and returns
     * the response as a `Blob`.
     *
     * @param url The endpoint URL.
     * @param options HTTP options.
     *
     * @return An `Observable` of the response, with the response body as a `Blob`.
     */
    options(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<Blob>;
    /**
     * Constructs an `OPTIONS` request that interprets the body as a text string and
     * returns a string value.
     *
     * @param url The endpoint URL.
     * @param options HTTP options.
     *
     * @return An `Observable` of the response, with the response body of type string.
     */
    options(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<string>;
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
    options(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpEvent<ArrayBuffer>>;
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
    options(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpEvent<Blob>>;
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
    options(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpEvent<string>>;
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
    options(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpEvent<Object>>;
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
    options<T>(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpEvent<T>>;
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
    options(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpResponse<ArrayBuffer>>;
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
    options(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpResponse<Blob>>;
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
    options(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpResponse<string>>;
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
    options(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpResponse<Object>>;
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
    options<T>(url: string, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpResponse<T>>;
    /**
  
     * Constructs an `OPTIONS` request that interprets the body as JSON and returns the
     * response body as an object parsed from JSON.
     *
     * @param url The endpoint URL.
     * @param options HTTP options.
     *
     * @return An `Observable` of the response, with the response body as an object parsed from JSON.
     */
    options(url: string, options?: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<Object>;
    /**
     * Constructs an `OPTIONS` request that interprets the body as JSON and returns the
     * response in a given type.
     *
     * @param url The endpoint URL.
     * @param options HTTP options.
     *
     * @return An `Observable` of the `HttpResponse`, with a response body of the given type.
     */
    options<T>(url: string, options?: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<T>;
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
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<ArrayBuffer>;
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
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<Blob>;
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
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<string>;
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
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpEvent<ArrayBuffer>>;
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
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpEvent<Blob>>;
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
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpEvent<string>>;
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
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpEvent<Object>>;
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
    patch<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpEvent<T>>;
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
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpResponse<ArrayBuffer>>;
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
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpResponse<Blob>>;
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
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpResponse<string>>;
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
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpResponse<Object>>;
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
    patch<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpResponse<T>>;
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
    patch(url: string, body: any | null, options?: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<Object>;
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
    patch<T>(url: string, body: any | null, options?: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<T>;
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
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<ArrayBuffer>;
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
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<Blob>;
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
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<string>;
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
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<ArrayBuffer>>;
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
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<Blob>>;
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
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<string>>;
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
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<Object>>;
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
    post<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpEvent<T>>;
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
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<ArrayBuffer>>;
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
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<Blob>>;
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
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<string>>;
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
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<Object>>;
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
    post<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<HttpResponse<T>>;
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
    post(url: string, body: any | null, options?: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<Object>;
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
    post<T>(url: string, body: any | null, options?: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    }): Observable<T>;
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
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<ArrayBuffer>;
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
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<Blob>;
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
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<string>;
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
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpEvent<ArrayBuffer>>;
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
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpEvent<Blob>>;
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
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpEvent<string>>;
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
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpEvent<Object>>;
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
    put<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'events';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpEvent<T>>;
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
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpResponse<ArrayBuffer>>;
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
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpResponse<Blob>>;
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
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpResponse<string>>;
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
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpResponse<Object>>;
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
    put<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        observe: 'response';
        context?: HttpContext;
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<HttpResponse<T>>;
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
    put(url: string, body: any | null, options?: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<Object>;
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
    put<T>(url: string, body: any | null, options?: {
        headers?: HttpHeaders | Record<string, string | string[]>;
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
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
        timeout?: number;
    }): Observable<T>;
}
