/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpContext} from './context';
import {HttpHeaders} from './headers';
import {HttpParams} from './params';

/**
 * Construction interface for `HttpRequest`s.
 *
 * All values are optional and will override default values if provided.
 */
interface HttpRequestInit {
  headers?: HttpHeaders;
  context?: HttpContext;
  reportProgress?: boolean;
  params?: HttpParams;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  withCredentials?: boolean;
  credentials?: RequestCredentials;
  transferCache?: {includeHeaders?: string[]} | boolean;
  keepalive?: boolean;
  priority?: RequestPriority;
  cache?: RequestCache;
  timeout?: number;
  mode?: RequestMode;
  redirect?: RequestRedirect;
}

/**
 * Determine whether the given HTTP method may include a body.
 */
function mightHaveBody(method: string): boolean {
  switch (method) {
    case 'DELETE':
    case 'GET':
    case 'HEAD':
    case 'OPTIONS':
    case 'JSONP':
      return false;
    default:
      return true;
  }
}

/**
 * Safely assert whether the given value is an ArrayBuffer.
 *
 * In some execution environments ArrayBuffer is not defined.
 */
function isArrayBuffer(value: any): value is ArrayBuffer {
  return typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer;
}

/**
 * Safely assert whether the given value is a Blob.
 *
 * In some execution environments Blob is not defined.
 */
function isBlob(value: any): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

/**
 * Safely assert whether the given value is a FormData instance.
 *
 * In some execution environments FormData is not defined.
 */
function isFormData(value: any): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

/**
 * Safely assert whether the given value is a URLSearchParams instance.
 *
 * In some execution environments URLSearchParams is not defined.
 */
function isUrlSearchParams(value: any): value is URLSearchParams {
  return typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;
}

/**
 * `Content-Type` is an HTTP header used to indicate the media type
 * (also known as MIME type) of the resource being sent to the client
 * or received from the server.
 */
export const CONTENT_TYPE_HEADER = 'Content-Type';

/**
 * The `Accept` header is an HTTP request header that indicates the media types
 * (or content types) the client is willing to receive from the server.
 */
export const ACCEPT_HEADER = 'Accept';

/**
 * `X-Request-URL` is a custom HTTP header used in older browser versions,
 * including Firefox (< 32), Chrome (< 37), Safari (< 8), and Internet Explorer,
 * to include the full URL of the request in cross-origin requests.
 */
export const X_REQUEST_URL_HEADER = 'X-Request-URL';

/**
 * `text/plain` is a content type used to indicate that the content being
 * sent is plain text with no special formatting or structured data
 * like HTML, XML, or JSON.
 */
export const TEXT_CONTENT_TYPE = 'text/plain';

/**
 * `application/json` is a content type used to indicate that the content
 * being sent is in the JSON format.
 */
export const JSON_CONTENT_TYPE = 'application/json';

/**
 * `application/json, text/plain, *\/*` is a content negotiation string often seen in the
 * Accept header of HTTP requests. It indicates the types of content the client is willing
 * to accept from the server, with a preference for `application/json` and `text/plain`,
 * but also accepting any other type (*\/*).
 */
export const ACCEPT_HEADER_VALUE = `${JSON_CONTENT_TYPE}, ${TEXT_CONTENT_TYPE}, */*`;

/**
 * An outgoing HTTP request with an optional typed body.
 *
 * `HttpRequest` represents an outgoing request, including URL, method,
 * headers, body, and other request configuration options. Instances should be
 * assumed to be immutable. To modify a `HttpRequest`, the `clone`
 * method should be used.
 *
 * @publicApi
 */
export class HttpRequest<T> {
  /**
   * The request body, or `null` if one isn't set.
   *
   * Bodies are not enforced to be immutable, as they can include a reference to any
   * user-defined data type. However, interceptors should take care to preserve
   * idempotence by treating them as such.
   */
  readonly body: T | null = null;

  /**
   * Outgoing headers for this request.
   */
  readonly headers!: HttpHeaders;

