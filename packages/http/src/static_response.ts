/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */



import {ResponseOptions} from './base_response_options';
import {Body} from './body';
import {ResponseType} from './enums';
import {Headers} from './headers';


/**
 * Creates `Response` instances from provided values.
 *
 * Though this object isn't
 * usually instantiated by end-users, it is the primary object interacted with when it comes time to
 * add data to a view.
 *
 * ### Example
 *
 * ```
 * http.request('my-friends.txt').subscribe(response => this.friends = response.text());
 * ```
 *
 * The Response's interface is inspired by the Response constructor defined in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#response-class), but is considered a static value whose body
 * can be accessed many times. There are other differences in the implementation, but this is the
 * most significant.
 *
 * @experimental
 */
export class Response extends Body {
  /**
   * One of "basic", "cors", "default", "error", or "opaque".
   *
   * Defaults to "default".
   */
  type: ResponseType;
  /**
   * True if the response's status is within 200-299
   */
  ok: boolean;
  /**
   * URL of response.
   *
   * Defaults to empty string.
   */
  url: string;
  /**
   * Status code returned by server.
   *
   * Defaults to 200.
   */
  status: number;
  /**
   * Text representing the corresponding reason phrase to the `status`, as defined in [ietf rfc 2616
   * section 6.1.1](https://tools.ietf.org/html/rfc2616#section-6.1.1)
   *
   * Defaults to "OK"
   */
  statusText: string|null;
  /**
   * Non-standard property
   *
   * Denotes how many of the response body's bytes have been loaded, for example if the response is
   * the result of a progress event.
   */
  bytesLoaded: number;
  /**
   * Non-standard property
   *
   * Denotes how many bytes are expected in the final response body.
   */
  totalBytes: number;
  /**
   * Headers object based on the `Headers` class in the [Fetch
   * Spec](https://fetch.spec.whatwg.org/#headers-class).
   */
  headers: Headers|null;

  constructor(responseOptions: ResponseOptions) {
    super();
    this._body = responseOptions.body;
    this.status = responseOptions.status !;
    this.ok = (this.status >= 200 && this.status <= 299);
    this.statusText = responseOptions.statusText;
    this.headers = responseOptions.headers;
    this.type = responseOptions.type !;
    this.url = responseOptions.url !;
  }

  toString(): string {
    return `Response with status: ${this.status} ${this.statusText} for URL: ${this.url}`;
  }
}
