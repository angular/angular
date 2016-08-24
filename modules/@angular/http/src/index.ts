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

import {BrowserJsonp} from './backends/browser_jsonp';
import {BrowserXhr} from './backends/browser_xhr';
import {JSONPBackend, JSONPBackend_, JSONPConnection} from './backends/jsonp_backend';
import {CookieXSRFStrategy, XHRBackend, XHRConnection} from './backends/xhr_backend';
import {BaseRequestOptions, RequestOptions} from './base_request_options';
import {BaseResponseOptions, ResponseOptions} from './base_response_options';
import {Http, Jsonp} from './http';
import {ConnectionBackend, XSRFStrategy} from './interfaces';

export {BrowserXhr} from './backends/browser_xhr';
export {JSONPBackend, JSONPConnection} from './backends/jsonp_backend';
export {CookieXSRFStrategy, XHRBackend, XHRConnection} from './backends/xhr_backend';
export {BaseRequestOptions, RequestOptions} from './base_request_options';
export {BaseResponseOptions, ResponseOptions} from './base_response_options';
export {ReadyState, RequestMethod, ResponseContentType, ResponseType} from './enums';
export {Headers} from './headers';
export {Http, Jsonp} from './http';
export {Connection, ConnectionBackend, RequestOptionsArgs, ResponseOptionsArgs, XSRFStrategy} from './interfaces';
export {Request} from './static_request';
export {Response} from './static_response';
export {QueryEncoder, URLSearchParams} from './url_search_params';

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
@NgModule({
  // TODO(alxhub): switch back to HTTP_PROVIDERS when the metadata collector can inline it
  providers: [
    // TODO(pascal): use factory type annotations once supported in DI
    // issue: https://github.com/angular/angular/issues/3183
    {provide: Http, useFactory: httpFactory, deps: [XHRBackend, RequestOptions]},
    BrowserXhr,
    {provide: RequestOptions, useClass: BaseRequestOptions},
    {provide: ResponseOptions, useClass: BaseResponseOptions},
    XHRBackend,
    {provide: XSRFStrategy, useFactory: _createDefaultCookieXSRFStrategy},
  ],
})
export class HttpModule {
}

/**
 * The module that includes jsonp's providers
 *
 * @experimental
 */
@NgModule({
  // TODO(alxhub): switch back to JSONP_PROVIDERS when the metadata collector can inline it
  providers: [
    // TODO(pascal): use factory type annotations once supported in DI
    // issue: https://github.com/angular/angular/issues/3183
    {provide: Jsonp, useFactory: jsonpFactory, deps: [JSONPBackend, RequestOptions]},
    BrowserJsonp,
    {provide: RequestOptions, useClass: BaseRequestOptions},
    {provide: ResponseOptions, useClass: BaseResponseOptions},
    {provide: JSONPBackend, useClass: JSONPBackend_},
  ],
})
export class JsonpModule {
}