  /**
   * Shared and mutable context that can be used by interceptors
   */
  readonly context!: HttpContext;

  /**
   * Whether this request should be made in a way that exposes progress events.
   *
   * Progress events are expensive (change detection runs on each event) and so
   * they should only be requested if the consumer intends to monitor them.
   *
   * Note: The `FetchBackend` doesn't support progress report on uploads.
   */
  readonly reportProgress: boolean = false;

  /**
   * Whether this request should be sent with outgoing credentials (cookies).
   */
  readonly withCredentials: boolean = false;

  /**
   *  The credentials mode of the request, which determines how cookies and HTTP authentication are handled.
   *  This can affect whether cookies are sent with the request, and how authentication is handled.
   */
  readonly credentials!: RequestCredentials;

  /**
   * When using the fetch implementation and set to `true`, the browser will not abort the associated request if the page that initiated it is unloaded before the request is complete.
   */
  readonly keepalive: boolean = false;

  /**
   * Controls how the request will interact with the browser's HTTP cache.
   * This affects whether a response is retrieved from the cache, how it is stored, or if it bypasses the cache altogether.
   */
  readonly cache!: RequestCache;

  /**
   * Indicates the relative priority of the request. This may be used by the browser to decide the order in which requests are dispatched and resources fetched.
   */
  readonly priority!: RequestPriority;

  /**
   * The mode of the request, which determines how the request will interact with the browser's security model.
   * This can affect things like CORS (Cross-Origin Resource Sharing) and same-origin policies.
   */
  readonly mode!: RequestMode;

  /**
   * The redirect mode of the request, which determines how redirects are handled.
   * This can affect whether the request follows redirects automatically, or if it fails when a redirect occurs.
   */
  readonly redirect!: RequestRedirect;

  /**
   * The expected response type of the server.
   *
   * This is used to parse the response appropriately before returning it to
   * the requestee.
   */
  readonly responseType: 'arraybuffer' | 'blob' | 'json' | 'text' = 'json';

  /**
   * The outgoing HTTP request method.
   */
  readonly method: string;

  /**
   * Outgoing URL parameters.
   *
   * To pass a string representation of HTTP parameters in the URL-query-string format,
   * the `HttpParamsOptions`' `fromString` may be used. For example:
   *
   * ```ts
   * new HttpParams({fromString: 'angular=awesome'})
   * ```
   */
  readonly params!: HttpParams;

  /**
   * The outgoing URL with all URL parameters set.
   */
  readonly urlWithParams: string;

  /**
   * The HttpTransferCache option for the request
   */
  readonly transferCache?: {includeHeaders?: string[]} | boolean;

  /**
   * The timeout for the backend HTTP request in ms.
   */
  readonly timeout?: number;

