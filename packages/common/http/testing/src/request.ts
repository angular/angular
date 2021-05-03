/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpErrorResponse, HttpEvent, HttpHeaders, HttpRequest, HttpResponse, HttpStatusCode} from '@angular/common/http';
import {Observer} from 'rxjs';

/**
 * A mock requests that was received and is ready to be answered.
 *
 * This interface allows access to the underlying `HttpRequest`, and allows
 * responding with `HttpEvent`s or `HttpErrorResponse`s.
 *
 * @publicApi
 */
export class TestRequest {
  /**
   * Whether the request was cancelled after it was sent.
   */
  get cancelled(): boolean {
    return this._cancelled;
  }

  /**
   * @internal set by `HttpClientTestingBackend`
   */
  _cancelled = false;

  constructor(public request: HttpRequest<any>, private observer: Observer<HttpEvent<any>>) {}

  /**
   * Resolve the request by returning a body plus additional HTTP information (such as response
   * headers) if provided.
   * If the request specifies an expected body type, the body is converted into the requested type.
   * Otherwise, the body is converted to `JSON` by default.
   *
   * Both successful and unsuccessful responses can be delivered via `flush()`.
   */
  flush(
      body: ArrayBuffer|Blob|boolean|string|number|Object|(boolean|string|number|Object|null)[]|
      null,
      opts: {
        headers?: HttpHeaders|{[name: string]: string | string[]},
        status?: number,
        statusText?: string,
      } = {}): void {
    if (this.cancelled) {
      throw new Error(`Cannot flush a cancelled request.`);
    }
    const url = this.request.urlWithParams;
    const headers =
        (opts.headers instanceof HttpHeaders) ? opts.headers : new HttpHeaders(opts.headers);
    body = _maybeConvertBody(this.request.responseType, body);
    let statusText: string|undefined = opts.statusText;
    let status: number = opts.status !== undefined ? opts.status : HttpStatusCode.Ok;
    if (opts.status === undefined) {
      if (body === null) {
        status = HttpStatusCode.NoContent;
        statusText = statusText || 'No Content';
      } else {
        statusText = statusText || 'OK';
      }
    }
    if (statusText === undefined) {
      throw new Error('statusText is required when setting a custom status.');
    }
    if (status >= 200 && status < 300) {
      this.observer.next(new HttpResponse<any>({body, headers, status, statusText, url}));
      this.observer.complete();
    } else {
      this.observer.error(new HttpErrorResponse({error: body, headers, status, statusText, url}));
    }
  }

  /**
   * Resolve the request by returning an `ErrorEvent` (e.g. simulating a network failure).
   */
  error(error: ErrorEvent, opts: {
    headers?: HttpHeaders|{[name: string]: string | string[]},
    status?: number,
    statusText?: string,
  } = {}): void {
    if (this.cancelled) {
      throw new Error(`Cannot return an error for a cancelled request.`);
    }
    if (opts.status && opts.status >= 200 && opts.status < 300) {
      throw new Error(`error() called with a successful status.`);
    }
    const headers =
        (opts.headers instanceof HttpHeaders) ? opts.headers : new HttpHeaders(opts.headers);
    this.observer.error(new HttpErrorResponse({
      error,
      headers,
      status: opts.status || 0,
      statusText: opts.statusText || '',
      url: this.request.urlWithParams,
    }));
  }

  /**
   * Deliver an arbitrary `HttpEvent` (such as a progress event) on the response stream for this
   * request.
   */
  event(event: HttpEvent<any>): void {
    if (this.cancelled) {
      throw new Error(`Cannot send events to a cancelled request.`);
    }
    this.observer.next(event);
  }
}


/**
 * Helper function to convert a response body to an ArrayBuffer.
 */
function _toArrayBufferBody(body: ArrayBuffer|Blob|string|number|Object|
                            (string | number | Object | null)[]): ArrayBuffer {
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
function _toBlob(body: ArrayBuffer|Blob|string|number|Object|
                 (string | number | Object | null)[]): Blob {
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
function _toJsonBody(
    body: ArrayBuffer|Blob|boolean|string|number|Object|
    (boolean | string | number | Object | null)[],
    format: string = 'JSON'): Object|string|number|(Object | string | number)[] {
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
    throw new Error(`Automatic conversion to ${format} is not supported for ArrayBuffers.`);
  }
  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    throw new Error(`Automatic conversion to ${format} is not supported for Blobs.`);
  }
  if (typeof body === 'string' || typeof body === 'number' || typeof body === 'object' ||
      typeof body === 'boolean' || Array.isArray(body)) {
    return body;
  }
  throw new Error(`Automatic conversion to ${format} is not supported for response type.`);
}

/**
 * Helper function to convert a response body to a string.
 */
function _toTextBody(body: ArrayBuffer|Blob|string|number|Object|
                     (string | number | Object | null)[]): string {
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
function _maybeConvertBody(
    responseType: string,
    body: ArrayBuffer|Blob|string|number|Object|(string | number | Object | null)[]|
    null): ArrayBuffer|Blob|string|number|Object|(string | number | Object | null)[]|null {
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
