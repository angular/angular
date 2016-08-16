/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * The http module provides services to perform http requests. To get started, see the {@link Http}
 * class.
 */
import {NgModule} from '@angular/core';

import {BrowserJsonp} from './src/backends/browser_jsonp';
import {BrowserXhr} from './src/backends/browser_xhr';
import {JSONPBackend, JSONPBackend_, JSONPConnection} from './src/backends/jsonp_backend';
import {CookieXSRFStrategy, XHRBackend, XHRConnection} from './src/backends/xhr_backend';
import {BaseRequestOptions, RequestOptions} from './src/base_request_options';
import {BaseResponseOptions, ResponseOptions} from './src/base_response_options';
import {Http, Jsonp} from './src/http';
import {ConnectionBackend, XSRFStrategy} from './src/interfaces';

export {BrowserXhr} from './src/backends/browser_xhr';
export {JSONPBackend, JSONPConnection} from './src/backends/jsonp_backend';
export {CookieXSRFStrategy, XHRBackend, XHRConnection} from './src/backends/xhr_backend';
export {BaseRequestOptions, RequestOptions} from './src/base_request_options';
export {BaseResponseOptions, ResponseOptions} from './src/base_response_options';
export {ReadyState, RequestMethod, ResponseContentType, ResponseType} from './src/enums';
export {Headers} from './src/headers';
export {Http, Jsonp} from './src/http';
export {Connection, ConnectionBackend, RequestOptionsArgs, ResponseOptionsArgs, XSRFStrategy} from './src/interfaces';
export {Request} from './src/static_request';
export {Response} from './src/static_response';
export {QueryEncoder, URLSearchParams} from './src/url_search_params';

const HTTP_PROVIDERS: any[] = [
  // TODO(pascal): use factory type annotations once supported in DI
  // issue: https://github.com/angular/angular/issues/3183
  {provide: Http, useFactory: httpFactory, deps: [XHRBackend, RequestOptions]},
  BrowserXhr,
  {provide: RequestOptions, useClass: BaseRequestOptions},
  {provide: ResponseOptions, useClass: BaseResponseOptions},
  XHRBackend,
  {provide: XSRFStrategy, useFactory: _createDefaultCookieXSRFStrategy},
];

/**
 * @experimental
 */
export function _createDefaultCookieXSRFStrategy() {
  return new CookieXSRFStrategy();
}

/**
 * @experimental
 */
export function httpFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions): Http {
  return new Http(xhrBackend, requestOptions);
}

const JSONP_PROVIDERS: any[] = [
  // TODO(pascal): use factory type annotations once supported in DI
  // issue: https://github.com/angular/angular/issues/3183
  {provide: Jsonp, useFactory: jsonpFactory, deps: [JSONPBackend, RequestOptions]},
  BrowserJsonp,
  {provide: RequestOptions, useClass: BaseRequestOptions},
  {provide: ResponseOptions, useClass: BaseResponseOptions},
  {provide: JSONPBackend, useClass: JSONPBackend_},
];

/**
 * @experimental
 */
export function jsonpFactory(jsonpBackend: JSONPBackend, requestOptions: RequestOptions): Jsonp {
  return new Jsonp(jsonpBackend, requestOptions);
}


/**
 * The module that includes http's providers
 *
 * @experimental
 */
@NgModule({providers: HTTP_PROVIDERS})
export class HttpModule {
}

/**
 * The module that includes jsonp's providers
 *
 * @experimental
 */
@NgModule({providers: JSONP_PROVIDERS})
export class JsonpModule {
}