  constructor(
    method: 'GET' | 'HEAD',
    url: string,
    init?: {
      headers?: HttpHeaders;
      context?: HttpContext;
      reportProgress?: boolean;
      params?: HttpParams;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      /**
       * This property accepts either a boolean to enable/disable transferring cache for eligible
       * requests performed using `HttpClient`, or an object, which allows to configure cache
       * parameters, such as which headers should be included (no headers are included by default).
       *
       * Setting this property will override the options passed to `provideClientHydration()` for this
       * particular request
       */
      transferCache?: {includeHeaders?: string[]} | boolean;
      timeout?: number;
    },
  );
  constructor(
    method: 'DELETE' | 'JSONP' | 'OPTIONS',
    url: string,
    init?: {
      headers?: HttpHeaders;
      context?: HttpContext;
      reportProgress?: boolean;
      params?: HttpParams;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      timeout?: number;
      mode?: RequestMode;
      redirect?: RequestRedirect;
    },
  );
  constructor(
    method: 'POST',
    url: string,
    body: T | null,
    init?: {
      headers?: HttpHeaders;
      context?: HttpContext;
      reportProgress?: boolean;
      params?: HttpParams;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      /**
       * This property accepts either a boolean to enable/disable transferring cache for eligible
       * requests performed using `HttpClient`, or an object, which allows to configure cache
       * parameters, such as which headers should be included (no headers are included by default).
       *
       * Setting this property will override the options passed to `provideClientHydration()` for this
       * particular request
       */
      transferCache?: {includeHeaders?: string[]} | boolean;
      timeout?: number;
    },
  );
  constructor(
    method: 'PUT' | 'PATCH',
    url: string,
    body: T | null,
    init?: {
      headers?: HttpHeaders;
      context?: HttpContext;
      reportProgress?: boolean;
      params?: HttpParams;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      timeout?: number;
      mode?: RequestMode;
      redirect?: RequestRedirect;
    },
  );
  constructor(
    method: string,
    url: string,
    body: T | null,
    init?: {
      headers?: HttpHeaders;
      context?: HttpContext;
      reportProgress?: boolean;
      params?: HttpParams;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      /**
       * This property accepts either a boolean to enable/disable transferring cache for eligible
       * requests performed using `HttpClient`, or an object, which allows to configure cache
       * parameters, such as which headers should be included (no headers are included by default).
       *
       * Setting this property will override the options passed to `provideClientHydration()` for this
       * particular request
       */
      transferCache?: {includeHeaders?: string[]} | boolean;
      timeout?: number;
    },
  );
  constructor(
    method: string,
    readonly url: string,
    third?:
      | T
      | {
          headers?: HttpHeaders;
          context?: HttpContext;
          reportProgress?: boolean;
          params?: HttpParams;
          responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
          withCredentials?: boolean;
          credentials?: RequestCredentials;
          keepalive?: boolean;
          priority?: RequestPriority;
          cache?: RequestCache;
          mode?: RequestMode;
          redirect?: RequestRedirect;
          transferCache?: {includeHeaders?: string[]} | boolean;
          timeout?: number;
        }
      | null,
    fourth?: {
      headers?: HttpHeaders;
      context?: HttpContext;
      reportProgress?: boolean;
      params?: HttpParams;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      transferCache?: {includeHeaders?: string[]} | boolean;
      timeout?: number;
    },
  ) {
    this.method = method.toUpperCase();
    // Next, need to figure out which argument holds the HttpRequestInit
    // options, if any.
    let options: HttpRequestInit | undefined;

    // Check whether a body argument is expected. The only valid way to omit
    // the body argument is to use a known no-body method like GET.
    if (mightHaveBody(this.method) || !!fourth) {
      // Body is the third argument, options are the fourth.
      this.body = third !== undefined ? (third as T) : null;
      options = fourth;
    } else {
      // No body required, options are the third argument. The body stays null.
      options = third as HttpRequestInit;
    }

    // If options have been passed, interpret them.
    if (options) {
      // Normalize reportProgress and withCredentials.
      this.reportProgress = !!options.reportProgress;
      this.withCredentials = !!options.withCredentials;
      this.keepalive = !!options.keepalive;

      // Override default response type of 'json' if one is provided.
      if (!!options.responseType) {
        this.responseType = options.responseType;
      }

      // Override headers if they're provided.
      if (options.headers) {
        this.headers = options.headers;
      }

      if (options.context) {
        this.context = options.context;
      }

      if (options.params) {
        this.params = options.params;
      }

      if (options.priority) {
        this.priority = options.priority;
      }

      if (options.cache) {
        this.cache = options.cache;
      }

      if (options.credentials) {
        this.credentials = options.credentials;
      }

      if (typeof options.timeout === 'number') {
        // XHR will ignore any value below 1. AbortSignals only accept unsigned integers.

        if (options.timeout < 1 || !Number.isInteger(options.timeout)) {
          // TODO: create a runtime error
          throw new Error(ngDevMode ? '`timeout` must be a positive integer value' : '');
        }

        this.timeout = options.timeout;
      }

      if (options.mode) {
        this.mode = options.mode;
      }

      if (options.redirect) {
        this.redirect = options.redirect;
      }

      // We do want to assign transferCache even if it's falsy (false is valid value)
      this.transferCache = options.transferCache;
    }

    // If no headers have been passed in, construct a new HttpHeaders instance.
    this.headers ??= new HttpHeaders();

    // If no context have been passed in, construct a new HttpContext instance.
    this.context ??= new HttpContext();

    // If no parameters have been passed in, construct a new HttpUrlEncodedParams instance.
    if (!this.params) {
      this.params = new HttpParams();
      this.urlWithParams = url;
    } else {
      // Encode the parameters to a string in preparation for inclusion in the URL.
      const params = this.params.toString();
      if (params.length === 0) {
        // No parameters, the visible URL is just the URL given at creation time.
        this.urlWithParams = url;
      } else {
        // Does the URL already have query parameters? Look for '?'.
        const qIdx = url.indexOf('?');
        // There are 3 cases to handle:
        // 1) No existing parameters -> append '?' followed by params.
        // 2) '?' exists and is followed by existing query string ->
        //    append '&' followed by params.
        // 3) '?' exists at the end of the url -> append params directly.
        // This basically amounts to determining the character, if any, with
        // which to join the URL and parameters.
        const sep: string = qIdx === -1 ? '?' : qIdx < url.length - 1 ? '&' : '';
        this.urlWithParams = url + sep + params;
      }
    }
  }

