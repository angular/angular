/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken, Provider } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHandlerFn } from './interceptor';
import { HttpRequest } from './request';
import { HttpEvent } from './response';
/**
 * Options to configure how TransferCache should be used to cache requests made via HttpClient.
 *
 * @param includeHeaders Specifies which headers should be included into cached responses. No
 *     headers are included by default.
 * @param filter A function that receives a request as an argument and returns a boolean to indicate
 *     whether a request should be included into the cache.
 * @param includePostRequests Enables caching for POST requests. By default, only GET and HEAD
 *     requests are cached. This option can be enabled if POST requests are used to retrieve data
 *     (for example using GraphQL).
 * @param includeRequestsWithAuthHeaders Enables caching of requests containing either `Authorization`
 *     or `Proxy-Authorization` headers. By default, these requests are excluded from caching.
 *
 * @publicApi
 */
export type HttpTransferCacheOptions = {
    includeHeaders?: string[];
    filter?: (req: HttpRequest<unknown>) => boolean;
    includePostRequests?: boolean;
    includeRequestsWithAuthHeaders?: boolean;
};
/**
 * If your application uses different HTTP origins to make API calls (via `HttpClient`) on the server and
 * on the client, the `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token allows you to establish a mapping
 * between those origins, so that `HttpTransferCache` feature can recognize those requests as the same
 * ones and reuse the data cached on the server during hydration on the client.
 *
 * **Important note**: the `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token should *only* be provided in
 * the *server* code of your application (typically in the `app.server.config.ts` script). Angular throws an
 * error if it detects that the token is defined while running on the client.
 *
 * @usageNotes
 *
 * When the same API endpoint is accessed via `http://internal-domain.com:8080` on the server and
 * via `https://external-domain.com` on the client, you can use the following configuration:
 * ```ts
 * // in app.server.config.ts
 * {
 *     provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
 *     useValue: {
 *         'http://internal-domain.com:8080': 'https://external-domain.com'
 *     }
 * }
 * ```
 *
 * @publicApi
 */
export declare const HTTP_TRANSFER_CACHE_ORIGIN_MAP: InjectionToken<Record<string, string>>;
/**
 * Keys within cached response data structure.
 */
export declare const BODY = "b";
export declare const HEADERS = "h";
export declare const STATUS = "s";
export declare const STATUS_TEXT = "st";
export declare const REQ_URL = "u";
export declare const RESPONSE_TYPE = "rt";
export declare function transferCacheInterceptorFn(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>>;
/**
 * Returns the DI providers needed to enable HTTP transfer cache.
 *
 * By default, when using server rendering, requests are performed twice: once on the server and
 * other one on the browser.
 *
 * When these providers are added, requests performed on the server are cached and reused during the
 * bootstrapping of the application in the browser thus avoiding duplicate requests and reducing
 * load time.
 *
 */
export declare function withHttpTransferCache(cacheOptions: HttpTransferCacheOptions): Provider[];
