/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  APP_BOOTSTRAP_LISTENER,
  ApplicationRef,
  inject,
  InjectionToken,
  makeStateKey,
  Provider,
  StateKey,
  TransferState,
  ɵformatRuntimeError as formatRuntimeError,
  ɵperformanceMarkFeature as performanceMarkFeature,
  ɵtruncateMiddle as truncateMiddle,
  ɵRuntimeError as RuntimeError,
} from '@angular/core';
import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';

import {RuntimeErrorCode} from './errors';
import {HttpHeaders} from './headers';
import {HTTP_ROOT_INTERCEPTOR_FNS, HttpHandlerFn} from './interceptor';
import {HttpRequest} from './request';
import {HttpEvent, HttpResponse} from './response';
import {HttpParams} from './params';

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
export const HTTP_TRANSFER_CACHE_ORIGIN_MAP = new InjectionToken<Record<string, string>>(
  ngDevMode ? 'HTTP_TRANSFER_CACHE_ORIGIN_MAP' : '',
);

/**
 * Keys within cached response data structure.
 */

export const BODY = 'b';
export const HEADERS = 'h';
export const STATUS = 's';
export const STATUS_TEXT = 'st';
export const REQ_URL = 'u';
export const RESPONSE_TYPE = 'rt';

interface TransferHttpResponse {
  /** body */
  [BODY]: any;
  /** headers */
  [HEADERS]: Record<string, string[]>;
  /** status */
  [STATUS]?: number;
  /** statusText */
  [STATUS_TEXT]?: string;
  /** url */
  [REQ_URL]?: string;
  /** responseType */
  [RESPONSE_TYPE]?: HttpRequest<unknown>['responseType'];
}

interface CacheOptions extends HttpTransferCacheOptions {
  isCacheActive: boolean;
}

const CACHE_OPTIONS = new InjectionToken<CacheOptions>(
  ngDevMode ? 'HTTP_TRANSFER_STATE_CACHE_OPTIONS' : '',
);

/**
 * A list of allowed HTTP methods to cache.
 */
const ALLOWED_METHODS = ['GET', 'HEAD'];

export function transferCacheInterceptorFn(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const {isCacheActive, ...globalOptions} = inject(CACHE_OPTIONS);
  const {transferCache: requestOptions, method: requestMethod} = req;

  // In the following situations we do not want to cache the request
  if (
    !isCacheActive ||
    requestOptions === false ||
    // POST requests are allowed either globally or at request level
    (requestMethod === 'POST' && !globalOptions.includePostRequests && !requestOptions) ||
    (requestMethod !== 'POST' && !ALLOWED_METHODS.includes(requestMethod)) ||
    // Do not cache request that require authorization when includeRequestsWithAuthHeaders is falsey
    (!globalOptions.includeRequestsWithAuthHeaders && hasAuthHeaders(req)) ||
    globalOptions.filter?.(req) === false
  ) {
    return next(req);
  }

  const transferState = inject(TransferState);

  const originMap: Record<string, string> | null = inject(HTTP_TRANSFER_CACHE_ORIGIN_MAP, {
    optional: true,
  });

  if (typeof ngServerMode !== 'undefined' && !ngServerMode && originMap) {
    throw new RuntimeError(
      RuntimeErrorCode.HTTP_ORIGIN_MAP_USED_IN_CLIENT,
      ngDevMode &&
        'Angular detected that the `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token is configured and ' +
          'present in the client side code. Please ensure that this token is only provided in the ' +
          'server code of the application.',
    );
  }

  const requestUrl =
    typeof ngServerMode !== 'undefined' && ngServerMode && originMap
      ? mapRequestOriginUrl(req.url, originMap)
      : req.url;

  const storeKey = makeCacheKey(req, requestUrl);
  const response = transferState.get(storeKey, null);

  let headersToInclude = globalOptions.includeHeaders;
  if (typeof requestOptions === 'object' && requestOptions.includeHeaders) {
    // Request-specific config takes precedence over the global config.
    headersToInclude = requestOptions.includeHeaders;
  }

  if (response) {
    const {
      [BODY]: undecodedBody,
      [RESPONSE_TYPE]: responseType,
      [HEADERS]: httpHeaders,
      [STATUS]: status,
      [STATUS_TEXT]: statusText,
      [REQ_URL]: url,
    } = response;
    // Request found in cache. Respond using it.
    let body: ArrayBuffer | Blob | string | undefined = undecodedBody;

    switch (responseType) {
      case 'arraybuffer':
        body = new TextEncoder().encode(undecodedBody).buffer;
        break;
      case 'blob':
        body = new Blob([undecodedBody]);
        break;
    }

    // We want to warn users accessing a header provided from the cache
    // That HttpTransferCache alters the headers
    // The warning will be logged a single time by HttpHeaders instance
    let headers = new HttpHeaders(httpHeaders);
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
        status,
        statusText,
        url,
      }),
    );
  }

  const event$ = next(req);

  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    // Request not found in cache. Make the request and cache it if on the server.
    return event$.pipe(
      tap((event: HttpEvent<unknown>) => {
        // Only cache successful HTTP responses.
        if (event instanceof HttpResponse) {
          transferState.set<TransferHttpResponse>(storeKey, {
            [BODY]: event.body,
            [HEADERS]: getFilteredHeaders(event.headers, headersToInclude),
            [STATUS]: event.status,
            [STATUS_TEXT]: event.statusText,
            [REQ_URL]: requestUrl,
            [RESPONSE_TYPE]: req.responseType,
          });
        }
      }),
    );
  }

  return event$;
}