  /**
   * Transform the free-form body into a serialized format suitable for
   * transmission to the server.
   */
  serializeBody(): ArrayBuffer | Blob | FormData | URLSearchParams | string | null {
    // If no body is present, no need to serialize it.
    if (this.body === null) {
      return null;
    }
    // Check whether the body is already in a serialized form. If so,
    // it can just be returned directly.
    if (
      typeof this.body === 'string' ||
      isArrayBuffer(this.body) ||
      isBlob(this.body) ||
      isFormData(this.body) ||
      isUrlSearchParams(this.body)
    ) {
      return this.body;
    }
    // Check whether the body is an instance of HttpUrlEncodedParams.
    if (this.body instanceof HttpParams) {
      return this.body.toString();
    }
    // Check whether the body is an object or array, and serialize with JSON if so.
    if (
      typeof this.body === 'object' ||
      typeof this.body === 'boolean' ||
      Array.isArray(this.body)
    ) {
      return JSON.stringify(this.body);
    }
    // Fall back on toString() for everything else.
    return (this.body as any).toString();
  }

  /**
   * Examine the body and attempt to infer an appropriate MIME type
   * for it.
   *
   * If no such type can be inferred, this method will return `null`.
   */
  detectContentTypeHeader(): string | null {
    // An empty body has no content type.
    if (this.body === null) {
      return null;
    }
    // FormData bodies rely on the browser's content type assignment.
    if (isFormData(this.body)) {
      return null;
    }
    // Blobs usually have their own content type. If it doesn't, then
    // no type can be inferred.
    if (isBlob(this.body)) {
      return this.body.type || null;
    }
    // Array buffers have unknown contents and thus no type can be inferred.
    if (isArrayBuffer(this.body)) {
      return null;
    }
    // Technically, strings could be a form of JSON data, but it's safe enough
    // to assume they're plain strings.
    if (typeof this.body === 'string') {
      return TEXT_CONTENT_TYPE;
    }
    // `HttpUrlEncodedParams` has its own content-type.
    if (this.body instanceof HttpParams) {
      return 'application/x-www-form-urlencoded;charset=UTF-8';
    }
    // Arrays, objects, boolean and numbers will be encoded as JSON.
    if (
      typeof this.body === 'object' ||
      typeof this.body === 'number' ||
      typeof this.body === 'boolean'
    ) {
      return JSON_CONTENT_TYPE;
    }
    // No type could be inferred.
    return null;
  }

