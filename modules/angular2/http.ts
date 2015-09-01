/**
 * @module
 * @description
 * The http module provides services to perform http requests. To get started, see the {@link Http}
 * class.
 */
import {bind, Binding} from 'angular2/di';
import {Http, Jsonp} from './src/http/http';
import {XHRBackend, XHRConnection} from './src/http/backends/xhr_backend';
import {JSONPBackend, JSONPConnection} from './src/http/backends/jsonp_backend';
import {BrowserXhr} from './src/http/backends/browser_xhr';
import {BrowserJsonp} from './src/http/backends/browser_jsonp';
import {BaseRequestOptions, RequestOptions} from './src/http/base_request_options';
import {ConnectionBackend} from './src/http/interfaces';
import {BaseResponseOptions, ResponseOptions} from './src/http/base_response_options';

export {MockConnection, MockBackend} from './src/http/backends/mock_backend';
export {Request} from './src/http/static_request';
export {Response} from './src/http/static_response';

export {
  RequestOptionsArgs,
  ResponseOptionsArgs,
  Connection,
  ConnectionBackend
} from './src/http/interfaces';

export {BrowserXhr} from './src/http/backends/browser_xhr';
export {BaseRequestOptions, RequestOptions} from './src/http/base_request_options';
export {BaseResponseOptions, ResponseOptions} from './src/http/base_response_options';
export {XHRBackend, XHRConnection} from './src/http/backends/xhr_backend';
export {JSONPBackend, JSONPConnection} from './src/http/backends/jsonp_backend';
export {Http, Jsonp} from './src/http/http';

export {Headers} from './src/http/headers';

export {
  ResponseTypes,
  ReadyStates,
  RequestMethods,
  RequestCredentialsOpts,
  RequestCacheOpts,
  RequestModesOpts
} from './src/http/enums';
export {URLSearchParams} from './src/http/url_search_params';

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
export const HTTP_BINDINGS: any[] = [
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

export const JSONP_BINDINGS: any[] = [
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
