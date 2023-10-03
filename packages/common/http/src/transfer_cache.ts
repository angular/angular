/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BOOTSTRAP_LISTENER, ApplicationRef, inject, InjectionToken, makeStateKey, Provider, StateKey, TransferState, ɵENABLED_SSR_FEATURES as ENABLED_SSR_FEATURES, ɵformatRuntimeError as formatRuntimeError, ɵtruncateMiddle as truncateMiddle, ɵwhenStable as whenStable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';

import {RuntimeErrorCode} from './errors';
import {HttpHeaders} from './headers';
import {HTTP_ROOT_INTERCEPTOR_FNS, HttpHandlerFn} from './interceptor';
import {HttpRequest} from './request';
import {HttpEvent, HttpResponse} from './response';

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
 *
 * @publicApi
 */
export type HttpTransferCacheOptions = {
  includeHeaders?: string[],
  filter?: (req: HttpRequest<unknown>) => boolean,
  includePostRequests?: boolean
};

interface TransferHttpResponse {
  body: any;
  headers: Record<string, string[]>;
  status?: number;
  statusText?: string;
  url?: string;
  responseType?: HttpRequest<unknown>['responseType'];
}

interface CacheOptions extends HttpTransferCacheOptions {
  isCacheActive: boolean;
}

const CACHE_OPTIONS =
    new InjectionToken<CacheOptions>(ngDevMode ? 'HTTP_TRANSFER_STATE_CACHE_OPTIONS' : '');

/**
 * A list of allowed HTTP methods to cache.
 */
const ALLOWED_METHODS = ['GET', 'HEAD'];

export function transferCacheInterceptorFn(
    req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const {isCacheActive, ...globalOptions} = inject(CACHE_OPTIONS);
  const {transferCache: requestOptions, method: requestMethod} = req;

  // In the following situations we do not want to cache the request
  if (!isCacheActive ||
      // POST requests are allowed either globally or at request level
      (requestMethod === 'POST' && !globalOptions.includePostRequests && !requestOptions) ||
      (requestMethod !== 'POST' && !ALLOWED_METHODS.includes(requestMethod)) ||
      requestOptions === false ||  //
      (globalOptions.filter?.(req)) === false) {
    return next(req);
  }

  const transferState = inject(TransferState);
  const storeKey = makeCacheKey(req);
  const response = transferState.get(storeKey, null);

  let headersToInclude = globalOptions.includeHeaders;
  if (typeof requestOptions === 'object' && requestOptions.includeHeaders) {
    // Request-specific config takes precedence over the global config.
    headersToInclude = requestOptions.includeHeaders;
  }

  if (response) {
    // Request found in cache. Respond using it.
    let body: ArrayBuffer|Blob|string|undefined = response.body;

    switch (response.responseType) {
      case 'arraybuffer':
        body = new TextEncoder().encode(response.body).buffer;
        break;
      case 'blob':
        body = new Blob([response.body]);
        break;
    }

    // We want to warn users accessing a header provided from the cache
    // That HttpTransferCache alters the headers
    // The warning will be logged a single time by HttpHeaders instance
    let headers = new HttpHeaders(response.headers);
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      // Append extra logic in dev mode to produce a warning when a header
      // that was not transferred to the client is accessed in the code via `get`
      // and `has` calls.
      headers = appendMissingHeadersDetection(req.url, headers, headersToInclude ?? []);
    }


    return of(
        new HttpResponse({
          body,
          headers,
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        }),
    );
  }


  // Request not found in cache. Make the request and cache it.
  return next(req).pipe(
      tap((event: HttpEvent<unknown>) => {
        if (event instanceof HttpResponse) {
          transferState.set<TransferHttpResponse>(storeKey, {
            body: event.body,
            headers: getFilteredHeaders(event.headers, headersToInclude),
            status: event.status,
            statusText: event.statusText,
            url: event.url || '',
            responseType: req.responseType,
          });
        }
      }),
  );
}