  clone(): HttpRequest<T>;
  clone(update: {
    headers?: HttpHeaders;
    context?: HttpContext;
    reportProgress?: boolean;
    params?: HttpParams;
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
    withCredentials?: boolean;
    credentials?: RequestCredentials;
    keepalive?: boolean;
    priority?: RequestPriority;
    cache?: RequestCache;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    transferCache?: {includeHeaders?: string[]} | boolean;
    timeout?: number;
    body?: T | null;
    method?: string;
    url?: string;
    setHeaders?: {[name: string]: string | string[]};
    setParams?: {[param: string]: string};
  }): HttpRequest<T>;
  clone<V>(update: {
    headers?: HttpHeaders;
    context?: HttpContext;
    reportProgress?: boolean;
    params?: HttpParams;
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
    keepalive?: boolean;
    priority?: RequestPriority;
    cache?: RequestCache;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    withCredentials?: boolean;
    credentials?: RequestCredentials;
    transferCache?: {includeHeaders?: string[]} | boolean;
    timeout?: number;
    body?: V | null;
    method?: string;
    url?: string;
    setHeaders?: {[name: string]: string | string[]};
    setParams?: {[param: string]: string};
  }): HttpRequest<V>;
  clone(
    update: {
      headers?: HttpHeaders;
      context?: HttpContext;
      reportProgress?: boolean;
      params?: HttpParams;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
      credentials?: RequestCredentials;
      keepalive?: boolean;
      priority?: RequestPriority;
      cache?: RequestCache;
      mode?: RequestMode;
      redirect?: RequestRedirect;
      transferCache?: {includeHeaders?: string[]} | boolean;
      timeout?: number;
      body?: any | null;
      method?: string;
      url?: string;
      setHeaders?: {[name: string]: string | string[]};
      setParams?: {[param: string]: string};
    } = {},
  ): HttpRequest<any> {
    // For method, url, and responseType, take the current value unless
    // it is overridden in the update hash.
    const method = update.method || this.method;
    const url = update.url || this.url;
    const responseType = update.responseType || this.responseType;
    const keepalive = update.keepalive ?? this.keepalive;
    const priority = update.priority || this.priority;
    const cache = update.cache || this.cache;
    const mode = update.mode || this.mode;
    const redirect = update.redirect || this.redirect;
    const credentials = update.credentials || this.credentials;
    // Carefully handle the transferCache to differentiate between
    // `false` and `undefined` in the update args.
    const transferCache = update.transferCache ?? this.transferCache;

    const timeout = update.timeout ?? this.timeout;

    // The body is somewhat special - a `null` value in update.body means
    // whatever current body is present is being overridden with an empty
    // body, whereas an `undefined` value in update.body implies no
    // override.
    const body = update.body !== undefined ? update.body : this.body;

    // Carefully handle the boolean options to differentiate between
    // `false` and `undefined` in the update args.
    const withCredentials = update.withCredentials ?? this.withCredentials;
    const reportProgress = update.reportProgress ?? this.reportProgress;

    // Headers and params may be appended to if `setHeaders` or
    // `setParams` are used.
    let headers = update.headers || this.headers;
    let params = update.params || this.params;

    // Pass on context if needed
    const context = update.context ?? this.context;

    // Check whether the caller has asked to add headers.
    if (update.setHeaders !== undefined) {
      // Set every requested header.
      headers = Object.keys(update.setHeaders).reduce(
        (headers, name) => headers.set(name, update.setHeaders![name]),
        headers,
      );
    }

    // Check whether the caller has asked to set params.
    if (update.setParams) {
      // Set every requested param.
      params = Object.keys(update.setParams).reduce(
        (params, param) => params.set(param, update.setParams![param]),
        params,
      );
    }

    // Finally, construct the new HttpRequest using the pieces from above.
    return new HttpRequest(method, url, body, {
      params,
      headers,
      context,
      reportProgress,
      responseType,
      withCredentials,
      transferCache,
      keepalive,
      cache,
      priority,
      timeout,
      mode,
      redirect,
      credentials,
    });
  }
}
