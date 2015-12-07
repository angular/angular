'use strict';/**
 * @module
 * @description
 * The http module provides services to perform http requests. To get started, see the {@link Http}
 * class.
 */
var core_1 = require('angular2/core');
var http_1 = require('./src/http/http');
var xhr_backend_1 = require('./src/http/backends/xhr_backend');
var jsonp_backend_1 = require('./src/http/backends/jsonp_backend');
var browser_xhr_1 = require('./src/http/backends/browser_xhr');
var browser_jsonp_1 = require('./src/http/backends/browser_jsonp');
var base_request_options_1 = require('./src/http/base_request_options');
var base_response_options_1 = require('./src/http/base_response_options');
var static_request_1 = require('./src/http/static_request');
exports.Request = static_request_1.Request;
var static_response_1 = require('./src/http/static_response');
exports.Response = static_response_1.Response;
var interfaces_1 = require('./src/http/interfaces');
exports.Connection = interfaces_1.Connection;
exports.ConnectionBackend = interfaces_1.ConnectionBackend;
var browser_xhr_2 = require('./src/http/backends/browser_xhr');
exports.BrowserXhr = browser_xhr_2.BrowserXhr;
var base_request_options_2 = require('./src/http/base_request_options');
exports.BaseRequestOptions = base_request_options_2.BaseRequestOptions;
exports.RequestOptions = base_request_options_2.RequestOptions;
var base_response_options_2 = require('./src/http/base_response_options');
exports.BaseResponseOptions = base_response_options_2.BaseResponseOptions;
exports.ResponseOptions = base_response_options_2.ResponseOptions;
var xhr_backend_2 = require('./src/http/backends/xhr_backend');
exports.XHRBackend = xhr_backend_2.XHRBackend;
exports.XHRConnection = xhr_backend_2.XHRConnection;
var jsonp_backend_2 = require('./src/http/backends/jsonp_backend');
exports.JSONPBackend = jsonp_backend_2.JSONPBackend;
exports.JSONPConnection = jsonp_backend_2.JSONPConnection;
var http_2 = require('./src/http/http');
exports.Http = http_2.Http;
exports.Jsonp = http_2.Jsonp;
var headers_1 = require('./src/http/headers');
exports.Headers = headers_1.Headers;
var enums_1 = require('./src/http/enums');
exports.ResponseType = enums_1.ResponseType;
exports.ReadyState = enums_1.ReadyState;
exports.RequestMethod = enums_1.RequestMethod;
var url_search_params_1 = require('./src/http/url_search_params');
exports.URLSearchParams = url_search_params_1.URLSearchParams;
/**
 * Provides a basic set of injectables to use the {@link Http} service in any application.
 *
 * The `HTTP_PROVIDERS` should be included either in a component's injector,
 * or in the root injector when bootstrapping an application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/snj7Nv?p=preview))
 *
 * ```
 * import {bootstrap, Component, NgFor, View} from 'angular2/angular2';
 * import {HTTP_PROVIDERS, Http} from 'angular2/http';
 *
 * @Component({
 *   selector: 'app',
 *   providers: [HTTP_PROVIDERS],
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
 * The primary public API included in `HTTP_PROVIDERS` is the {@link Http} class.
 * However, other providers required by `Http` are included,
 * which may be beneficial to override in certain cases.
 *
 * The providers included in `HTTP_PROVIDERS` include:
 *  * {@link Http}
 *  * {@link XHRBackend}
 *  * `BrowserXHR` - Private factory to create `XMLHttpRequest` instances
 *  * {@link RequestOptions} - Bound to {@link BaseRequestOptions} class
 *  * {@link ResponseOptions} - Bound to {@link BaseResponseOptions} class
 *
 * There may be cases where it makes sense to extend the base request options,
 * such as to add a search string to be appended to all URLs.
 * To accomplish this, a new provider for {@link RequestOptions} should
 * be added in the same injector as `HTTP_PROVIDERS`.
 *
 * ### Example ([live demo](http://plnkr.co/edit/aCMEXi?p=preview))
 *
 * ```
 * import {provide, bootstrap} from 'angular2/angular2';
 * import {HTTP_PROVIDERS, BaseRequestOptions, RequestOptions} from 'angular2/http';
 *
 * class MyOptions extends BaseRequestOptions {
 *   search: string = 'coreTeam=true';
 * }
 *
 * bootstrap(App, [HTTP_PROVIDERS, provide(RequestOptions, {useClass: MyOptions})])
 *   .catch(err => console.error(err));
 * ```
 *
 * Likewise, to use a mock backend for unit tests, the {@link XHRBackend}
 * provider should be bound to {@link MockBackend}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/7LWALD?p=preview))
 *
 * ```
 * import {provide, Injector} from 'angular2/angular2';
 * import {HTTP_PROVIDERS, Http, Response, XHRBackend} from 'angular2/http';
 * import {MockBackend} from 'angular2/http/testing';
 *
 * var people = [{name: 'Jeff'}, {name: 'Tobias'}];
 *
 * var injector = Injector.resolveAndCreate([
 *   HTTP_PROVIDERS,
 *   MockBackend,
 *   provide(XHRBackend, {useExisting: MockBackend})
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
exports.HTTP_PROVIDERS = [
    // TODO(pascal): use factory type annotations once supported in DI
    // issue: https://github.com/angular/angular/issues/3183
    core_1.provide(http_1.Http, {
        useFactory: function (xhrBackend, requestOptions) { return new http_1.Http(xhrBackend, requestOptions); },
        deps: [xhr_backend_1.XHRBackend, base_request_options_1.RequestOptions]
    }),
    browser_xhr_1.BrowserXhr,
    core_1.provide(base_request_options_1.RequestOptions, { useClass: base_request_options_1.BaseRequestOptions }),
    core_1.provide(base_response_options_1.ResponseOptions, { useClass: base_response_options_1.BaseResponseOptions }),
    xhr_backend_1.XHRBackend
];
/**
 * @deprecated
 */
