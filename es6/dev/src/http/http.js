var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isString, isPresent } from 'angular2/src/facade/lang';
import { makeTypeError } from 'angular2/src/facade/exceptions';
import { Injectable } from 'angular2/angular2';
import { ConnectionBackend } from './interfaces';
import { Request } from './static_request';
import { RequestOptions } from './base_request_options';
import { RequestMethods } from './enums';
function httpRequest(backend, request) {
    return backend.createConnection(request).response;
}
function mergeOptions(defaultOpts, providedOpts, method, url) {
    var newOptions = defaultOpts;
    if (isPresent(providedOpts)) {
        // Hack so Dart can used named parameters
        return newOptions.merge(new RequestOptions({
            method: providedOpts.method || method,
            url: providedOpts.url || url,
            search: providedOpts.search,
            headers: providedOpts.headers,
            body: providedOpts.body
        }));
    }
    if (isPresent(method)) {
        return newOptions.merge(new RequestOptions({ method: method, url: url }));
    }
    else {
        return newOptions.merge(new RequestOptions({ url: url }));
    }
}
/**
 * Performs http requests using `XMLHttpRequest` as the default backend.
 *
 * `Http` is available as an injectable class, with methods to perform http requests. Calling
 * `request` returns an {@link Observable} which will emit a single {@link Response} when a
 * response is received.
 *
 * ### Example
 *
 * ```typescript
 * import {Http, HTTP_PROVIDERS} from 'angular2/http';
 * @Component({
 *   selector: 'http-app',
 *   viewProviders: [HTTP_PROVIDERS],
 *   templateUrl: 'people.html'
 * })
 * class PeopleComponent {
 *   constructor(http: Http) {
 *     http.get('people.json')
 *       // Call map on the response observable to get the parsed people object
 *       .map(res => res.json())
 *       // Subscribe to the observable to get the parsed people object and attach it to the
 *       // component
 *       .subscribe(people => this.people = people);
 *   }
 * }
 * ```
 *
 *
 * ### Example
 *
 * ```
 * http.get('people.json').observer({next: (value) => this.people = value});
 * ```
 *
 * The default construct used to perform requests, `XMLHttpRequest`, is abstracted as a "Backend" (
 * {@link XHRBackend} in this case), which could be mocked with dependency injection by replacing
 * the {@link XHRBackend} provider, as in the following example:
 *
 * ### Example
 *
 * ```typescript
 * import {MockBackend, BaseRequestOptions, Http} from 'angular2/http';
 * var injector = Injector.resolveAndCreate([
 *   BaseRequestOptions,
 *   MockBackend,
 *   provide(Http, {useFactory:
 *       function(backend, defaultOptions) {
 *         return new Http(backend, defaultOptions);
 *       },
 *       deps: [MockBackend, BaseRequestOptions]})
 * ]);
 * var http = injector.get(Http);
 * http.get('request-from-mock-backend.json').subscribe((res:Response) => doSomething(res));
 * ```
 *
 **/
