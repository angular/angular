'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var core_1 = require('angular2/core');
var interfaces_1 = require('./interfaces');
var static_request_1 = require('./static_request');
var base_request_options_1 = require('./base_request_options');
var enums_1 = require('./enums');
function httpRequest(backend, request) {
    return backend.createConnection(request).response;
}
function mergeOptions(defaultOpts, providedOpts, method, url) {
    var newOptions = defaultOpts;
    if (lang_1.isPresent(providedOpts)) {
        // Hack so Dart can used named parameters
        return newOptions.merge(new base_request_options_1.RequestOptions({
            method: providedOpts.method || method,
            url: providedOpts.url || url,
            search: providedOpts.search,
            headers: providedOpts.headers,
            body: providedOpts.body
        }));
    }
    if (lang_1.isPresent(method)) {
        return newOptions.merge(new base_request_options_1.RequestOptions({ method: method, url: url }));
    }
    else {
        return newOptions.merge(new base_request_options_1.RequestOptions({ url: url }));
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
var Http = (function () {
    function Http(_backend, _defaultOptions) {
        this._backend = _backend;
        this._defaultOptions = _defaultOptions;
    }
    /**
     * Performs any type of http request. First argument is required, and can either be a url or
     * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
     * object can be provided as the 2nd argument. The options object will be merged with the values
     * of {@link BaseRequestOptions} before performing the request.
     */
    Http.prototype.request = function (url, options) {
        var responseObservable;
        if (lang_1.isString(url)) {
            responseObservable = httpRequest(this._backend, new static_request_1.Request(mergeOptions(this._defaultOptions, options, enums_1.RequestMethod.Get, url)));
        }
        else if (url instanceof static_request_1.Request) {
            responseObservable = httpRequest(this._backend, url);
        }
        else {
            throw exceptions_1.makeTypeError('First argument must be a url string or Request instance.');
        }
        return responseObservable;
    };
    /**
     * Performs a request with `get` http method.
     */
    Http.prototype.get = function (url, options) {
        return httpRequest(this._backend, new static_request_1.Request(mergeOptions(this._defaultOptions, options, enums_1.RequestMethod.Get, url)));
    };
    /**
     * Performs a request with `post` http method.
     */
    Http.prototype.post = function (url, body, options) {
        return httpRequest(this._backend, new static_request_1.Request(mergeOptions(this._defaultOptions.merge(new base_request_options_1.RequestOptions({ body: body })), options, enums_1.RequestMethod.Post, url)));
    };
    /**
     * Performs a request with `put` http method.
     */
    Http.prototype.put = function (url, body, options) {
        return httpRequest(this._backend, new static_request_1.Request(mergeOptions(this._defaultOptions.merge(new base_request_options_1.RequestOptions({ body: body })), options, enums_1.RequestMethod.Put, url)));
    };
    /**
     * Performs a request with `delete` http method.
     */
    Http.prototype.delete = function (url, options) {
        return httpRequest(this._backend, new static_request_1.Request(mergeOptions(this._defaultOptions, options, enums_1.RequestMethod.Delete, url)));
    };
    /**
     * Performs a request with `patch` http method.
     */
    Http.prototype.patch = function (url, body, options) {
        return httpRequest(this._backend, new static_request_1.Request(mergeOptions(this._defaultOptions.merge(new base_request_options_1.RequestOptions({ body: body })), options, enums_1.RequestMethod.Patch, url)));
    };
    /**
     * Performs a request with `head` http method.
     */
    Http.prototype.head = function (url, options) {
        return httpRequest(this._backend, new static_request_1.Request(mergeOptions(this._defaultOptions, options, enums_1.RequestMethod.Head, url)));
    };
    Http = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [interfaces_1.ConnectionBackend, base_request_options_1.RequestOptions])
    ], Http);
    return Http;
})();
exports.Http = Http;
var Jsonp = (function (_super) {
    __extends(Jsonp, _super);
    function Jsonp(backend, defaultOptions) {
        _super.call(this, backend, defaultOptions);
    }
    /**
     * Performs any type of http request. First argument is required, and can either be a url or
     * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
     * object can be provided as the 2nd argument. The options object will be merged with the values
     * of {@link BaseRequestOptions} before performing the request.
     */
    Jsonp.prototype.request = function (url, options) {
        var responseObservable;
        if (lang_1.isString(url)) {
            url = new static_request_1.Request(mergeOptions(this._defaultOptions, options, enums_1.RequestMethod.Get, url));
        }
        if (url instanceof static_request_1.Request) {
            if (url.method !== enums_1.RequestMethod.Get) {
                exceptions_1.makeTypeError('JSONP requests must use GET request method.');
            }
            responseObservable = httpRequest(this._backend, url);
        }
        else {
            throw exceptions_1.makeTypeError('First argument must be a url string or Request instance.');
        }
        return responseObservable;
    };
    Jsonp = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [interfaces_1.ConnectionBackend, base_request_options_1.RequestOptions])
    ], Jsonp);
    return Jsonp;
})(Http);
exports.Jsonp = Jsonp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9odHRwL2h0dHAudHMiXSwibmFtZXMiOlsiaHR0cFJlcXVlc3QiLCJtZXJnZU9wdGlvbnMiLCJIdHRwIiwiSHR0cC5jb25zdHJ1Y3RvciIsIkh0dHAucmVxdWVzdCIsIkh0dHAuZ2V0IiwiSHR0cC5wb3N0IiwiSHR0cC5wdXQiLCJIdHRwLmRlbGV0ZSIsIkh0dHAucGF0Y2giLCJIdHRwLmhlYWQiLCJKc29ucCIsIkpzb25wLmNvbnN0cnVjdG9yIiwiSnNvbnAucmVxdWVzdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFCQUEyQywwQkFBMEIsQ0FBQyxDQUFBO0FBQ3RFLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELHFCQUF5QixlQUFlLENBQUMsQ0FBQTtBQUN6QywyQkFBZ0UsY0FBYyxDQUFDLENBQUE7QUFDL0UsK0JBQXNCLGtCQUFrQixDQUFDLENBQUE7QUFFekMscUNBQWlELHdCQUF3QixDQUFDLENBQUE7QUFDMUUsc0JBQTRCLFNBQVMsQ0FBQyxDQUFBO0FBR3RDLHFCQUFxQixPQUEwQixFQUFFLE9BQWdCO0lBQy9EQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxnQkFBZ0JBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLFFBQVFBLENBQUNBO0FBQ3BEQSxDQUFDQTtBQUVELHNCQUFzQixXQUFXLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxHQUFHO0lBQzFEQyxJQUFJQSxVQUFVQSxHQUFHQSxXQUFXQSxDQUFDQTtJQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzVCQSx5Q0FBeUNBO1FBQ3pDQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxxQ0FBY0EsQ0FBQ0E7WUFDekNBLE1BQU1BLEVBQUVBLFlBQVlBLENBQUNBLE1BQU1BLElB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cUJBQWFBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQ3pGQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxZQUFZQSx3QkFBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0JBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLEtBQUtBLHFCQUFhQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDckNBLDBCQUFhQSxDQUFDQSw2Q0FBNkNBLENBQUNBLENBQUNBO1lBQy9EQSxDQUFDQTtZQUNEQSxrQkFBa0JBLEdBQUdBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3ZEQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSwwQkFBYUEsQ0FBQ0EsMERBQTBEQSxDQUFDQSxDQUFDQTtRQUNsRkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQTtJQUM1QkEsQ0FBQ0E7SUExQkhGO1FBQUNBLGlCQUFVQSxFQUFFQTs7Y0EyQlpBO0lBQURBLFlBQUNBO0FBQURBLENBQUNBLEFBM0JELEVBQzJCLElBQUksRUEwQjlCO0FBMUJZLGFBQUssUUEwQmpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzU3RyaW5nLCBpc1ByZXNlbnQsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge21ha2VUeXBlRXJyb3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtSZXF1ZXN0T3B0aW9uc0FyZ3MsIENvbm5lY3Rpb24sIENvbm5lY3Rpb25CYWNrZW5kfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtSZXF1ZXN0fSBmcm9tICcuL3N0YXRpY19yZXF1ZXN0JztcbmltcG9ydCB7UmVzcG9uc2V9IGZyb20gJy4vc3RhdGljX3Jlc3BvbnNlJztcbmltcG9ydCB7QmFzZVJlcXVlc3RPcHRpb25zLCBSZXF1ZXN0T3B0aW9uc30gZnJvbSAnLi9iYXNlX3JlcXVlc3Rfb3B0aW9ucyc7XG5pbXBvcnQge1JlcXVlc3RNZXRob2R9IGZyb20gJy4vZW51bXMnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuZnVuY3Rpb24gaHR0cFJlcXVlc3QoYmFja2VuZDogQ29ubmVjdGlvbkJhY2tlbmQsIHJlcXVlc3Q6IFJlcXVlc3QpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gIHJldHVybiBiYWNrZW5kLmNyZWF0ZUNvbm5lY3Rpb24ocmVxdWVzdCkucmVzcG9uc2U7XG59XG5cbmZ1bmN0aW9uIG1lcmdlT3B0aW9ucyhkZWZhdWx0T3B0cywgcHJvdmlkZWRPcHRzLCBtZXRob2QsIHVybCk6IFJlcXVlc3RPcHRpb25zIHtcbiAgdmFyIG5ld09wdGlvbnMgPSBkZWZhdWx0T3B0cztcbiAgaWYgKGlzUHJlc2VudChwcm92aWRlZE9wdHMpKSB7XG4gICAgLy8gSGFjayBzbyBEYXJ0IGNhbiB1c2VkIG5hbWVkIHBhcmFtZXRlcnNcbiAgICByZXR1cm4gbmV3T3B0aW9ucy5tZXJnZShuZXcgUmVxdWVzdE9wdGlvbnMoe1xuICAgICAgbWV0aG9kOiBwcm92aWRlZE9wdHMubWV0aG9kIHx8IG1ldGhvZCxcbiAgICAgIHVybDogcHJvdmlkZWRPcHRzLnVybCB8fCB1cmwsXG4gICAgICBzZWFyY2g6IHByb3ZpZGVkT3B0cy5zZWFyY2gsXG4gICAgICBoZWFkZXJzOiBwcm92aWRlZE9wdHMuaGVhZGVycyxcbiAgICAgIGJvZHk6IHByb3ZpZGVkT3B0cy5ib2R5XG4gICAgfSkpO1xuICB9XG4gIGlmIChpc1ByZXNlbnQobWV0aG9kKSkge1xuICAgIHJldHVybiBuZXdPcHRpb25zLm1lcmdlKG5ldyBSZXF1ZXN0T3B0aW9ucyh7bWV0aG9kOiBtZXRob2QsIHVybDogdXJsfSkpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXdPcHRpb25zLm1lcmdlKG5ldyBSZXF1ZXN0T3B0aW9ucyh7dXJsOiB1cmx9KSk7XG4gIH1cbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBodHRwIHJlcXVlc3RzIHVzaW5nIGBYTUxIdHRwUmVxdWVzdGAgYXMgdGhlIGRlZmF1bHQgYmFja2VuZC5cbiAqXG4gKiBgSHR0cGAgaXMgYXZhaWxhYmxlIGFzIGFuIGluamVjdGFibGUgY2xhc3MsIHdpdGggbWV0aG9kcyB0byBwZXJmb3JtIGh0dHAgcmVxdWVzdHMuIENhbGxpbmdcbiAqIGByZXF1ZXN0YCByZXR1cm5zIGFuIHtAbGluayBPYnNlcnZhYmxlfSB3aGljaCB3aWxsIGVtaXQgYSBzaW5nbGUge0BsaW5rIFJlc3BvbnNlfSB3aGVuIGFcbiAqIHJlc3BvbnNlIGlzIHJlY2VpdmVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtIdHRwLCBIVFRQX1BST1ZJREVSU30gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdodHRwLWFwcCcsXG4gKiAgIHZpZXdQcm92aWRlcnM6IFtIVFRQX1BST1ZJREVSU10sXG4gKiAgIHRlbXBsYXRlVXJsOiAncGVvcGxlLmh0bWwnXG4gKiB9KVxuICogY2xhc3MgUGVvcGxlQ29tcG9uZW50IHtcbiAqICAgY29uc3RydWN0b3IoaHR0cDogSHR0cCkge1xuICogICAgIGh0dHAuZ2V0KCdwZW9wbGUuanNvbicpXG4gKiAgICAgICAvLyBDYWxsIG1hcCBvbiB0aGUgcmVzcG9uc2Ugb2JzZXJ2YWJsZSB0byBnZXQgdGhlIHBhcnNlZCBwZW9wbGUgb2JqZWN0XG4gKiAgICAgICAubWFwKHJlcyA9PiByZXMuanNvbigpKVxuICogICAgICAgLy8gU3Vic2NyaWJlIHRvIHRoZSBvYnNlcnZhYmxlIHRvIGdldCB0aGUgcGFyc2VkIHBlb3BsZSBvYmplY3QgYW5kIGF0dGFjaCBpdCB0byB0aGVcbiAqICAgICAgIC8vIGNvbXBvbmVudFxuICogICAgICAgLnN1YnNjcmliZShwZW9wbGUgPT4gdGhpcy5wZW9wbGUgPSBwZW9wbGUpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGh0dHAuZ2V0KCdwZW9wbGUuanNvbicpLm9ic2VydmVyKHtuZXh0OiAodmFsdWUpID0+IHRoaXMucGVvcGxlID0gdmFsdWV9KTtcbiAqIGBgYFxuICpcbiAqIFRoZSBkZWZhdWx0IGNvbnN0cnVjdCB1c2VkIHRvIHBlcmZvcm0gcmVxdWVzdHMsIGBYTUxIdHRwUmVxdWVzdGAsIGlzIGFic3RyYWN0ZWQgYXMgYSBcIkJhY2tlbmRcIiAoXG4gKiB7QGxpbmsgWEhSQmFja2VuZH0gaW4gdGhpcyBjYXNlKSwgd2hpY2ggY291bGQgYmUgbW9ja2VkIHdpdGggZGVwZW5kZW5jeSBpbmplY3Rpb24gYnkgcmVwbGFjaW5nXG4gKiB0aGUge0BsaW5rIFhIUkJhY2tlbmR9IHByb3ZpZGVyLCBhcyBpbiB0aGUgZm9sbG93aW5nIGV4YW1wbGU6XG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge01vY2tCYWNrZW5kLCBCYXNlUmVxdWVzdE9wdGlvbnMsIEh0dHB9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gKiAgIEJhc2VSZXF1ZXN0T3B0aW9ucyxcbiAqICAgTW9ja0JhY2tlbmQsXG4gKiAgIHByb3ZpZGUoSHR0cCwge3VzZUZhY3Rvcnk6XG4gKiAgICAgICBmdW5jdGlvbihiYWNrZW5kLCBkZWZhdWx0T3B0aW9ucykge1xuICogICAgICAgICByZXR1cm4gbmV3IEh0dHAoYmFja2VuZCwgZGVmYXVsdE9wdGlvbnMpO1xuICogICAgICAgfSxcbiAqICAgICAgIGRlcHM6IFtNb2NrQmFja2VuZCwgQmFzZVJlcXVlc3RPcHRpb25zXX0pXG4gKiBdKTtcbiAqIHZhciBodHRwID0gaW5qZWN0b3IuZ2V0KEh0dHApO1xuICogaHR0cC5nZXQoJ3JlcXVlc3QtZnJvbS1tb2NrLWJhY2tlbmQuanNvbicpLnN1YnNjcmliZSgocmVzOlJlc3BvbnNlKSA9PiBkb1NvbWV0aGluZyhyZXMpKTtcbiAqIGBgYFxuICpcbiAqKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwIHtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIF9iYWNrZW5kOiBDb25uZWN0aW9uQmFja2VuZCwgcHJvdGVjdGVkIF9kZWZhdWx0T3B0aW9uczogUmVxdWVzdE9wdGlvbnMpIHt9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGFueSB0eXBlIG9mIGh0dHAgcmVxdWVzdC4gRmlyc3QgYXJndW1lbnQgaXMgcmVxdWlyZWQsIGFuZCBjYW4gZWl0aGVyIGJlIGEgdXJsIG9yXG4gICAqIGEge0BsaW5rIFJlcXVlc3R9IGluc3RhbmNlLiBJZiB0aGUgZmlyc3QgYXJndW1lbnQgaXMgYSB1cmwsIGFuIG9wdGlvbmFsIHtAbGluayBSZXF1ZXN0T3B0aW9uc31cbiAgICogb2JqZWN0IGNhbiBiZSBwcm92aWRlZCBhcyB0aGUgMm5kIGFyZ3VtZW50LiBUaGUgb3B0aW9ucyBvYmplY3Qgd2lsbCBiZSBtZXJnZWQgd2l0aCB0aGUgdmFsdWVzXG4gICAqIG9mIHtAbGluayBCYXNlUmVxdWVzdE9wdGlvbnN9IGJlZm9yZSBwZXJmb3JtaW5nIHRoZSByZXF1ZXN0LlxuICAgKi9cbiAgcmVxdWVzdCh1cmw6IHN0cmluZyB8IFJlcXVlc3QsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgdmFyIHJlc3BvbnNlT2JzZXJ2YWJsZTogYW55O1xuICAgIGlmIChpc1N0cmluZyh1cmwpKSB7XG4gICAgICByZXNwb25zZU9ic2VydmFibGUgPSBodHRwUmVxdWVzdChcbiAgICAgICAgICB0aGlzLl9iYWNrZW5kLFxuICAgICAgICAgIG5ldyBSZXF1ZXN0KG1lcmdlT3B0aW9ucyh0aGlzLl9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucywgUmVxdWVzdE1ldGhvZC5HZXQsIHVybCkpKTtcbiAgICB9IGVsc2UgaWYgKHVybCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgIHJlc3BvbnNlT2JzZXJ2YWJsZSA9IGh0dHBSZXF1ZXN0KHRoaXMuX2JhY2tlbmQsIHVybCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG1ha2VUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSB1cmwgc3RyaW5nIG9yIFJlcXVlc3QgaW5zdGFuY2UuJyk7XG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZU9ic2VydmFibGU7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYSByZXF1ZXN0IHdpdGggYGdldGAgaHR0cCBtZXRob2QuXG4gICAqL1xuICBnZXQodXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIGh0dHBSZXF1ZXN0KHRoaXMuX2JhY2tlbmQsIG5ldyBSZXF1ZXN0KG1lcmdlT3B0aW9ucyh0aGlzLl9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlcXVlc3RNZXRob2QuR2V0LCB1cmwpKSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYSByZXF1ZXN0IHdpdGggYHBvc3RgIGh0dHAgbWV0aG9kLlxuICAgKi9cbiAgcG9zdCh1cmw6IHN0cmluZywgYm9keTogc3RyaW5nLCBvcHRpb25zPzogUmVxdWVzdE9wdGlvbnNBcmdzKTogT2JzZXJ2YWJsZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiBodHRwUmVxdWVzdChcbiAgICAgICAgdGhpcy5fYmFja2VuZCxcbiAgICAgICAgbmV3IFJlcXVlc3QobWVyZ2VPcHRpb25zKHRoaXMuX2RlZmF1bHRPcHRpb25zLm1lcmdlKG5ldyBSZXF1ZXN0T3B0aW9ucyh7Ym9keTogYm9keX0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMsIFJlcXVlc3RNZXRob2QuUG9zdCwgdXJsKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGEgcmVxdWVzdCB3aXRoIGBwdXRgIGh0dHAgbWV0aG9kLlxuICAgKi9cbiAgcHV0KHVybDogc3RyaW5nLCBib2R5OiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIGh0dHBSZXF1ZXN0KFxuICAgICAgICB0aGlzLl9iYWNrZW5kLFxuICAgICAgICBuZXcgUmVxdWVzdChtZXJnZU9wdGlvbnModGhpcy5fZGVmYXVsdE9wdGlvbnMubWVyZ2UobmV3IFJlcXVlc3RPcHRpb25zKHtib2R5OiBib2R5fSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucywgUmVxdWVzdE1ldGhvZC5QdXQsIHVybCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhIHJlcXVlc3Qgd2l0aCBgZGVsZXRlYCBodHRwIG1ldGhvZC5cbiAgICovXG4gIGRlbGV0ZSAodXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIGh0dHBSZXF1ZXN0KHRoaXMuX2JhY2tlbmQsIG5ldyBSZXF1ZXN0KG1lcmdlT3B0aW9ucyh0aGlzLl9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlcXVlc3RNZXRob2QuRGVsZXRlLCB1cmwpKSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYSByZXF1ZXN0IHdpdGggYHBhdGNoYCBodHRwIG1ldGhvZC5cbiAgICovXG4gIHBhdGNoKHVybDogc3RyaW5nLCBib2R5OiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIGh0dHBSZXF1ZXN0KFxuICAgICAgICB0aGlzLl9iYWNrZW5kLFxuICAgICAgICBuZXcgUmVxdWVzdChtZXJnZU9wdGlvbnModGhpcy5fZGVmYXVsdE9wdGlvbnMubWVyZ2UobmV3IFJlcXVlc3RPcHRpb25zKHtib2R5OiBib2R5fSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucywgUmVxdWVzdE1ldGhvZC5QYXRjaCwgdXJsKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGEgcmVxdWVzdCB3aXRoIGBoZWFkYCBodHRwIG1ldGhvZC5cbiAgICovXG4gIGhlYWQodXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIGh0dHBSZXF1ZXN0KHRoaXMuX2JhY2tlbmQsIG5ldyBSZXF1ZXN0KG1lcmdlT3B0aW9ucyh0aGlzLl9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlcXVlc3RNZXRob2QuSGVhZCwgdXJsKSkpO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBKc29ucCBleHRlbmRzIEh0dHAge1xuICBjb25zdHJ1Y3RvcihiYWNrZW5kOiBDb25uZWN0aW9uQmFja2VuZCwgZGVmYXVsdE9wdGlvbnM6IFJlcXVlc3RPcHRpb25zKSB7XG4gICAgc3VwZXIoYmFja2VuZCwgZGVmYXVsdE9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGFueSB0eXBlIG9mIGh0dHAgcmVxdWVzdC4gRmlyc3QgYXJndW1lbnQgaXMgcmVxdWlyZWQsIGFuZCBjYW4gZWl0aGVyIGJlIGEgdXJsIG9yXG4gICAqIGEge0BsaW5rIFJlcXVlc3R9IGluc3RhbmNlLiBJZiB0aGUgZmlyc3QgYXJndW1lbnQgaXMgYSB1cmwsIGFuIG9wdGlvbmFsIHtAbGluayBSZXF1ZXN0T3B0aW9uc31cbiAgICogb2JqZWN0IGNhbiBiZSBwcm92aWRlZCBhcyB0aGUgMm5kIGFyZ3VtZW50LiBUaGUgb3B0aW9ucyBvYmplY3Qgd2lsbCBiZSBtZXJnZWQgd2l0aCB0aGUgdmFsdWVzXG4gICAqIG9mIHtAbGluayBCYXNlUmVxdWVzdE9wdGlvbnN9IGJlZm9yZSBwZXJmb3JtaW5nIHRoZSByZXF1ZXN0LlxuICAgKi9cbiAgcmVxdWVzdCh1cmw6IHN0cmluZyB8IFJlcXVlc3QsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgdmFyIHJlc3BvbnNlT2JzZXJ2YWJsZTogYW55O1xuICAgIGlmIChpc1N0cmluZyh1cmwpKSB7XG4gICAgICB1cmwgPSBuZXcgUmVxdWVzdChtZXJnZU9wdGlvbnModGhpcy5fZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMsIFJlcXVlc3RNZXRob2QuR2V0LCB1cmwpKTtcbiAgICB9XG4gICAgaWYgKHVybCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgIGlmICh1cmwubWV0aG9kICE9PSBSZXF1ZXN0TWV0aG9kLkdldCkge1xuICAgICAgICBtYWtlVHlwZUVycm9yKCdKU09OUCByZXF1ZXN0cyBtdXN0IHVzZSBHRVQgcmVxdWVzdCBtZXRob2QuJyk7XG4gICAgICB9XG4gICAgICByZXNwb25zZU9ic2VydmFibGUgPSBodHRwUmVxdWVzdCh0aGlzLl9iYWNrZW5kLCB1cmwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBtYWtlVHlwZUVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgdXJsIHN0cmluZyBvciBSZXF1ZXN0IGluc3RhbmNlLicpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2VPYnNlcnZhYmxlO1xuICB9XG59XG4iXX0=