exports.HTTP_BINDINGS = exports.HTTP_PROVIDERS;
/**
 * Provides a basic set of providers to use the {@link Jsonp} service in any application.
 *
 * The `JSONP_PROVIDERS` should be included either in a component's injector,
 * or in the root injector when bootstrapping an application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/vmeN4F?p=preview))
 *
 * ```
 * import {Component, NgFor, View} from 'angular2/angular2';
 * import {JSONP_PROVIDERS, Jsonp} from 'angular2/http';
 *
 * @Component({
 *   selector: 'app',
 *   providers: [JSONP_PROVIDERS],
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
 * The primary public API included in `JSONP_PROVIDERS` is the {@link Jsonp} class.
 * However, other providers required by `Jsonp` are included,
 * which may be beneficial to override in certain cases.
 *
 * The providers included in `JSONP_PROVIDERS` include:
 *  * {@link Jsonp}
 *  * {@link JSONPBackend}
 *  * `BrowserJsonp` - Private factory
 *  * {@link RequestOptions} - Bound to {@link BaseRequestOptions} class
 *  * {@link ResponseOptions} - Bound to {@link BaseResponseOptions} class
 *
 * There may be cases where it makes sense to extend the base request options,
 * such as to add a search string to be appended to all URLs.
 * To accomplish this, a new provider for {@link RequestOptions} should
 * be added in the same injector as `JSONP_PROVIDERS`.
 *
 * ### Example ([live demo](http://plnkr.co/edit/TFug7x?p=preview))
 *
 * ```
 * import {provide, bootstrap} from 'angular2/angular2';
 * import {JSONP_PROVIDERS, BaseRequestOptions, RequestOptions} from 'angular2/http';
 *
 * class MyOptions extends BaseRequestOptions {
 *   search: string = 'coreTeam=true';
 * }
 *
 * bootstrap(App, [JSONP_PROVIDERS, provide(RequestOptions, {useClass: MyOptions})])
 *   .catch(err => console.error(err));
 * ```
 *
 * Likewise, to use a mock backend for unit tests, the {@link JSONPBackend}
 * provider should be bound to {@link MockBackend}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/HDqZWL?p=preview))
 *
 * ```
 * import {provide, Injector} from 'angular2/angular2';
 * import {JSONP_PROVIDERS, Jsonp, Response, JSONPBackend} from 'angular2/http';
 * import {MockBackend} from 'angular2/http/testing';
 *
 * var people = [{name: 'Jeff'}, {name: 'Tobias'}];
 * var injector = Injector.resolveAndCreate([
 *   JSONP_PROVIDERS,
 *   MockBackend,
 *   provide(JSONPBackend, {useExisting: MockBackend})
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
exports.JSONP_PROVIDERS = [
    // TODO(pascal): use factory type annotations once supported in DI
    // issue: https://github.com/angular/angular/issues/3183
    core_1.provide(http_1.Jsonp, {
        useFactory: function (jsonpBackend, requestOptions) { return new http_1.Jsonp(jsonpBackend, requestOptions); },
        deps: [jsonp_backend_1.JSONPBackend, base_request_options_1.RequestOptions]
    }),
    browser_jsonp_1.BrowserJsonp,
    core_1.provide(base_request_options_1.RequestOptions, { useClass: base_request_options_1.BaseRequestOptions }),
    core_1.provide(base_response_options_1.ResponseOptions, { useClass: base_response_options_1.BaseResponseOptions }),
    core_1.provide(jsonp_backend_1.JSONPBackend, { useClass: jsonp_backend_1.JSONPBackend_ })
];
/**
 * @deprecated
 */
