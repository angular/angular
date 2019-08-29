/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {stringToArrayBuffer} from './http_utils';
import {URLSearchParams} from './url_search_params';


/**
 * HTTP request body used by both {@link Request} and {@link Response}
 * https://fetch.spec.whatwg.org/#body
 */
export abstract class Body {
  /**
   * @internal
   */
  protected _body: any;

  /**
   * Attempts to return body as parsed `JSON` object, or raises an exception.
   */
  json(): any {
    if (typeof this._body === 'string') {
      return JSON.parse(<string>this._body);
    }

    if (this._body instanceof ArrayBuffer) {
      return JSON.parse(this.text());
    }

    return this._body;
  }

  /**
   * Returns the body as a string, presuming `toString()` can be called on the response body.
   *
   * When decoding an `ArrayBuffer`, the optional `encodingHint` parameter determines how the
   * bytes in the buffer will be interpreted. Valid values are:
   *
   * - `legacy` - incorrectly interpret the bytes as UTF-16 (technically, UCS-2). Only characters
   *   in the Basic Multilingual Plane are supported, surrogate pairs are not handled correctly.
   *   In addition, the endianness of the 16-bit octet pairs in the `ArrayBuffer` is not taken
   *   into consideration. This is the default behavior to avoid breaking apps, but should be
   *   considered deprecated.
   *
   * - `iso-8859` - interpret the bytes as ISO-8859 (which can be used for ASCII encoded text).
   */
  text(encodingHint: 'legacy'|'iso-8859' = 'legacy'): string {
    if (this._body instanceof URLSearchParams) {
      return this._body.toString();
    }

    if (this._body instanceof ArrayBuffer) {
      switch (encodingHint) {
        case 'legacy':
          return String.fromCharCode.apply(null, new Uint16Array(this._body as ArrayBuffer));
        case 'iso-8859':
          return String.fromCharCode.apply(null, new Uint8Array(this._body as ArrayBuffer));
        default:
          throw new Error(`Invalid value for encodingHint: ${encodingHint}`);
      }
    }

    if (this._body == null) {
      return '';
    }

    if (typeof this._body === 'object') {
      return JSON.stringify(this._body, null, 2);
    }

    return this._body.toString();
  }

  /**
   * Return the body as an ArrayBuffer
   */
  arrayBuffer(): ArrayBuffer {
    if (this._body instanceof ArrayBuffer) {
      return <ArrayBuffer>this._body;
    }

    return stringToArrayBuffer(this.text());
  }

  /**
    * Returns the request's body as a Blob, assuming that body exists.
    */
  blob(): Blob {
    if (this._body instanceof Blob) {
      return <Blob>this._body;
    }

    if (this._body instanceof ArrayBuffer) {
      return new Blob([this._body]);
    }

    throw new Error('The request body isn\'t either a blob or an array buffer');
  }
}
