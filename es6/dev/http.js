import { provide } from 'angular2/core';
import { Http, Jsonp } from './src/http/http';
import { XHRBackend } from './src/http/backends/xhr_backend';
import { JSONPBackend, JSONPBackend_ } from './src/http/backends/jsonp_backend';
import { BrowserXhr } from './src/http/backends/browser_xhr';
import { BrowserJsonp } from './src/http/backends/browser_jsonp';
import { BaseRequestOptions, RequestOptions } from './src/http/base_request_options';
import { BaseResponseOptions, ResponseOptions } from './src/http/base_response_options';
export { MockConnection, MockBackend } from './src/http/backends/mock_backend';
export { Request } from './src/http/static_request';
export { Response } from './src/http/static_response';
export { Connection, ConnectionBackend } from './src/http/interfaces';
export { BrowserXhr } from './src/http/backends/browser_xhr';
export { BaseRequestOptions, RequestOptions } from './src/http/base_request_options';
export { BaseResponseOptions, ResponseOptions } from './src/http/base_response_options';
export { XHRBackend, XHRConnection } from './src/http/backends/xhr_backend';
export { JSONPBackend, JSONPConnection } from './src/http/backends/jsonp_backend';
export { Http, Jsonp } from './src/http/http';
export { Headers } from './src/http/headers';
export { ResponseTypes, ReadyStates, RequestMethods } from './src/http/enums';
export { URLSearchParams } from './src/http/url_search_params';
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
 * import {HTTP_PROVIDERS, Http, Response, XHRBackend, MockBackend} from 'angular2/http';
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
export const HTTP_PROVIDERS = [
    // TODO(pascal): use factory type annotations once supported in DI
    // issue: https://github.com/angular/angular/issues/3183
    provide(Http, {
        useFactory: (xhrBackend, requestOptions) => new Http(xhrBackend, requestOptions),
        deps: [XHRBackend, RequestOptions]
    }),
    BrowserXhr,
    provide(RequestOptions, { useClass: BaseRequestOptions }),
    provide(ResponseOptions, { useClass: BaseResponseOptions }),
    XHRBackend
];
/**
 * @deprecated
 */
export const HTTP_BINDINGS = HTTP_PROVIDERS;
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
 * import {JSONP_PROVIDERS, Jsonp, Response, JSONPBackend, MockBackend} from 'angular2/http';
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
export const JSONP_PROVIDERS = [
    // TODO(pascal): use factory type annotations once supported in DI
    // issue: https://github.com/angular/angular/issues/3183
    provide(Jsonp, {
        useFactory: (jsonpBackend, requestOptions) => new Jsonp(jsonpBackend, requestOptions),
        deps: [JSONPBackend, RequestOptions]
    }),
    BrowserJsonp,
    provide(RequestOptions, { useClass: BaseRequestOptions }),
    provide(ResponseOptions, { useClass: BaseResponseOptions }),
    provide(JSONPBackend, { useClass: JSONPBackend_ })
];
/**
 * @deprecated
 */
