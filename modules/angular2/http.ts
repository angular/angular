/**
 * @module
 * @public
 * @description
 * The http module provides services to perform http requests. To get started, see the {@link Http}
 * class.
 */
import {bind, Binding} from 'angular2/di';
import {Http, HttpFactory} from './src/http/http';
import {XHRBackend, XHRConnection} from 'angular2/src/http/backends/xhr_backend';
import {BrowserXHR} from 'angular2/src/http/backends/browser_xhr';
import {BaseRequestOptions, RequestOptions} from 'angular2/src/http/base_request_options';
import {ConnectionBackend} from 'angular2/src/http/interfaces';

export {MockConnection, MockBackend} from 'angular2/src/http/backends/mock_backend';
export {Request} from 'angular2/src/http/static_request';
export {Response} from 'angular2/src/http/static_response';

export {
  IHttp,
  IRequestOptions,
  IResponse,
  Connection,
  ConnectionBackend
} from 'angular2/src/http/interfaces';

export {BaseRequestOptions, RequestOptions} from 'angular2/src/http/base_request_options';
export {XHRBackend, XHRConnection} from 'angular2/src/http/backends/xhr_backend';
export {Http, HttpFactory} from './src/http/http';

export {Headers} from 'angular2/src/http/headers';

export * from 'angular2/src/http/enums';
export {URLSearchParams} from 'angular2/src/http/url_search_params';

/**
 * Provides a basic set of injectables to use the {@link Http} service in any application.
 *
 * #Example
 *
 * ```
 * import {httpInjectables, Http} from 'angular2/http';
 * @Component({selector: 'http-app', appInjector: [httpInjectables]})
 * @View({template: '{{data}}'})
 * class MyApp {
 *   constructor(http:Http) {
 *     http.request('data.txt').subscribe(res => this.data = res.text());
 *   }
 * }
 * ```
 *
 */
export var httpInjectables: List<any> = [
  bind(ConnectionBackend)
      .toClass(XHRBackend),
  BrowserXHR,
  XHRBackend,
  BaseRequestOptions,
  bind(HttpFactory).toFactory(HttpFactory, [XHRBackend, BaseRequestOptions]),
  Http
];
