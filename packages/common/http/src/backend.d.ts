/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Observable } from 'rxjs';
import { HttpRequest } from './request';
import { HttpEvent } from './response';
import { EnvironmentInjector } from '@angular/core';
/**
 * A final `HttpHandler` which will dispatch the request via browser HTTP APIs to a backend.
 *
 * Interceptors sit between the `HttpClient` interface and the `HttpBackend`.
 *
 * When injected, `HttpBackend` dispatches requests directly to the backend, without going
 * through the interceptor chain.
 *
 * @publicApi
 */
export declare abstract class HttpBackend implements HttpHandler {
    abstract handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}
/** Internal function to reset the flag in tests */
export declare function resetFetchBackendWarningFlag(): void;
export declare class HttpInterceptorHandler implements HttpHandler {
    private backend;
    private injector;
    private chain;
    private readonly pendingTasks;
    private readonly contributeToStability;
    constructor(backend: HttpBackend, injector: EnvironmentInjector);
    handle(initialRequest: HttpRequest<any>): Observable<HttpEvent<any>>;
}
/**
 * Transforms an `HttpRequest` into a stream of `HttpEvent`s, one of which will likely be a
 * `HttpResponse`.
 *
 * `HttpHandler` is injectable. When injected, the handler instance dispatches requests to the
 * first interceptor in the chain, which dispatches to the second, etc, eventually reaching the
 * `HttpBackend`.
 *
 * In an `HttpInterceptor`, the `HttpHandler` parameter is the next interceptor in the chain.
 *
 * @publicApi
 */
export declare abstract class HttpHandler {
    abstract handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}
