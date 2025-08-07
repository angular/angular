/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpHeaders} from './headers';

/**
 * Type enumeration for the different kinds of `HttpEvent`.
 *
 * @publicApi
 */
export enum HttpEventType {
  /**
   * The request was sent out over the wire.
   */
  Sent,

  /**
   * An upload progress event was received.
   *
   * Note: The `FetchBackend` doesn't support progress report on uploads.
   */
  UploadProgress,

  /**
   * The response status code and headers were received.
   */
  ResponseHeader,

  /**
   * A download progress event was received.
   */
  DownloadProgress,

  /**
   * The full response including the body was received.
   */
  Response,

  /**
   * A custom event from an interceptor or a backend.
   */
  User,
}

/**
 * Base interface for progress events.
 *
 * @publicApi
 */
export interface HttpProgressEvent {
  /**
   * Progress event type is either upload or download.
   */
  type: HttpEventType.DownloadProgress | HttpEventType.UploadProgress;

  /**
   * Number of bytes uploaded or downloaded.
   */
  loaded: number;

  /**
   * Total number of bytes to upload or download. Depending on the request or
   * response, this may not be computable and thus may not be present.
   */
  total?: number;
}

/**
 * A download progress event.
 *
 * @publicApi
 */
export interface HttpDownloadProgressEvent extends HttpProgressEvent {
  type: HttpEventType.DownloadProgress;

  /**
   * The partial response body as downloaded so far.
   *
   * Only present if the responseType was `text`.
   */
  partialText?: string;
}

/**
 * An upload progress event.
 *
 * Note: The `FetchBackend` doesn't support progress report on uploads.
 *
 * @publicApi
 */
export interface HttpUploadProgressEvent extends HttpProgressEvent {
  type: HttpEventType.UploadProgress;
}

/**
 * An event indicating that the request was sent to the server. Useful
 * when a request may be retried multiple times, to distinguish between
 * retries on the final event stream.
 *
 * @publicApi
 */
export interface HttpSentEvent {
  type: HttpEventType.Sent;
}

/**
 * A user-defined event.
 *
 * Grouping all custom events under this type ensures they will be handled
 * and forwarded by all implementations of interceptors.
 *
 * @publicApi
 */
export interface HttpUserEvent<T> {
  type: HttpEventType.User;
}

/**
 * An error that represents a failed attempt to JSON.parse text coming back
 * from the server.
 *
 * It bundles the Error object with the actual response body that failed to parse.
 *
 *
 */
export interface HttpJsonParseError {
  error: Error;
  text: string;
}

/**
 * Union type for all possible events on the response stream.
 *
 * Typed according to the expected type of the response.
 *
 * @publicApi
 */
export type HttpEvent<T> =
  | HttpSentEvent
  | HttpHeaderResponse
  | HttpResponse<T>
  | HttpProgressEvent
  | HttpUserEvent<T>;

/**
 * Base class for both `HttpResponse` and `HttpHeaderResponse`.
 *
 * @publicApi
 */
export abstract class HttpResponseBase {
  /**
   * All response headers.
   */
  readonly headers: HttpHeaders;

  /**
   * Response status code.
   */
  readonly status: number;

  /**
   * Textual description of response status code, defaults to OK.
   *
   * Do not depend on this.
   */
  readonly statusText: string;

  /**
   * URL of the resource retrieved, or null if not available.
   */
  readonly url: string | null;

  /**
   * Whether the status code falls in the 2xx range.
   */
  readonly ok: boolean;

  /**
   * Type of the response, narrowed to either the full response or the header.
   */
  readonly type!: HttpEventType.Response | HttpEventType.ResponseHeader;

  /**
   * Indicates whether the HTTP response was redirected during the request.
   * This property is only available when using the Fetch API using `withFetch()`
   * When using the default XHR Request this property will be `undefined`
   */
  readonly redirected?: boolean;