exports.JSON_BINDINGS = exports.JSONP_PROVIDERS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2h0dHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFDSCxxQkFBZ0MsZUFBZSxDQUFDLENBQUE7QUFDaEQscUJBQTBCLGlCQUFpQixDQUFDLENBQUE7QUFDNUMsNEJBQXdDLGlDQUFpQyxDQUFDLENBQUE7QUFDMUUsOEJBQTJELG1DQUFtQyxDQUFDLENBQUE7QUFDL0YsNEJBQXlCLGlDQUFpQyxDQUFDLENBQUE7QUFDM0QsOEJBQTJCLG1DQUFtQyxDQUFDLENBQUE7QUFDL0QscUNBQWlELGlDQUFpQyxDQUFDLENBQUE7QUFFbkYsc0NBQW1ELGtDQUFrQyxDQUFDLENBQUE7QUFDdEYsK0JBQXNCLDJCQUEyQixDQUFDO0FBQTFDLDJDQUEwQztBQUNsRCxnQ0FBdUIsNEJBQTRCLENBQUM7QUFBNUMsOENBQTRDO0FBRXBELDJCQUtPLHVCQUF1QixDQUFDO0FBRjdCLDZDQUFVO0FBQ1YsMkRBQzZCO0FBRS9CLDRCQUF5QixpQ0FBaUMsQ0FBQztBQUFuRCw4Q0FBbUQ7QUFDM0QscUNBQWlELGlDQUFpQyxDQUFDO0FBQTNFLHVFQUFrQjtBQUFFLCtEQUF1RDtBQUNuRixzQ0FBbUQsa0NBQWtDLENBQUM7QUFBOUUsMEVBQW1CO0FBQUUsa0VBQXlEO0FBQ3RGLDRCQUF3QyxpQ0FBaUMsQ0FBQztBQUFsRSw4Q0FBVTtBQUFFLG9EQUFzRDtBQUMxRSw4QkFBNEMsbUNBQW1DLENBQUM7QUFBeEUsb0RBQVk7QUFBRSwwREFBMEQ7QUFDaEYscUJBQTBCLGlCQUFpQixDQUFDO0FBQXBDLDJCQUFJO0FBQUUsNkJBQThCO0FBRTVDLHdCQUFzQixvQkFBb0IsQ0FBQztBQUFuQyxvQ0FBbUM7QUFFM0Msc0JBQXNELGtCQUFrQixDQUFDO0FBQWpFLDRDQUFZO0FBQUUsd0NBQVU7QUFBRSw4Q0FBdUM7QUFDekUsa0NBQThCLDhCQUE4QixDQUFDO0FBQXJELDhEQUFxRDtBQUU3RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBK0dHO0FBQ1Usc0JBQWMsR0FBVTtJQUNuQyxrRUFBa0U7SUFDbEUsd0RBQXdEO0lBQ3hELGNBQU8sQ0FBQyxXQUFJLEVBQ0o7UUFDRSxVQUFVLEVBQUUsVUFBQyxVQUFVLEVBQUUsY0FBYyxJQUFLLE9BQUEsSUFBSSxXQUFJLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxFQUFwQyxDQUFvQztRQUNoRixJQUFJLEVBQUUsQ0FBQyx3QkFBVSxFQUFFLHFDQUFjLENBQUM7S0FDbkMsQ0FBQztJQUNWLHdCQUFVO0lBQ1YsY0FBTyxDQUFDLHFDQUFjLEVBQUUsRUFBQyxRQUFRLEVBQUUseUNBQWtCLEVBQUMsQ0FBQztJQUN2RCxjQUFPLENBQUMsdUNBQWUsRUFBRSxFQUFDLFFBQVEsRUFBRSwyQ0FBbUIsRUFBQyxDQUFDO0lBQ3pELHdCQUFVO0NBQ1gsQ0FBQztBQUVGOztHQUVHO0FBQ1UscUJBQWEsR0FBRyxzQkFBYyxDQUFDO0FBRTVDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUdHO0FBQ1UsdUJBQWUsR0FBVTtJQUNwQyxrRUFBa0U7SUFDbEUsd0RBQXdEO0lBQ3hELGNBQU8sQ0FBQyxZQUFLLEVBQ0w7UUFDRSxVQUFVLEVBQUUsVUFBQyxZQUFZLEVBQUUsY0FBYyxJQUFLLE9BQUEsSUFBSSxZQUFLLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQyxFQUF2QyxDQUF1QztRQUNyRixJQUFJLEVBQUUsQ0FBQyw0QkFBWSxFQUFFLHFDQUFjLENBQUM7S0FDckMsQ0FBQztJQUNWLDRCQUFZO0lBQ1osY0FBTyxDQUFDLHFDQUFjLEVBQUUsRUFBQyxRQUFRLEVBQUUseUNBQWtCLEVBQUMsQ0FBQztJQUN2RCxjQUFPLENBQUMsdUNBQWUsRUFBRSxFQUFDLFFBQVEsRUFBRSwyQ0FBbUIsRUFBQyxDQUFDO0lBQ3pELGNBQU8sQ0FBQyw0QkFBWSxFQUFFLEVBQUMsUUFBUSxFQUFFLDZCQUFhLEVBQUMsQ0FBQztDQUNqRCxDQUFDO0FBRUY7O0dBRUc7QUFDVSxxQkFBYSxHQUFHLHVCQUFlLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBtb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICogVGhlIGh0dHAgbW9kdWxlIHByb3ZpZGVzIHNlcnZpY2VzIHRvIHBlcmZvcm0gaHR0cCByZXF1ZXN0cy4gVG8gZ2V0IHN0YXJ0ZWQsIHNlZSB0aGUge0BsaW5rIEh0dHB9XG4gKiBjbGFzcy5cbiAqL1xuaW1wb3J0IHtwcm92aWRlLCBQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0h0dHAsIEpzb25wfSBmcm9tICcuL3NyYy9odHRwL2h0dHAnO1xuaW1wb3J0IHtYSFJCYWNrZW5kLCBYSFJDb25uZWN0aW9ufSBmcm9tICcuL3NyYy9odHRwL2JhY2tlbmRzL3hocl9iYWNrZW5kJztcbmltcG9ydCB7SlNPTlBCYWNrZW5kLCBKU09OUEJhY2tlbmRfLCBKU09OUENvbm5lY3Rpb259IGZyb20gJy4vc3JjL2h0dHAvYmFja2VuZHMvanNvbnBfYmFja2VuZCc7XG5pbXBvcnQge0Jyb3dzZXJYaHJ9IGZyb20gJy4vc3JjL2h0dHAvYmFja2VuZHMvYnJvd3Nlcl94aHInO1xuaW1wb3J0IHtCcm93c2VySnNvbnB9IGZyb20gJy4vc3JjL2h0dHAvYmFja2VuZHMvYnJvd3Nlcl9qc29ucCc7XG5pbXBvcnQge0Jhc2VSZXF1ZXN0T3B0aW9ucywgUmVxdWVzdE9wdGlvbnN9IGZyb20gJy4vc3JjL2h0dHAvYmFzZV9yZXF1ZXN0X29wdGlvbnMnO1xuaW1wb3J0IHtDb25uZWN0aW9uQmFja2VuZH0gZnJvbSAnLi9zcmMvaHR0cC9pbnRlcmZhY2VzJztcbmltcG9ydCB7QmFzZVJlc3BvbnNlT3B0aW9ucywgUmVzcG9uc2VPcHRpb25zfSBmcm9tICcuL3NyYy9odHRwL2Jhc2VfcmVzcG9uc2Vfb3B0aW9ucyc7XG5leHBvcnQge1JlcXVlc3R9IGZyb20gJy4vc3JjL2h0dHAvc3RhdGljX3JlcXVlc3QnO1xuZXhwb3J0IHtSZXNwb25zZX0gZnJvbSAnLi9zcmMvaHR0cC9zdGF0aWNfcmVzcG9uc2UnO1xuXG5leHBvcnQge1xuICBSZXF1ZXN0T3B0aW9uc0FyZ3MsXG4gIFJlc3BvbnNlT3B0aW9uc0FyZ3MsXG4gIENvbm5lY3Rpb24sXG4gIENvbm5lY3Rpb25CYWNrZW5kXG59IGZyb20gJy4vc3JjL2h0dHAvaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCB7QnJvd3Nlclhocn0gZnJvbSAnLi9zcmMvaHR0cC9iYWNrZW5kcy9icm93c2VyX3hocic7XG5leHBvcnQge0Jhc2VSZXF1ZXN0T3B0aW9ucywgUmVxdWVzdE9wdGlvbnN9IGZyb20gJy4vc3JjL2h0dHAvYmFzZV9yZXF1ZXN0X29wdGlvbnMnO1xuZXhwb3J0IHtCYXNlUmVzcG9uc2VPcHRpb25zLCBSZXNwb25zZU9wdGlvbnN9IGZyb20gJy4vc3JjL2h0dHAvYmFzZV9yZXNwb25zZV9vcHRpb25zJztcbmV4cG9ydCB7WEhSQmFja2VuZCwgWEhSQ29ubmVjdGlvbn0gZnJvbSAnLi9zcmMvaHR0cC9iYWNrZW5kcy94aHJfYmFja2VuZCc7XG5leHBvcnQge0pTT05QQmFja2VuZCwgSlNPTlBDb25uZWN0aW9ufSBmcm9tICcuL3NyYy9odHRwL2JhY2tlbmRzL2pzb25wX2JhY2tlbmQnO1xuZXhwb3J0IHtIdHRwLCBKc29ucH0gZnJvbSAnLi9zcmMvaHR0cC9odHRwJztcblxuZXhwb3J0IHtIZWFkZXJzfSBmcm9tICcuL3NyYy9odHRwL2hlYWRlcnMnO1xuXG5leHBvcnQge1Jlc3BvbnNlVHlwZSwgUmVhZHlTdGF0ZSwgUmVxdWVzdE1ldGhvZH0gZnJvbSAnLi9zcmMvaHR0cC9lbnVtcyc7XG5leHBvcnQge1VSTFNlYXJjaFBhcmFtc30gZnJvbSAnLi9zcmMvaHR0cC91cmxfc2VhcmNoX3BhcmFtcyc7XG5cbi8qKlxuICogUHJvdmlkZXMgYSBiYXNpYyBzZXQgb2YgaW5qZWN0YWJsZXMgdG8gdXNlIHRoZSB7QGxpbmsgSHR0cH0gc2VydmljZSBpbiBhbnkgYXBwbGljYXRpb24uXG4gKlxuICogVGhlIGBIVFRQX1BST1ZJREVSU2Agc2hvdWxkIGJlIGluY2x1ZGVkIGVpdGhlciBpbiBhIGNvbXBvbmVudCdzIGluamVjdG9yLFxuICogb3IgaW4gdGhlIHJvb3QgaW5qZWN0b3Igd2hlbiBib290c3RyYXBwaW5nIGFuIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9zbmo3TnY/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Ym9vdHN0cmFwLCBDb21wb25lbnQsIE5nRm9yLCBWaWV3fSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG4gKiBpbXBvcnQge0hUVFBfUFJPVklERVJTLCBIdHRwfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICBwcm92aWRlcnM6IFtIVFRQX1BST1ZJREVSU10sXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdj5cbiAqICAgICAgIDxoMT5QZW9wbGU8L2gxPlxuICogICAgICAgPHVsPlxuICogICAgICAgICA8bGkgKm5nLWZvcj1cIiNwZXJzb24gb2YgcGVvcGxlXCI+XG4gKiAgICAgICAgICAge3twZXJzb24ubmFtZX19XG4gKiAgICAgICAgIDwvbGk+XG4gKiAgICAgICA8L3VsPlxuICogICAgIDwvZGl2PlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbTmdGb3JdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIHBlb3BsZTogT2JqZWN0W107XG4gKiAgIGNvbnN0cnVjdG9yKGh0dHA6SHR0cCkge1xuICogICAgIGh0dHAuZ2V0KCdwZW9wbGUuanNvbicpLnN1YnNjcmliZShyZXMgPT4ge1xuICogICAgICAgdGhpcy5wZW9wbGUgPSByZXMuanNvbigpO1xuICogICAgIH0pO1xuICogICB9XG4gKiAgIGFjdGl2ZTpib29sZWFuID0gZmFsc2U7XG4gKiAgIHRvZ2dsZUFjdGl2ZVN0YXRlKCkge1xuICogICAgIHRoaXMuYWN0aXZlID0gIXRoaXMuYWN0aXZlO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcClcbiAqICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKGVycikpO1xuICogYGBgXG4gKlxuICogVGhlIHByaW1hcnkgcHVibGljIEFQSSBpbmNsdWRlZCBpbiBgSFRUUF9QUk9WSURFUlNgIGlzIHRoZSB7QGxpbmsgSHR0cH0gY2xhc3MuXG4gKiBIb3dldmVyLCBvdGhlciBwcm92aWRlcnMgcmVxdWlyZWQgYnkgYEh0dHBgIGFyZSBpbmNsdWRlZCxcbiAqIHdoaWNoIG1heSBiZSBiZW5lZmljaWFsIHRvIG92ZXJyaWRlIGluIGNlcnRhaW4gY2FzZXMuXG4gKlxuICogVGhlIHByb3ZpZGVycyBpbmNsdWRlZCBpbiBgSFRUUF9QUk9WSURFUlNgIGluY2x1ZGU6XG4gKiAgKiB7QGxpbmsgSHR0cH1cbiAqICAqIHtAbGluayBYSFJCYWNrZW5kfVxuICogICogYEJyb3dzZXJYSFJgIC0gUHJpdmF0ZSBmYWN0b3J5IHRvIGNyZWF0ZSBgWE1MSHR0cFJlcXVlc3RgIGluc3RhbmNlc1xuICogICoge0BsaW5rIFJlcXVlc3RPcHRpb25zfSAtIEJvdW5kIHRvIHtAbGluayBCYXNlUmVxdWVzdE9wdGlvbnN9IGNsYXNzXG4gKiAgKiB7QGxpbmsgUmVzcG9uc2VPcHRpb25zfSAtIEJvdW5kIHRvIHtAbGluayBCYXNlUmVzcG9uc2VPcHRpb25zfSBjbGFzc1xuICpcbiAqIFRoZXJlIG1heSBiZSBjYXNlcyB3aGVyZSBpdCBtYWtlcyBzZW5zZSB0byBleHRlbmQgdGhlIGJhc2UgcmVxdWVzdCBvcHRpb25zLFxuICogc3VjaCBhcyB0byBhZGQgYSBzZWFyY2ggc3RyaW5nIHRvIGJlIGFwcGVuZGVkIHRvIGFsbCBVUkxzLlxuICogVG8gYWNjb21wbGlzaCB0aGlzLCBhIG5ldyBwcm92aWRlciBmb3Ige0BsaW5rIFJlcXVlc3RPcHRpb25zfSBzaG91bGRcbiAqIGJlIGFkZGVkIGluIHRoZSBzYW1lIGluamVjdG9yIGFzIGBIVFRQX1BST1ZJREVSU2AuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2FDTUVYaT9wPXByZXZpZXcpKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtwcm92aWRlLCBib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbiAqIGltcG9ydCB7SFRUUF9QUk9WSURFUlMsIEJhc2VSZXF1ZXN0T3B0aW9ucywgUmVxdWVzdE9wdGlvbnN9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICpcbiAqIGNsYXNzIE15T3B0aW9ucyBleHRlbmRzIEJhc2VSZXF1ZXN0T3B0aW9ucyB7XG4gKiAgIHNlYXJjaDogc3RyaW5nID0gJ2NvcmVUZWFtPXRydWUnO1xuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHAsIFtIVFRQX1BST1ZJREVSUywgcHJvdmlkZShSZXF1ZXN0T3B0aW9ucywge3VzZUNsYXNzOiBNeU9wdGlvbnN9KV0pXG4gKiAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcbiAqIGBgYFxuICpcbiAqIExpa2V3aXNlLCB0byB1c2UgYSBtb2NrIGJhY2tlbmQgZm9yIHVuaXQgdGVzdHMsIHRoZSB7QGxpbmsgWEhSQmFja2VuZH1cbiAqIHByb3ZpZGVyIHNob3VsZCBiZSBib3VuZCB0byB7QGxpbmsgTW9ja0JhY2tlbmR9LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC83TFdBTEQ/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7cHJvdmlkZSwgSW5qZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbiAqIGltcG9ydCB7SFRUUF9QUk9WSURFUlMsIEh0dHAsIFJlc3BvbnNlLCBYSFJCYWNrZW5kfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqIGltcG9ydCB7TW9ja0JhY2tlbmR9IGZyb20gJ2FuZ3VsYXIyL2h0dHAvdGVzdGluZyc7XG4gKlxuICogdmFyIHBlb3BsZSA9IFt7bmFtZTogJ0plZmYnfSwge25hbWU6ICdUb2JpYXMnfV07XG4gKlxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gKiAgIEhUVFBfUFJPVklERVJTLFxuICogICBNb2NrQmFja2VuZCxcbiAqICAgcHJvdmlkZShYSFJCYWNrZW5kLCB7dXNlRXhpc3Rpbmc6IE1vY2tCYWNrZW5kfSlcbiAqIF0pO1xuICogdmFyIGh0dHAgPSBpbmplY3Rvci5nZXQoSHR0cCk7XG4gKiB2YXIgYmFja2VuZCA9IGluamVjdG9yLmdldChNb2NrQmFja2VuZCk7XG4gKlxuICogLy8gTGlzdGVuIGZvciBhbnkgbmV3IHJlcXVlc3RzXG4gKiBiYWNrZW5kLmNvbm5lY3Rpb25zLm9ic2VydmVyKHtcbiAqICAgbmV4dDogY29ubmVjdGlvbiA9PiB7XG4gKiAgICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKHtib2R5OiBwZW9wbGV9KTtcbiAqICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAqICAgICAgIC8vIFNlbmQgYSByZXNwb25zZSB0byB0aGUgcmVxdWVzdFxuICogICAgICAgY29ubmVjdGlvbi5tb2NrUmVzcG9uZChyZXNwb25zZSk7XG4gKiAgICAgfSk7XG4gKiAgIH0pO1xuICpcbiAqIGh0dHAuZ2V0KCdwZW9wbGUuanNvbicpLm9ic2VydmVyKHtcbiAqICAgbmV4dDogcmVzID0+IHtcbiAqICAgICAvLyBSZXNwb25zZSBjYW1lIGZyb20gbW9jayBiYWNrZW5kXG4gKiAgICAgY29uc29sZS5sb2coJ2ZpcnN0IHBlcnNvbicsIHJlcy5qc29uKClbMF0ubmFtZSk7XG4gKiAgIH1cbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBIVFRQX1BST1ZJREVSUzogYW55W10gPSBbXG4gIC8vIFRPRE8ocGFzY2FsKTogdXNlIGZhY3RvcnkgdHlwZSBhbm5vdGF0aW9ucyBvbmNlIHN1cHBvcnRlZCBpbiBESVxuICAvLyBpc3N1ZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMzE4M1xuICBwcm92aWRlKEh0dHAsXG4gICAgICAgICAge1xuICAgICAgICAgICAgdXNlRmFjdG9yeTogKHhockJhY2tlbmQsIHJlcXVlc3RPcHRpb25zKSA9PiBuZXcgSHR0cCh4aHJCYWNrZW5kLCByZXF1ZXN0T3B0aW9ucyksXG4gICAgICAgICAgICBkZXBzOiBbWEhSQmFja2VuZCwgUmVxdWVzdE9wdGlvbnNdXG4gICAgICAgICAgfSksXG4gIEJyb3dzZXJYaHIsXG4gIHByb3ZpZGUoUmVxdWVzdE9wdGlvbnMsIHt1c2VDbGFzczogQmFzZVJlcXVlc3RPcHRpb25zfSksXG4gIHByb3ZpZGUoUmVzcG9uc2VPcHRpb25zLCB7dXNlQ2xhc3M6IEJhc2VSZXNwb25zZU9wdGlvbnN9KSxcbiAgWEhSQmFja2VuZFxuXTtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgY29uc3QgSFRUUF9CSU5ESU5HUyA9IEhUVFBfUFJPVklERVJTO1xuXG4vKipcbiAqIFByb3ZpZGVzIGEgYmFzaWMgc2V0IG9mIHByb3ZpZGVycyB0byB1c2UgdGhlIHtAbGluayBKc29ucH0gc2VydmljZSBpbiBhbnkgYXBwbGljYXRpb24uXG4gKlxuICogVGhlIGBKU09OUF9QUk9WSURFUlNgIHNob3VsZCBiZSBpbmNsdWRlZCBlaXRoZXIgaW4gYSBjb21wb25lbnQncyBpbmplY3RvcixcbiAqIG9yIGluIHRoZSByb290IGluamVjdG9yIHdoZW4gYm9vdHN0cmFwcGluZyBhbiBhcHBsaWNhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvdm1lTjRGP3A9cHJldmlldykpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudCwgTmdGb3IsIFZpZXd9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbiAqIGltcG9ydCB7SlNPTlBfUFJPVklERVJTLCBKc29ucH0gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgcHJvdmlkZXJzOiBbSlNPTlBfUFJPVklERVJTXSxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8ZGl2PlxuICogICAgICAgPGgxPlBlb3BsZTwvaDE+XG4gKiAgICAgICA8dWw+XG4gKiAgICAgICAgIDxsaSAqbmctZm9yPVwiI3BlcnNvbiBvZiBwZW9wbGVcIj5cbiAqICAgICAgICAgICB7e3BlcnNvbi5uYW1lfX1cbiAqICAgICAgICAgPC9saT5cbiAqICAgICAgIDwvdWw+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtOZ0Zvcl1cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwIHtcbiAqICAgcGVvcGxlOiBBcnJheTxPYmplY3Q+O1xuICogICBjb25zdHJ1Y3Rvcihqc29ucDpKc29ucCkge1xuICogICAgIGpzb25wLnJlcXVlc3QoJ3Blb3BsZS5qc29uJykuc3Vic2NyaWJlKHJlcyA9PiB7XG4gKiAgICAgICB0aGlzLnBlb3BsZSA9IHJlcy5qc29uKCk7XG4gKiAgICAgfSlcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhlIHByaW1hcnkgcHVibGljIEFQSSBpbmNsdWRlZCBpbiBgSlNPTlBfUFJPVklERVJTYCBpcyB0aGUge0BsaW5rIEpzb25wfSBjbGFzcy5cbiAqIEhvd2V2ZXIsIG90aGVyIHByb3ZpZGVycyByZXF1aXJlZCBieSBgSnNvbnBgIGFyZSBpbmNsdWRlZCxcbiAqIHdoaWNoIG1heSBiZSBiZW5lZmljaWFsIHRvIG92ZXJyaWRlIGluIGNlcnRhaW4gY2FzZXMuXG4gKlxuICogVGhlIHByb3ZpZGVycyBpbmNsdWRlZCBpbiBgSlNPTlBfUFJPVklERVJTYCBpbmNsdWRlOlxuICogICoge0BsaW5rIEpzb25wfVxuICogICoge0BsaW5rIEpTT05QQmFja2VuZH1cbiAqICAqIGBCcm93c2VySnNvbnBgIC0gUHJpdmF0ZSBmYWN0b3J5XG4gKiAgKiB7QGxpbmsgUmVxdWVzdE9wdGlvbnN9IC0gQm91bmQgdG8ge0BsaW5rIEJhc2VSZXF1ZXN0T3B0aW9uc30gY2xhc3NcbiAqICAqIHtAbGluayBSZXNwb25zZU9wdGlvbnN9IC0gQm91bmQgdG8ge0BsaW5rIEJhc2VSZXNwb25zZU9wdGlvbnN9IGNsYXNzXG4gKlxuICogVGhlcmUgbWF5IGJlIGNhc2VzIHdoZXJlIGl0IG1ha2VzIHNlbnNlIHRvIGV4dGVuZCB0aGUgYmFzZSByZXF1ZXN0IG9wdGlvbnMsXG4gKiBzdWNoIGFzIHRvIGFkZCBhIHNlYXJjaCBzdHJpbmcgdG8gYmUgYXBwZW5kZWQgdG8gYWxsIFVSTHMuXG4gKiBUbyBhY2NvbXBsaXNoIHRoaXMsIGEgbmV3IHByb3ZpZGVyIGZvciB7QGxpbmsgUmVxdWVzdE9wdGlvbnN9IHNob3VsZFxuICogYmUgYWRkZWQgaW4gdGhlIHNhbWUgaW5qZWN0b3IgYXMgYEpTT05QX1BST1ZJREVSU2AuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1RGdWc3eD9wPXByZXZpZXcpKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtwcm92aWRlLCBib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbiAqIGltcG9ydCB7SlNPTlBfUFJPVklERVJTLCBCYXNlUmVxdWVzdE9wdGlvbnMsIFJlcXVlc3RPcHRpb25zfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqXG4gKiBjbGFzcyBNeU9wdGlvbnMgZXh0ZW5kcyBCYXNlUmVxdWVzdE9wdGlvbnMge1xuICogICBzZWFyY2g6IHN0cmluZyA9ICdjb3JlVGVhbT10cnVlJztcbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwLCBbSlNPTlBfUFJPVklERVJTLCBwcm92aWRlKFJlcXVlc3RPcHRpb25zLCB7dXNlQ2xhc3M6IE15T3B0aW9uc30pXSlcbiAqICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKGVycikpO1xuICogYGBgXG4gKlxuICogTGlrZXdpc2UsIHRvIHVzZSBhIG1vY2sgYmFja2VuZCBmb3IgdW5pdCB0ZXN0cywgdGhlIHtAbGluayBKU09OUEJhY2tlbmR9XG4gKiBwcm92aWRlciBzaG91bGQgYmUgYm91bmQgdG8ge0BsaW5rIE1vY2tCYWNrZW5kfS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvSERxWldMP3A9cHJldmlldykpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge3Byb3ZpZGUsIEluamVjdG9yfSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG4gKiBpbXBvcnQge0pTT05QX1BST1ZJREVSUywgSnNvbnAsIFJlc3BvbnNlLCBKU09OUEJhY2tlbmR9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICogaW1wb3J0IHtNb2NrQmFja2VuZH0gZnJvbSAnYW5ndWxhcjIvaHR0cC90ZXN0aW5nJztcbiAqXG4gKiB2YXIgcGVvcGxlID0gW3tuYW1lOiAnSmVmZid9LCB7bmFtZTogJ1RvYmlhcyd9XTtcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogICBKU09OUF9QUk9WSURFUlMsXG4gKiAgIE1vY2tCYWNrZW5kLFxuICogICBwcm92aWRlKEpTT05QQmFja2VuZCwge3VzZUV4aXN0aW5nOiBNb2NrQmFja2VuZH0pXG4gKiBdKTtcbiAqIHZhciBqc29ucCA9IGluamVjdG9yLmdldChKc29ucCk7XG4gKiB2YXIgYmFja2VuZCA9IGluamVjdG9yLmdldChNb2NrQmFja2VuZCk7XG4gKlxuICogLy8gTGlzdGVuIGZvciBhbnkgbmV3IHJlcXVlc3RzXG4gKiBiYWNrZW5kLmNvbm5lY3Rpb25zLm9ic2VydmVyKHtcbiAqICAgbmV4dDogY29ubmVjdGlvbiA9PiB7XG4gKiAgICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKHtib2R5OiBwZW9wbGV9KTtcbiAqICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAqICAgICAgIC8vIFNlbmQgYSByZXNwb25zZSB0byB0aGUgcmVxdWVzdFxuICogICAgICAgY29ubmVjdGlvbi5tb2NrUmVzcG9uZChyZXNwb25zZSk7XG4gKiAgICAgfSk7XG4gKiAgIH0pO1xuXG4gKiBqc29ucC5nZXQoJ3Blb3BsZS5qc29uJykub2JzZXJ2ZXIoe1xuICogICBuZXh0OiByZXMgPT4ge1xuICogICAgIC8vIFJlc3BvbnNlIGNhbWUgZnJvbSBtb2NrIGJhY2tlbmRcbiAqICAgICBjb25zb2xlLmxvZygnZmlyc3QgcGVyc29uJywgcmVzLmpzb24oKVswXS5uYW1lKTtcbiAqICAgfVxuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IEpTT05QX1BST1ZJREVSUzogYW55W10gPSBbXG4gIC8vIFRPRE8ocGFzY2FsKTogdXNlIGZhY3RvcnkgdHlwZSBhbm5vdGF0aW9ucyBvbmNlIHN1cHBvcnRlZCBpbiBESVxuICAvLyBpc3N1ZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMzE4M1xuICBwcm92aWRlKEpzb25wLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVzZUZhY3Rvcnk6IChqc29ucEJhY2tlbmQsIHJlcXVlc3RPcHRpb25zKSA9PiBuZXcgSnNvbnAoanNvbnBCYWNrZW5kLCByZXF1ZXN0T3B0aW9ucyksXG4gICAgICAgICAgICBkZXBzOiBbSlNPTlBCYWNrZW5kLCBSZXF1ZXN0T3B0aW9uc11cbiAgICAgICAgICB9KSxcbiAgQnJvd3Nlckpzb25wLFxuICBwcm92aWRlKFJlcXVlc3RPcHRpb25zLCB7dXNlQ2xhc3M6IEJhc2VSZXF1ZXN0T3B0aW9uc30pLFxuICBwcm92aWRlKFJlc3BvbnNlT3B0aW9ucywge3VzZUNsYXNzOiBCYXNlUmVzcG9uc2VPcHRpb25zfSksXG4gIHByb3ZpZGUoSlNPTlBCYWNrZW5kLCB7dXNlQ2xhc3M6IEpTT05QQmFja2VuZF99KVxuXTtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgY29uc3QgSlNPTl9CSU5ESU5HUyA9IEpTT05QX1BST1ZJREVSUztcbiJdfQ==