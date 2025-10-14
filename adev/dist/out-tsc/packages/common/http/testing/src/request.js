/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {HttpErrorResponse, HttpHeaders, HttpResponse, HttpStatusCode} from '../../index';
/**
 * A mock requests that was received and is ready to be answered.
 *
 * This interface allows access to the underlying `HttpRequest`, and allows
 * responding with `HttpEvent`s or `HttpErrorResponse`s.
 *
 * @publicApi
 */
export class TestRequest {
  request;
  observer;
  /**
   * Whether the request was cancelled after it was sent.
   */
  get cancelled() {
    return this._cancelled;
  }
  /**
   * @internal set by `HttpClientTestingBackend`
   */
  _cancelled = false;
  constructor(request, observer) {
    this.request = request;
    this.observer = observer;
  }
  /**
   * Resolve the request by returning a body plus additional HTTP information (such as response
   * headers) if provided.
   * If the request specifies an expected body type, the body is converted into the requested type.
   * Otherwise, the body is converted to `JSON` by default.
   *
   * Both successful and unsuccessful responses can be delivered via `flush()`.
   */
  flush(body, opts = {}) {
    if (this.cancelled) {
      throw new Error(`Cannot flush a cancelled request.`);
    }
    const url = this.request.urlWithParams;
    const headers =
      opts.headers instanceof HttpHeaders ? opts.headers : new HttpHeaders(opts.headers);
    body = _maybeConvertBody(this.request.responseType, body);
    let statusText = opts.statusText;
    let status = opts.status !== undefined ? opts.status : HttpStatusCode.Ok;
    if (opts.status === undefined) {
      if (body === null) {
        status = HttpStatusCode.NoContent;
        statusText ||= 'No Content';
      } else {
        statusText ||= 'OK';
      }
    }
    if (statusText === undefined) {
      throw new Error('statusText is required when setting a custom status.');
    }
    if (status >= 200 && status < 300) {
      this.observer.next(new HttpResponse({body, headers, status, statusText, url}));
      this.observer.complete();
    } else {
      this.observer.error(new HttpErrorResponse({error: body, headers, status, statusText, url}));
    }
  }
  error(error, opts = {}) {
    if (this.cancelled) {
      throw new Error(`Cannot return an error for a cancelled request.`);
    }
    const headers =
      opts.headers instanceof HttpHeaders ? opts.headers : new HttpHeaders(opts.headers);
    this.observer.error(
      new HttpErrorResponse({
        error,
        headers,
        status: opts.status || 0,
        statusText: opts.statusText || '',
        url: this.request.urlWithParams,
      }),
    );
  }
  /**
   * Deliver an arbitrary `HttpEvent` (such as a progress event) on the response stream for this
   * request.
   */
  event(event) {
    if (this.cancelled) {
      throw new Error(`Cannot send events to a cancelled request.`);
    }
    this.observer.next(event);
  }
}
/**
 * Helper function to convert a response body to an ArrayBuffer.
 */
function _toArrayBufferBody(body) {
  if (typeof ArrayBuffer === 'undefined') {
    throw new Error('ArrayBuffer responses are not supported on this platform.');
  }
  if (body instanceof ArrayBuffer) {
    return body;
  }
  throw new Error('Automatic conversion to ArrayBuffer is not supported for response type.');
}
/**
 * Helper function to convert a response body to a Blob.
 */
function _toBlob(body) {
  if (typeof Blob === 'undefined') {
    throw new Error('Blob responses are not supported on this platform.');
  }
  if (body instanceof Blob) {
    return body;
  }
  if (ArrayBuffer && body instanceof ArrayBuffer) {
    return new Blob([body]);
  }
  throw new Error('Automatic conversion to Blob is not supported for response type.');
}
/**
 * Helper function to convert a response body to JSON data.
 */
function _toJsonBody(body, format = 'JSON') {
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
    throw new Error(`Automatic conversion to ${format} is not supported for ArrayBuffers.`);
  }
  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    throw new Error(`Automatic conversion to ${format} is not supported for Blobs.`);
  }
  if (
    typeof body === 'string' ||
    typeof body === 'number' ||
    typeof body === 'object' ||
    typeof body === 'boolean' ||
    Array.isArray(body)
  ) {
    return body;
  }
  throw new Error(`Automatic conversion to ${format} is not supported for response type.`);
}
/**
 * Helper function to convert a response body to a string.
 */
function _toTextBody(body) {
  if (typeof body === 'string') {
    return body;
  }
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
    throw new Error('Automatic conversion to text is not supported for ArrayBuffers.');
  }
  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    throw new Error('Automatic conversion to text is not supported for Blobs.');
  }
  return JSON.stringify(_toJsonBody(body, 'text'));
}
/**
 * Convert a response body to the requested type.
 */
function _maybeConvertBody(responseType, body) {
  if (body === null) {
    return null;
  }
  switch (responseType) {
    case 'arraybuffer':
      return _toArrayBufferBody(body);
    case 'blob':
      return _toBlob(body);
    case 'json':
      return _toJsonBody(body);
    case 'text':
      return _toTextBody(body);
    default:
      throw new Error(`Unsupported responseType: ${responseType}`);
  }
}
//# sourceMappingURL=request.js.map
