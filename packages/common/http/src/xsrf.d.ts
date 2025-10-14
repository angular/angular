/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentInjector, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHandler } from './backend';
import { HttpHandlerFn, HttpInterceptor } from './interceptor';
import { HttpRequest } from './request';
import { HttpEvent } from './response';
export declare const XSRF_ENABLED: InjectionToken<boolean>;
export declare const XSRF_DEFAULT_COOKIE_NAME = "XSRF-TOKEN";
export declare const XSRF_COOKIE_NAME: InjectionToken<string>;
export declare const XSRF_DEFAULT_HEADER_NAME = "X-XSRF-TOKEN";
export declare const XSRF_HEADER_NAME: InjectionToken<string>;
/**
 * `HttpXsrfTokenExtractor` which retrieves the token from a cookie.
 */
export declare class HttpXsrfCookieExtractor implements HttpXsrfTokenExtractor {
    private doc;
    private cookieName;
    private lastCookieString;
    private lastToken;
    /**
     * @internal for testing
     */
    parseCount: number;
    constructor(doc: any, cookieName: string);
    getToken(): string | null;
}
/**
 * Retrieves the current XSRF token to use with the next outgoing request.
 *
 * @publicApi
 */
export declare abstract class HttpXsrfTokenExtractor {
    /**
     * Get the XSRF token to use with an outgoing request.
     *
     * Will be called for every request, so the token may change between requests.
     */
    abstract getToken(): string | null;
}
export declare function xsrfInterceptorFn(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>>;
/**
 * `HttpInterceptor` which adds an XSRF token to eligible outgoing requests.
 */
export declare class HttpXsrfInterceptor implements HttpInterceptor {
    private injector;
    constructor(injector: EnvironmentInjector);
    intercept(initialRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}
