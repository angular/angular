/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { HttpBackend } from './backend';
import { HttpRequest } from './request';
import { HttpEvent } from './response';
/**
 * An internal injection token to reference `FetchBackend` implementation
 * in a tree-shakable way.
 */
export declare const FETCH_BACKEND: InjectionToken<FetchBackend>;
/**
 * Uses `fetch` to send requests to a backend server.
 *
 * This `FetchBackend` requires the support of the
 * [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) which is available on all
 * supported browsers and on Node.js v18 or later.
 *
 * @see {@link HttpHandler}
 *
 * @publicApi
 */
export declare class FetchBackend implements HttpBackend {
    private readonly fetchImpl;
    private readonly ngZone;
    private readonly destroyRef;
    private destroyed;
    constructor();
    handle(request: HttpRequest<any>): Observable<HttpEvent<any>>;
    private doRequest;
    private parseBody;
    private createRequestInit;
    private concatChunks;
}
/**
 * Abstract class to provide a mocked implementation of `fetch()`
 */
export declare abstract class FetchFactory {
    abstract fetch: typeof fetch;
}
