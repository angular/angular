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
  TransferState,
  ɵformatRuntimeError as formatRuntimeError,
  ɵperformanceMarkFeature as performanceMarkFeature,
  ɵtruncateMiddle as truncateMiddle,
  ɵRuntimeError as RuntimeError,
} from '@angular/core';
import {of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {HttpHeaders} from './headers';
import {HTTP_ROOT_INTERCEPTOR_FNS} from './interceptor';
import {HttpResponse} from './response';
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
export const HTTP_TRANSFER_CACHE_ORIGIN_MAP = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'HTTP_TRANSFER_CACHE_ORIGIN_MAP' : '',
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
const CACHE_OPTIONS = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'HTTP_TRANSFER_STATE_CACHE_OPTIONS' : '',
);
/**
 * A list of allowed HTTP methods to cache.
 */
const ALLOWED_METHODS = ['GET', 'HEAD'];
export function transferCacheInterceptorFn(req, next) {
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
  const originMap = inject(HTTP_TRANSFER_CACHE_ORIGIN_MAP, {
    optional: true,
  });
  if (typeof ngServerMode !== 'undefined' && !ngServerMode && originMap) {
    throw new RuntimeError(
      2803 /* RuntimeErrorCode.HTTP_ORIGIN_MAP_USED_IN_CLIENT */,
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
    let body = undecodedBody;
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
      tap((event) => {
        // Only cache successful HTTP responses.
        if (event instanceof HttpResponse) {
          transferState.set(storeKey, {
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
function hasAuthHeaders(req) {
  return req.headers.has('authorization') || req.headers.has('proxy-authorization');
}
function getFilteredHeaders(headers, includeHeaders) {
  if (!includeHeaders) {
    return {};
  }
  const headersMap = {};
  for (const key of includeHeaders) {
    const values = headers.getAll(key);
    if (values !== null) {
      headersMap[key] = values;
    }
  }
  return headersMap;
}
function sortAndConcatParams(params) {
  return [...params.keys()]
    .sort()
    .map((k) => `${k}=${params.getAll(k)}`)
    .join('&');
}
function makeCacheKey(request, mappedRequestUrl) {
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
function generateHash(value) {
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
export function withHttpTransferCache(cacheOptions) {
  return [
    {
      provide: CACHE_OPTIONS,
      useFactory: () => {
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
function appendMissingHeadersDetection(url, headers, headersToInclude) {
  const warningProduced = new Set();
  return new Proxy(headers, {
    get(target, prop) {
      const value = Reflect.get(target, prop);
      const methods = new Set(['get', 'has', 'getAll']);
      if (typeof value !== 'function' || !methods.has(prop)) {
        return value;
      }
      return (headerName) => {
        // We log when the key has been removed and a warning hasn't been produced for the header
        const key = (prop + ':' + headerName).toLowerCase(); // e.g. `get:cache-control`
        if (!headersToInclude.includes(headerName) && !warningProduced.has(key)) {
          warningProduced.add(key);
          const truncatedUrl = truncateMiddle(url);
          console.warn(
            formatRuntimeError(
              -2802 /* RuntimeErrorCode.HEADERS_ALTERED_BY_TRANSFER_CACHE */,
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
        return value.apply(target, [headerName]);
      };
    },
  });
}
function mapRequestOriginUrl(url, originMap) {
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
function verifyMappedOrigin(url) {
  if (new URL(url, 'resolve://').pathname !== '/') {
    throw new RuntimeError(
      2804 /* RuntimeErrorCode.HTTP_ORIGIN_MAP_CONTAINS_PATH */,
      'Angular detected a URL with a path segment in the value provided for the ' +
        `\`HTTP_TRANSFER_CACHE_ORIGIN_MAP\` token: ${url}. The map should only contain origins ` +
        'without any other segments.',
    );
  }
}
//# sourceMappingURL=transfer_cache.js.map
