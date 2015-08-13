/**
 * @module
 * @description
 * The http module provides services to perform http requests. To get started, see the {@link Http}
 * class.
 */
import {bind, Binding} from 'angular2/di';
import {Http, Jsonp} from 'http/src/http';
import {XHRBackend, XHRConnection} from 'http/src/backends/xhr_backend';
import {JSONPBackend, JSONPConnection} from 'http/src/backends/jsonp_backend';
import {BrowserXhr} from 'http/src/backends/browser_xhr';
import {BrowserJsonp} from 'http/src/backends/browser_jsonp';
import {BaseRequestOptions, RequestOptions} from 'http/src/base_request_options';
import {ConnectionBackend} from 'http/src/interfaces';
import {BaseResponseOptions, ResponseOptions} from 'http/src/base_response_options';

export {MockConnection, MockBackend} from 'http/src/backends/mock_backend';
export {Request} from 'http/src/static_request';
export {Response} from 'http/src/static_response';

export {
  RequestOptionsArgs,
  ResponseOptionsArgs,
  Connection,
  ConnectionBackend
} from 'http/src/interfaces';

export {BrowserXhr} from 'http/src/backends/browser_xhr';
export {BaseRequestOptions, RequestOptions} from 'http/src/base_request_options';
export {BaseResponseOptions, ResponseOptions} from 'http/src/base_response_options';
export {XHRBackend, XHRConnection} from 'http/src/backends/xhr_backend';
export {JSONPBackend, JSONPConnection} from 'http/src/backends/jsonp_backend';
export {Http, Jsonp} from 'http/src/http';

export {Headers} from 'http/src/headers';

export {
  ResponseTypes,
  ReadyStates,
  RequestMethods,
  RequestCredentialsOpts,
  RequestCacheOpts,
  RequestModesOpts
} from 'http/src/enums';
export {URLSearchParams} from 'http/src/url_search_params';

/**
 * Provides a basic set of injectables to use the {@link Http} service in any application.
 *
 * #Example
 *
 * ```
 * import {HTTP_BINDINGS, Http} from 'http/http';
 * @Component({selector: 'http-app', viewBindings: [HTTP_BINDINGS]})
 * @View({template: '{{data}}'})
 * class MyApp {
 *   constructor(http:Http) {
 *     http.request('data.txt').subscribe(res => this.data = res.text());
 *   }
 * }
 * ```
 *
 */
export const HTTP_BINDINGS: List<any> = [
  bind(ConnectionBackend)
      .toClass(XHRBackend),
  BrowserXhr,
  bind(RequestOptions).toClass(BaseRequestOptions),
  bind(ResponseOptions).toClass(BaseResponseOptions),
  Http
];

export const JSONP_BINDINGS: List<any> = [
  bind(ConnectionBackend)
      .toClass(JSONPBackend),
  BrowserJsonp,
  bind(RequestOptions).toClass(BaseRequestOptions),
  bind(ResponseOptions).toClass(BaseResponseOptions),
  Jsonp
];
