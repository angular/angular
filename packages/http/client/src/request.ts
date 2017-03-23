/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpHeaders} from './headers';
import {HttpUrlParams} from './url_params';

/**
 * Represents an HTTP request body when serialized for the server.
 *
 * @experimental
 */
export type HttpSerializedBody = ArrayBuffer | Blob | FormData | string;

/**
 * A subset of the allowed values for `XMLHttpRequest.responseType` supported by
 * {@link HttpClient}.
 *
 * @experimental
 */
export type HttpResponseType = 'arraybuffer' | 'blob' | 'json' | 'text';

/**
 * A type capturing HTTP methods which don't take request bodies.
 *
 * @experimental
 */
export type HttpNoBodyMethod = 'DELETE' | 'GET' | 'HEAD' | 'JSONP' | 'OPTIONS';

/**
 * A type capturing HTTP methods which do take request bodies.
 *
 * @experimental
 */
export type HttpBodyMethod = 'POST' | 'PUT' | 'PATCH';

/**
 * A type representing all (known) HTTP methods.
 *
 * @experimental
 */
export type HttpMethod = HttpBodyMethod | HttpNoBodyMethod;

/**
 * Construction interface for {@link HttpRequest}s.
 *
 * All values are optional and will override default values if provided.
 *
 * @experimental
 */
export interface HttpRequestInit {
  headers?: HttpHeaders;
  reportProgress?: boolean;
  responseType?: HttpResponseType;
  withCredentials?: boolean;
}

/**
 * Cloning interface for {@link HttpRequestClone}.
 *
 * All values are optional and will be cloned from the base request if not
 * provided.
 *
 * @experimental
 */
export interface HttpRequestClone<T> extends HttpRequestInit {
  body?: T|null;
  method?: HttpMethod|string;
  url?: string;
  setHeaders?: {[name: string]: string | string[]};
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
 * An outgoing HTTP request with an optional typed body.
 *
 * {@link HttpRequest} represents an outgoing request, including URL, method,
 * headers, body, and other request configuration options. Instances should be
 * assumed to be immutable. To modify a {@link HttpRequest}, the {@link HttpRequest#clone}
 * method should be used.
 *
 * @experimental
 */
export class HttpRequest<T> {
  /**
   * The request body, or `null` if one isn't set.
   *
   * Bodies are not enforced to be immutable, as they can include a reference to any
   * user-defined data type. However, interceptors should take care to preserve
   * idempotence by treating them as such.
   */
  readonly body: T|null = null;

  /**
   * Outgoing headers for this request.
   */
  readonly headers: HttpHeaders;

  /**
   * Whether this request should be made in a way that exposes progress events.
   *
   * Progress events are expensive (change detection runs on each event) and so
   * they should only be requested if the consumer intends to monitor them.
   */
  readonly reportProgress: boolean = false;

  /**
   * Whether this request should be sent with outgoing credentials (cookies).
   */
  readonly withCredentials: boolean = false;

  /**
   * The expected response type of the server.
   *
   * This is used to parse the response appropriately before returning it to
   * the requestee.
   */
  readonly responseType: HttpResponseType = 'json';

  /**
   * The outgoing HTTP request method.
   */
  readonly method: string;

  constructor(url: string);
  constructor(url: string, method: HttpNoBodyMethod, init?: HttpRequestInit);
  constructor(url: string, method: HttpBodyMethod, body: T|null, init?: HttpRequestInit);
  constructor(url: string, method: HttpMethod|string, body: T|null, init?: HttpRequestInit);
  constructor(
      public readonly url: string, method?: string, third?: T|HttpRequestInit|null,
      fourth?: HttpRequestInit) {
    // Assume GET unless otherwise specified, and normalize the request method.
    this.method = (method || 'GET').toUpperCase();
    // Next, need to figure out which argument holds the HttpRequestInit
    // options, if any.
    let options: HttpRequestInit|undefined;

    // Check whether a body argument is expected. The only valid way to omit
    // the body argument is to use a known no-body method like GET.
    if (mightHaveBody(this.method) || !!fourth) {
      // Body is the third argument, options are the fourth.
      this.body = third as T || null;
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

      // Override default response type of 'json' if one is provided.
      if (!!options.responseType) {
        this.responseType = options.responseType;
      }

      // Override headers if they're provided.
      if (!!options.headers) {
        this.headers = options.headers;
      }
    }

    // If no headers have been passed in, construct a new HttpHeaders instance.
    if (!this.headers) {
      this.headers = new HttpHeaders();
    }

    // In any case, seal the headers so no changes are allowed.
    this.headers.seal();
  }

  /**
   * Transform the free-form body into a serialized format suitable for
   * transmission to the server.
   */
  serializeBody(): HttpSerializedBody|null {
    // If no body is present, no need to serialize it.
    if (this.body === null) {
      return null;
    }
    // Check whether the body is already in a serialized form. If so,
    // it can just be returned directly.
    if (isArrayBuffer(this.body) || isBlob(this.body) || isFormData(this.body) ||
        typeof this.body === 'string') {
      return this.body;
    }
    // Check whether the body is an object or array, and serialize with JSON if so.
    if (typeof this.body === 'object' || typeof this.body === 'boolean' ||
        Array.isArray(this.body)) {
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
  detectContentTypeHeader(): string|null {
    // An empty body has no content type.
    if (this.body === null) {
      return null;
    }
    // FormData instances are URL encoded on the wire.
    if (isFormData(this.body)) {
      return 'application/x-www-form-urlencoded;charset=UTF-8';
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
      return 'text/plain';
    }
    // Arrays, objects, and numbers will be encoded as JSON.
    if (typeof this.body === 'object' || typeof this.body === 'number' ||
        Array.isArray(this.body)) {
      return 'application/json';
    }
    // No type could be inferred.
    return null;
  }

  clone(): HttpRequest<T>;
  clone(update: HttpRequestInit): HttpRequest<T>;
  clone<V>(update: HttpRequestClone<V>): HttpRequest<V>;
  clone(update: HttpRequestClone<any> = {}): HttpRequest<any> {
    // For method, url, and responseType, take the current value unless
    // it is overridden in the update hash.
    const method = update.method || this.method;
    const url = update.url || this.url;
    const responseType = update.responseType || this.responseType;

    // The body is somewhat special - a `null` value in update.body means
    // whatever current body is present is being overridden with an empty
    // body, whereas an `undefined` value in update.body implies no
    // override.
    const body = (update.body !== undefined) ? update.body : this.body;

    // Carefully handle the boolean options to differentiate between
    // `false` and `undefined` in the update args.
    const withCredentials =
        (update.withCredentials !== undefined) ? update.withCredentials : this.withCredentials;
    const reportProgress =
        (update.reportProgress !== undefined) ? update.reportProgress : this.reportProgress;

    // Headers may need to be cloned later if they're sealed, but being
    // appended to.
    let headers = update.headers || this.headers;

    // Check whether the caller has asked to add headers.
    if (update.setHeaders !== undefined) {
      // Adding extra headers. If the current headers are sealed, they need to
      // be cloned to unseal them first.
      if (headers.sealed) {
        headers = headers.clone();
      }

      // Set every requested header.
      Object.keys(update.setHeaders)
          .forEach(header => headers.set(header, update.setHeaders ![header]));
    }

    // Finally, construct the new HttpRequest using the pieces from above.
    return new HttpRequest(
        url, method, body, {
                               headers, reportProgress, responseType, withCredentials,
                           });
  }
}
