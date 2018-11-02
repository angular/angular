/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReadyState, RequestMethod, ResponseContentType, ResponseType} from './enums';
import {Headers} from './headers';
import {Request} from './static_request';
import {URLSearchParams} from './url_search_params';

/**
 * Abstract class from which real backends are derived.
 *
 * The primary purpose of a `ConnectionBackend` is to create new connections to fulfill a given
 * {@link Request}.
 *
 * @deprecated see https://angular.io/guide/http
 * @publicApi
 */
export abstract class ConnectionBackend { abstract createConnection(request: any): Connection; }

/**
 * Abstract class from which real connections are derived.
 *
 * @deprecated see https://angular.io/guide/http
 * @publicApi
 */
export abstract class Connection {
  // TODO(issue/24571): remove '!'.
  readyState !: ReadyState;
  // TODO(issue/24571): remove '!'.
  request !: Request;
  response: any;  // TODO: generic of <Response>;
}

/**
 * An XSRFStrategy configures XSRF protection (e.g. via headers) on an HTTP request.
 *
 * @deprecated see https://angular.io/guide/http
 * @publicApi
 */
export abstract class XSRFStrategy { abstract configureRequest(req: Request): void; }

/**
 * Interface for options to construct a RequestOptions, based on
 * [RequestInit](https://fetch.spec.whatwg.org/#requestinit) from the Fetch spec.
 *
 * @deprecated see https://angular.io/guide/http
 * @publicApi
 */
export interface RequestOptionsArgs {
  url?: string|null;
  method?: string|RequestMethod|null;
  /** @deprecated from 4.0.0. Use params instead. */
  search?: string|URLSearchParams|{[key: string]: any | any[]}|null;
  params?: string|URLSearchParams|{[key: string]: any | any[]}|null;
  headers?: Headers|null;
  body?: any;
  withCredentials?: boolean|null;
  responseType?: ResponseContentType|null;
}

/**
 * Required structure when constructing new Request();
 */
export interface RequestArgs extends RequestOptionsArgs { url: string|null; }

/**
 * Interface for options to construct a Response, based on
 * [ResponseInit](https://fetch.spec.whatwg.org/#responseinit) from the Fetch spec.
 *
 * @deprecated see https://angular.io/guide/http
 * @publicApi
 */
export interface ResponseOptionsArgs {
  body?: string|Object|FormData|ArrayBuffer|Blob|null;
  status?: number|null;
  statusText?: string|null;
  headers?: Headers|null;
  type?: ResponseType|null;
  url?: string|null;
}
