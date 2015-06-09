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

export {MockConnection, MockBackend} from 'angular2/src/http/backends/mock_backend';
export {Request} from 'angular2/src/http/static_request';
export {Response} from 'angular2/src/http/static_response';

export {Http, XHRBackend, XHRConnection, BaseRequestOptions, RequestOptions, HttpFactory};
export {IHttp} from 'angular2/src/http/interfaces';
export {Headers} from 'angular2/src/http/headers';

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
  bind(BrowserXHR)
      .toValue(BrowserXHR),
  XHRBackend,
  BaseRequestOptions,
  bind(HttpFactory).toFactory(HttpFactory, [XHRBackend, BaseRequestOptions]),
  Http
];