  /**
   * Indicates the type of the HTTP response, based on how the request was made and how the browser handles the response.
   *
   * This corresponds to the `type` property of the Fetch API's `Response` object, which can indicate values such as:
   * - `'basic'`: A same-origin response, allowing full access to the body and headers.
   * - `'cors'`: A cross-origin response with CORS enabled, exposing only safe response headers.
   * - `'opaque'`: A cross-origin response made with `no-cors`, where the response body and headers are inaccessible.
   * - `'opaqueredirect'`: A response resulting from a redirect followed in `no-cors` mode.
   * - `'error'`: A response representing a network error or similar failure.
   *
   * This property is only available when using the Fetch-based backend (via `withFetch()`).
   * When using Angular's (XHR) backend, this value will be `undefined`.
   */
  readonly responseType?: ResponseType;

  /**
   * Super-constructor for all responses.
   *
   * The single parameter accepted is an initialization hash. Any properties
   * of the response passed there will override the default values.
   */
  constructor(
    init: {
      headers?: HttpHeaders;
      status?: number;
      statusText?: string;
      url?: string;
      redirected?: boolean;
      responseType?: ResponseType;
    },
    defaultStatus: number = 200,
    defaultStatusText: string = 'OK',
  ) {
    // If the hash has values passed, use them to initialize the response.
    // Otherwise use the default values.
    this.headers = init.headers || new HttpHeaders();
    this.status = init.status !== undefined ? init.status : defaultStatus;
    this.statusText = init.statusText || defaultStatusText;
    this.url = init.url || null;
    this.redirected = init.redirected;
    this.responseType = init.responseType;
    // Cache the ok value to avoid defining a getter.
    this.ok = this.status >= 200 && this.status < 300;
  }
}

/**
 * A partial HTTP response which only includes the status and header data,
 * but no response body.
 *
 * `HttpHeaderResponse` is a `HttpEvent` available on the response
 * event stream, only when progress events are requested.
 *
 * @publicApi
 */
export class HttpHeaderResponse extends HttpResponseBase {
  /**
   * Create a new `HttpHeaderResponse` with the given parameters.
   */
  constructor(
    init: {
      headers?: HttpHeaders;
      status?: number;
      statusText?: string;
      url?: string;
    } = {},
  ) {
    super(init);
  }

  override readonly type: HttpEventType.ResponseHeader = HttpEventType.ResponseHeader;

  /**
   * Copy this `HttpHeaderResponse`, overriding its contents with the
   * given parameter hash.
   */
  clone(
    update: {
      headers?: HttpHeaders;
      status?: number;
      statusText?: string;
      url?: string;
    } = {},
  ): HttpHeaderResponse {
    // Perform a straightforward initialization of the new HttpHeaderResponse,
    // overriding the current parameters with new ones if given.
    return new HttpHeaderResponse({
      headers: update.headers || this.headers,
      status: update.status !== undefined ? update.status : this.status,
      statusText: update.statusText || this.statusText,
      url: update.url || this.url || undefined,
    });
  }
}

/**
 * A full HTTP response, including a typed response body (which may be `null`
 * if one was not returned).
 *
 * `HttpResponse` is a `HttpEvent` available on the response event
 * stream.
 *
 * @publicApi
 */
export class HttpResponse<T> extends HttpResponseBase {
  /**
   * The response body, or `null` if one was not returned.
   */
  readonly body: T | null;

  /**
   * Construct a new `HttpResponse`.
   */
  constructor(
    init: {
      body?: T | null;
      headers?: HttpHeaders;
      status?: number;
      statusText?: string;
      url?: string;
      redirected?: boolean;
      responseType?: ResponseType;
    } = {},
  ) {
    super(init);
    this.body = init.body !== undefined ? init.body : null;
  }

  override readonly type: HttpEventType.Response = HttpEventType.Response;

  clone(): HttpResponse<T>;
  clone(update: {
    headers?: HttpHeaders;
    status?: number;
    statusText?: string;
    url?: string;
    redirected?: boolean;
    responseType?: ResponseType;
  }): HttpResponse<T>;
  clone<V>(update: {
    body?: V | null;
    headers?: HttpHeaders;
    status?: number;
    statusText?: string;
    url?: string;
    redirected?: boolean;
    responseType?: ResponseType;
  }): HttpResponse<V>;
  clone(
    update: {
      body?: any | null;
      headers?: HttpHeaders;
      status?: number;
      statusText?: string;
      url?: string;
      redirected?: boolean;
      responseType?: ResponseType;
    } = {},
  ): HttpResponse<any> {
    return new HttpResponse<any>({
      body: update.body !== undefined ? update.body : this.body,
      headers: update.headers || this.headers,
      status: update.status !== undefined ? update.status : this.status,
      statusText: update.statusText || this.statusText,
      url: update.url || this.url || undefined,
      redirected: update.redirected ?? this.redirected,
      responseType: update.responseType ?? this.responseType,
    });
  }
}

