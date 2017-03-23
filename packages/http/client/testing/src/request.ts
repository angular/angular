import {HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse, HttpResponseInit} from '@angular/http/client';
import {Observer} from 'rxjs/Observer';

/**
 * Type of all possible mock response bodies.
 */
export type TestResponseBody =
    ArrayBuffer | Blob | string | number | Object | (string | number | Object | null)[];

/**
 * Options to the flush() interface for responding to requests.
 *
 * @experimental
 */
export interface FlushOptions {
  /**
   * A set of response headers to include.
   */
  headers?: HttpHeaders|{[name: string]: string | string[]};

  /**
   * HTTP status code of the response (defaults to 200).
   */
  status?: number;

  /**
   * HTTP status text of the response (defaults to 'OK').
   */
  statusText?: string;
}

/**
 * A mock requests that was received and is ready to be answered.
 *
 * This interface allows access to the underlying {@link HttpRequest}, and allows
 * responding with {@link HttpEvent}s or {@link HttpErrorResponse}s.
 *
 * @experimental
 */
export class TestRequest {
  /**
   * Whether the request was cancelled after it was sent.
   */
  cancelled = false;

  constructor(public request: HttpRequest<any>, private observer: Observer<HttpEvent<any>>) {}


  flush(body: TestResponseBody|null, opts: FlushOptions = {}): void {
    if (this.cancelled) {
      throw new Error(`Cannot flush a cancelled request.`);
    }
    const url = this.request.url;
    const headers = new HttpHeaders(opts.headers);
    body = _maybeConvertBody(this.request.responseType, body);
    let statusText: string|undefined = opts.statusText;
    let status: number = opts.status !== undefined ? opts.status : 200;
    if (opts.status === undefined) {
      if (body === null) {
        status = 204;
        statusText = statusText || 'No Content';
      } else {
        statusText = statusText || 'OK';
      }
    }
    if (statusText === undefined) {
      throw new Error('statusText is required when setting a custom status.');
    }
    const res: HttpResponseInit<any> = {body, headers, status, statusText, url};
    if (status >= 200 && status < 300) {
      this.observer.next(new HttpResponse<any>(res));
      this.observer.complete();
    } else {
      this.observer.error(new HttpErrorResponse(res));
    }
  }

  error(error: ErrorEvent, opts: FlushOptions = {}): void {
    if (this.cancelled) {
      throw new Error(`Cannot return an error for a cancelled request.`);
    }
    if (opts.status && opts.status >= 200 && opts.status < 300) {
      throw new Error(`error() called with a successful status.`);
    }
    this.observer.error(new HttpErrorResponse({
      error,
      headers: new HttpHeaders(opts.headers),
      status: opts.status || 0,
      statusText: opts.statusText || '',
      url: this.request.url,
    }));
  }

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
function _toArrayBufferBody(body: TestResponseBody): ArrayBuffer {
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
function _toBlob(body: TestResponseBody): Blob {
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
function _toJsonBody(body: TestResponseBody, format: string = 'JSON'): Object|string|number|
    (Object | string | number)[] {
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
    throw new Error(`Automatic conversion to ${format} is not supported for ArrayBuffers.`);
  }
  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    throw new Error(`Automatic conversion to ${format} is not supported for Blobs.`);
  }
  if (typeof body === 'string' || typeof body === 'number' || typeof body === 'object' ||
      Array.isArray(body)) {
    return body;
  }
  throw new Error(`Automatic conversion to ${format} is not supported for response type.`);
}

/**
 * Helper function to convert a response body to a string.
 */
function _toTextBody(body: TestResponseBody): string {
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
function _maybeConvertBody(responseType: string, body: TestResponseBody | null): TestResponseBody|
    null {
  switch (responseType) {
    case 'arraybuffer':
      if (body === null) {
        return null;
      }
      return _toArrayBufferBody(body);
    case 'blob':
      if (body === null) {
        return null;
      }
      return _toBlob(body);
    case 'json':
      if (body === null) {
        return 'null';
      }
      return _toJsonBody(body);
    case 'text':
      if (body === null) {
        return null;
      }
      return _toTextBody(body);
    default:
      throw new Error(`Unsupported responseType: ${responseType}`);
  }
}
