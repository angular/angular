/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Body} from './body';
import {ContentType, RequestMethod, ResponseContentType} from './enums';
import {Headers} from './headers';
import {normalizeMethodName} from './http_utils';
import {RequestArgs} from './interfaces';
import {URLSearchParams} from './url_search_params';


// TODO(jeffbcross): properly implement body accessors
/**
 * Creates `Request` instances from provided values.
 *
 * The Request's interface is inspired by the Request constructor defined in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#request-class),
 * but is considered a static value whose body can be accessed many times. There are other
 * differences in the implementation, but this is the most significant.
 *
 * `Request` instances are typically created by higher-level classes, like {@link Http} and
 * {@link Jsonp}, but it may occasionally be useful to explicitly create `Request` instances.
 * One such example is when creating services that wrap higher-level services, like {@link Http},
 * where it may be useful to generate a `Request` with arbitrary headers and search params.
 *
 * ```typescript
 * import {Injectable, Injector} from '@angular/core';
 * import {HTTP_PROVIDERS, Http, Request, RequestMethod} from '@angular/http';
 *
 * @Injectable()
 * class AutoAuthenticator {
 *   constructor(public http:Http) {}
 *   request(url:string) {
 *     return this.http.request(new Request({
 *       method: RequestMethod.Get,
 *       url: url,
 *       search: 'password=123'
 *     }));
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([HTTP_PROVIDERS, AutoAuthenticator]);
 * var authenticator = injector.get(AutoAuthenticator);
 * authenticator.request('people.json').subscribe(res => {
 *   //URL should have included '?password=123'
 *   console.log('people', res.json());
 * });
 * ```
 *
 * @experimental
 */
export class Request extends Body {
  /**
   * Http method with which to perform the request.
   */
  method: RequestMethod;
  /**
   * {@link Headers} instance
   */
  headers: Headers;
  /** Url of the remote resource */
  url: string;
  /** Type of the request body **/
  private contentType: ContentType;
  /** Enable use credentials */
  withCredentials: boolean;
  /** Buffer to store the response */
  responseType: ResponseContentType;
  constructor(requestOptions: RequestArgs) {
    super();
    // TODO: assert that url is present
    const url = requestOptions.url;
    this.url = requestOptions.url !;
    const paramsArg = requestOptions.params || requestOptions.search;
    if (paramsArg) {
      let params: string;
      if (typeof paramsArg === 'object' && !(paramsArg instanceof URLSearchParams)) {
        params = urlEncodeParams(paramsArg).toString();
      } else {
        params = paramsArg.toString();
      }
      if (params.length > 0) {
        let prefix = '?';
        if (this.url.indexOf('?') != -1) {
          prefix = (this.url[this.url.length - 1] == '&') ? '' : '&';
        }
        // TODO: just delete search-query-looking string in url?
        this.url = url + prefix + params;
      }
    }
    this._body = requestOptions.body;
    this.method = normalizeMethodName(requestOptions.method !);
    // TODO(jeffbcross): implement behavior
    // Defaults to 'omit', consistent with browser
    this.headers = new Headers(requestOptions.headers);
    this.contentType = this.detectContentType();
    this.withCredentials = requestOptions.withCredentials !;
    this.responseType = requestOptions.responseType !;
  }

  /**
   * Returns the content type enum based on header options.
   */
  detectContentType(): ContentType {
    switch (this.headers.get('content-type')) {
      case 'application/json':
        return ContentType.JSON;
      case 'application/x-www-form-urlencoded':
        return ContentType.FORM;
      case 'multipart/form-data':
        return ContentType.FORM_DATA;
      case 'text/plain':
      case 'text/html':
        return ContentType.TEXT;
      case 'application/octet-stream':
        return this._body instanceof ArrayBuffer ? ContentType.ARRAY_BUFFER : ContentType.BLOB;
      default:
        return this.detectContentTypeFromBody();
    }
  }

  /**
   * Returns the content type of request's body based on its type.
   */
  detectContentTypeFromBody(): ContentType {
    if (this._body == null) {
      return ContentType.NONE;
    } else if (this._body instanceof URLSearchParams) {
      return ContentType.FORM;
    } else if (this._body instanceof FormData) {
      return ContentType.FORM_DATA;
    } else if (this._body instanceof Blob) {
      return ContentType.BLOB;
    } else if (this._body instanceof ArrayBuffer) {
      return ContentType.ARRAY_BUFFER;
    } else if (this._body && typeof this._body === 'object') {
      return ContentType.JSON;
    } else {
      return ContentType.TEXT;
    }
  }

  /**
   * Returns the request's body according to its type. If body is undefined, return
   * null.
   */
  getBody(): any {
    switch (this.contentType) {
      case ContentType.JSON:
        return this.text();
      case ContentType.FORM:
        return this.text();
      case ContentType.FORM_DATA:
        return this._body;
      case ContentType.TEXT:
        return this.text();
      case ContentType.BLOB:
        return this.blob();
      case ContentType.ARRAY_BUFFER:
        return this.arrayBuffer();
      default:
        return null;
    }
  }
}

function urlEncodeParams(params: {[key: string]: any}): URLSearchParams {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value && Array.isArray(value)) {
      value.forEach(element => searchParams.append(key, element.toString()));
    } else {
      searchParams.append(key, value.toString());
    }
  });
  return searchParams;
}

const noop = function() {};
const w = typeof window == 'object' ? window : noop;
const FormData = (w as any /** TODO #9100 */)['FormData'] || noop;
const Blob = (w as any /** TODO #9100 */)['Blob'] || noop;
export const ArrayBuffer: ArrayBufferConstructor =
    (w as any /** TODO #9100 */)['ArrayBuffer'] || noop;