function getFilteredHeaders(
    headers: HttpHeaders,
    includeHeaders: string[]|undefined,
    ): Record<string, string[]> {
  if (!includeHeaders) {
    return {};
  }

  const headersMap: Record<string, string[]> = {};
  for (const key of includeHeaders) {
    const values = headers.getAll(key);
    if (values !== null) {
      headersMap[key] = values;
    }
  }

  return headersMap;
}

function makeCacheKey(request: HttpRequest<any>): StateKey<TransferHttpResponse> {
  // make the params encoded same as a url so it's easy to identify
  const {params, method, responseType, url} = request;
  const encodedParams = params.keys().sort().map((k) => `${k}=${params.getAll(k)}`).join('&');
  const key = method + '.' + responseType + '.' + url + '?' + encodedParams;

  const hash = generateHash(key);

  return makeStateKey(hash);
}

/**
 * A method that returns a hash representation of a string using a variant of DJB2 hash
 * algorithm.
 *
 * This is the same hashing logic that is used to generate component ids.
 */
function generateHash(value: string): string {
  let hash = 0;

  for (const char of value) {
    hash = Math.imul(31, hash) + char.charCodeAt(0) << 0;
  }

  // Force positive number hash.
  // 2147483647 = equivalent of Integer.MAX_VALUE.
  hash += 2147483647 + 1;

  return hash.toString();
}

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
export function withHttpTransferCache(cacheOptions: HttpTransferCacheOptions): Provider[] {
  return [
    {
      provide: CACHE_OPTIONS,
      useFactory: (): CacheOptions => {
        inject(ENABLED_SSR_FEATURES).add('httpcache');
        return {isCacheActive: true, ...cacheOptions};
      }
    },
    {
      provide: HTTP_ROOT_INTERCEPTOR_FNS,
      useValue: transferCacheInterceptorFn,
      multi: true,
      deps: [TransferState, CACHE_OPTIONS]
    },
    {
      provide: APP_BOOTSTRAP_LISTENER,
      multi: true,
      useFactory: () => {
        const appRef = inject(ApplicationRef);
        const cacheState = inject(CACHE_OPTIONS);

        return () => {
          whenStable(appRef).then(() => {
            cacheState.isCacheActive = false;
          });
        };
      }
    }
  ];
}


/**
 * This function will add a proxy to an HttpHeader to intercept calls to get/has
 * and log a warning if the header entry requested has been removed
 */
function appendMissingHeadersDetection(
    url: string, headers: HttpHeaders, headersToInclude: string[]): HttpHeaders {
  const warningProduced = new Set();
  return new Proxy<HttpHeaders>(headers, {
    get(target: HttpHeaders, prop: keyof HttpHeaders): unknown {
      const value = Reflect.get(target, prop);
      const methods: Set<keyof HttpHeaders> = new Set(['get', 'has', 'getAll']);

      if (typeof value !== 'function' || !methods.has(prop)) {
        return value;
      }

      return (headerName: string) => {
        // We log when the key has been removed and a warning hasn't been produced for the header
        const key = (prop + ':' + headerName).toLowerCase();  // e.g. `get:cache-control`
        if (!headersToInclude.includes(headerName) && !warningProduced.has(key)) {
          warningProduced.add(key);
          const truncatedUrl = truncateMiddle(url);

          // TODO: create Error guide for this warning
          console.warn(formatRuntimeError(
              RuntimeErrorCode.HEADERS_ALTERED_BY_TRANSFER_CACHE,
              `Angular detected that the \`${
                  headerName}\` header is accessed, but the value of the header ` +
                  `was not transferred from the server to the client by the HttpTransferCache. ` +
                  `To include the value of the \`${headerName}\` header for the \`${
                      truncatedUrl}\` request, ` +
                  `use the \`includeHeaders\` list. The \`includeHeaders\` can be defined either ` +
                  `on a request level by adding the \`transferCache\` parameter, or on an application ` +
                  `level by adding the \`httpCacheTransfer.includeHeaders\` argument to the ` +
                  `\`provideClientHydration()\` call. `));
        }

        // invoking the original method
        return (value as Function).apply(target, [headerName]);
      };
    }
  });
}