/**
 * A response that represents an error or failure, either from a
 * non-successful HTTP status, an error while executing the request,
 * or some other failure which occurred during the parsing of the response.
 *
 * Any error returned on the `Observable` response stream will be
 * wrapped in an `HttpErrorResponse` to provide additional context about
 * the state of the HTTP layer when the error occurred. The error property
 * will contain either a wrapped Error object or the error response returned
 * from the server.
 *
 * @publicApi
 */
export class HttpErrorResponse extends HttpResponseBase implements Error {
  readonly name = 'HttpErrorResponse';
  readonly message: string;
  readonly error: any | null;

  /**
   * Errors are never okay, even when the status code is in the 2xx success range.
   */
  override readonly ok = false;

  constructor(init: {
    error?: any;
    headers?: HttpHeaders;
    status?: number;
    statusText?: string;
    url?: string;
    redirected?: boolean;
    responseType?: ResponseType;
  }) {
    // Initialize with a default status of 0 / Unknown Error.
    super(init, 0, 'Unknown Error');

    // If the response was successful, then this was a parse error. Otherwise, it was
    // a protocol-level failure of some sort. Either the request failed in transit
    // or the server returned an unsuccessful status code.
    if (this.status >= 200 && this.status < 300) {
      this.message = `Http failure during parsing for ${init.url || '(unknown url)'}`;
    } else {
      this.message = `Http failure response for ${init.url || '(unknown url)'}: ${init.status} ${
        init.statusText
      }`;
    }
    this.error = init.error || null;
  }
}

/**
 * We use these constant to prevent pulling the whole HttpStatusCode enum
 * Those are the only ones referenced directly by the framework
 */
export const HTTP_STATUS_CODE_OK = 200;
export const HTTP_STATUS_CODE_NO_CONTENT = 204;

/**
 * Http status codes.
 * As per https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
 * @publicApi
 */
export enum HttpStatusCode {
  Continue = 100,
  SwitchingProtocols = 101,
  Processing = 102,
  EarlyHints = 103,

  Ok = HTTP_STATUS_CODE_OK,
  Created = 201,
  Accepted = 202,
  NonAuthoritativeInformation = 203,
  NoContent = HTTP_STATUS_CODE_NO_CONTENT,
  ResetContent = 205,
  PartialContent = 206,
  MultiStatus = 207,
  AlreadyReported = 208,
  ImUsed = 226,

  MultipleChoices = 300,
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,
  UseProxy = 305,
  Unused = 306,
  TemporaryRedirect = 307,
  PermanentRedirect = 308,

  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  ProxyAuthenticationRequired = 407,
  RequestTimeout = 408,
  Conflict = 409,
  Gone = 410,
  LengthRequired = 411,
  PreconditionFailed = 412,
  PayloadTooLarge = 413,
  UriTooLong = 414,
  UnsupportedMediaType = 415,
  RangeNotSatisfiable = 416,
  ExpectationFailed = 417,
  ImATeapot = 418,
  MisdirectedRequest = 421,
  UnprocessableEntity = 422,
  Locked = 423,
  FailedDependency = 424,
  TooEarly = 425,
  UpgradeRequired = 426,
  PreconditionRequired = 428,
  TooManyRequests = 429,
  RequestHeaderFieldsTooLarge = 431,
  UnavailableForLegalReasons = 451,

  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
  HttpVersionNotSupported = 505,
  VariantAlsoNegotiates = 506,
  InsufficientStorage = 507,
  LoopDetected = 508,
  NotExtended = 510,
  NetworkAuthenticationRequired = 511,
}
