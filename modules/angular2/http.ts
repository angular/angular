/**
 * @module
 * @description
 * The http module provides services to perform http requests. To get started, see the {@link Http}
 * class.
 */
import {bind, Binding} from 'angular2/di';
import {Http, Jsonp} from './src/http';
import {XHRBackend, XHRConnection} from './src/backends/xhr_backend';
import {JSONPBackend, JSONPConnection} from './src/backends/jsonp_backend';
import {BrowserXhr} from './src/backends/browser_xhr';
import {BrowserJsonp} from './src/backends/browser_jsonp';
import {BaseRequestOptions, RequestOptions} from './src/base_request_options';
import {ConnectionBackend} from './src/interfaces';
import {BaseResponseOptions, ResponseOptions} from './src/base_response_options';

export {MockConnection, MockBackend} from './src/backends/mock_backend';
export {Request} from './src/static_request';
export {Response} from './src/static_response';

export {
  RequestOptionsArgs,
  ResponseOptionsArgs,
  Connection,
  ConnectionBackend
} from './src/interfaces';

export {BrowserXhr} from './src/backends/browser_xhr';
export {BaseRequestOptions, RequestOptions} from './src/base_request_options';
export {BaseResponseOptions, ResponseOptions} from './src/base_response_options';
export {XHRBackend, XHRConnection} from './src/backends/xhr_backend';
export {JSONPBackend, JSONPConnection} from './src/backends/jsonp_backend';
export {Http, Jsonp} from './src/http';

export {Headers} from './src/headers';

export {
  ResponseTypes,
  ReadyStates,
  RequestMethods,
  RequestCredentialsOpts,
  RequestCacheOpts,
  RequestModesOpts
} from './src/http/enums';
export {URLSearchParams} from './src/http/url_search_params';
export {EventEmitter, Observable} from './src/core/facade/async';

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
  // TODO(pascal): use factory type annotations once supported in DI
  // issue: https://github.com/angular/angular/issues/3183
  bind(Http)
      .toFactory((xhrBackend, requestOptions) => { return new Http(xhrBackend, requestOptions);},
                 [XHRBackend, RequestOptions]),
  BrowserXhr,
  bind(RequestOptions).toClass(BaseRequestOptions),
  bind(ResponseOptions).toClass(BaseResponseOptions),
  XHRBackend
];

export const JSONP_BINDINGS: List<any> = [
  // TODO(pascal): use factory type annotations once supported in DI
  // issue: https://github.com/angular/angular/issues/3183
  bind(Jsonp)
      .toFactory(
          (jsonpBackend, requestOptions) => { return new Jsonp(jsonpBackend, requestOptions);},
          [JSONPBackend, RequestOptions]),
  BrowserJsonp,
  bind(RequestOptions).toClass(BaseRequestOptions),
  bind(ResponseOptions).toClass(BaseResponseOptions),
  JSONPBackend
];
