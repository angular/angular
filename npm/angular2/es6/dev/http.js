import { provide } from 'angular2/core';
import { Http, Jsonp } from './src/http/http';
import { XHRBackend } from './src/http/backends/xhr_backend';
import { JSONPBackend, JSONPBackend_ } from './src/http/backends/jsonp_backend';
import { BrowserXhr } from './src/http/backends/browser_xhr';
import { BrowserJsonp } from './src/http/backends/browser_jsonp';
import { BaseRequestOptions, RequestOptions } from './src/http/base_request_options';
import { BaseResponseOptions, ResponseOptions } from './src/http/base_response_options';
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
export { ResponseType, ReadyState, RequestMethod } from './src/http/enums';
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
 * import {Component} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {NgFor} from 'angular2/common';
 * import {HTTP_PROVIDERS, Http} from 'angular2/http';
 *
 * @Component({
 *   selector: 'app',
 *   providers: [HTTP_PROVIDERS],
 *   template: `
 *     <div>
 *       <h1>People</h1>
 *       <ul>
 *         <li *ngFor="let person of people">
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
 * import {provide} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
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
 * import {provide} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
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
 *   }
 * });
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
 * See {@link HTTP_PROVIDERS} instead.
 *
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
 * import {Component} from 'angular2/core';
 * import {NgFor} from 'angular2/common';
 * import {JSONP_PROVIDERS, Jsonp} from 'angular2/http';
 *
 * @Component({
 *   selector: 'app',
 *   providers: [JSONP_PROVIDERS],
 *   template: `
 *     <div>
 *       <h1>People</h1>
 *       <ul>
 *         <li *ngFor="let person of people">
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
 * import {provide} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
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
 * import {provide, Injector} from 'angular2/core';
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
 *   }
 * });

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
 * See {@link JSONP_PROVIDERS} instead.
 *
 * @deprecated
 */
