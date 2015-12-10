'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var enums_1 = require('../enums');
var static_response_1 = require('../static_response');
var headers_1 = require('../headers');
var base_response_options_1 = require('../base_response_options');
var core_1 = require('angular2/core');
var browser_xhr_1 = require('./browser_xhr');
var lang_1 = require('angular2/src/facade/lang');
var core_2 = require('angular2/core');
var http_utils_1 = require('../http_utils');
/**
* Creates connections using `XMLHttpRequest`. Given a fully-qualified
* request, an `XHRConnection` will immediately create an `XMLHttpRequest` object and send the
* request.
*
* This class would typically not be created or interacted with directly inside applications, though
* the {@link MockConnection} may be interacted with in tests.
*/
var XHRConnection = (function () {
    function XHRConnection(req, browserXHR, baseResponseOptions) {
        var _this = this;
        this.request = req;
        this.response = new core_2.Observable(function (responseObserver) {
            var _xhr = browserXHR.build();
            _xhr.open(enums_1.RequestMethod[req.method].toUpperCase(), req.url);
            // load event handler
            var onLoad = function () {
                // responseText is the old-school way of retrieving response (supported by IE8 & 9)
                // response/responseType properties were introduced in XHR Level2 spec (supported by
                // IE10)
                var body = lang_1.isPresent(_xhr.response) ? _xhr.response : _xhr.responseText;
                var headers = headers_1.Headers.fromResponseHeaderString(_xhr.getAllResponseHeaders());
                var url = http_utils_1.getResponseURL(_xhr);
                // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
                var status = _xhr.status === 1223 ? 204 : _xhr.status;
                // fix status code when it is 0 (0 status is undocumented).
                // Occurs when accessing file resources or on Android 4.1 stock browser
                // while retrieving files from application cache.
                if (status === 0) {
                    status = body ? 200 : 0;
                }
                var responseOptions = new base_response_options_1.ResponseOptions({ body: body, status: status, headers: headers, url: url });
                if (lang_1.isPresent(baseResponseOptions)) {
                    responseOptions = baseResponseOptions.merge(responseOptions);
                }
                var response = new static_response_1.Response(responseOptions);
                if (http_utils_1.isSuccess(status)) {
                    responseObserver.next(response);
                    // TODO(gdi2290): defer complete if array buffer until done
                    responseObserver.complete();
                    return;
                }
                responseObserver.error(response);
            };
            // error event handler
            var onError = function (err) {
                var responseOptions = new base_response_options_1.ResponseOptions({ body: err, type: enums_1.ResponseType.Error });
                if (lang_1.isPresent(baseResponseOptions)) {
                    responseOptions = baseResponseOptions.merge(responseOptions);
                }
                responseObserver.error(new static_response_1.Response(responseOptions));
            };
            if (lang_1.isPresent(req.headers)) {
                req.headers.forEach(function (values, name) { return _xhr.setRequestHeader(name, values.join(',')); });
            }
            _xhr.addEventListener('load', onLoad);
            _xhr.addEventListener('error', onError);
            _xhr.send(_this.request.text());
            return function () {
                _xhr.removeEventListener('load', onLoad);
                _xhr.removeEventListener('error', onError);
                _xhr.abort();
            };
        });
    }
    return XHRConnection;
})();
exports.XHRConnection = XHRConnection;
/**
 * Creates {@link XHRConnection} instances.
 *
 * This class would typically not be used by end users, but could be
 * overridden if a different backend implementation should be used,
 * such as in a node backend.
 *
 * ### Example
 *
 * ```
 * import {Http, MyNodeBackend, HTTP_PROVIDERS, BaseRequestOptions} from 'angular2/http';
 * @Component({
 *   viewProviders: [
 *     HTTP_PROVIDERS,
 *     provide(Http, {useFactory: (backend, options) => {
 *       return new Http(backend, options);
 *     }, deps: [MyNodeBackend, BaseRequestOptions]})]
 * })
 * class MyComponent {
 *   constructor(http:Http) {
 *     http.request('people.json').subscribe(res => this.people = res.json());
 *   }
 * }
 * ```
 *
 **/