/** @returns true when the requests contains autorization related headers. */
function hasAuthHeaders(req: HttpRequest<unknown>): boolean {
  return req.headers.has('authorization') || req.headers.has('proxy-authorization');
}

function getFilteredHeaders(
  headers: HttpHeaders,
  includeHeaders: string[] | undefined,
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

function sortAndConcatParams(params: HttpParams | URLSearchParams): string {
  return [...params.keys()]
    .sort()
    .map((k) => `${k}=${params.getAll(k)}`)
    .join('&');
}

function makeCacheKey(
  request: HttpRequest<any>,
  mappedRequestUrl: string,
): StateKey<TransferHttpResponse> {
  // make the params encoded same as a url so it's easy to identify
  const {params, method, responseType} = request;
  const encodedParams = sortAndConcatParams(params);

  let serializedBody = request.serializeBody();
  if (serializedBody instanceof URLSearchParams) {
    serializedBody = sortAndConcatParams(serializedBody);
  } else if (typeof serializedBody !== 'string') {
    serializedBody = '';
  }

  const key = [method, responseType, mappedRequestUrl, serializedBody, encodedParams].join('|');
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
    hash = (Math.imul(31, hash) + char.charCodeAt(0)) << 0;
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
        performanceMarkFeature('NgHttpTransferCache');
        return {isCacheActive: true, ...cacheOptions};
      },
    },
    {
      provide: HTTP_ROOT_INTERCEPTOR_FNS,
      useValue: transferCacheInterceptorFn,
      multi: true,
    },
    {
      provide: APP_BOOTSTRAP_LISTENER,
      multi: true,
      useFactory: () => {
        const appRef = inject(ApplicationRef);
        const cacheState = inject(CACHE_OPTIONS);

        return () => {
          appRef.whenStable().then(() => {
            cacheState.isCacheActive = false;
          });
        };
      },
    },
  ];
}

/**
 * This function will add a proxy to an HttpHeader to intercept calls to get/has
 * and log a warning if the header entry requested has been removed
 */
function appendMissingHeadersDetection(
  url: string,
  headers: HttpHeaders,
  headersToInclude: string[],
): HttpHeaders {
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
        const key = (prop + ':' + headerName).toLowerCase(); // e.g. `get:cache-control`
        if (!headersToInclude.includes(headerName) && !warningProduced.has(key)) {
          warningProduced.add(key);
          const truncatedUrl = truncateMiddle(url);

          // TODO: create Error guide for this warning
          console.warn(
            formatRuntimeError(
              RuntimeErrorCode.HEADERS_ALTERED_BY_TRANSFER_CACHE,
              `Angular detected that the \`${headerName}\` header is accessed, but the value of the header ` +
                `was not transferred from the server to the client by the HttpTransferCache. ` +
                `To include the value of the \`${headerName}\` header for the \`${truncatedUrl}\` request, ` +
                `use the \`includeHeaders\` list. The \`includeHeaders\` can be defined either ` +
                `on a request level by adding the \`transferCache\` parameter, or on an application ` +
                `level by adding the \`httpCacheTransfer.includeHeaders\` argument to the ` +
                `\`provideClientHydration()\` call. `,
            ),
          );
        }

        // invoking the original method
        return (value as Function).apply(target, [headerName]);
      };
    },
  });
}

function mapRequestOriginUrl(url: string, originMap: Record<string, string>): string {
  const origin = new URL(url, 'resolve://').origin;
  const mappedOrigin = originMap[origin];
  if (!mappedOrigin) {
    return url;
  }

  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    verifyMappedOrigin(mappedOrigin);
  }

  return url.replace(origin, mappedOrigin);
}

function verifyMappedOrigin(url: string): void {
  if (new URL(url, 'resolve://').pathname !== '/') {
    throw new RuntimeError(
      RuntimeErrorCode.HTTP_ORIGIN_MAP_CONTAINS_PATH,
      'Angular detected a URL with a path segment in the value provided for the ' +
        `\`HTTP_TRANSFER_CACHE_ORIGIN_MAP\` token: ${url}. The map should only contain origins ` +
        'without any other segments.',
    );
  }
}