export const JSON_BINDINGS = JSONP_PROVIDERS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL2h0dHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BTU8sRUFBQyxPQUFPLEVBQVcsTUFBTSxlQUFlO09BQ3hDLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxNQUFNLGlCQUFpQjtPQUNwQyxFQUFDLFVBQVUsRUFBZ0IsTUFBTSxpQ0FBaUM7T0FDbEUsRUFBQyxZQUFZLEVBQUUsYUFBYSxFQUFrQixNQUFNLG1DQUFtQztPQUN2RixFQUFDLFVBQVUsRUFBQyxNQUFNLGlDQUFpQztPQUNuRCxFQUFDLFlBQVksRUFBQyxNQUFNLG1DQUFtQztPQUN2RCxFQUFDLGtCQUFrQixFQUFFLGNBQWMsRUFBQyxNQUFNLGlDQUFpQztPQUUzRSxFQUFDLG1CQUFtQixFQUFFLGVBQWUsRUFBQyxNQUFNLGtDQUFrQztBQUNyRixTQUFRLE9BQU8sUUFBTywyQkFBMkIsQ0FBQztBQUNsRCxTQUFRLFFBQVEsUUFBTyw0QkFBNEIsQ0FBQztBQUVwRCxTQUdFLFVBQVUsRUFDVixpQkFBaUIsUUFDWix1QkFBdUIsQ0FBQztBQUUvQixTQUFRLFVBQVUsUUFBTyxpQ0FBaUMsQ0FBQztBQUMzRCxTQUFRLGtCQUFrQixFQUFFLGNBQWMsUUFBTyxpQ0FBaUMsQ0FBQztBQUNuRixTQUFRLG1CQUFtQixFQUFFLGVBQWUsUUFBTyxrQ0FBa0MsQ0FBQztBQUN0RixTQUFRLFVBQVUsRUFBRSxhQUFhLFFBQU8saUNBQWlDLENBQUM7QUFDMUUsU0FBUSxZQUFZLEVBQUUsZUFBZSxRQUFPLG1DQUFtQyxDQUFDO0FBQ2hGLFNBQVEsSUFBSSxFQUFFLEtBQUssUUFBTyxpQkFBaUIsQ0FBQztBQUU1QyxTQUFRLE9BQU8sUUFBTyxvQkFBb0IsQ0FBQztBQUUzQyxTQUFRLFlBQVksRUFBRSxVQUFVLEVBQUUsYUFBYSxRQUFPLGtCQUFrQixDQUFDO0FBQ3pFLFNBQVEsZUFBZSxRQUFPLDhCQUE4QixDQUFDO0FBRTdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9IRztBQUNILE9BQU8sTUFBTSxjQUFjLEdBQVU7SUFDbkMsa0VBQWtFO0lBQ2xFLHdEQUF3RDtJQUN4RCxPQUFPLENBQUMsSUFBSSxFQUNKO1FBQ0UsVUFBVSxFQUFFLENBQUMsVUFBc0IsRUFBRSxjQUE4QixLQUNuRCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDO1FBQ3BELElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUM7S0FDbkMsQ0FBQztJQUNWLFVBQVU7SUFDVixPQUFPLENBQUMsY0FBYyxFQUFFLEVBQUMsUUFBUSxFQUFFLGtCQUFrQixFQUFDLENBQUM7SUFDdkQsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFDLFFBQVEsRUFBRSxtQkFBbUIsRUFBQyxDQUFDO0lBQ3pELFVBQVU7Q0FDWCxDQUFDO0FBRUY7Ozs7R0FJRztBQUNILE9BQU8sTUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDO0FBRTVDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMEdHO0FBQ0gsT0FBTyxNQUFNLGVBQWUsR0FBVTtJQUNwQyxrRUFBa0U7SUFDbEUsd0RBQXdEO0lBQ3hELE9BQU8sQ0FBQyxLQUFLLEVBQ0w7UUFDRSxVQUFVLEVBQUUsQ0FBQyxZQUEwQixFQUFFLGNBQThCLEtBQ3ZELElBQUksS0FBSyxDQUFDLFlBQVksRUFBRSxjQUFjLENBQUM7UUFDdkQsSUFBSSxFQUFFLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQztLQUNyQyxDQUFDO0lBQ1YsWUFBWTtJQUNaLE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBQyxRQUFRLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQztJQUN2RCxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUMsUUFBUSxFQUFFLG1CQUFtQixFQUFDLENBQUM7SUFDekQsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUMsQ0FBQztDQUNqRCxDQUFDO0FBRUY7Ozs7R0FJRztBQUNILE9BQU8sTUFBTSxhQUFhLEdBQUcsZUFBZSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRoZSBodHRwIG1vZHVsZSBwcm92aWRlcyBzZXJ2aWNlcyB0byBwZXJmb3JtIGh0dHAgcmVxdWVzdHMuIFRvIGdldCBzdGFydGVkLCBzZWUgdGhlIHtAbGluayBIdHRwfVxuICogY2xhc3MuXG4gKi9cbmltcG9ydCB7cHJvdmlkZSwgUHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtIdHRwLCBKc29ucH0gZnJvbSAnLi9zcmMvaHR0cC9odHRwJztcbmltcG9ydCB7WEhSQmFja2VuZCwgWEhSQ29ubmVjdGlvbn0gZnJvbSAnLi9zcmMvaHR0cC9iYWNrZW5kcy94aHJfYmFja2VuZCc7XG5pbXBvcnQge0pTT05QQmFja2VuZCwgSlNPTlBCYWNrZW5kXywgSlNPTlBDb25uZWN0aW9ufSBmcm9tICcuL3NyYy9odHRwL2JhY2tlbmRzL2pzb25wX2JhY2tlbmQnO1xuaW1wb3J0IHtCcm93c2VyWGhyfSBmcm9tICcuL3NyYy9odHRwL2JhY2tlbmRzL2Jyb3dzZXJfeGhyJztcbmltcG9ydCB7QnJvd3Nlckpzb25wfSBmcm9tICcuL3NyYy9odHRwL2JhY2tlbmRzL2Jyb3dzZXJfanNvbnAnO1xuaW1wb3J0IHtCYXNlUmVxdWVzdE9wdGlvbnMsIFJlcXVlc3RPcHRpb25zfSBmcm9tICcuL3NyYy9odHRwL2Jhc2VfcmVxdWVzdF9vcHRpb25zJztcbmltcG9ydCB7Q29ubmVjdGlvbkJhY2tlbmR9IGZyb20gJy4vc3JjL2h0dHAvaW50ZXJmYWNlcyc7XG5pbXBvcnQge0Jhc2VSZXNwb25zZU9wdGlvbnMsIFJlc3BvbnNlT3B0aW9uc30gZnJvbSAnLi9zcmMvaHR0cC9iYXNlX3Jlc3BvbnNlX29wdGlvbnMnO1xuZXhwb3J0IHtSZXF1ZXN0fSBmcm9tICcuL3NyYy9odHRwL3N0YXRpY19yZXF1ZXN0JztcbmV4cG9ydCB7UmVzcG9uc2V9IGZyb20gJy4vc3JjL2h0dHAvc3RhdGljX3Jlc3BvbnNlJztcblxuZXhwb3J0IHtcbiAgUmVxdWVzdE9wdGlvbnNBcmdzLFxuICBSZXNwb25zZU9wdGlvbnNBcmdzLFxuICBDb25uZWN0aW9uLFxuICBDb25uZWN0aW9uQmFja2VuZFxufSBmcm9tICcuL3NyYy9odHRwL2ludGVyZmFjZXMnO1xuXG5leHBvcnQge0Jyb3dzZXJYaHJ9IGZyb20gJy4vc3JjL2h0dHAvYmFja2VuZHMvYnJvd3Nlcl94aHInO1xuZXhwb3J0IHtCYXNlUmVxdWVzdE9wdGlvbnMsIFJlcXVlc3RPcHRpb25zfSBmcm9tICcuL3NyYy9odHRwL2Jhc2VfcmVxdWVzdF9vcHRpb25zJztcbmV4cG9ydCB7QmFzZVJlc3BvbnNlT3B0aW9ucywgUmVzcG9uc2VPcHRpb25zfSBmcm9tICcuL3NyYy9odHRwL2Jhc2VfcmVzcG9uc2Vfb3B0aW9ucyc7XG5leHBvcnQge1hIUkJhY2tlbmQsIFhIUkNvbm5lY3Rpb259IGZyb20gJy4vc3JjL2h0dHAvYmFja2VuZHMveGhyX2JhY2tlbmQnO1xuZXhwb3J0IHtKU09OUEJhY2tlbmQsIEpTT05QQ29ubmVjdGlvbn0gZnJvbSAnLi9zcmMvaHR0cC9iYWNrZW5kcy9qc29ucF9iYWNrZW5kJztcbmV4cG9ydCB7SHR0cCwgSnNvbnB9IGZyb20gJy4vc3JjL2h0dHAvaHR0cCc7XG5cbmV4cG9ydCB7SGVhZGVyc30gZnJvbSAnLi9zcmMvaHR0cC9oZWFkZXJzJztcblxuZXhwb3J0IHtSZXNwb25zZVR5cGUsIFJlYWR5U3RhdGUsIFJlcXVlc3RNZXRob2R9IGZyb20gJy4vc3JjL2h0dHAvZW51bXMnO1xuZXhwb3J0IHtVUkxTZWFyY2hQYXJhbXN9IGZyb20gJy4vc3JjL2h0dHAvdXJsX3NlYXJjaF9wYXJhbXMnO1xuXG4vKipcbiAqIFByb3ZpZGVzIGEgYmFzaWMgc2V0IG9mIGluamVjdGFibGVzIHRvIHVzZSB0aGUge0BsaW5rIEh0dHB9IHNlcnZpY2UgaW4gYW55IGFwcGxpY2F0aW9uLlxuICpcbiAqIFRoZSBgSFRUUF9QUk9WSURFUlNgIHNob3VsZCBiZSBpbmNsdWRlZCBlaXRoZXIgaW4gYSBjb21wb25lbnQncyBpbmplY3RvcixcbiAqIG9yIGluIHRoZSByb290IGluamVjdG9yIHdoZW4gYm9vdHN0cmFwcGluZyBhbiBhcHBsaWNhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvc25qN052P3A9cHJldmlldykpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG4gKiBpbXBvcnQge05nRm9yfSBmcm9tICdhbmd1bGFyMi9jb21tb24nO1xuICogaW1wb3J0IHtIVFRQX1BST1ZJREVSUywgSHR0cH0gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgcHJvdmlkZXJzOiBbSFRUUF9QUk9WSURFUlNdLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXY+XG4gKiAgICAgICA8aDE+UGVvcGxlPC9oMT5cbiAqICAgICAgIDx1bD5cbiAqICAgICAgICAgPGxpICpuZ0Zvcj1cImxldCBwZXJzb24gb2YgcGVvcGxlXCI+XG4gKiAgICAgICAgICAge3twZXJzb24ubmFtZX19XG4gKiAgICAgICAgIDwvbGk+XG4gKiAgICAgICA8L3VsPlxuICogICAgIDwvZGl2PlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbTmdGb3JdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIHBlb3BsZTogT2JqZWN0W107XG4gKiAgIGNvbnN0cnVjdG9yKGh0dHA6SHR0cCkge1xuICogICAgIGh0dHAuZ2V0KCdwZW9wbGUuanNvbicpLnN1YnNjcmliZShyZXMgPT4ge1xuICogICAgICAgdGhpcy5wZW9wbGUgPSByZXMuanNvbigpO1xuICogICAgIH0pO1xuICogICB9XG4gKiAgIGFjdGl2ZTpib29sZWFuID0gZmFsc2U7XG4gKiAgIHRvZ2dsZUFjdGl2ZVN0YXRlKCkge1xuICogICAgIHRoaXMuYWN0aXZlID0gIXRoaXMuYWN0aXZlO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcClcbiAqICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKGVycikpO1xuICogYGBgXG4gKlxuICogVGhlIHByaW1hcnkgcHVibGljIEFQSSBpbmNsdWRlZCBpbiBgSFRUUF9QUk9WSURFUlNgIGlzIHRoZSB7QGxpbmsgSHR0cH0gY2xhc3MuXG4gKiBIb3dldmVyLCBvdGhlciBwcm92aWRlcnMgcmVxdWlyZWQgYnkgYEh0dHBgIGFyZSBpbmNsdWRlZCxcbiAqIHdoaWNoIG1heSBiZSBiZW5lZmljaWFsIHRvIG92ZXJyaWRlIGluIGNlcnRhaW4gY2FzZXMuXG4gKlxuICogVGhlIHByb3ZpZGVycyBpbmNsdWRlZCBpbiBgSFRUUF9QUk9WSURFUlNgIGluY2x1ZGU6XG4gKiAgKiB7QGxpbmsgSHR0cH1cbiAqICAqIHtAbGluayBYSFJCYWNrZW5kfVxuICogICogYEJyb3dzZXJYSFJgIC0gUHJpdmF0ZSBmYWN0b3J5IHRvIGNyZWF0ZSBgWE1MSHR0cFJlcXVlc3RgIGluc3RhbmNlc1xuICogICoge0BsaW5rIFJlcXVlc3RPcHRpb25zfSAtIEJvdW5kIHRvIHtAbGluayBCYXNlUmVxdWVzdE9wdGlvbnN9IGNsYXNzXG4gKiAgKiB7QGxpbmsgUmVzcG9uc2VPcHRpb25zfSAtIEJvdW5kIHRvIHtAbGluayBCYXNlUmVzcG9uc2VPcHRpb25zfSBjbGFzc1xuICpcbiAqIFRoZXJlIG1heSBiZSBjYXNlcyB3aGVyZSBpdCBtYWtlcyBzZW5zZSB0byBleHRlbmQgdGhlIGJhc2UgcmVxdWVzdCBvcHRpb25zLFxuICogc3VjaCBhcyB0byBhZGQgYSBzZWFyY2ggc3RyaW5nIHRvIGJlIGFwcGVuZGVkIHRvIGFsbCBVUkxzLlxuICogVG8gYWNjb21wbGlzaCB0aGlzLCBhIG5ldyBwcm92aWRlciBmb3Ige0BsaW5rIFJlcXVlc3RPcHRpb25zfSBzaG91bGRcbiAqIGJlIGFkZGVkIGluIHRoZSBzYW1lIGluamVjdG9yIGFzIGBIVFRQX1BST1ZJREVSU2AuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2FDTUVYaT9wPXByZXZpZXcpKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtwcm92aWRlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcbiAqIGltcG9ydCB7SFRUUF9QUk9WSURFUlMsIEJhc2VSZXF1ZXN0T3B0aW9ucywgUmVxdWVzdE9wdGlvbnN9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICpcbiAqIGNsYXNzIE15T3B0aW9ucyBleHRlbmRzIEJhc2VSZXF1ZXN0T3B0aW9ucyB7XG4gKiAgIHNlYXJjaDogc3RyaW5nID0gJ2NvcmVUZWFtPXRydWUnO1xuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHAsIFtIVFRQX1BST1ZJREVSUywgcHJvdmlkZShSZXF1ZXN0T3B0aW9ucywge3VzZUNsYXNzOiBNeU9wdGlvbnN9KV0pXG4gKiAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcbiAqIGBgYFxuICpcbiAqIExpa2V3aXNlLCB0byB1c2UgYSBtb2NrIGJhY2tlbmQgZm9yIHVuaXQgdGVzdHMsIHRoZSB7QGxpbmsgWEhSQmFja2VuZH1cbiAqIHByb3ZpZGVyIHNob3VsZCBiZSBib3VuZCB0byB7QGxpbmsgTW9ja0JhY2tlbmR9LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC83TFdBTEQ/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7cHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG4gKiBpbXBvcnQge0hUVFBfUFJPVklERVJTLCBIdHRwLCBSZXNwb25zZSwgWEhSQmFja2VuZH0gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKiBpbXBvcnQge01vY2tCYWNrZW5kfSBmcm9tICdhbmd1bGFyMi9odHRwL3Rlc3RpbmcnO1xuICpcbiAqIHZhciBwZW9wbGUgPSBbe25hbWU6ICdKZWZmJ30sIHtuYW1lOiAnVG9iaWFzJ31dO1xuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogICBIVFRQX1BST1ZJREVSUyxcbiAqICAgTW9ja0JhY2tlbmQsXG4gKiAgIHByb3ZpZGUoWEhSQmFja2VuZCwge3VzZUV4aXN0aW5nOiBNb2NrQmFja2VuZH0pXG4gKiBdKTtcbiAqIHZhciBodHRwID0gaW5qZWN0b3IuZ2V0KEh0dHApO1xuICogdmFyIGJhY2tlbmQgPSBpbmplY3Rvci5nZXQoTW9ja0JhY2tlbmQpO1xuICpcbiAqIC8vIExpc3RlbiBmb3IgYW55IG5ldyByZXF1ZXN0c1xuICogYmFja2VuZC5jb25uZWN0aW9ucy5vYnNlcnZlcih7XG4gKiAgIG5leHQ6IGNvbm5lY3Rpb24gPT4ge1xuICogICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZSh7Ym9keTogcGVvcGxlfSk7XG4gKiAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gKiAgICAgICAvLyBTZW5kIGEgcmVzcG9uc2UgdG8gdGhlIHJlcXVlc3RcbiAqICAgICAgIGNvbm5lY3Rpb24ubW9ja1Jlc3BvbmQocmVzcG9uc2UpO1xuICogICAgIH0pO1xuICogICB9XG4gKiB9KTtcbiAqXG4gKiBodHRwLmdldCgncGVvcGxlLmpzb24nKS5vYnNlcnZlcih7XG4gKiAgIG5leHQ6IHJlcyA9PiB7XG4gKiAgICAgLy8gUmVzcG9uc2UgY2FtZSBmcm9tIG1vY2sgYmFja2VuZFxuICogICAgIGNvbnNvbGUubG9nKCdmaXJzdCBwZXJzb24nLCByZXMuanNvbigpWzBdLm5hbWUpO1xuICogICB9XG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgSFRUUF9QUk9WSURFUlM6IGFueVtdID0gW1xuICAvLyBUT0RPKHBhc2NhbCk6IHVzZSBmYWN0b3J5IHR5cGUgYW5ub3RhdGlvbnMgb25jZSBzdXBwb3J0ZWQgaW4gRElcbiAgLy8gaXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzMxODNcbiAgcHJvdmlkZShIdHRwLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVzZUZhY3Rvcnk6ICh4aHJCYWNrZW5kOiBYSFJCYWNrZW5kLCByZXF1ZXN0T3B0aW9uczogUmVxdWVzdE9wdGlvbnMpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEh0dHAoeGhyQmFja2VuZCwgcmVxdWVzdE9wdGlvbnMpLFxuICAgICAgICAgICAgZGVwczogW1hIUkJhY2tlbmQsIFJlcXVlc3RPcHRpb25zXVxuICAgICAgICAgIH0pLFxuICBCcm93c2VyWGhyLFxuICBwcm92aWRlKFJlcXVlc3RPcHRpb25zLCB7dXNlQ2xhc3M6IEJhc2VSZXF1ZXN0T3B0aW9uc30pLFxuICBwcm92aWRlKFJlc3BvbnNlT3B0aW9ucywge3VzZUNsYXNzOiBCYXNlUmVzcG9uc2VPcHRpb25zfSksXG4gIFhIUkJhY2tlbmRcbl07XG5cbi8qKlxuICogU2VlIHtAbGluayBIVFRQX1BST1ZJREVSU30gaW5zdGVhZC5cbiAqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgY29uc3QgSFRUUF9CSU5ESU5HUyA9IEhUVFBfUFJPVklERVJTO1xuXG4vKipcbiAqIFByb3ZpZGVzIGEgYmFzaWMgc2V0IG9mIHByb3ZpZGVycyB0byB1c2UgdGhlIHtAbGluayBKc29ucH0gc2VydmljZSBpbiBhbnkgYXBwbGljYXRpb24uXG4gKlxuICogVGhlIGBKU09OUF9QUk9WSURFUlNgIHNob3VsZCBiZSBpbmNsdWRlZCBlaXRoZXIgaW4gYSBjb21wb25lbnQncyBpbmplY3RvcixcbiAqIG9yIGluIHRoZSByb290IGluamVjdG9yIHdoZW4gYm9vdHN0cmFwcGluZyBhbiBhcHBsaWNhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvdm1lTjRGP3A9cHJldmlldykpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge05nRm9yfSBmcm9tICdhbmd1bGFyMi9jb21tb24nO1xuICogaW1wb3J0IHtKU09OUF9QUk9WSURFUlMsIEpzb25wfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICBwcm92aWRlcnM6IFtKU09OUF9QUk9WSURFUlNdLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXY+XG4gKiAgICAgICA8aDE+UGVvcGxlPC9oMT5cbiAqICAgICAgIDx1bD5cbiAqICAgICAgICAgPGxpICpuZ0Zvcj1cImxldCBwZXJzb24gb2YgcGVvcGxlXCI+XG4gKiAgICAgICAgICAge3twZXJzb24ubmFtZX19XG4gKiAgICAgICAgIDwvbGk+XG4gKiAgICAgICA8L3VsPlxuICogICAgIDwvZGl2PlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbTmdGb3JdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIHBlb3BsZTogQXJyYXk8T2JqZWN0PjtcbiAqICAgY29uc3RydWN0b3IoanNvbnA6SnNvbnApIHtcbiAqICAgICBqc29ucC5yZXF1ZXN0KCdwZW9wbGUuanNvbicpLnN1YnNjcmliZShyZXMgPT4ge1xuICogICAgICAgdGhpcy5wZW9wbGUgPSByZXMuanNvbigpO1xuICogICAgIH0pXG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoZSBwcmltYXJ5IHB1YmxpYyBBUEkgaW5jbHVkZWQgaW4gYEpTT05QX1BST1ZJREVSU2AgaXMgdGhlIHtAbGluayBKc29ucH0gY2xhc3MuXG4gKiBIb3dldmVyLCBvdGhlciBwcm92aWRlcnMgcmVxdWlyZWQgYnkgYEpzb25wYCBhcmUgaW5jbHVkZWQsXG4gKiB3aGljaCBtYXkgYmUgYmVuZWZpY2lhbCB0byBvdmVycmlkZSBpbiBjZXJ0YWluIGNhc2VzLlxuICpcbiAqIFRoZSBwcm92aWRlcnMgaW5jbHVkZWQgaW4gYEpTT05QX1BST1ZJREVSU2AgaW5jbHVkZTpcbiAqICAqIHtAbGluayBKc29ucH1cbiAqICAqIHtAbGluayBKU09OUEJhY2tlbmR9XG4gKiAgKiBgQnJvd3Nlckpzb25wYCAtIFByaXZhdGUgZmFjdG9yeVxuICogICoge0BsaW5rIFJlcXVlc3RPcHRpb25zfSAtIEJvdW5kIHRvIHtAbGluayBCYXNlUmVxdWVzdE9wdGlvbnN9IGNsYXNzXG4gKiAgKiB7QGxpbmsgUmVzcG9uc2VPcHRpb25zfSAtIEJvdW5kIHRvIHtAbGluayBCYXNlUmVzcG9uc2VPcHRpb25zfSBjbGFzc1xuICpcbiAqIFRoZXJlIG1heSBiZSBjYXNlcyB3aGVyZSBpdCBtYWtlcyBzZW5zZSB0byBleHRlbmQgdGhlIGJhc2UgcmVxdWVzdCBvcHRpb25zLFxuICogc3VjaCBhcyB0byBhZGQgYSBzZWFyY2ggc3RyaW5nIHRvIGJlIGFwcGVuZGVkIHRvIGFsbCBVUkxzLlxuICogVG8gYWNjb21wbGlzaCB0aGlzLCBhIG5ldyBwcm92aWRlciBmb3Ige0BsaW5rIFJlcXVlc3RPcHRpb25zfSBzaG91bGRcbiAqIGJlIGFkZGVkIGluIHRoZSBzYW1lIGluamVjdG9yIGFzIGBKU09OUF9QUk9WSURFUlNgLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9URnVnN3g/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7cHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG4gKiBpbXBvcnQge0pTT05QX1BST1ZJREVSUywgQmFzZVJlcXVlc3RPcHRpb25zLCBSZXF1ZXN0T3B0aW9uc30gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKlxuICogY2xhc3MgTXlPcHRpb25zIGV4dGVuZHMgQmFzZVJlcXVlc3RPcHRpb25zIHtcbiAqICAgc2VhcmNoOiBzdHJpbmcgPSAnY29yZVRlYW09dHJ1ZSc7XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcCwgW0pTT05QX1BST1ZJREVSUywgcHJvdmlkZShSZXF1ZXN0T3B0aW9ucywge3VzZUNsYXNzOiBNeU9wdGlvbnN9KV0pXG4gKiAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcbiAqIGBgYFxuICpcbiAqIExpa2V3aXNlLCB0byB1c2UgYSBtb2NrIGJhY2tlbmQgZm9yIHVuaXQgdGVzdHMsIHRoZSB7QGxpbmsgSlNPTlBCYWNrZW5kfVxuICogcHJvdmlkZXIgc2hvdWxkIGJlIGJvdW5kIHRvIHtAbGluayBNb2NrQmFja2VuZH0uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0hEcVpXTD9wPXByZXZpZXcpKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtwcm92aWRlLCBJbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge0pTT05QX1BST1ZJREVSUywgSnNvbnAsIFJlc3BvbnNlLCBKU09OUEJhY2tlbmR9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICogaW1wb3J0IHtNb2NrQmFja2VuZH0gZnJvbSAnYW5ndWxhcjIvaHR0cC90ZXN0aW5nJztcbiAqXG4gKiB2YXIgcGVvcGxlID0gW3tuYW1lOiAnSmVmZid9LCB7bmFtZTogJ1RvYmlhcyd9XTtcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogICBKU09OUF9QUk9WSURFUlMsXG4gKiAgIE1vY2tCYWNrZW5kLFxuICogICBwcm92aWRlKEpTT05QQmFja2VuZCwge3VzZUV4aXN0aW5nOiBNb2NrQmFja2VuZH0pXG4gKiBdKTtcbiAqIHZhciBqc29ucCA9IGluamVjdG9yLmdldChKc29ucCk7XG4gKiB2YXIgYmFja2VuZCA9IGluamVjdG9yLmdldChNb2NrQmFja2VuZCk7XG4gKlxuICogLy8gTGlzdGVuIGZvciBhbnkgbmV3IHJlcXVlc3RzXG4gKiBiYWNrZW5kLmNvbm5lY3Rpb25zLm9ic2VydmVyKHtcbiAqICAgbmV4dDogY29ubmVjdGlvbiA9PiB7XG4gKiAgICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKHtib2R5OiBwZW9wbGV9KTtcbiAqICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAqICAgICAgIC8vIFNlbmQgYSByZXNwb25zZSB0byB0aGUgcmVxdWVzdFxuICogICAgICAgY29ubmVjdGlvbi5tb2NrUmVzcG9uZChyZXNwb25zZSk7XG4gKiAgICAgfSk7XG4gKiAgIH1cbiAqIH0pO1xuXG4gKiBqc29ucC5nZXQoJ3Blb3BsZS5qc29uJykub2JzZXJ2ZXIoe1xuICogICBuZXh0OiByZXMgPT4ge1xuICogICAgIC8vIFJlc3BvbnNlIGNhbWUgZnJvbSBtb2NrIGJhY2tlbmRcbiAqICAgICBjb25zb2xlLmxvZygnZmlyc3QgcGVyc29uJywgcmVzLmpzb24oKVswXS5uYW1lKTtcbiAqICAgfVxuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IEpTT05QX1BST1ZJREVSUzogYW55W10gPSBbXG4gIC8vIFRPRE8ocGFzY2FsKTogdXNlIGZhY3RvcnkgdHlwZSBhbm5vdGF0aW9ucyBvbmNlIHN1cHBvcnRlZCBpbiBESVxuICAvLyBpc3N1ZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMzE4M1xuICBwcm92aWRlKEpzb25wLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVzZUZhY3Rvcnk6IChqc29ucEJhY2tlbmQ6IEpTT05QQmFja2VuZCwgcmVxdWVzdE9wdGlvbnM6IFJlcXVlc3RPcHRpb25zKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBKc29ucChqc29ucEJhY2tlbmQsIHJlcXVlc3RPcHRpb25zKSxcbiAgICAgICAgICAgIGRlcHM6IFtKU09OUEJhY2tlbmQsIFJlcXVlc3RPcHRpb25zXVxuICAgICAgICAgIH0pLFxuICBCcm93c2VySnNvbnAsXG4gIHByb3ZpZGUoUmVxdWVzdE9wdGlvbnMsIHt1c2VDbGFzczogQmFzZVJlcXVlc3RPcHRpb25zfSksXG4gIHByb3ZpZGUoUmVzcG9uc2VPcHRpb25zLCB7dXNlQ2xhc3M6IEJhc2VSZXNwb25zZU9wdGlvbnN9KSxcbiAgcHJvdmlkZShKU09OUEJhY2tlbmQsIHt1c2VDbGFzczogSlNPTlBCYWNrZW5kX30pXG5dO1xuXG4vKipcbiAqIFNlZSB7QGxpbmsgSlNPTlBfUFJPVklERVJTfSBpbnN0ZWFkLlxuICpcbiAqIEBkZXByZWNhdGVkXG4gKi9cbmV4cG9ydCBjb25zdCBKU09OX0JJTkRJTkdTID0gSlNPTlBfUFJPVklERVJTO1xuIl19