var XHRBackend = (function () {
    function XHRBackend(_browserXHR, _baseResponseOptions) {
        this._browserXHR = _browserXHR;
        this._baseResponseOptions = _baseResponseOptions;
    }
    XHRBackend.prototype.createConnection = function (request) {
        return new XHRConnection(request, this._browserXHR, this._baseResponseOptions);
    };
    XHRBackend = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [browser_xhr_1.BrowserXhr, base_response_options_1.ResponseOptions])
    ], XHRBackend);
    return XHRBackend;
})();
exports.XHRBackend = XHRBackend;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX2JhY2tlbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvaHR0cC9iYWNrZW5kcy94aHJfYmFja2VuZC50cyJdLCJuYW1lcyI6WyJYSFJDb25uZWN0aW9uIiwiWEhSQ29ubmVjdGlvbi5jb25zdHJ1Y3RvciIsIlhIUkJhY2tlbmQiLCJYSFJCYWNrZW5kLmNvbnN0cnVjdG9yIiwiWEhSQmFja2VuZC5jcmVhdGVDb25uZWN0aW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFDQSxzQkFBc0QsVUFBVSxDQUFDLENBQUE7QUFFakUsZ0NBQXVCLG9CQUFvQixDQUFDLENBQUE7QUFDNUMsd0JBQXNCLFlBQVksQ0FBQyxDQUFBO0FBQ25DLHNDQUFtRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQzlFLHFCQUF5QixlQUFlLENBQUMsQ0FBQTtBQUN6Qyw0QkFBeUIsZUFBZSxDQUFDLENBQUE7QUFDekMscUJBQXdCLDBCQUEwQixDQUFDLENBQUE7QUFDbkQscUJBQXlCLGVBQWUsQ0FBQyxDQUFBO0FBQ3pDLDJCQUF3QyxlQUFlLENBQUMsQ0FBQTtBQUN4RDs7Ozs7OztFQU9FO0FBQ0Y7SUFRRUEsdUJBQVlBLEdBQVlBLEVBQUVBLFVBQXNCQSxFQUFFQSxtQkFBcUNBO1FBUnpGQyxpQkF1RUNBO1FBOURHQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxHQUFHQSxDQUFDQTtRQUNuQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsSUFBSUEsaUJBQVVBLENBQUNBLFVBQUFBLGdCQUFnQkE7WUFDN0NBLElBQUlBLElBQUlBLEdBQW1CQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtZQUM5Q0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EscUJBQWFBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLEVBQUVBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1lBQzVEQSxxQkFBcUJBO1lBQ3JCQSxJQUFJQSxNQUFNQSxHQUFHQTtnQkFDWEEsbUZBQW1GQTtnQkFDbkZBLG9GQUFvRkE7Z0JBQ3BGQSxRQUFRQTtnQkFDUkEsSUFBSUEsSUFBSUEsR0FBR0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBO2dCQUV4RUEsSUFBSUEsT0FBT0EsR0FBR0EsaUJBQU9BLENBQUNBLHdCQUF3QkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EscUJBQXFCQSxFQUFFQSxDQUFDQSxDQUFDQTtnQkFFN0VBLElBQUlBLEdBQUdBLEdBQUdBLDJCQUFjQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFFL0JBLHlEQUF5REE7Z0JBQ3pEQSxJQUFJQSxNQUFNQSxHQUFXQSxJQUFJQSxDQUFDQSxNQUFNQSxLQUFLQSxJQUFJQSxHQUFHQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtnQkFFOURBLDJEQUEyREE7Z0JBQzNEQSx1RUFBdUVBO2dCQUN2RUEsaURBQWlEQTtnQkFDakRBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUNqQkEsTUFBTUEsR0FBR0EsSUFBSUEsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFCQSxDQUFDQTtnQkFDREEsSUFBSUEsZUFBZUEsR0FBR0EsSUFBSUEsdUNBQWVBLENBQUNBLEVBQUNBLE1BQUFBLElBQUlBLEVBQUVBLFFBQUFBLE1BQU1BLEVBQUVBLFNBQUFBLE9BQU9BLEVBQUVBLEtBQUFBLEdBQUdBLEVBQUNBLENBQUNBLENBQUNBO2dCQUN4RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ25DQSxlQUFlQSxHQUFHQSxtQkFBbUJBLENBQUNBLEtBQUtBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO2dCQUMvREEsQ0FBQ0E7Z0JBQ0RBLElBQUlBLFFBQVFBLEdBQUdBLElBQUlBLDBCQUFRQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQTtnQkFDN0NBLEVBQUVBLENBQUNBLENBQUNBLHNCQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDdEJBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7b0JBQ2hDQSwyREFBMkRBO29CQUMzREEsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQTtvQkFDNUJBLE1BQU1BLENBQUNBO2dCQUNUQSxDQUFDQTtnQkFDREEsZ0JBQWdCQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtZQUNuQ0EsQ0FBQ0EsQ0FBQ0E7WUFDRkEsc0JBQXNCQTtZQUN0QkEsSUFBSUEsT0FBT0EsR0FBR0EsVUFBQ0EsR0FBR0E7Z0JBQ2hCQSxJQUFJQSxlQUFlQSxHQUFHQSxJQUFJQSx1Q0FBZUEsQ0FBQ0EsRUFBQ0EsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsb0JBQVlBLENBQUNBLEtBQUtBLEVBQUNBLENBQUNBLENBQUNBO2dCQUNqRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ25DQSxlQUFlQSxHQUFHQSxtQkFBbUJBLENBQUNBLEtBQUtBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO2dCQUMvREEsQ0FBQ0E7Z0JBQ0RBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsMEJBQVFBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hEQSxDQUFDQSxDQUFDQTtZQUVGQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzNCQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFDQSxNQUFNQSxFQUFFQSxJQUFJQSxJQUFLQSxPQUFBQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLEVBQUVBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEVBQTdDQSxDQUE2Q0EsQ0FBQ0EsQ0FBQ0E7WUFDdkZBLENBQUNBO1lBRURBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsTUFBTUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFDdENBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsT0FBT0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7WUFFeENBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEtBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO1lBRS9CQSxNQUFNQSxDQUFDQTtnQkFDTEEsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxNQUFNQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtnQkFDekNBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsT0FBT0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzNDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtZQUNmQSxDQUFDQSxDQUFDQTtRQUNKQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUNIRCxvQkFBQ0E7QUFBREEsQ0FBQ0EsQUF2RUQsSUF1RUM7QUF2RVkscUJBQWEsZ0JBdUV6QixDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUF5Qkk7QUFDSjtJQUVFRSxvQkFBb0JBLFdBQXVCQSxFQUFVQSxvQkFBcUNBO1FBQXRFQyxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBWUE7UUFBVUEseUJBQW9CQSxHQUFwQkEsb0JBQW9CQSxDQUFpQkE7SUFBR0EsQ0FBQ0E7SUFDOUZELHFDQUFnQkEsR0FBaEJBLFVBQWlCQSxPQUFnQkE7UUFDL0JFLE1BQU1BLENBQUNBLElBQUlBLGFBQWFBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0E7SUFDakZBLENBQUNBO0lBTEhGO1FBQUNBLGlCQUFVQSxFQUFFQTs7bUJBTVpBO0lBQURBLGlCQUFDQTtBQUFEQSxDQUFDQSxBQU5ELElBTUM7QUFMWSxrQkFBVSxhQUt0QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb25uZWN0aW9uQmFja2VuZCwgQ29ubmVjdGlvbn0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge1JlYWR5U3RhdGUsIFJlcXVlc3RNZXRob2QsIFJlc3BvbnNlVHlwZX0gZnJvbSAnLi4vZW51bXMnO1xuaW1wb3J0IHtSZXF1ZXN0fSBmcm9tICcuLi9zdGF0aWNfcmVxdWVzdCc7XG5pbXBvcnQge1Jlc3BvbnNlfSBmcm9tICcuLi9zdGF0aWNfcmVzcG9uc2UnO1xuaW1wb3J0IHtIZWFkZXJzfSBmcm9tICcuLi9oZWFkZXJzJztcbmltcG9ydCB7UmVzcG9uc2VPcHRpb25zLCBCYXNlUmVzcG9uc2VPcHRpb25zfSBmcm9tICcuLi9iYXNlX3Jlc3BvbnNlX29wdGlvbnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7QnJvd3Nlclhocn0gZnJvbSAnLi9icm93c2VyX3hocic7XG5pbXBvcnQge2lzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2lzU3VjY2VzcywgZ2V0UmVzcG9uc2VVUkx9IGZyb20gJy4uL2h0dHBfdXRpbHMnO1xuLyoqXG4qIENyZWF0ZXMgY29ubmVjdGlvbnMgdXNpbmcgYFhNTEh0dHBSZXF1ZXN0YC4gR2l2ZW4gYSBmdWxseS1xdWFsaWZpZWRcbiogcmVxdWVzdCwgYW4gYFhIUkNvbm5lY3Rpb25gIHdpbGwgaW1tZWRpYXRlbHkgY3JlYXRlIGFuIGBYTUxIdHRwUmVxdWVzdGAgb2JqZWN0IGFuZCBzZW5kIHRoZVxuKiByZXF1ZXN0LlxuKlxuKiBUaGlzIGNsYXNzIHdvdWxkIHR5cGljYWxseSBub3QgYmUgY3JlYXRlZCBvciBpbnRlcmFjdGVkIHdpdGggZGlyZWN0bHkgaW5zaWRlIGFwcGxpY2F0aW9ucywgdGhvdWdoXG4qIHRoZSB7QGxpbmsgTW9ja0Nvbm5lY3Rpb259IG1heSBiZSBpbnRlcmFjdGVkIHdpdGggaW4gdGVzdHMuXG4qL1xuZXhwb3J0IGNsYXNzIFhIUkNvbm5lY3Rpb24gaW1wbGVtZW50cyBDb25uZWN0aW9uIHtcbiAgcmVxdWVzdDogUmVxdWVzdDtcbiAgLyoqXG4gICAqIFJlc3BvbnNlIHtAbGluayBFdmVudEVtaXR0ZXJ9IHdoaWNoIGVtaXRzIGEgc2luZ2xlIHtAbGluayBSZXNwb25zZX0gdmFsdWUgb24gbG9hZCBldmVudCBvZlxuICAgKiBgWE1MSHR0cFJlcXVlc3RgLlxuICAgKi9cbiAgcmVzcG9uc2U6IE9ic2VydmFibGU8UmVzcG9uc2U+O1xuICByZWFkeVN0YXRlOiBSZWFkeVN0YXRlO1xuICBjb25zdHJ1Y3RvcihyZXE6IFJlcXVlc3QsIGJyb3dzZXJYSFI6IEJyb3dzZXJYaHIsIGJhc2VSZXNwb25zZU9wdGlvbnM/OiBSZXNwb25zZU9wdGlvbnMpIHtcbiAgICB0aGlzLnJlcXVlc3QgPSByZXE7XG4gICAgdGhpcy5yZXNwb25zZSA9IG5ldyBPYnNlcnZhYmxlKHJlc3BvbnNlT2JzZXJ2ZXIgPT4ge1xuICAgICAgbGV0IF94aHI6IFhNTEh0dHBSZXF1ZXN0ID0gYnJvd3NlclhIUi5idWlsZCgpO1xuICAgICAgX3hoci5vcGVuKFJlcXVlc3RNZXRob2RbcmVxLm1ldGhvZF0udG9VcHBlckNhc2UoKSwgcmVxLnVybCk7XG4gICAgICAvLyBsb2FkIGV2ZW50IGhhbmRsZXJcbiAgICAgIGxldCBvbkxvYWQgPSAoKSA9PiB7XG4gICAgICAgIC8vIHJlc3BvbnNlVGV4dCBpcyB0aGUgb2xkLXNjaG9vbCB3YXkgb2YgcmV0cmlldmluZyByZXNwb25zZSAoc3VwcG9ydGVkIGJ5IElFOCAmIDkpXG4gICAgICAgIC8vIHJlc3BvbnNlL3Jlc3BvbnNlVHlwZSBwcm9wZXJ0aWVzIHdlcmUgaW50cm9kdWNlZCBpbiBYSFIgTGV2ZWwyIHNwZWMgKHN1cHBvcnRlZCBieVxuICAgICAgICAvLyBJRTEwKVxuICAgICAgICBsZXQgYm9keSA9IGlzUHJlc2VudChfeGhyLnJlc3BvbnNlKSA/IF94aHIucmVzcG9uc2UgOiBfeGhyLnJlc3BvbnNlVGV4dDtcblxuICAgICAgICBsZXQgaGVhZGVycyA9IEhlYWRlcnMuZnJvbVJlc3BvbnNlSGVhZGVyU3RyaW5nKF94aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuXG4gICAgICAgIGxldCB1cmwgPSBnZXRSZXNwb25zZVVSTChfeGhyKTtcblxuICAgICAgICAvLyBub3JtYWxpemUgSUU5IGJ1ZyAoaHR0cDovL2J1Z3MuanF1ZXJ5LmNvbS90aWNrZXQvMTQ1MClcbiAgICAgICAgbGV0IHN0YXR1czogbnVtYmVyID0gX3hoci5zdGF0dXMgPT09IDEyMjMgPyAyMDQgOiBfeGhyLnN0YXR1cztcblxuICAgICAgICAvLyBmaXggc3RhdHVzIGNvZGUgd2hlbiBpdCBpcyAwICgwIHN0YXR1cyBpcyB1bmRvY3VtZW50ZWQpLlxuICAgICAgICAvLyBPY2N1cnMgd2hlbiBhY2Nlc3NpbmcgZmlsZSByZXNvdXJjZXMgb3Igb24gQW5kcm9pZCA0LjEgc3RvY2sgYnJvd3NlclxuICAgICAgICAvLyB3aGlsZSByZXRyaWV2aW5nIGZpbGVzIGZyb20gYXBwbGljYXRpb24gY2FjaGUuXG4gICAgICAgIGlmIChzdGF0dXMgPT09IDApIHtcbiAgICAgICAgICBzdGF0dXMgPSBib2R5ID8gMjAwIDogMDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzcG9uc2VPcHRpb25zID0gbmV3IFJlc3BvbnNlT3B0aW9ucyh7Ym9keSwgc3RhdHVzLCBoZWFkZXJzLCB1cmx9KTtcbiAgICAgICAgaWYgKGlzUHJlc2VudChiYXNlUmVzcG9uc2VPcHRpb25zKSkge1xuICAgICAgICAgIHJlc3BvbnNlT3B0aW9ucyA9IGJhc2VSZXNwb25zZU9wdGlvbnMubWVyZ2UocmVzcG9uc2VPcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UocmVzcG9uc2VPcHRpb25zKTtcbiAgICAgICAgaWYgKGlzU3VjY2VzcyhzdGF0dXMpKSB7XG4gICAgICAgICAgcmVzcG9uc2VPYnNlcnZlci5uZXh0KHJlc3BvbnNlKTtcbiAgICAgICAgICAvLyBUT0RPKGdkaTIyOTApOiBkZWZlciBjb21wbGV0ZSBpZiBhcnJheSBidWZmZXIgdW50aWwgZG9uZVxuICAgICAgICAgIHJlc3BvbnNlT2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmVzcG9uc2VPYnNlcnZlci5lcnJvcihyZXNwb25zZSk7XG4gICAgICB9O1xuICAgICAgLy8gZXJyb3IgZXZlbnQgaGFuZGxlclxuICAgICAgbGV0IG9uRXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICAgIHZhciByZXNwb25zZU9wdGlvbnMgPSBuZXcgUmVzcG9uc2VPcHRpb25zKHtib2R5OiBlcnIsIHR5cGU6IFJlc3BvbnNlVHlwZS5FcnJvcn0pO1xuICAgICAgICBpZiAoaXNQcmVzZW50KGJhc2VSZXNwb25zZU9wdGlvbnMpKSB7XG4gICAgICAgICAgcmVzcG9uc2VPcHRpb25zID0gYmFzZVJlc3BvbnNlT3B0aW9ucy5tZXJnZShyZXNwb25zZU9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3BvbnNlT2JzZXJ2ZXIuZXJyb3IobmV3IFJlc3BvbnNlKHJlc3BvbnNlT3B0aW9ucykpO1xuICAgICAgfTtcblxuICAgICAgaWYgKGlzUHJlc2VudChyZXEuaGVhZGVycykpIHtcbiAgICAgICAgcmVxLmhlYWRlcnMuZm9yRWFjaCgodmFsdWVzLCBuYW1lKSA9PiBfeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWVzLmpvaW4oJywnKSkpO1xuICAgICAgfVxuXG4gICAgICBfeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkxvYWQpO1xuICAgICAgX3hoci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuXG4gICAgICBfeGhyLnNlbmQodGhpcy5yZXF1ZXN0LnRleHQoKSk7XG5cbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIF94aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZCk7XG4gICAgICAgIF94aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcbiAgICAgICAgX3hoci5hYm9ydCgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMge0BsaW5rIFhIUkNvbm5lY3Rpb259IGluc3RhbmNlcy5cbiAqXG4gKiBUaGlzIGNsYXNzIHdvdWxkIHR5cGljYWxseSBub3QgYmUgdXNlZCBieSBlbmQgdXNlcnMsIGJ1dCBjb3VsZCBiZVxuICogb3ZlcnJpZGRlbiBpZiBhIGRpZmZlcmVudCBiYWNrZW5kIGltcGxlbWVudGF0aW9uIHNob3VsZCBiZSB1c2VkLFxuICogc3VjaCBhcyBpbiBhIG5vZGUgYmFja2VuZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtIdHRwLCBNeU5vZGVCYWNrZW5kLCBIVFRQX1BST1ZJREVSUywgQmFzZVJlcXVlc3RPcHRpb25zfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqIEBDb21wb25lbnQoe1xuICogICB2aWV3UHJvdmlkZXJzOiBbXG4gKiAgICAgSFRUUF9QUk9WSURFUlMsXG4gKiAgICAgcHJvdmlkZShIdHRwLCB7dXNlRmFjdG9yeTogKGJhY2tlbmQsIG9wdGlvbnMpID0+IHtcbiAqICAgICAgIHJldHVybiBuZXcgSHR0cChiYWNrZW5kLCBvcHRpb25zKTtcbiAqICAgICB9LCBkZXBzOiBbTXlOb2RlQmFja2VuZCwgQmFzZVJlcXVlc3RPcHRpb25zXX0pXVxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgY29uc3RydWN0b3IoaHR0cDpIdHRwKSB7XG4gKiAgICAgaHR0cC5yZXF1ZXN0KCdwZW9wbGUuanNvbicpLnN1YnNjcmliZShyZXMgPT4gdGhpcy5wZW9wbGUgPSByZXMuanNvbigpKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICoqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFhIUkJhY2tlbmQgaW1wbGVtZW50cyBDb25uZWN0aW9uQmFja2VuZCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2Jyb3dzZXJYSFI6IEJyb3dzZXJYaHIsIHByaXZhdGUgX2Jhc2VSZXNwb25zZU9wdGlvbnM6IFJlc3BvbnNlT3B0aW9ucykge31cbiAgY3JlYXRlQ29ubmVjdGlvbihyZXF1ZXN0OiBSZXF1ZXN0KTogWEhSQ29ubmVjdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBYSFJDb25uZWN0aW9uKHJlcXVlc3QsIHRoaXMuX2Jyb3dzZXJYSFIsIHRoaXMuX2Jhc2VSZXNwb25zZU9wdGlvbnMpO1xuICB9XG59XG4iXX0=