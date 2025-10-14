/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentInjector } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpBackend, HttpHandler } from './backend';
import { HttpHandlerFn } from './interceptor';
import { HttpRequest } from './request';
import { HttpEvent } from './response';
export declare const JSONP_ERR_NO_CALLBACK = "JSONP injected script did not invoke callback.";
export declare const JSONP_ERR_WRONG_METHOD = "JSONP requests must use JSONP request method.";
export declare const JSONP_ERR_WRONG_RESPONSE_TYPE = "JSONP requests must use Json response type.";
export declare const JSONP_ERR_HEADERS_NOT_SUPPORTED = "JSONP requests do not support headers.";
/**
 * DI token/abstract type representing a map of JSONP callbacks.
 *
 * In the browser, this should always be the `window` object.
 *
 *
 */
export declare abstract class JsonpCallbackContext {
    [key: string]: (data: any) => void;
}
/**
 * Factory function that determines where to store JSONP callbacks.
 *
 * Ordinarily JSONP callbacks are stored on the `window` object, but this may not exist
 * in test environments. In that case, callbacks are stored on an anonymous object instead.
 *
 *
 */
export declare function jsonpCallbackContext(): Object;
/**
 * Processes an `HttpRequest` with the JSONP method,
 * by performing JSONP style requests.
 * @see {@link HttpHandler}
 * @see {@link HttpXhrBackend}
 *
 * @publicApi
 */
export declare class JsonpClientBackend implements HttpBackend {
    private callbackMap;
    private document;
    /**
     * A resolved promise that can be used to schedule microtasks in the event handlers.
     */
    private readonly resolvedPromise;
    constructor(callbackMap: JsonpCallbackContext, document: any);
    /**
     * Get the name of the next callback method, by incrementing the global `nextRequestId`.
     */
    private nextCallback;
    /**
     * Processes a JSONP request and returns an event stream of the results.
     * @param req The request object.
     * @returns An observable of the response events.
     *
     */
    handle(req: HttpRequest<never>): Observable<HttpEvent<any>>;
    private removeListeners;
}
/**
 * Identifies requests with the method JSONP and shifts them to the `JsonpClientBackend`.
 */
export declare function jsonpInterceptorFn(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>>;
/**
 * Identifies requests with the method JSONP and
 * shifts them to the `JsonpClientBackend`.
 *
 * @see {@link HttpInterceptor}
 *
 * @publicApi
 */
export declare class JsonpInterceptor {
    private injector;
    constructor(injector: EnvironmentInjector);
    /**
     * Identifies and handles a given JSONP request.
     * @param initialRequest The outgoing request object to handle.
     * @param next The next interceptor in the chain, or the backend
     * if no interceptors remain in the chain.
     * @returns An observable of the event stream.
     */
    intercept(initialRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}