export let Http = class {
    constructor(_backend, _defaultOptions) {
        this._backend = _backend;
        this._defaultOptions = _defaultOptions;
    }
    /**
     * Performs any type of http request. First argument is required, and can either be a url or
     * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
     * object can be provided as the 2nd argument. The options object will be merged with the values
     * of {@link BaseRequestOptions} before performing the request.
     */
    request(url, options) {
        var responseObservable;
        if (isString(url)) {
            responseObservable = httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options, RequestMethods.Get, url)));
        }
        else if (url instanceof Request) {
            responseObservable = httpRequest(this._backend, url);
        }
        else {
            throw makeTypeError('First argument must be a url string or Request instance.');
        }
        return responseObservable;
    }
    /**
     * Performs a request with `get` http method.
     */
    get(url, options) {
        return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options, RequestMethods.Get, url)));
    }
    /**
     * Performs a request with `post` http method.
     */
    post(url, body, options) {
        return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({ body: body })), options, RequestMethods.Post, url)));
    }
    /**
     * Performs a request with `put` http method.
     */
    put(url, body, options) {
        return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({ body: body })), options, RequestMethods.Put, url)));
    }
    /**
     * Performs a request with `delete` http method.
     */
    delete(url, options) {
        return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options, RequestMethods.Delete, url)));
    }
    /**
     * Performs a request with `patch` http method.
     */
    patch(url, body, options) {
        return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({ body: body })), options, RequestMethods.Patch, url)));
    }
    /**
     * Performs a request with `head` http method.
     */
    head(url, options) {
        return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options, RequestMethods.Head, url)));
    }
};
Http = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ConnectionBackend, RequestOptions])
], Http);
export let Jsonp = class extends Http {
    constructor(backend, defaultOptions) {
        super(backend, defaultOptions);
    }
    /**
     * Performs any type of http request. First argument is required, and can either be a url or
     * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
     * object can be provided as the 2nd argument. The options object will be merged with the values
     * of {@link BaseRequestOptions} before performing the request.
     */
    request(url, options) {
        var responseObservable;
        if (isString(url)) {
            url = new Request(mergeOptions(this._defaultOptions, options, RequestMethods.Get, url));
        }
        if (url instanceof Request) {
            if (url.method !== RequestMethods.Get) {
                makeTypeError('JSONP requests must use GET request method.');
            }
            responseObservable = httpRequest(this._backend, url);
        }
        else {
            throw makeTypeError('First argument must be a url string or Request instance.');
        }
        return responseObservable;
    }
};
Jsonp = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ConnectionBackend, RequestOptions])
], Jsonp);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9odHRwL2h0dHAudHMiXSwibmFtZXMiOlsiaHR0cFJlcXVlc3QiLCJtZXJnZU9wdGlvbnMiLCJIdHRwIiwiSHR0cC5jb25zdHJ1Y3RvciIsIkh0dHAucmVxdWVzdCIsIkh0dHAuZ2V0IiwiSHR0cC5wb3N0IiwiSHR0cC5wdXQiLCJIdHRwLmRlbGV0ZSIsIkh0dHAucGF0Y2giLCJIdHRwLmhlYWQiLCJKc29ucCIsIkpzb25wLmNvbnN0cnVjdG9yIiwiSnNvbnAucmVxdWVzdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQVUsTUFBTSwwQkFBMEI7T0FDOUQsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckQsRUFBQyxVQUFVLEVBQUMsTUFBTSxtQkFBbUI7T0FDckMsRUFBaUMsaUJBQWlCLEVBQUMsTUFBTSxjQUFjO09BQ3ZFLEVBQUMsT0FBTyxFQUFDLE1BQU0sa0JBQWtCO09BRWpDLEVBQXFCLGNBQWMsRUFBQyxNQUFNLHdCQUF3QjtPQUNsRSxFQUFDLGNBQWMsRUFBQyxNQUFNLFNBQVM7QUFHdEMscUJBQXFCLE9BQTBCLEVBQUUsT0FBZ0I7SUFDL0RBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLGdCQUFnQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7QUFDcERBLENBQUNBO0FBRUQsc0JBQXNCLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLEdBQUc7SUFDMURDLElBQUlBLFVBQVVBLEdBQUdBLFdBQVdBLENBQUNBO0lBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM1QkEseUNBQXlDQTtRQUN6Q0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsY0FBY0EsQ0FBQ0E7WUFDekNBLE1B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QUNBLENBQUNBLENBQUNBO1lBQzNCQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxLQUFLQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdENBLGFBQWFBLENBQUNBLDZDQUE2Q0EsQ0FBQ0EsQ0FBQ0E7WUFDL0RBLENBQUNBO1lBQ0RBLGtCQUFrQkEsR0FBR0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDdkRBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLE1BQU1BLGFBQWFBLENBQUNBLDBEQUEwREEsQ0FBQ0EsQ0FBQ0E7UUFDbEZBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLGtCQUFrQkEsQ0FBQ0E7SUFDNUJBLENBQUNBO0FBQ0hGLENBQUNBO0FBM0JEO0lBQUMsVUFBVSxFQUFFOztVQTJCWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1N0cmluZywgaXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHttYWtlVHlwZUVycm9yfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG5pbXBvcnQge1JlcXVlc3RPcHRpb25zQXJncywgQ29ubmVjdGlvbiwgQ29ubmVjdGlvbkJhY2tlbmR9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge1JlcXVlc3R9IGZyb20gJy4vc3RhdGljX3JlcXVlc3QnO1xuaW1wb3J0IHtSZXNwb25zZX0gZnJvbSAnLi9zdGF0aWNfcmVzcG9uc2UnO1xuaW1wb3J0IHtCYXNlUmVxdWVzdE9wdGlvbnMsIFJlcXVlc3RPcHRpb25zfSBmcm9tICcuL2Jhc2VfcmVxdWVzdF9vcHRpb25zJztcbmltcG9ydCB7UmVxdWVzdE1ldGhvZHN9IGZyb20gJy4vZW51bXMnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG5cbmZ1bmN0aW9uIGh0dHBSZXF1ZXN0KGJhY2tlbmQ6IENvbm5lY3Rpb25CYWNrZW5kLCByZXF1ZXN0OiBSZXF1ZXN0KTogT2JzZXJ2YWJsZTxSZXNwb25zZT4ge1xuICByZXR1cm4gYmFja2VuZC5jcmVhdGVDb25uZWN0aW9uKHJlcXVlc3QpLnJlc3BvbnNlO1xufVxuXG5mdW5jdGlvbiBtZXJnZU9wdGlvbnMoZGVmYXVsdE9wdHMsIHByb3ZpZGVkT3B0cywgbWV0aG9kLCB1cmwpOiBSZXF1ZXN0T3B0aW9ucyB7XG4gIHZhciBuZXdPcHRpb25zID0gZGVmYXVsdE9wdHM7XG4gIGlmIChpc1ByZXNlbnQocHJvdmlkZWRPcHRzKSkge1xuICAgIC8vIEhhY2sgc28gRGFydCBjYW4gdXNlZCBuYW1lZCBwYXJhbWV0ZXJzXG4gICAgcmV0dXJuIG5ld09wdGlvbnMubWVyZ2UobmV3IFJlcXVlc3RPcHRpb25zKHtcbiAgICAgIG1ldGhvZDogcHJvdmlkZWRPcHRzLm1ldGhvZCB8fCBtZXRob2QsXG4gICAgICB1cmw6IHByb3ZpZGVkT3B0cy51cmwgfHwgdXJsLFxuICAgICAgc2VhcmNoOiBwcm92aWRlZE9wdHMuc2VhcmNoLFxuICAgICAgaGVhZGVyczogcHJvdmlkZWRPcHRzLmhlYWRlcnMsXG4gICAgICBib2R5OiBwcm92aWRlZE9wdHMuYm9keVxuICAgIH0pKTtcbiAgfVxuICBpZiAoaXNQcmVzZW50KG1ldGhvZCkpIHtcbiAgICByZXR1cm4gbmV3T3B0aW9ucy5tZXJnZShuZXcgUmVxdWVzdE9wdGlvbnMoe21ldGhvZDogbWV0aG9kLCB1cmw6IHVybH0pKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3T3B0aW9ucy5tZXJnZShuZXcgUmVxdWVzdE9wdGlvbnMoe3VybDogdXJsfSkpO1xuICB9XG59XG5cbi8qKlxuICogUGVyZm9ybXMgaHR0cCByZXF1ZXN0cyB1c2luZyBgWE1MSHR0cFJlcXVlc3RgIGFzIHRoZSBkZWZhdWx0IGJhY2tlbmQuXG4gKlxuICogYEh0dHBgIGlzIGF2YWlsYWJsZSBhcyBhbiBpbmplY3RhYmxlIGNsYXNzLCB3aXRoIG1ldGhvZHMgdG8gcGVyZm9ybSBodHRwIHJlcXVlc3RzLiBDYWxsaW5nXG4gKiBgcmVxdWVzdGAgcmV0dXJucyBhbiB7QGxpbmsgT2JzZXJ2YWJsZX0gd2hpY2ggd2lsbCBlbWl0IGEgc2luZ2xlIHtAbGluayBSZXNwb25zZX0gd2hlbiBhXG4gKiByZXNwb25zZSBpcyByZWNlaXZlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7SHR0cCwgSFRUUF9QUk9WSURFUlN9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnaHR0cC1hcHAnLFxuICogICB2aWV3UHJvdmlkZXJzOiBbSFRUUF9QUk9WSURFUlNdLFxuICogICB0ZW1wbGF0ZVVybDogJ3Blb3BsZS5odG1sJ1xuICogfSlcbiAqIGNsYXNzIFBlb3BsZUNvbXBvbmVudCB7XG4gKiAgIGNvbnN0cnVjdG9yKGh0dHA6IEh0dHApIHtcbiAqICAgICBodHRwLmdldCgncGVvcGxlLmpzb24nKVxuICogICAgICAgLy8gQ2FsbCBtYXAgb24gdGhlIHJlc3BvbnNlIG9ic2VydmFibGUgdG8gZ2V0IHRoZSBwYXJzZWQgcGVvcGxlIG9iamVjdFxuICogICAgICAgLm1hcChyZXMgPT4gcmVzLmpzb24oKSlcbiAqICAgICAgIC8vIFN1YnNjcmliZSB0byB0aGUgb2JzZXJ2YWJsZSB0byBnZXQgdGhlIHBhcnNlZCBwZW9wbGUgb2JqZWN0IGFuZCBhdHRhY2ggaXQgdG8gdGhlXG4gKiAgICAgICAvLyBjb21wb25lbnRcbiAqICAgICAgIC5zdWJzY3JpYmUocGVvcGxlID0+IHRoaXMucGVvcGxlID0gcGVvcGxlKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBodHRwLmdldCgncGVvcGxlLmpzb24nKS5vYnNlcnZlcih7bmV4dDogKHZhbHVlKSA9PiB0aGlzLnBlb3BsZSA9IHZhbHVlfSk7XG4gKiBgYGBcbiAqXG4gKiBUaGUgZGVmYXVsdCBjb25zdHJ1Y3QgdXNlZCB0byBwZXJmb3JtIHJlcXVlc3RzLCBgWE1MSHR0cFJlcXVlc3RgLCBpcyBhYnN0cmFjdGVkIGFzIGEgXCJCYWNrZW5kXCIgKFxuICoge0BsaW5rIFhIUkJhY2tlbmR9IGluIHRoaXMgY2FzZSksIHdoaWNoIGNvdWxkIGJlIG1vY2tlZCB3aXRoIGRlcGVuZGVuY3kgaW5qZWN0aW9uIGJ5IHJlcGxhY2luZ1xuICogdGhlIHtAbGluayBYSFJCYWNrZW5kfSBwcm92aWRlciwgYXMgaW4gdGhlIGZvbGxvd2luZyBleGFtcGxlOlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtNb2NrQmFja2VuZCwgQmFzZVJlcXVlc3RPcHRpb25zLCBIdHRwfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogICBCYXNlUmVxdWVzdE9wdGlvbnMsXG4gKiAgIE1vY2tCYWNrZW5kLFxuICogICBwcm92aWRlKEh0dHAsIHt1c2VGYWN0b3J5OlxuICogICAgICAgZnVuY3Rpb24oYmFja2VuZCwgZGVmYXVsdE9wdGlvbnMpIHtcbiAqICAgICAgICAgcmV0dXJuIG5ldyBIdHRwKGJhY2tlbmQsIGRlZmF1bHRPcHRpb25zKTtcbiAqICAgICAgIH0sXG4gKiAgICAgICBkZXBzOiBbTW9ja0JhY2tlbmQsIEJhc2VSZXF1ZXN0T3B0aW9uc119KVxuICogXSk7XG4gKiB2YXIgaHR0cCA9IGluamVjdG9yLmdldChIdHRwKTtcbiAqIGh0dHAuZ2V0KCdyZXF1ZXN0LWZyb20tbW9jay1iYWNrZW5kLmpzb24nKS5zdWJzY3JpYmUoKHJlczpSZXNwb25zZSkgPT4gZG9Tb21ldGhpbmcocmVzKSk7XG4gKiBgYGBcbiAqXG4gKiovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cCB7XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfYmFja2VuZDogQ29ubmVjdGlvbkJhY2tlbmQsIHByb3RlY3RlZCBfZGVmYXVsdE9wdGlvbnM6IFJlcXVlc3RPcHRpb25zKSB7fVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhbnkgdHlwZSBvZiBodHRwIHJlcXVlc3QuIEZpcnN0IGFyZ3VtZW50IGlzIHJlcXVpcmVkLCBhbmQgY2FuIGVpdGhlciBiZSBhIHVybCBvclxuICAgKiBhIHtAbGluayBSZXF1ZXN0fSBpbnN0YW5jZS4gSWYgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIGEgdXJsLCBhbiBvcHRpb25hbCB7QGxpbmsgUmVxdWVzdE9wdGlvbnN9XG4gICAqIG9iamVjdCBjYW4gYmUgcHJvdmlkZWQgYXMgdGhlIDJuZCBhcmd1bWVudC4gVGhlIG9wdGlvbnMgb2JqZWN0IHdpbGwgYmUgbWVyZ2VkIHdpdGggdGhlIHZhbHVlc1xuICAgKiBvZiB7QGxpbmsgQmFzZVJlcXVlc3RPcHRpb25zfSBiZWZvcmUgcGVyZm9ybWluZyB0aGUgcmVxdWVzdC5cbiAgICovXG4gIHJlcXVlc3QodXJsOiBzdHJpbmcgfCBSZXF1ZXN0LCBvcHRpb25zPzogUmVxdWVzdE9wdGlvbnNBcmdzKTogT2JzZXJ2YWJsZTxSZXNwb25zZT4ge1xuICAgIHZhciByZXNwb25zZU9ic2VydmFibGU6IGFueTtcbiAgICBpZiAoaXNTdHJpbmcodXJsKSkge1xuICAgICAgcmVzcG9uc2VPYnNlcnZhYmxlID0gaHR0cFJlcXVlc3QoXG4gICAgICAgICAgdGhpcy5fYmFja2VuZCxcbiAgICAgICAgICBuZXcgUmVxdWVzdChtZXJnZU9wdGlvbnModGhpcy5fZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMsIFJlcXVlc3RNZXRob2RzLkdldCwgdXJsKSkpO1xuICAgIH0gZWxzZSBpZiAodXJsIGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgcmVzcG9uc2VPYnNlcnZhYmxlID0gaHR0cFJlcXVlc3QodGhpcy5fYmFja2VuZCwgdXJsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbWFrZVR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHVybCBzdHJpbmcgb3IgUmVxdWVzdCBpbnN0YW5jZS4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlT2JzZXJ2YWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhIHJlcXVlc3Qgd2l0aCBgZ2V0YCBodHRwIG1ldGhvZC5cbiAgICovXG4gIGdldCh1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zQXJncyk6IE9ic2VydmFibGU8UmVzcG9uc2U+IHtcbiAgICByZXR1cm4gaHR0cFJlcXVlc3QodGhpcy5fYmFja2VuZCwgbmV3IFJlcXVlc3QobWVyZ2VPcHRpb25zKHRoaXMuX2RlZmF1bHRPcHRpb25zLCBvcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVxdWVzdE1ldGhvZHMuR2V0LCB1cmwpKSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYSByZXF1ZXN0IHdpdGggYHBvc3RgIGh0dHAgbWV0aG9kLlxuICAgKi9cbiAgcG9zdCh1cmw6IHN0cmluZywgYm9keTogc3RyaW5nLCBvcHRpb25zPzogUmVxdWVzdE9wdGlvbnNBcmdzKTogT2JzZXJ2YWJsZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiBodHRwUmVxdWVzdChcbiAgICAgICAgdGhpcy5fYmFja2VuZCxcbiAgICAgICAgbmV3IFJlcXVlc3QobWVyZ2VPcHRpb25zKHRoaXMuX2RlZmF1bHRPcHRpb25zLm1lcmdlKG5ldyBSZXF1ZXN0T3B0aW9ucyh7Ym9keTogYm9keX0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMsIFJlcXVlc3RNZXRob2RzLlBvc3QsIHVybCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhIHJlcXVlc3Qgd2l0aCBgcHV0YCBodHRwIG1ldGhvZC5cbiAgICovXG4gIHB1dCh1cmw6IHN0cmluZywgYm9keTogc3RyaW5nLCBvcHRpb25zPzogUmVxdWVzdE9wdGlvbnNBcmdzKTogT2JzZXJ2YWJsZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiBodHRwUmVxdWVzdChcbiAgICAgICAgdGhpcy5fYmFja2VuZCxcbiAgICAgICAgbmV3IFJlcXVlc3QobWVyZ2VPcHRpb25zKHRoaXMuX2RlZmF1bHRPcHRpb25zLm1lcmdlKG5ldyBSZXF1ZXN0T3B0aW9ucyh7Ym9keTogYm9keX0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMsIFJlcXVlc3RNZXRob2RzLlB1dCwgdXJsKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGEgcmVxdWVzdCB3aXRoIGBkZWxldGVgIGh0dHAgbWV0aG9kLlxuICAgKi9cbiAgZGVsZXRlICh1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zQXJncyk6IE9ic2VydmFibGU8UmVzcG9uc2U+IHtcbiAgICByZXR1cm4gaHR0cFJlcXVlc3QodGhpcy5fYmFja2VuZCwgbmV3IFJlcXVlc3QobWVyZ2VPcHRpb25zKHRoaXMuX2RlZmF1bHRPcHRpb25zLCBvcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVxdWVzdE1ldGhvZHMuRGVsZXRlLCB1cmwpKSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYSByZXF1ZXN0IHdpdGggYHBhdGNoYCBodHRwIG1ldGhvZC5cbiAgICovXG4gIHBhdGNoKHVybDogc3RyaW5nLCBib2R5OiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIGh0dHBSZXF1ZXN0KFxuICAgICAgICB0aGlzLl9iYWNrZW5kLFxuICAgICAgICBuZXcgUmVxdWVzdChtZXJnZU9wdGlvbnModGhpcy5fZGVmYXVsdE9wdGlvbnMubWVyZ2UobmV3IFJlcXVlc3RPcHRpb25zKHtib2R5OiBib2R5fSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucywgUmVxdWVzdE1ldGhvZHMuUGF0Y2gsIHVybCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhIHJlcXVlc3Qgd2l0aCBgaGVhZGAgaHR0cCBtZXRob2QuXG4gICAqL1xuICBoZWFkKHVybDogc3RyaW5nLCBvcHRpb25zPzogUmVxdWVzdE9wdGlvbnNBcmdzKTogT2JzZXJ2YWJsZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiBodHRwUmVxdWVzdCh0aGlzLl9iYWNrZW5kLCBuZXcgUmVxdWVzdChtZXJnZU9wdGlvbnModGhpcy5fZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXF1ZXN0TWV0aG9kcy5IZWFkLCB1cmwpKSk7XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEpzb25wIGV4dGVuZHMgSHR0cCB7XG4gIGNvbnN0cnVjdG9yKGJhY2tlbmQ6IENvbm5lY3Rpb25CYWNrZW5kLCBkZWZhdWx0T3B0aW9uczogUmVxdWVzdE9wdGlvbnMpIHtcbiAgICBzdXBlcihiYWNrZW5kLCBkZWZhdWx0T3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYW55IHR5cGUgb2YgaHR0cCByZXF1ZXN0LiBGaXJzdCBhcmd1bWVudCBpcyByZXF1aXJlZCwgYW5kIGNhbiBlaXRoZXIgYmUgYSB1cmwgb3JcbiAgICogYSB7QGxpbmsgUmVxdWVzdH0gaW5zdGFuY2UuIElmIHRoZSBmaXJzdCBhcmd1bWVudCBpcyBhIHVybCwgYW4gb3B0aW9uYWwge0BsaW5rIFJlcXVlc3RPcHRpb25zfVxuICAgKiBvYmplY3QgY2FuIGJlIHByb3ZpZGVkIGFzIHRoZSAybmQgYXJndW1lbnQuIFRoZSBvcHRpb25zIG9iamVjdCB3aWxsIGJlIG1lcmdlZCB3aXRoIHRoZSB2YWx1ZXNcbiAgICogb2Yge0BsaW5rIEJhc2VSZXF1ZXN0T3B0aW9uc30gYmVmb3JlIHBlcmZvcm1pbmcgdGhlIHJlcXVlc3QuXG4gICAqL1xuICByZXF1ZXN0KHVybDogc3RyaW5nIHwgUmVxdWVzdCwgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zQXJncyk6IE9ic2VydmFibGU8UmVzcG9uc2U+IHtcbiAgICB2YXIgcmVzcG9uc2VPYnNlcnZhYmxlOiBhbnk7XG4gICAgaWYgKGlzU3RyaW5nKHVybCkpIHtcbiAgICAgIHVybCA9IG5ldyBSZXF1ZXN0KG1lcmdlT3B0aW9ucyh0aGlzLl9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucywgUmVxdWVzdE1ldGhvZHMuR2V0LCB1cmwpKTtcbiAgICB9XG4gICAgaWYgKHVybCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgIGlmICh1cmwubWV0aG9kICE9PSBSZXF1ZXN0TWV0aG9kcy5HZXQpIHtcbiAgICAgICAgbWFrZVR5cGVFcnJvcignSlNPTlAgcmVxdWVzdHMgbXVzdCB1c2UgR0VUIHJlcXVlc3QgbWV0aG9kLicpO1xuICAgICAgfVxuICAgICAgcmVzcG9uc2VPYnNlcnZhYmxlID0gaHR0cFJlcXVlc3QodGhpcy5fYmFja2VuZCwgdXJsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbWFrZVR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHVybCBzdHJpbmcgb3IgUmVxdWVzdCBpbnN0YW5jZS4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlT2JzZXJ2YWJsZTtcbiAgfVxufVxuIl19