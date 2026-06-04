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
 * @param includeRequestsWithAuthHeaders Enables caching of requests containing `Authorization`,
 *     `Proxy-Authorization`, or `Cookie` headers. By default, these requests are excluded from
 *     caching. Requests sent using `withCredentials` or Fetch API `credentials` modes that can send
 *     credentials are also excluded by default.
 *
 * @see [Configuring the caching options](guide/ssr#configuring-the-caching-options)
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
 * IMPORTANT: The `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token should *only* be provided in
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
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'HTTP_TRANSFER_CACHE_ORIGIN_MAP' : '',
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
  [STATUS]: number;
  /** statusText */
  [STATUS_TEXT]: string;
  /** url */
  [REQ_URL]: string;
  /** responseType */
  [RESPONSE_TYPE]: HttpRequest<unknown>['responseType'];
}

interface CacheOptions extends HttpTransferCacheOptions {
  isCacheActive: boolean;
}

export const CACHE_OPTIONS = new InjectionToken<CacheOptions>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'HTTP_TRANSFER_STATE_CACHE_OPTIONS' : '',
);

/**
 * A list of allowed HTTP methods to cache.
 */
const ALLOWED_METHODS = ['GET', 'HEAD'];

function canUseOrCacheRequest(req: HttpRequest<unknown>, options: CacheOptions): boolean {
  const {isCacheActive, ...globalOptions} = options;
  const {transferCache: requestOptions, method: requestMethod} = req;

  if (
    !isCacheActive ||
    requestOptions === false ||
    // Do not cache requests sent with credentials.
    hasOutgoingCredentials(req) ||
    // POST requests are allowed either globally or at request level
    (requestMethod === 'POST' && !globalOptions.includePostRequests && !requestOptions) ||
    (requestMethod !== 'POST' && !ALLOWED_METHODS.includes(requestMethod)) ||
    // Do not cache requests with authentication or cookie headers unless explicitly enabled.
    (!globalOptions.includeRequestsWithAuthHeaders && hasAuthHeaders(req)) ||
    // Do not cache requests that explicitly forbid caching via Cache-Control
    // or Fetch API cache mode.
    hasUncacheableCacheControl(req.headers) ||
    isNonCacheableRequest(req.cache) ||
    globalOptions.filter?.(req) === false
  ) {
    return false;
  }

  return true;
}

function getHeadersToInclude(
  options: CacheOptions,
  requestOptions: HttpTransferCacheOptions | boolean | undefined,
): string[] | undefined {
  // Request-specific config takes precedence over the global config.
  return typeof requestOptions === 'object' && requestOptions.includeHeaders
    ? requestOptions.includeHeaders
    : options.includeHeaders;
}

/**
 * Retrieves the cached response for a given request.
 * @param req The request to retrieve the cached response for.
 * @param options The caching options.
 * @param transferState The transfer state to retrieve the cached response from.
 * @param originMap The origin map to map the request URL to the origin. (Not needed when `storeKey` is provided).
 * @param storeKey The key to use to store the cached response in the transfer state. (If not provided, it will be computed from the request and originMap).
 * @param skipUseCacheChecks Whether to skip the use cache checks. (Only disable when the checks have been performed beforehand).
 */
export function retrieveStateFromCache(
  req: HttpRequest<unknown>,
  options: CacheOptions,
  transferState: TransferState,
  originMap: Record<string, string> | null,
  storeKey?: StateKey<TransferHttpResponse>,
  skipUseCacheChecks = false,
): HttpResponse<unknown> | null {
  if (!skipUseCacheChecks && !canUseOrCacheRequest(req, options)) {
    return null;
  }

  if (typeof ngServerMode !== 'undefined' && !ngServerMode && originMap) {
    throw new RuntimeError(
      RuntimeErrorCode.HTTP_ORIGIN_MAP_USED_IN_CLIENT,
      ngDevMode &&
        'Angular detected that the `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token is configured and ' +
          'present in the client side code. Please ensure that this token is only provided in the ' +
          'server code of the application.',
    );
  }

  if (!storeKey) {
    const requestUrl =
      typeof ngServerMode !== 'undefined' && ngServerMode && originMap
        ? mapRequestOriginUrl(req.url, originMap)
        : req.url;

    storeKey = makeCacheKey(req, requestUrl);
  }

  const response = transferState.get(storeKey, null);

  if (!response) {
    return null;
  }

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
      body = fromBase64(undecodedBody);
      break;
    case 'blob':
      body = new Blob([fromBase64(undecodedBody)]);
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
    const {transferCache: requestOptions} = req;
    const headersToInclude = getHeadersToInclude(options, requestOptions);
    headers = appendMissingHeadersDetection(req.url, headers, headersToInclude ?? []);
  }

  return new HttpResponse({
    body,
    headers,
    status,
    statusText,
    url,
  });
}

