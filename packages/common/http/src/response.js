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
export var HttpEventType;
(function (HttpEventType) {
  /**
   * The request was sent out over the wire.
   */
  HttpEventType[(HttpEventType['Sent'] = 0)] = 'Sent';
  /**
   * An upload progress event was received.
   *
   * Note: The `FetchBackend` doesn't support progress report on uploads.
   */
  HttpEventType[(HttpEventType['UploadProgress'] = 1)] = 'UploadProgress';
  /**
   * The response status code and headers were received.
   */
  HttpEventType[(HttpEventType['ResponseHeader'] = 2)] = 'ResponseHeader';
  /**
   * A download progress event was received.
   */
  HttpEventType[(HttpEventType['DownloadProgress'] = 3)] = 'DownloadProgress';
  /**
   * The full response including the body was received.
   */
  HttpEventType[(HttpEventType['Response'] = 4)] = 'Response';
  /**
   * A custom event from an interceptor or a backend.
   */
  HttpEventType[(HttpEventType['User'] = 5)] = 'User';
})(HttpEventType || (HttpEventType = {}));
/**
 * Base class for both `HttpResponse` and `HttpHeaderResponse`.
 *
 * @publicApi
 */
export class HttpResponseBase {
  /**
   * Super-constructor for all responses.
   *
   * The single parameter accepted is an initialization hash. Any properties
   * of the response passed there will override the default values.
   */
  constructor(init, defaultStatus = 200, defaultStatusText = 'OK') {
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
  constructor(init = {}) {
    super(init);
    this.type = HttpEventType.ResponseHeader;
  }
  /**
   * Copy this `HttpHeaderResponse`, overriding its contents with the
   * given parameter hash.
   */
  clone(update = {}) {
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
export class HttpResponse extends HttpResponseBase {
  /**
   * Construct a new `HttpResponse`.
   */
  constructor(init = {}) {
    super(init);
    this.type = HttpEventType.Response;
    this.body = init.body !== undefined ? init.body : null;
  }
  clone(update = {}) {
    return new HttpResponse({
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
export class HttpErrorResponse extends HttpResponseBase {
  constructor(init) {
    // Initialize with a default status of 0 / Unknown Error.
    super(init, 0, 'Unknown Error');
    this.name = 'HttpErrorResponse';
    /**
     * Errors are never okay, even when the status code is in the 2xx success range.
     */
    this.ok = false;
    // If the response was successful, then this was a parse error. Otherwise, it was
    // a protocol-level failure of some sort. Either the request failed in transit
    // or the server returned an unsuccessful status code.
    if (this.status >= 200 && this.status < 300) {
      this.message = `Http failure during parsing for ${init.url || '(unknown url)'}`;
    } else {
      this.message = `Http failure response for ${init.url || '(unknown url)'}: ${init.status} ${init.statusText}`;
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
export var HttpStatusCode;
(function (HttpStatusCode) {
  HttpStatusCode[(HttpStatusCode['Continue'] = 100)] = 'Continue';
  HttpStatusCode[(HttpStatusCode['SwitchingProtocols'] = 101)] = 'SwitchingProtocols';
  HttpStatusCode[(HttpStatusCode['Processing'] = 102)] = 'Processing';
  HttpStatusCode[(HttpStatusCode['EarlyHints'] = 103)] = 'EarlyHints';
  HttpStatusCode[(HttpStatusCode['Ok'] = 200)] = 'Ok';
  HttpStatusCode[(HttpStatusCode['Created'] = 201)] = 'Created';
  HttpStatusCode[(HttpStatusCode['Accepted'] = 202)] = 'Accepted';
  HttpStatusCode[(HttpStatusCode['NonAuthoritativeInformation'] = 203)] =
    'NonAuthoritativeInformation';
  HttpStatusCode[(HttpStatusCode['NoContent'] = 204)] = 'NoContent';
  HttpStatusCode[(HttpStatusCode['ResetContent'] = 205)] = 'ResetContent';
  HttpStatusCode[(HttpStatusCode['PartialContent'] = 206)] = 'PartialContent';
  HttpStatusCode[(HttpStatusCode['MultiStatus'] = 207)] = 'MultiStatus';
  HttpStatusCode[(HttpStatusCode['AlreadyReported'] = 208)] = 'AlreadyReported';
  HttpStatusCode[(HttpStatusCode['ImUsed'] = 226)] = 'ImUsed';
  HttpStatusCode[(HttpStatusCode['MultipleChoices'] = 300)] = 'MultipleChoices';
  HttpStatusCode[(HttpStatusCode['MovedPermanently'] = 301)] = 'MovedPermanently';
  HttpStatusCode[(HttpStatusCode['Found'] = 302)] = 'Found';
  HttpStatusCode[(HttpStatusCode['SeeOther'] = 303)] = 'SeeOther';
  HttpStatusCode[(HttpStatusCode['NotModified'] = 304)] = 'NotModified';
  HttpStatusCode[(HttpStatusCode['UseProxy'] = 305)] = 'UseProxy';
  HttpStatusCode[(HttpStatusCode['Unused'] = 306)] = 'Unused';
  HttpStatusCode[(HttpStatusCode['TemporaryRedirect'] = 307)] = 'TemporaryRedirect';
  HttpStatusCode[(HttpStatusCode['PermanentRedirect'] = 308)] = 'PermanentRedirect';
  HttpStatusCode[(HttpStatusCode['BadRequest'] = 400)] = 'BadRequest';
  HttpStatusCode[(HttpStatusCode['Unauthorized'] = 401)] = 'Unauthorized';
  HttpStatusCode[(HttpStatusCode['PaymentRequired'] = 402)] = 'PaymentRequired';
  HttpStatusCode[(HttpStatusCode['Forbidden'] = 403)] = 'Forbidden';
  HttpStatusCode[(HttpStatusCode['NotFound'] = 404)] = 'NotFound';
  HttpStatusCode[(HttpStatusCode['MethodNotAllowed'] = 405)] = 'MethodNotAllowed';
  HttpStatusCode[(HttpStatusCode['NotAcceptable'] = 406)] = 'NotAcceptable';
  HttpStatusCode[(HttpStatusCode['ProxyAuthenticationRequired'] = 407)] =
    'ProxyAuthenticationRequired';
  HttpStatusCode[(HttpStatusCode['RequestTimeout'] = 408)] = 'RequestTimeout';
  HttpStatusCode[(HttpStatusCode['Conflict'] = 409)] = 'Conflict';
  HttpStatusCode[(HttpStatusCode['Gone'] = 410)] = 'Gone';
  HttpStatusCode[(HttpStatusCode['LengthRequired'] = 411)] = 'LengthRequired';
  HttpStatusCode[(HttpStatusCode['PreconditionFailed'] = 412)] = 'PreconditionFailed';
  HttpStatusCode[(HttpStatusCode['PayloadTooLarge'] = 413)] = 'PayloadTooLarge';
  HttpStatusCode[(HttpStatusCode['UriTooLong'] = 414)] = 'UriTooLong';
  HttpStatusCode[(HttpStatusCode['UnsupportedMediaType'] = 415)] = 'UnsupportedMediaType';
  HttpStatusCode[(HttpStatusCode['RangeNotSatisfiable'] = 416)] = 'RangeNotSatisfiable';
  HttpStatusCode[(HttpStatusCode['ExpectationFailed'] = 417)] = 'ExpectationFailed';
  HttpStatusCode[(HttpStatusCode['ImATeapot'] = 418)] = 'ImATeapot';
  HttpStatusCode[(HttpStatusCode['MisdirectedRequest'] = 421)] = 'MisdirectedRequest';
  HttpStatusCode[(HttpStatusCode['UnprocessableEntity'] = 422)] = 'UnprocessableEntity';
  HttpStatusCode[(HttpStatusCode['Locked'] = 423)] = 'Locked';
  HttpStatusCode[(HttpStatusCode['FailedDependency'] = 424)] = 'FailedDependency';
  HttpStatusCode[(HttpStatusCode['TooEarly'] = 425)] = 'TooEarly';
  HttpStatusCode[(HttpStatusCode['UpgradeRequired'] = 426)] = 'UpgradeRequired';
  HttpStatusCode[(HttpStatusCode['PreconditionRequired'] = 428)] = 'PreconditionRequired';
  HttpStatusCode[(HttpStatusCode['TooManyRequests'] = 429)] = 'TooManyRequests';
  HttpStatusCode[(HttpStatusCode['RequestHeaderFieldsTooLarge'] = 431)] =
    'RequestHeaderFieldsTooLarge';
  HttpStatusCode[(HttpStatusCode['UnavailableForLegalReasons'] = 451)] =
    'UnavailableForLegalReasons';
  HttpStatusCode[(HttpStatusCode['InternalServerError'] = 500)] = 'InternalServerError';
  HttpStatusCode[(HttpStatusCode['NotImplemented'] = 501)] = 'NotImplemented';
  HttpStatusCode[(HttpStatusCode['BadGateway'] = 502)] = 'BadGateway';
  HttpStatusCode[(HttpStatusCode['ServiceUnavailable'] = 503)] = 'ServiceUnavailable';
  HttpStatusCode[(HttpStatusCode['GatewayTimeout'] = 504)] = 'GatewayTimeout';
  HttpStatusCode[(HttpStatusCode['HttpVersionNotSupported'] = 505)] = 'HttpVersionNotSupported';
  HttpStatusCode[(HttpStatusCode['VariantAlsoNegotiates'] = 506)] = 'VariantAlsoNegotiates';
  HttpStatusCode[(HttpStatusCode['InsufficientStorage'] = 507)] = 'InsufficientStorage';
  HttpStatusCode[(HttpStatusCode['LoopDetected'] = 508)] = 'LoopDetected';
  HttpStatusCode[(HttpStatusCode['NotExtended'] = 510)] = 'NotExtended';
  HttpStatusCode[(HttpStatusCode['NetworkAuthenticationRequired'] = 511)] =
    'NetworkAuthenticationRequired';
})(HttpStatusCode || (HttpStatusCode = {}));
//# sourceMappingURL=response.js.map