export const JSON_BINDINGS = JSONP_PROVIDERS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2h0dHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BTU8sRUFBQyxPQUFPLEVBQVcsTUFBTSxlQUFlO09BQ3hDLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxNQUFNLGlCQUFpQjtPQUNwQyxFQUFDLFVBQVUsRUFBZ0IsTUFBTSxpQ0FBaUM7T0FDbEUsRUFBQyxZQUFZLEVBQUUsYUFBYSxFQUFrQixNQUFNLG1DQUFtQztPQUN2RixFQUFDLFVBQVUsRUFBQyxNQUFNLGlDQUFpQztPQUNuRCxFQUFDLFlBQVksRUFBQyxNQUFNLG1DQUFtQztPQUN2RCxFQUFDLGtCQUFrQixFQUFFLGNBQWMsRUFBQyxNQUFNLGlDQUFpQztPQUUzRSxFQUFDLG1CQUFtQixFQUFFLGVBQWUsRUFBQyxNQUFNLGtDQUFrQztBQUVyRixTQUFRLGNBQWMsRUFBRSxXQUFXLFFBQU8sa0NBQWtDLENBQUM7QUFDN0UsU0FBUSxPQUFPLFFBQU8sMkJBQTJCLENBQUM7QUFDbEQsU0FBUSxRQUFRLFFBQU8sNEJBQTRCLENBQUM7QUFFcEQsU0FHRSxVQUFVLEVBQ1YsaUJBQWlCLFFBQ1osdUJBQXVCLENBQUM7QUFFL0IsU0FBUSxVQUFVLFFBQU8saUNBQWlDLENBQUM7QUFDM0QsU0FBUSxrQkFBa0IsRUFBRSxjQUFjLFFBQU8saUNBQWlDLENBQUM7QUFDbkYsU0FBUSxtQkFBbUIsRUFBRSxlQUFlLFFBQU8sa0NBQWtDLENBQUM7QUFDdEYsU0FBUSxVQUFVLEVBQUUsYUFBYSxRQUFPLGlDQUFpQyxDQUFDO0FBQzFFLFNBQVEsWUFBWSxFQUFFLGVBQWUsUUFBTyxtQ0FBbUMsQ0FBQztBQUNoRixTQUFRLElBQUksRUFBRSxLQUFLLFFBQU8saUJBQWlCLENBQUM7QUFFNUMsU0FBUSxPQUFPLFFBQU8sb0JBQW9CLENBQUM7QUFFM0MsU0FBUSxhQUFhLEVBQUUsV0FBVyxFQUFFLGNBQWMsUUFBTyxrQkFBa0IsQ0FBQztBQUM1RSxTQUFRLGVBQWUsUUFBTyw4QkFBOEIsQ0FBQztBQUU3RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4R0c7QUFDSCxhQUFhLGNBQWMsR0FBVTtJQUNuQyxrRUFBa0U7SUFDbEUsd0RBQXdEO0lBQ3hELE9BQU8sQ0FBQyxJQUFJLEVBQ0o7UUFDRSxVQUFVLEVBQUUsQ0FBQyxVQUFVLEVBQUUsY0FBYyxLQUFLLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUM7UUFDaEYsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQztLQUNuQyxDQUFDO0lBQ1YsVUFBVTtJQUNWLE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBQyxRQUFRLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQztJQUN2RCxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUMsUUFBUSxFQUFFLG1CQUFtQixFQUFDLENBQUM7SUFDekQsVUFBVTtDQUNYLENBQUM7QUFFRjs7R0FFRztBQUNILGFBQWEsYUFBYSxHQUFHLGNBQWMsQ0FBQztBQUU1Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0dHO0FBQ0gsYUFBYSxlQUFlLEdBQVU7SUFDcEMsa0VBQWtFO0lBQ2xFLHdEQUF3RDtJQUN4RCxPQUFPLENBQUMsS0FBSyxFQUNMO1FBQ0UsVUFBVSxFQUFFLENBQUMsWUFBWSxFQUFFLGNBQWMsS0FBSyxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDO1FBQ3JGLElBQUksRUFBRSxDQUFDLFlBQVksRUFBRSxjQUFjLENBQUM7S0FDckMsQ0FBQztJQUNWLFlBQVk7SUFDWixPQUFPLENBQUMsY0FBYyxFQUFFLEVBQUMsUUFBUSxFQUFFLGtCQUFrQixFQUFDLENBQUM7SUFDdkQsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFDLFFBQVEsRUFBRSxtQkFBbUIsRUFBQyxDQUFDO0lBQ3pELE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBQyxRQUFRLEVBQUUsYUFBYSxFQUFDLENBQUM7Q0FDakQsQ0FBQztBQUVGOztHQUVHO0FBQ0gsYUFBYSxhQUFhLEdBQUcsZUFBZSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRoZSBodHRwIG1vZHVsZSBwcm92aWRlcyBzZXJ2aWNlcyB0byBwZXJmb3JtIGh0dHAgcmVxdWVzdHMuIFRvIGdldCBzdGFydGVkLCBzZWUgdGhlIHtAbGluayBIdHRwfVxuICogY2xhc3MuXG4gKi9cbmltcG9ydCB7cHJvdmlkZSwgUHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtIdHRwLCBKc29ucH0gZnJvbSAnLi9zcmMvaHR0cC9odHRwJztcbmltcG9ydCB7WEhSQmFja2VuZCwgWEhSQ29ubmVjdGlvbn0gZnJvbSAnLi9zcmMvaHR0cC9iYWNrZW5kcy94aHJfYmFja2VuZCc7XG5pbXBvcnQge0pTT05QQmFja2VuZCwgSlNPTlBCYWNrZW5kXywgSlNPTlBDb25uZWN0aW9ufSBmcm9tICcuL3NyYy9odHRwL2JhY2tlbmRzL2pzb25wX2JhY2tlbmQnO1xuaW1wb3J0IHtCcm93c2VyWGhyfSBmcm9tICcuL3NyYy9odHRwL2JhY2tlbmRzL2Jyb3dzZXJfeGhyJztcbmltcG9ydCB7QnJvd3Nlckpzb25wfSBmcm9tICcuL3NyYy9odHRwL2JhY2tlbmRzL2Jyb3dzZXJfanNvbnAnO1xuaW1wb3J0IHtCYXNlUmVxdWVzdE9wdGlvbnMsIFJlcXVlc3RPcHRpb25zfSBmcm9tICcuL3NyYy9odHRwL2Jhc2VfcmVxdWVzdF9vcHRpb25zJztcbmltcG9ydCB7Q29ubmVjdGlvbkJhY2tlbmR9IGZyb20gJy4vc3JjL2h0dHAvaW50ZXJmYWNlcyc7XG5pbXBvcnQge0Jhc2VSZXNwb25zZU9wdGlvbnMsIFJlc3BvbnNlT3B0aW9uc30gZnJvbSAnLi9zcmMvaHR0cC9iYXNlX3Jlc3BvbnNlX29wdGlvbnMnO1xuXG5leHBvcnQge01vY2tDb25uZWN0aW9uLCBNb2NrQmFja2VuZH0gZnJvbSAnLi9zcmMvaHR0cC9iYWNrZW5kcy9tb2NrX2JhY2tlbmQnO1xuZXhwb3J0IHtSZXF1ZXN0fSBmcm9tICcuL3NyYy9odHRwL3N0YXRpY19yZXF1ZXN0JztcbmV4cG9ydCB7UmVzcG9uc2V9IGZyb20gJy4vc3JjL2h0dHAvc3RhdGljX3Jlc3BvbnNlJztcblxuZXhwb3J0IHtcbiAgUmVxdWVzdE9wdGlvbnNBcmdzLFxuICBSZXNwb25zZU9wdGlvbnNBcmdzLFxuICBDb25uZWN0aW9uLFxuICBDb25uZWN0aW9uQmFja2VuZFxufSBmcm9tICcuL3NyYy9odHRwL2ludGVyZmFjZXMnO1xuXG5leHBvcnQge0Jyb3dzZXJYaHJ9IGZyb20gJy4vc3JjL2h0dHAvYmFja2VuZHMvYnJvd3Nlcl94aHInO1xuZXhwb3J0IHtCYXNlUmVxdWVzdE9wdGlvbnMsIFJlcXVlc3RPcHRpb25zfSBmcm9tICcuL3NyYy9odHRwL2Jhc2VfcmVxdWVzdF9vcHRpb25zJztcbmV4cG9ydCB7QmFzZVJlc3BvbnNlT3B0aW9ucywgUmVzcG9uc2VPcHRpb25zfSBmcm9tICcuL3NyYy9odHRwL2Jhc2VfcmVzcG9uc2Vfb3B0aW9ucyc7XG5leHBvcnQge1hIUkJhY2tlbmQsIFhIUkNvbm5lY3Rpb259IGZyb20gJy4vc3JjL2h0dHAvYmFja2VuZHMveGhyX2JhY2tlbmQnO1xuZXhwb3J0IHtKU09OUEJhY2tlbmQsIEpTT05QQ29ubmVjdGlvbn0gZnJvbSAnLi9zcmMvaHR0cC9iYWNrZW5kcy9qc29ucF9iYWNrZW5kJztcbmV4cG9ydCB7SHR0cCwgSnNvbnB9IGZyb20gJy4vc3JjL2h0dHAvaHR0cCc7XG5cbmV4cG9ydCB7SGVhZGVyc30gZnJvbSAnLi9zcmMvaHR0cC9oZWFkZXJzJztcblxuZXhwb3J0IHtSZXNwb25zZVR5cGVzLCBSZWFkeVN0YXRlcywgUmVxdWVzdE1ldGhvZHN9IGZyb20gJy4vc3JjL2h0dHAvZW51bXMnO1xuZXhwb3J0IHtVUkxTZWFyY2hQYXJhbXN9IGZyb20gJy4vc3JjL2h0dHAvdXJsX3NlYXJjaF9wYXJhbXMnO1xuXG4vKipcbiAqIFByb3ZpZGVzIGEgYmFzaWMgc2V0IG9mIGluamVjdGFibGVzIHRvIHVzZSB0aGUge0BsaW5rIEh0dHB9IHNlcnZpY2UgaW4gYW55IGFwcGxpY2F0aW9uLlxuICpcbiAqIFRoZSBgSFRUUF9QUk9WSURFUlNgIHNob3VsZCBiZSBpbmNsdWRlZCBlaXRoZXIgaW4gYSBjb21wb25lbnQncyBpbmplY3RvcixcbiAqIG9yIGluIHRoZSByb290IGluamVjdG9yIHdoZW4gYm9vdHN0cmFwcGluZyBhbiBhcHBsaWNhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvc25qN052P3A9cHJldmlldykpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge2Jvb3RzdHJhcCwgQ29tcG9uZW50LCBOZ0ZvciwgVmlld30gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuICogaW1wb3J0IHtIVFRQX1BST1ZJREVSUywgSHR0cH0gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgcHJvdmlkZXJzOiBbSFRUUF9QUk9WSURFUlNdLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXY+XG4gKiAgICAgICA8aDE+UGVvcGxlPC9oMT5cbiAqICAgICAgIDx1bD5cbiAqICAgICAgICAgPGxpICpuZy1mb3I9XCIjcGVyc29uIG9mIHBlb3BsZVwiPlxuICogICAgICAgICAgIHt7cGVyc29uLm5hbWV9fVxuICogICAgICAgICA8L2xpPlxuICogICAgICAgPC91bD5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW05nRm9yXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHAge1xuICogICBwZW9wbGU6IE9iamVjdFtdO1xuICogICBjb25zdHJ1Y3RvcihodHRwOkh0dHApIHtcbiAqICAgICBodHRwLmdldCgncGVvcGxlLmpzb24nKS5zdWJzY3JpYmUocmVzID0+IHtcbiAqICAgICAgIHRoaXMucGVvcGxlID0gcmVzLmpzb24oKTtcbiAqICAgICB9KTtcbiAqICAgfVxuICogICBhY3RpdmU6Ym9vbGVhbiA9IGZhbHNlO1xuICogICB0b2dnbGVBY3RpdmVTdGF0ZSgpIHtcbiAqICAgICB0aGlzLmFjdGl2ZSA9ICF0aGlzLmFjdGl2ZTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHApXG4gKiAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcbiAqIGBgYFxuICpcbiAqIFRoZSBwcmltYXJ5IHB1YmxpYyBBUEkgaW5jbHVkZWQgaW4gYEhUVFBfUFJPVklERVJTYCBpcyB0aGUge0BsaW5rIEh0dHB9IGNsYXNzLlxuICogSG93ZXZlciwgb3RoZXIgcHJvdmlkZXJzIHJlcXVpcmVkIGJ5IGBIdHRwYCBhcmUgaW5jbHVkZWQsXG4gKiB3aGljaCBtYXkgYmUgYmVuZWZpY2lhbCB0byBvdmVycmlkZSBpbiBjZXJ0YWluIGNhc2VzLlxuICpcbiAqIFRoZSBwcm92aWRlcnMgaW5jbHVkZWQgaW4gYEhUVFBfUFJPVklERVJTYCBpbmNsdWRlOlxuICogICoge0BsaW5rIEh0dHB9XG4gKiAgKiB7QGxpbmsgWEhSQmFja2VuZH1cbiAqICAqIGBCcm93c2VyWEhSYCAtIFByaXZhdGUgZmFjdG9yeSB0byBjcmVhdGUgYFhNTEh0dHBSZXF1ZXN0YCBpbnN0YW5jZXNcbiAqICAqIHtAbGluayBSZXF1ZXN0T3B0aW9uc30gLSBCb3VuZCB0byB7QGxpbmsgQmFzZVJlcXVlc3RPcHRpb25zfSBjbGFzc1xuICogICoge0BsaW5rIFJlc3BvbnNlT3B0aW9uc30gLSBCb3VuZCB0byB7QGxpbmsgQmFzZVJlc3BvbnNlT3B0aW9uc30gY2xhc3NcbiAqXG4gKiBUaGVyZSBtYXkgYmUgY2FzZXMgd2hlcmUgaXQgbWFrZXMgc2Vuc2UgdG8gZXh0ZW5kIHRoZSBiYXNlIHJlcXVlc3Qgb3B0aW9ucyxcbiAqIHN1Y2ggYXMgdG8gYWRkIGEgc2VhcmNoIHN0cmluZyB0byBiZSBhcHBlbmRlZCB0byBhbGwgVVJMcy5cbiAqIFRvIGFjY29tcGxpc2ggdGhpcywgYSBuZXcgcHJvdmlkZXIgZm9yIHtAbGluayBSZXF1ZXN0T3B0aW9uc30gc2hvdWxkXG4gKiBiZSBhZGRlZCBpbiB0aGUgc2FtZSBpbmplY3RvciBhcyBgSFRUUF9QUk9WSURFUlNgLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9hQ01FWGk/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7cHJvdmlkZSwgYm9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG4gKiBpbXBvcnQge0hUVFBfUFJPVklERVJTLCBCYXNlUmVxdWVzdE9wdGlvbnMsIFJlcXVlc3RPcHRpb25zfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqXG4gKiBjbGFzcyBNeU9wdGlvbnMgZXh0ZW5kcyBCYXNlUmVxdWVzdE9wdGlvbnMge1xuICogICBzZWFyY2g6IHN0cmluZyA9ICdjb3JlVGVhbT10cnVlJztcbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwLCBbSFRUUF9QUk9WSURFUlMsIHByb3ZpZGUoUmVxdWVzdE9wdGlvbnMsIHt1c2VDbGFzczogTXlPcHRpb25zfSldKVxuICogICAuY2F0Y2goZXJyID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XG4gKiBgYGBcbiAqXG4gKiBMaWtld2lzZSwgdG8gdXNlIGEgbW9jayBiYWNrZW5kIGZvciB1bml0IHRlc3RzLCB0aGUge0BsaW5rIFhIUkJhY2tlbmR9XG4gKiBwcm92aWRlciBzaG91bGQgYmUgYm91bmQgdG8ge0BsaW5rIE1vY2tCYWNrZW5kfS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvN0xXQUxEP3A9cHJldmlldykpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge3Byb3ZpZGUsIEluamVjdG9yfSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG4gKiBpbXBvcnQge0hUVFBfUFJPVklERVJTLCBIdHRwLCBSZXNwb25zZSwgWEhSQmFja2VuZCwgTW9ja0JhY2tlbmR9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICpcbiAqIHZhciBwZW9wbGUgPSBbe25hbWU6ICdKZWZmJ30sIHtuYW1lOiAnVG9iaWFzJ31dO1xuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogICBIVFRQX1BST1ZJREVSUyxcbiAqICAgTW9ja0JhY2tlbmQsXG4gKiAgIHByb3ZpZGUoWEhSQmFja2VuZCwge3VzZUV4aXN0aW5nOiBNb2NrQmFja2VuZH0pXG4gKiBdKTtcbiAqIHZhciBodHRwID0gaW5qZWN0b3IuZ2V0KEh0dHApO1xuICogdmFyIGJhY2tlbmQgPSBpbmplY3Rvci5nZXQoTW9ja0JhY2tlbmQpO1xuICpcbiAqIC8vIExpc3RlbiBmb3IgYW55IG5ldyByZXF1ZXN0c1xuICogYmFja2VuZC5jb25uZWN0aW9ucy5vYnNlcnZlcih7XG4gKiAgIG5leHQ6IGNvbm5lY3Rpb24gPT4ge1xuICogICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZSh7Ym9keTogcGVvcGxlfSk7XG4gKiAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gKiAgICAgICAvLyBTZW5kIGEgcmVzcG9uc2UgdG8gdGhlIHJlcXVlc3RcbiAqICAgICAgIGNvbm5lY3Rpb24ubW9ja1Jlc3BvbmQocmVzcG9uc2UpO1xuICogICAgIH0pO1xuICogICB9KTtcbiAqXG4gKiBodHRwLmdldCgncGVvcGxlLmpzb24nKS5vYnNlcnZlcih7XG4gKiAgIG5leHQ6IHJlcyA9PiB7XG4gKiAgICAgLy8gUmVzcG9uc2UgY2FtZSBmcm9tIG1vY2sgYmFja2VuZFxuICogICAgIGNvbnNvbGUubG9nKCdmaXJzdCBwZXJzb24nLCByZXMuanNvbigpWzBdLm5hbWUpO1xuICogICB9XG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgSFRUUF9QUk9WSURFUlM6IGFueVtdID0gW1xuICAvLyBUT0RPKHBhc2NhbCk6IHVzZSBmYWN0b3J5IHR5cGUgYW5ub3RhdGlvbnMgb25jZSBzdXBwb3J0ZWQgaW4gRElcbiAgLy8gaXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzMxODNcbiAgcHJvdmlkZShIdHRwLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVzZUZhY3Rvcnk6ICh4aHJCYWNrZW5kLCByZXF1ZXN0T3B0aW9ucykgPT4gbmV3IEh0dHAoeGhyQmFja2VuZCwgcmVxdWVzdE9wdGlvbnMpLFxuICAgICAgICAgICAgZGVwczogW1hIUkJhY2tlbmQsIFJlcXVlc3RPcHRpb25zXVxuICAgICAgICAgIH0pLFxuICBCcm93c2VyWGhyLFxuICBwcm92aWRlKFJlcXVlc3RPcHRpb25zLCB7dXNlQ2xhc3M6IEJhc2VSZXF1ZXN0T3B0aW9uc30pLFxuICBwcm92aWRlKFJlc3BvbnNlT3B0aW9ucywge3VzZUNsYXNzOiBCYXNlUmVzcG9uc2VPcHRpb25zfSksXG4gIFhIUkJhY2tlbmRcbl07XG5cbi8qKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfQklORElOR1MgPSBIVFRQX1BST1ZJREVSUztcblxuLyoqXG4gKiBQcm92aWRlcyBhIGJhc2ljIHNldCBvZiBwcm92aWRlcnMgdG8gdXNlIHRoZSB7QGxpbmsgSnNvbnB9IHNlcnZpY2UgaW4gYW55IGFwcGxpY2F0aW9uLlxuICpcbiAqIFRoZSBgSlNPTlBfUFJPVklERVJTYCBzaG91bGQgYmUgaW5jbHVkZWQgZWl0aGVyIGluIGEgY29tcG9uZW50J3MgaW5qZWN0b3IsXG4gKiBvciBpbiB0aGUgcm9vdCBpbmplY3RvciB3aGVuIGJvb3RzdHJhcHBpbmcgYW4gYXBwbGljYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3ZtZU40Rj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnQsIE5nRm9yLCBWaWV3fSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG4gKiBpbXBvcnQge0pTT05QX1BST1ZJREVSUywgSnNvbnB9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHByb3ZpZGVyczogW0pTT05QX1BST1ZJREVSU10sXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdj5cbiAqICAgICAgIDxoMT5QZW9wbGU8L2gxPlxuICogICAgICAgPHVsPlxuICogICAgICAgICA8bGkgKm5nLWZvcj1cIiNwZXJzb24gb2YgcGVvcGxlXCI+XG4gKiAgICAgICAgICAge3twZXJzb24ubmFtZX19XG4gKiAgICAgICAgIDwvbGk+XG4gKiAgICAgICA8L3VsPlxuICogICAgIDwvZGl2PlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbTmdGb3JdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIHBlb3BsZTogQXJyYXk8T2JqZWN0PjtcbiAqICAgY29uc3RydWN0b3IoanNvbnA6SnNvbnApIHtcbiAqICAgICBqc29ucC5yZXF1ZXN0KCdwZW9wbGUuanNvbicpLnN1YnNjcmliZShyZXMgPT4ge1xuICogICAgICAgdGhpcy5wZW9wbGUgPSByZXMuanNvbigpO1xuICogICAgIH0pXG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoZSBwcmltYXJ5IHB1YmxpYyBBUEkgaW5jbHVkZWQgaW4gYEpTT05QX1BST1ZJREVSU2AgaXMgdGhlIHtAbGluayBKc29ucH0gY2xhc3MuXG4gKiBIb3dldmVyLCBvdGhlciBwcm92aWRlcnMgcmVxdWlyZWQgYnkgYEpzb25wYCBhcmUgaW5jbHVkZWQsXG4gKiB3aGljaCBtYXkgYmUgYmVuZWZpY2lhbCB0byBvdmVycmlkZSBpbiBjZXJ0YWluIGNhc2VzLlxuICpcbiAqIFRoZSBwcm92aWRlcnMgaW5jbHVkZWQgaW4gYEpTT05QX1BST1ZJREVSU2AgaW5jbHVkZTpcbiAqICAqIHtAbGluayBKc29ucH1cbiAqICAqIHtAbGluayBKU09OUEJhY2tlbmR9XG4gKiAgKiBgQnJvd3Nlckpzb25wYCAtIFByaXZhdGUgZmFjdG9yeVxuICogICoge0BsaW5rIFJlcXVlc3RPcHRpb25zfSAtIEJvdW5kIHRvIHtAbGluayBCYXNlUmVxdWVzdE9wdGlvbnN9IGNsYXNzXG4gKiAgKiB7QGxpbmsgUmVzcG9uc2VPcHRpb25zfSAtIEJvdW5kIHRvIHtAbGluayBCYXNlUmVzcG9uc2VPcHRpb25zfSBjbGFzc1xuICpcbiAqIFRoZXJlIG1heSBiZSBjYXNlcyB3aGVyZSBpdCBtYWtlcyBzZW5zZSB0byBleHRlbmQgdGhlIGJhc2UgcmVxdWVzdCBvcHRpb25zLFxuICogc3VjaCBhcyB0byBhZGQgYSBzZWFyY2ggc3RyaW5nIHRvIGJlIGFwcGVuZGVkIHRvIGFsbCBVUkxzLlxuICogVG8gYWNjb21wbGlzaCB0aGlzLCBhIG5ldyBwcm92aWRlciBmb3Ige0BsaW5rIFJlcXVlc3RPcHRpb25zfSBzaG91bGRcbiAqIGJlIGFkZGVkIGluIHRoZSBzYW1lIGluamVjdG9yIGFzIGBKU09OUF9QUk9WSURFUlNgLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9URnVnN3g/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7cHJvdmlkZSwgYm9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG4gKiBpbXBvcnQge0pTT05QX1BST1ZJREVSUywgQmFzZVJlcXVlc3RPcHRpb25zLCBSZXF1ZXN0T3B0aW9uc30gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKlxuICogY2xhc3MgTXlPcHRpb25zIGV4dGVuZHMgQmFzZVJlcXVlc3RPcHRpb25zIHtcbiAqICAgc2VhcmNoOiBzdHJpbmcgPSAnY29yZVRlYW09dHJ1ZSc7XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcCwgW0pTT05QX1BST1ZJREVSUywgcHJvdmlkZShSZXF1ZXN0T3B0aW9ucywge3VzZUNsYXNzOiBNeU9wdGlvbnN9KV0pXG4gKiAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcbiAqIGBgYFxuICpcbiAqIExpa2V3aXNlLCB0byB1c2UgYSBtb2NrIGJhY2tlbmQgZm9yIHVuaXQgdGVzdHMsIHRoZSB7QGxpbmsgSlNPTlBCYWNrZW5kfVxuICogcHJvdmlkZXIgc2hvdWxkIGJlIGJvdW5kIHRvIHtAbGluayBNb2NrQmFja2VuZH0uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0hEcVpXTD9wPXByZXZpZXcpKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtwcm92aWRlLCBJbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuICogaW1wb3J0IHtKU09OUF9QUk9WSURFUlMsIEpzb25wLCBSZXNwb25zZSwgSlNPTlBCYWNrZW5kLCBNb2NrQmFja2VuZH0gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKlxuICogdmFyIHBlb3BsZSA9IFt7bmFtZTogJ0plZmYnfSwge25hbWU6ICdUb2JpYXMnfV07XG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICAgSlNPTlBfUFJPVklERVJTLFxuICogICBNb2NrQmFja2VuZCxcbiAqICAgcHJvdmlkZShKU09OUEJhY2tlbmQsIHt1c2VFeGlzdGluZzogTW9ja0JhY2tlbmR9KVxuICogXSk7XG4gKiB2YXIganNvbnAgPSBpbmplY3Rvci5nZXQoSnNvbnApO1xuICogdmFyIGJhY2tlbmQgPSBpbmplY3Rvci5nZXQoTW9ja0JhY2tlbmQpO1xuICpcbiAqIC8vIExpc3RlbiBmb3IgYW55IG5ldyByZXF1ZXN0c1xuICogYmFja2VuZC5jb25uZWN0aW9ucy5vYnNlcnZlcih7XG4gKiAgIG5leHQ6IGNvbm5lY3Rpb24gPT4ge1xuICogICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZSh7Ym9keTogcGVvcGxlfSk7XG4gKiAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gKiAgICAgICAvLyBTZW5kIGEgcmVzcG9uc2UgdG8gdGhlIHJlcXVlc3RcbiAqICAgICAgIGNvbm5lY3Rpb24ubW9ja1Jlc3BvbmQocmVzcG9uc2UpO1xuICogICAgIH0pO1xuICogICB9KTtcblxuICoganNvbnAuZ2V0KCdwZW9wbGUuanNvbicpLm9ic2VydmVyKHtcbiAqICAgbmV4dDogcmVzID0+IHtcbiAqICAgICAvLyBSZXNwb25zZSBjYW1lIGZyb20gbW9jayBiYWNrZW5kXG4gKiAgICAgY29uc29sZS5sb2coJ2ZpcnN0IHBlcnNvbicsIHJlcy5qc29uKClbMF0ubmFtZSk7XG4gKiAgIH1cbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBKU09OUF9QUk9WSURFUlM6IGFueVtdID0gW1xuICAvLyBUT0RPKHBhc2NhbCk6IHVzZSBmYWN0b3J5IHR5cGUgYW5ub3RhdGlvbnMgb25jZSBzdXBwb3J0ZWQgaW4gRElcbiAgLy8gaXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzMxODNcbiAgcHJvdmlkZShKc29ucCxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1c2VGYWN0b3J5OiAoanNvbnBCYWNrZW5kLCByZXF1ZXN0T3B0aW9ucykgPT4gbmV3IEpzb25wKGpzb25wQmFja2VuZCwgcmVxdWVzdE9wdGlvbnMpLFxuICAgICAgICAgICAgZGVwczogW0pTT05QQmFja2VuZCwgUmVxdWVzdE9wdGlvbnNdXG4gICAgICAgICAgfSksXG4gIEJyb3dzZXJKc29ucCxcbiAgcHJvdmlkZShSZXF1ZXN0T3B0aW9ucywge3VzZUNsYXNzOiBCYXNlUmVxdWVzdE9wdGlvbnN9KSxcbiAgcHJvdmlkZShSZXNwb25zZU9wdGlvbnMsIHt1c2VDbGFzczogQmFzZVJlc3BvbnNlT3B0aW9uc30pLFxuICBwcm92aWRlKEpTT05QQmFja2VuZCwge3VzZUNsYXNzOiBKU09OUEJhY2tlbmRffSlcbl07XG5cbi8qKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IEpTT05fQklORElOR1MgPSBKU09OUF9QUk9WSURFUlM7XG4iXX0=