export function transferCacheInterceptorFn(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const options = inject(CACHE_OPTIONS);
  if (!canUseOrCacheRequest(req, options)) {
    return next(req);
  }

  const transferState = inject(TransferState);
  const originMap = inject(HTTP_TRANSFER_CACHE_ORIGIN_MAP, {optional: true});
  const requestUrl =
    typeof ngServerMode !== 'undefined' && ngServerMode && originMap
      ? mapRequestOriginUrl(req.url, originMap)
      : req.url;
  const storeKey = makeCacheKey(req, requestUrl);

  const cachedResponse = retrieveStateFromCache(
    req,
    options,
    transferState,
    /** originMap */ null,
    storeKey,
    /** skipUseCacheChecks */ true,
  );

  if (cachedResponse) {
    return of(cachedResponse);
  }

  const event$ = next(req);
  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    // Request not found in cache. Make the request and cache it if on the server.
    return event$.pipe(
      tap((event: HttpEvent<unknown>) => {
        if (event instanceof HttpResponse) {
          const {headers, body, status, statusText} = event;

          // Only cache successful HTTP responses that do not have Cache-Control
          // directives that forbid shared caching (no-store or private).
          if (hasUncacheableCacheControl(headers)) {
            return;
          }

          const {transferCache: requestOptions, responseType} = req;
          const headersToInclude = getHeadersToInclude(options, requestOptions);

          transferState.set<TransferHttpResponse>(storeKey, {
            [BODY]:
              responseType === 'arraybuffer' || responseType === 'blob' ? toBase64(body) : body,
            [HEADERS]: getFilteredHeaders(headers, headersToInclude),
            [STATUS]: status,
            [STATUS_TEXT]: statusText,
            [REQ_URL]: requestUrl,
            [RESPONSE_TYPE]: responseType,
          });
        }
      }),
    );
  }

  return event$;
}

/** @returns true when the request contains authentication or cookie headers. */
function hasAuthHeaders(req: HttpRequest<unknown>): boolean {
  const headers = req.headers;

  return (
    headers.has('authorization') || headers.has('proxy-authorization') || headers.has('cookie')
  );
}

function hasOutgoingCredentials(req: HttpRequest<unknown>): boolean {
  const {withCredentials, credentials} = req;

  return withCredentials || credentials === 'include' || credentials === 'same-origin';
}

const UNCACHEABLE_CACHE_CONTROL_DIRECTIVES = new Set(['no-store', 'private', 'no-cache']);

function hasUncacheableCacheControl(headers: HttpHeaders): boolean {
  const cacheControl = headers.get('cache-control');

  if (!cacheControl) {
    return false;
  }

  return cacheControl.split(',').some((directive) => {
    const directiveName = directive.split('=', 1)[0].trim().toLowerCase();

    return UNCACHEABLE_CACHE_CONTROL_DIRECTIVES.has(directiveName);
  });
}

function isNonCacheableRequest(cache: RequestCache): boolean {
  return cache === 'no-cache' || cache === 'no-store';
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

function toBase64(buffer: unknown): string {
  //TODO: replace with when is Baseline widely available
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64
  const bytes = new Uint8Array(buffer as ArrayBufferLike);

  const CHUNK_SIZE = 0x8000; // 32,768 bytes (~32 KB) per chunk, to avoid stack overflow

  let binaryString = '';

  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    binaryString += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binaryString);
}

