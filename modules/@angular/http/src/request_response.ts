/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpHeaders} from './headers';
import {ArrayBuffer, Blob, FormData, URLSearchParams} from './scope';
import {HttpUrlParams} from './url_params';

/**
 * Possible types for the body of an outgoing {@link HttpRequest} or incoming {@link HttpResponse}.
 */
export type HttpBody = ArrayBuffer | Blob | FormData | Object | HttpUrlParams | number | string;

/**
 * Manipulates a synchronous `HttpBody`, like that on an outgoing request.
 */
export class HttpSyncBody {
  /**
   * Direct access to the `HttpBody`.
   */
  body: HttpBody;

  /**
   * Attempts to return body as parsed `JSON` object, or raises an exception.
   */
  json(): any {
    if (typeof this.body === 'string') {
      return JSON.parse(<string>this.body);
    }

    if (this.body instanceof ArrayBuffer) {
      return JSON.parse(this.text());
    }

    return this.body;
  }

  /**
   * Returns the body as a string, presuming `toString()` can be called on the response body.
   */
  text(): string {
    if (this.body instanceof ArrayBuffer) {
      return String.fromCharCode.apply(null, new Uint16Array(<ArrayBuffer>this.body));
    }

    if (this.body == null) {
      return '';
    }

    if (this.body instanceof HttpUrlParams || this.body instanceof URLSearchParams ||
        this.body instanceof Blob) {
      return this.body.toString();
    }

    if (typeof this.body === 'object') {
      return JSON.stringify(this.body);
    }

    return this.body.toString();
  }

  /**
   * Return the body as an ArrayBuffer
   */
  arrayBuffer(): ArrayBuffer {
    if (this.body instanceof ArrayBuffer) {
      return <ArrayBuffer>this.body;
    }

    return stringToArrayBuffer(this.text());
  }

  /**
    * Returns the request's body as a Blob, assuming that body exists.
    */
  blob(): Blob {
    if (this.body instanceof Blob) {
      return <Blob>this.body;
    }

    if (this.body instanceof ArrayBuffer) {
      return new Blob([this.body]);
    }

    throw new Error('The request body isn\'t either a blob or an array buffer');
  }
}

/**
 * Manipulates an `HttpBody` asynchronously, like that on an incoming response.
 */
export class HttpAsyncBody {
  protected syncBody = new HttpSyncBody();

  /**
   * Attempts to return body as parsed `JSON` object, or raises an exception.
   */
  json(): Promise<any> { return Promise.resolve(this.syncBody.json()); }

  /**
   * Returns the body as a string, presuming `toString()` can be called on the response body.
   */
  text(): Promise<string> { return Promise.resolve(this.syncBody.text()); }

  /**
   * Return the body as an ArrayBuffer
   */
  arrayBuffer(): Promise<ArrayBuffer> { return Promise.resolve(this.syncBody.arrayBuffer()); }

  /**
    * Returns the request's body as a Blob, assuming that body exists.
    */
  blob(): Promise<Blob> { return Promise.resolve(this.syncBody.blob()); }
}

/**
 * HTTP method verb that captures the well known verbs as well as allows custom ones.
 */
export type HttpMethod = 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT' | string;

/**
 * A hint for an {@link HttpRequest} that the response will be of a particular type and should
 * be parsed as such.
 */
export type HttpResponseTypeHint = 'arraybuffer' | 'blob' | 'json' | 'text' | 'unknown';

/**
 * Initializes a {@link HttpRequest}
 */
export interface HttpRequestInit {
  /**
   * Set the headers to be sent with this request.
   */
  headers?: HttpHeaders;

  /**
   * Set whether credentials will be sent with this request (defaults to `false`)
   */
  withCredentials?: boolean;

  /**
   * Set the body to be sent with this request.
   */
  body?: HttpBody;

  /**
   * Set the method of this request (defaults to `GET`).
   */
  method?: HttpMethod;

  /**
   * Hint to Angular that the response body will be of a particular type.
   */
  responseTypeHint?: HttpResponseTypeHint;
}

/**
 * An outgoing HTTP request.
 */
export class HttpRequest extends HttpSyncBody {
  /**
   * Request headers that will be sent with the outgoing request.
   */
  headers: HttpHeaders;

  /**
   * The HTTP method verb to be used.
   */
  method: HttpMethod = 'GET';

  /**
   * Whether credentials will be sent with the request.
   */
  withCredentials: boolean = false;

  /**
   * A hint about the type of response which is expected.
   */
  responseTypeHint: HttpResponseTypeHint = 'unknown';

  /**
   * URL of the outgoing request.
   */
  url: string;

  constructor(url: string, init?: HttpRequestInit) {
    super();
    this.url = url;

    if (!init) {
      this.headers = new HttpHeaders();
      return;
    }
    if (init.method) {
      this.method = init.method.toUpperCase();
    }
    if (init.headers) {
      this.headers = init.headers;
    } else {
      this.headers = new HttpHeaders();
    }
    this.body = init.body !== undefined ? init.body : null;
    this.withCredentials = !!init.withCredentials;
    this.responseTypeHint = init.responseTypeHint !== undefined ? init.responseTypeHint : null;
  }

  /**
   * Copies a {@link HttpRequest} (but may not clone the body depending on its type).
   */
  clone(): HttpRequest {
    return new HttpRequest(this.url, {
      headers: new HttpHeaders(this.headers),
      method: this.method,
      withCredentials: this.withCredentials,
      body: this.body
    });
  }
}

/**
 * @deprecated use HttpRequest instead.
 */
export type Request = HttpRequest;

/**
 * Initializes a {@link HttpResponse}.
 */
export interface HttpResponseInit {
  headers?: HttpHeaders;
  url?: string;
  status?: number;
  statusText?: string;
  body?: HttpBody;
}

/**
 * Represents an HTTP response received from the network.
 */
export class HttpResponse extends HttpAsyncBody {
  /**
   * The URL that produced this response (provided on a best effort basis).
   */
  url: string;

  /**
   * HTTP status code of the response.
   */
  status: number;

  /**
   * HTTP status text of the response.
   */
  statusText: string;

  /**
   * HTTP response headers from the server.
   */
  headers: HttpHeaders;

  constructor(init?: HttpResponseInit) {
    super();
    this.url = init.url;
    this.status = init.status !== undefined ? init.status : 200;
    this.statusText = init.statusText !== undefined ? init.statusText : 'OK';
    this.headers = init.headers || new HttpHeaders();
    this.syncBody.body = init.body;
  }

  /**
   * Whether the response is a successful response (status code 2XX).
   */
  get ok(): boolean { return this.status >= 200 && this.status < 300; }
}

/**
 * @deprecated use HttpResponse intead.
 */
export type Response = HttpResponse;

function stringToArrayBuffer(input: String): ArrayBuffer {
  const view = new Uint16Array(input.length);
  for (let i = 0, strLen = input.length; i < strLen; i++) {
    view[i] = input.charCodeAt(i);
  }
  return view.buffer;
}
