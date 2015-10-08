/**
 * @module
 * @description
 * The http module provides services to perform http requests. To get started, see the {@link Http}
 * class.
 */
import {bind, Binding} from 'angular2/core';
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

export {ResponseTypes, ReadyStates, RequestMethods} from './src/http/enums';
export {URLSearchParams} from './src/http/url_search_params';

/**
 * Provides a basic set of injectables to use the {@link Http} service in any application.
 *
 * The `HTTP_BINDINGS` should be included either in a component's injector,
 * or in the root injector when bootstrapping an application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/snj7Nv?p=preview))
 *
 * ```
 * import {bootstrap, Component, NgFor, View} from 'angular2/angular2';
 * import {HTTP_BINDINGS, Http} from 'angular2/http';
 *
 * @Component({
 *   selector: 'app',
 *   bindings: [HTTP_BINDINGS]
 * })
 * @View({
 *   template: `
 *     <div>
 *       <h1>People</h1>
 *       <ul>
 *         <li *ng-for="#person of people">
 *           {{person.name}}
 *         </li>
 *       </ul>
 *     </div>
 *   `,
 *   directives: [NgFor]
 * })
 * export class App {
 *   people: Object[];
 *   constructor(http:Http) {
 *     http.get('people.json').subscribe(res => {
 *       this.people = res.json();
 *     });
 *   }
 *   active:boolean = false;
 *   toggleActiveState() {
 *     this.active = !this.active;
 *   }
 * }
 *
 * bootstrap(App)
 *   .catch(err => console.error(err));
 * ```
 *
 * The primary public API included in `HTTP_BINDINGS` is the {@link Http} class.
 * However, other bindings required by `Http` are included,
 * which may be beneficial to override in certain cases.
 *
 * The bindings included in `HTTP_BINDINGS` include:
 *  * {@link Http}
 *  * {@link XHRBackend}
 *  * `BrowserXHR` - Private factory to create `XMLHttpRequest` instances
 *  * {@link RequestOptions} - Bound to {@link BaseRequestOptions} class
 *  * {@link ResponseOptions} - Bound to {@link BaseResponseOptions} class
 *
 * There may be cases where it makes sense to extend the base request options,
 * such as to add a search string to be appended to all URLs.
 * To accomplish this, a new binding for {@link RequestOptions} should
 * be added in the same injector as `HTTP_BINDINGS`.
 *
 * ### Example ([live demo](http://plnkr.co/edit/aCMEXi?p=preview))
 *
 * ```
 * import {bind, bootstrap} from 'angular2/angular2';
 * import {HTTP_BINDINGS, BaseRequestOptions, RequestOptions} from 'angular2/http';
 *
 * class MyOptions extends BaseRequestOptions {
 *   search: string = 'coreTeam=true';
 * }
 *
 * bootstrap(App, [HTTP_BINDINGS, bind(RequestOptions).toClass(MyOptions)])
 *   .catch(err => console.error(err));
 * ```
 *
 * Likewise, to use a mock backend for unit tests, the {@link XHRBackend}
 * binding should be bound to {@link MockBackend}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/7LWALD?p=preview))
 *
 * ```
 * import {bind, Injector} from 'angular2/angular2';
 * import {HTTP_BINDINGS, Http, Response, XHRBackend, MockBackend} from 'angular2/http';
 *
 * var people = [{name: 'Jeff'}, {name: 'Tobias'}];
 *
 * var injector = Injector.resolveAndCreate([
 *   HTTP_BINDINGS,
 *   MockBackend,
 *   bind(XHRBackend).toAlias(MockBackend)
 * ]);
 * var http = injector.get(Http);
 * var backend = injector.get(MockBackend);
 *
 * // Listen for any new requests
 * backend.connections.observer({
 *   next: connection => {
 *     var response = new Response({body: people});
 *     setTimeout(() => {
 *       // Send a response to the request
 *       connection.mockRespond(response);
 *     });
 *   });
 *
 * http.get('people.json').observer({
 *   next: res => {
 *     // Response came from mock backend
 *     console.log('first person', res.json()[0].name);
 *   }
 * });
 * ```
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


/**
 * Provides a basic set of bindings to use the {@link Jsonp} service in any application.
 *
 * The `JSONP_BINDINGS` should be included either in a component's injector,
 * or in the root injector when bootstrapping an application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/vmeN4F?p=preview))
 *
 * ```
 * import {Component, NgFor, View} from 'angular2/angular2';
 * import {JSONP_BINDINGS, Jsonp} from 'angular2/http';
 *
 * @Component({
 *   selector: 'app',
 *   bindings: [JSONP_BINDINGS]
 * })
 * @View({
 *   template: `
 *     <div>
 *       <h1>People</h1>
 *       <ul>
 *         <li *ng-for="#person of people">
 *           {{person.name}}
 *         </li>
 *       </ul>
 *     </div>
 *   `,
 *   directives: [NgFor]
 * })
 * export class App {
 *   people: Array<Object>;
 *   constructor(jsonp:Jsonp) {
 *     jsonp.request('people.json').subscribe(res => {
 *       this.people = res.json();
 *     })
 *   }
 * }
 * ```
 *
 * The primary public API included in `JSONP_BINDINGS` is the {@link Jsonp} class.
 * However, other bindings required by `Jsonp` are included,
 * which may be beneficial to override in certain cases.
 *
 * The bindings included in `JSONP_BINDINGS` include:
 *  * {@link Jsonp}
 *  * {@link JSONPBackend}
 *  * `BrowserJsonp` - Private factory
 *  * {@link RequestOptions} - Bound to {@link BaseRequestOptions} class
 *  * {@link ResponseOptions} - Bound to {@link BaseResponseOptions} class
 *
 * There may be cases where it makes sense to extend the base request options,
 * such as to add a search string to be appended to all URLs.
 * To accomplish this, a new binding for {@link RequestOptions} should
 * be added in the same injector as `JSONP_BINDINGS`.
 *
 * ### Example ([live demo](http://plnkr.co/edit/TFug7x?p=preview))
 *
 * ```
 * import {bind, bootstrap} from 'angular2/angular2';
 * import {JSONP_BINDINGS, BaseRequestOptions, RequestOptions} from 'angular2/http';
 *
 * class MyOptions extends BaseRequestOptions {
 *   search: string = 'coreTeam=true';
 * }
 *
 * bootstrap(App, [JSONP_BINDINGS, bind(RequestOptions).toClass(MyOptions)])
 *   .catch(err => console.error(err));
 * ```
 *
 * Likewise, to use a mock backend for unit tests, the {@link JSONPBackend}
 * binding should be bound to {@link MockBackend}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/HDqZWL?p=preview))
 *
 * ```
 * import {bind, Injector} from 'angular2/angular2';
 * import {JSONP_BINDINGS, Jsonp, Response, JSONPBackend, MockBackend} from 'angular2/http';
 *
 * var people = [{name: 'Jeff'}, {name: 'Tobias'}];
 * var injector = Injector.resolveAndCreate([
 *   JSONP_BINDINGS,
 *   MockBackend,
 *   bind(JSONPBackend).toAlias(MockBackend)
 * ]);
 * var jsonp = injector.get(Jsonp);
 * var backend = injector.get(MockBackend);
 *
 * // Listen for any new requests
 * backend.connections.observer({
 *   next: connection => {
 *     var response = new Response({body: people});
 *     setTimeout(() => {
 *       // Send a response to the request
 *       connection.mockRespond(response);
 *     });
 *   });

 * jsonp.get('people.json').observer({
 *   next: res => {
 *     // Response came from mock backend
 *     console.log('first person', res.json()[0].name);
 *   }
 * });
 * ```
 */
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