function fromBase64(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return bytes.buffer;
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
 * @see [Caching data when using HttpClient](guide/ssr#configuring-the-caching-options)
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

/**
 * SHA-256 Constants (first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311):
 */
const SHA256_ROUND_CONSTANTS = /* @__PURE__ */ new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

let textEncoder: TextEncoder | undefined;

/**
 * Generates a SHA-256 hash representation of a string.
 *
 * Note: A custom synchronous SHA-256 implementation is used here because the Web Crypto API
 * (`crypto.subtle.digest`) is strictly asynchronous (Promise-based), whereas the transfer cache
 * state lookup and interceptor flow must operate synchronously due to the HttpResource API.
 *
 * The previous DJB2 hashing logic was vulnerable to pre-image and second-preimage attacks due to
 * its small 64-bit keyspace and mathematical simplicity. An attacker could craft colliding request
 * inputs to poison the cache, potentially causing a CDN or the application to serve the wrong
 * cached response to legitimate users. SHA-256 provides strong cryptographic collision resistance,
 * preventing cache key collision attacks.
 */
export function generateHash(value: string): string {
  textEncoder ??= new TextEncoder();
  const inputBytes = textEncoder.encode(value);

  // Initial hash values (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
  let hashState0 = 0x6a09e667;
  let hashState1 = 0xbb67ae85;
  let hashState2 = 0x3c6ef372;
  let hashState3 = 0xa54ff53a;
  let hashState4 = 0x510e527f;
  let hashState5 = 0x9b05688c;
  let hashState6 = 0x1f83d9ab;
  let hashState7 = 0x5be0cd19;

  // Pre-processing (Padding):
  const messageLengthInBits = inputBytes.length * 8;

  // The total length of the padded message must be a multiple of 64 bytes (512 bits)
  const paddedLengthInBytes = (((inputBytes.length + 8) >> 6) + 1) << 6;
  const paddedBytes = new Uint8Array(paddedLengthInBytes);
  paddedBytes.set(inputBytes);
  paddedBytes[inputBytes.length] = 0x80; // Append a single '1' bit (0x80 byte)

  const paddedBytesView = new DataView(paddedBytes.buffer);
  const lowBits = messageLengthInBits >>> 0;
  const highBits = (messageLengthInBits / 0x100000000) >>> 0;
  paddedBytesView.setUint32(paddedLengthInBytes - 8, highBits, false);
  paddedBytesView.setUint32(paddedLengthInBytes - 4, lowBits, false);

  // Process the message in successive 64-byte chunks:
  const messageSchedule = new Uint32Array(64);
  for (let chunkOffset = 0; chunkOffset < paddedLengthInBytes; chunkOffset += 64) {
    // Initialize first 16 words of the message schedule:
    for (let i = 0; i < 16; i++) {
      messageSchedule[i] = paddedBytesView.getUint32(chunkOffset + i * 4, false);
    }

    // Extend to 64 words:
    for (let i = 16; i < 64; i++) {
      const prevWord15 = messageSchedule[i - 15];
      const sigma0 =
        (((prevWord15 >>> 7) | (prevWord15 << 25)) ^
          ((prevWord15 >>> 18) | (prevWord15 << 14)) ^
          (prevWord15 >>> 3)) >>>
        0;

      const prevWord2 = messageSchedule[i - 2];
      const sigma1 =
        (((prevWord2 >>> 17) | (prevWord2 << 15)) ^
          ((prevWord2 >>> 19) | (prevWord2 << 13)) ^
          (prevWord2 >>> 10)) >>>
        0;

      messageSchedule[i] =
        (messageSchedule[i - 16] + sigma0 + messageSchedule[i - 7] + sigma1) >>> 0;
    }

    // Initialize working variables to current hash values:
    let workingStateA = hashState0;
    let workingStateB = hashState1;
    let workingStateC = hashState2;
    let workingStateD = hashState3;
    let workingStateE = hashState4;
    let workingStateF = hashState5;
    let workingStateG = hashState6;
    let workingStateH = hashState7;

    // Compression function main loop:
    for (let i = 0; i < 64; i++) {
      const capitalSigma1 =
        (((workingStateE >>> 6) | (workingStateE << 26)) ^
          ((workingStateE >>> 11) | (workingStateE << 21)) ^
          ((workingStateE >>> 25) | (workingStateE << 7))) >>>
        0;
      const chFunction = ((workingStateE & workingStateF) ^ (~workingStateE & workingStateG)) >>> 0;
      const temp1 =
        (workingStateH +
          capitalSigma1 +
          chFunction +
          SHA256_ROUND_CONSTANTS[i] +
          messageSchedule[i]) >>>
        0;

      const capitalSigma0 =
        (((workingStateA >>> 2) | (workingStateA << 30)) ^
          ((workingStateA >>> 13) | (workingStateA << 19)) ^
          ((workingStateA >>> 22) | (workingStateA << 10))) >>>
        0;
      const majFunction =
        ((workingStateA & workingStateB) ^
          (workingStateA & workingStateC) ^
          (workingStateB & workingStateC)) >>>
        0;
      const temp2 = (capitalSigma0 + majFunction) >>> 0;

      workingStateH = workingStateG;
      workingStateG = workingStateF;
      workingStateF = workingStateE;
      workingStateE = (workingStateD + temp1) >>> 0;
      workingStateD = workingStateC;
      workingStateC = workingStateB;
      workingStateB = workingStateA;
      workingStateA = (temp1 + temp2) >>> 0;
    }

    // Update intermediate hash state:
    hashState0 = (hashState0 + workingStateA) >>> 0;
    hashState1 = (hashState1 + workingStateB) >>> 0;
    hashState2 = (hashState2 + workingStateC) >>> 0;
    hashState3 = (hashState3 + workingStateD) >>> 0;
    hashState4 = (hashState4 + workingStateE) >>> 0;
    hashState5 = (hashState5 + workingStateF) >>> 0;
    hashState6 = (hashState6 + workingStateG) >>> 0;
    hashState7 = (hashState7 + workingStateH) >>> 0;
  }

  // Produce the final 64-character hexadecimal hash:
  return [
    hashState0,
    hashState1,
    hashState2,
    hashState3,
    hashState4,
    hashState5,
    hashState6,
    hashState7,
  ]
    .map((x) => x.toString(16).padStart(8, '0'))
    .join('');
}
