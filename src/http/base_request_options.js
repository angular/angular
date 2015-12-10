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
var headers_1 = require('./headers');
var enums_1 = require('./enums');
var core_1 = require('angular2/core');
var url_search_params_1 = require('./url_search_params');
var http_utils_1 = require('./http_utils');
/**
 * Creates a request options object to be optionally provided when instantiating a
 * {@link Request}.
 *
 * This class is based on the `RequestInit` description in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#requestinit).
 *
 * All values are null by default. Typical defaults can be found in the {@link BaseRequestOptions}
 * class, which sub-classes `RequestOptions`.
 *
 * ### Example ([live demo](http://plnkr.co/edit/7Wvi3lfLq41aQPKlxB4O?p=preview))
 *
 * ```typescript
 * import {RequestOptions, Request, RequestMethod} from 'angular2/http';
 *
 * var options = new RequestOptions({
 *   method: RequestMethod.Post,
 *   url: 'https://google.com'
 * });
 * var req = new Request(options);
 * console.log('req.method:', RequestMethod[req.method]); // Post
 * console.log('options.url:', options.url); // https://google.com
 * ```
 */
var RequestOptions = (function () {
    function RequestOptions(_a) {
        var _b = _a === void 0 ? {} : _a, method = _b.method, headers = _b.headers, body = _b.body, url = _b.url, search = _b.search;
        this.method = lang_1.isPresent(method) ? http_utils_1.normalizeMethodName(method) : null;
        this.headers = lang_1.isPresent(headers) ? headers : null;
        this.body = lang_1.isPresent(body) ? body : null;
        this.url = lang_1.isPresent(url) ? url : null;
        this.search = lang_1.isPresent(search) ? (lang_1.isString(search) ? new url_search_params_1.URLSearchParams((search)) :
            (search)) :
            null;
    }
    /**
     * Creates a copy of the `RequestOptions` instance, using the optional input as values to override
     * existing values. This method will not change the values of the instance on which it is being
     * called.
     *
     * Note that `headers` and `search` will override existing values completely if present in
     * the `options` object. If these values should be merged, it should be done prior to calling
     * `merge` on the `RequestOptions` instance.
     *
     * ### Example ([live demo](http://plnkr.co/edit/6w8XA8YTkDRcPYpdB9dk?p=preview))
     *
     * ```typescript
     * import {RequestOptions, Request, RequestMethod} from 'angular2/http';
     *
     * var options = new RequestOptions({
     *   method: RequestMethod.Post
     * });
     * var req = new Request(options.merge({
     *   url: 'https://google.com'
     * }));
     * console.log('req.method:', RequestMethod[req.method]); // Post
     * console.log('options.url:', options.url); // null
     * console.log('req.url:', req.url); // https://google.com
     * ```
     */
    RequestOptions.prototype.merge = function (options) {
        return new RequestOptions({
            method: lang_1.isPresent(options) && lang_1.isPresent(options.method) ? options.method : this.method,
            headers: lang_1.isPresent(options) && lang_1.isPresent(options.headers) ? options.headers : this.headers,
            body: lang_1.isPresent(options) && lang_1.isPresent(options.body) ? options.body : this.body,
            url: lang_1.isPresent(options) && lang_1.isPresent(options.url) ? options.url : this.url,
            search: lang_1.isPresent(options) && lang_1.isPresent(options.search) ?
                (lang_1.isString(options.search) ? new url_search_params_1.URLSearchParams((options.search)) :
                    (options.search).clone()) :
                this.search
        });
    };
    return RequestOptions;
})();
exports.RequestOptions = RequestOptions;
/**
 * Subclass of {@link RequestOptions}, with default values.
 *
 * Default values:
 *  * method: {@link RequestMethod RequestMethod.Get}
 *  * headers: empty {@link Headers} object
 *
 * This class could be extended and bound to the {@link RequestOptions} class
 * when configuring an {@link Injector}, in order to override the default options
 * used by {@link Http} to create and send {@link Request Requests}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/LEKVSx?p=preview))
 *
 * ```typescript
 * import {provide, bootstrap} from 'angular2/angular2';
 * import {HTTP_PROVIDERS, Http, BaseRequestOptions, RequestOptions} from 'angular2/http';
 * import {App} from './myapp';
 *
 * class MyOptions extends BaseRequestOptions {
 *   search: string = 'coreTeam=true';
 * }
 *
 * bootstrap(App, [HTTP_PROVIDERS, provide(RequestOptions, {useClass: MyOptions})]);
 * ```
 *
 * The options could also be extended when manually creating a {@link Request}
 * object.
 *
 * ### Example ([live demo](http://plnkr.co/edit/oyBoEvNtDhOSfi9YxaVb?p=preview))
 *
 * ```
 * import {BaseRequestOptions, Request, RequestMethod} from 'angular2/http';
 *
 * var options = new BaseRequestOptions();
 * var req = new Request(options.merge({
 *   method: RequestMethod.Post,
 *   url: 'https://google.com'
 * }));
 * console.log('req.method:', RequestMethod[req.method]); // Post
 * console.log('options.url:', options.url); // null
 * console.log('req.url:', req.url); // https://google.com
 * ```
 */
var BaseRequestOptions = (function (_super) {
    __extends(BaseRequestOptions, _super);
    function BaseRequestOptions() {
        _super.call(this, { method: enums_1.RequestMethod.Get, headers: new headers_1.Headers() });
    }
    BaseRequestOptions = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], BaseRequestOptions);
    return BaseRequestOptions;
})(RequestOptions);
exports.BaseRequestOptions = BaseRequestOptions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZV9yZXF1ZXN0X29wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvaHR0cC9iYXNlX3JlcXVlc3Rfb3B0aW9ucy50cyJdLCJuYW1lcyI6WyJSZXF1ZXN0T3B0aW9ucyIsIlJlcXVlc3RPcHRpb25zLmNvbnN0cnVjdG9yIiwiUmVxdWVzdE9wdGlvbnMubWVyZ2UiLCJCYXNlUmVxdWVzdE9wdGlvbnMiLCJCYXNlUmVxdWVzdE9wdGlvbnMuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQkFBa0MsMEJBQTBCLENBQUMsQ0FBQTtBQUM3RCx3QkFBc0IsV0FBVyxDQUFDLENBQUE7QUFDbEMsc0JBQTRCLFNBQVMsQ0FBQyxDQUFBO0FBRXRDLHFCQUF5QixlQUFlLENBQUMsQ0FBQTtBQUN6QyxrQ0FBOEIscUJBQXFCLENBQUMsQ0FBQTtBQUNwRCwyQkFBa0MsY0FBYyxDQUFDLENBQUE7QUFFakQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0g7SUF1QkVBLHdCQUFZQSxFQUE2REE7aUNBQUZDLEVBQUVBLE9BQTVEQSxNQUFNQSxjQUFFQSxPQUFPQSxlQUFFQSxJQUFJQSxZQUFFQSxHQUFHQSxXQUFFQSxNQUFNQTtRQUM3Q0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsZ0JBQVNBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLGdDQUFtQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDckVBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLGdCQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNuREEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQzFDQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxnQkFBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDdkNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLGdCQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxlQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxJQUFJQSxtQ0FBZUEsQ0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQzlDQSxJQUFJQSxDQUFDQTtJQUN6Q0EsQ0FBQ0E7SUFFREQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXdCR0E7SUFDSEEsOEJBQUtBLEdBQUxBLFVBQU1BLE9BQTRCQTtRQUNoQ0UsTUFBTUEsQ0FBQ0EsSUFBSUEsY0FBY0EsQ0FBQ0E7WUFDeEJBLE1BQU1BLEVBQUVBLGdCQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUE7WUFDdEZBLE9BQU9BLEVBQUVBLGdCQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0E7WUFDMUZBLElBQUlBLEVBQUVBLGdCQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUE7WUFDOUVBLEdBQUdBLEVBQUVBLGdCQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0E7WUFDMUVBLE1BQU1BLEVBQUVBLGdCQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0E7Z0JBQzNDQSxDQUFDQSxlQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxJQUFJQSxtQ0FBZUEsQ0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7b0JBQzNCQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtnQkFDeEVBLElBQUlBLENBQUNBLE1BQU1BO1NBQ3hCQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUNIRixxQkFBQ0E7QUFBREEsQ0FBQ0EsQUF0RUQsSUFzRUM7QUF0RVksc0JBQWMsaUJBc0UxQixDQUFBO0FBR0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBDRztBQUNIO0lBQ3dDRyxzQ0FBY0E7SUFDcERBO1FBQWdCQyxrQkFBTUEsRUFBQ0EsTUFBTUEsRUFBRUEscUJBQWFBLENBQUNBLEdBQUdBLEVBQUVBLE9BQU9BLEVBQUVBLElBQUlBLGlCQUFPQSxFQUFFQSxFQUFDQSxDQUFDQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUYvRUQ7UUFBQ0EsaUJBQVVBLEVBQUVBOzsyQkFHWkE7SUFBREEseUJBQUNBO0FBQURBLENBQUNBLEFBSEQsRUFDd0MsY0FBYyxFQUVyRDtBQUZZLDBCQUFrQixxQkFFOUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNQcmVzZW50LCBpc1N0cmluZ30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7SGVhZGVyc30gZnJvbSAnLi9oZWFkZXJzJztcbmltcG9ydCB7UmVxdWVzdE1ldGhvZH0gZnJvbSAnLi9lbnVtcyc7XG5pbXBvcnQge1JlcXVlc3RPcHRpb25zQXJnc30gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1VSTFNlYXJjaFBhcmFtc30gZnJvbSAnLi91cmxfc2VhcmNoX3BhcmFtcyc7XG5pbXBvcnQge25vcm1hbGl6ZU1ldGhvZE5hbWV9IGZyb20gJy4vaHR0cF91dGlscyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHJlcXVlc3Qgb3B0aW9ucyBvYmplY3QgdG8gYmUgb3B0aW9uYWxseSBwcm92aWRlZCB3aGVuIGluc3RhbnRpYXRpbmcgYVxuICoge0BsaW5rIFJlcXVlc3R9LlxuICpcbiAqIFRoaXMgY2xhc3MgaXMgYmFzZWQgb24gdGhlIGBSZXF1ZXN0SW5pdGAgZGVzY3JpcHRpb24gaW4gdGhlIFtGZXRjaFxuICogU3BlY10oaHR0cHM6Ly9mZXRjaC5zcGVjLndoYXR3Zy5vcmcvI3JlcXVlc3Rpbml0KS5cbiAqXG4gKiBBbGwgdmFsdWVzIGFyZSBudWxsIGJ5IGRlZmF1bHQuIFR5cGljYWwgZGVmYXVsdHMgY2FuIGJlIGZvdW5kIGluIHRoZSB7QGxpbmsgQmFzZVJlcXVlc3RPcHRpb25zfVxuICogY2xhc3MsIHdoaWNoIHN1Yi1jbGFzc2VzIGBSZXF1ZXN0T3B0aW9uc2AuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0LzdXdmkzbGZMcTQxYVFQS2x4QjRPP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtSZXF1ZXN0T3B0aW9ucywgUmVxdWVzdCwgUmVxdWVzdE1ldGhvZH0gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKlxuICogdmFyIG9wdGlvbnMgPSBuZXcgUmVxdWVzdE9wdGlvbnMoe1xuICogICBtZXRob2Q6IFJlcXVlc3RNZXRob2QuUG9zdCxcbiAqICAgdXJsOiAnaHR0cHM6Ly9nb29nbGUuY29tJ1xuICogfSk7XG4gKiB2YXIgcmVxID0gbmV3IFJlcXVlc3Qob3B0aW9ucyk7XG4gKiBjb25zb2xlLmxvZygncmVxLm1ldGhvZDonLCBSZXF1ZXN0TWV0aG9kW3JlcS5tZXRob2RdKTsgLy8gUG9zdFxuICogY29uc29sZS5sb2coJ29wdGlvbnMudXJsOicsIG9wdGlvbnMudXJsKTsgLy8gaHR0cHM6Ly9nb29nbGUuY29tXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJlcXVlc3RPcHRpb25zIHtcbiAgLyoqXG4gICAqIEh0dHAgbWV0aG9kIHdpdGggd2hpY2ggdG8gZXhlY3V0ZSBhIHtAbGluayBSZXF1ZXN0fS5cbiAgICogQWNjZXB0YWJsZSBtZXRob2RzIGFyZSBkZWZpbmVkIGluIHRoZSB7QGxpbmsgUmVxdWVzdE1ldGhvZH0gZW51bS5cbiAgICovXG4gIG1ldGhvZDogUmVxdWVzdE1ldGhvZCB8IHN0cmluZztcbiAgLyoqXG4gICAqIHtAbGluayBIZWFkZXJzfSB0byBiZSBhdHRhY2hlZCB0byBhIHtAbGluayBSZXF1ZXN0fS5cbiAgICovXG4gIGhlYWRlcnM6IEhlYWRlcnM7XG4gIC8qKlxuICAgKiBCb2R5IHRvIGJlIHVzZWQgd2hlbiBjcmVhdGluZyBhIHtAbGluayBSZXF1ZXN0fS5cbiAgICovXG4gIC8vIFRPRE86IHN1cHBvcnQgRm9ybURhdGEsIEJsb2IsIFVSTFNlYXJjaFBhcmFtc1xuICBib2R5OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBVcmwgd2l0aCB3aGljaCB0byBwZXJmb3JtIGEge0BsaW5rIFJlcXVlc3R9LlxuICAgKi9cbiAgdXJsOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBTZWFyY2ggcGFyYW1ldGVycyB0byBiZSBpbmNsdWRlZCBpbiBhIHtAbGluayBSZXF1ZXN0fS5cbiAgICovXG4gIHNlYXJjaDogVVJMU2VhcmNoUGFyYW1zO1xuICBjb25zdHJ1Y3Rvcih7bWV0aG9kLCBoZWFkZXJzLCBib2R5LCB1cmwsIHNlYXJjaH06IFJlcXVlc3RPcHRpb25zQXJncyA9IHt9KSB7XG4gICAgdGhpcy5tZXRob2QgPSBpc1ByZXNlbnQobWV0aG9kKSA/IG5vcm1hbGl6ZU1ldGhvZE5hbWUobWV0aG9kKSA6IG51bGw7XG4gICAgdGhpcy5oZWFkZXJzID0gaXNQcmVzZW50KGhlYWRlcnMpID8gaGVhZGVycyA6IG51bGw7XG4gICAgdGhpcy5ib2R5ID0gaXNQcmVzZW50KGJvZHkpID8gYm9keSA6IG51bGw7XG4gICAgdGhpcy51cmwgPSBpc1ByZXNlbnQodXJsKSA/IHVybCA6IG51bGw7XG4gICAgdGhpcy5zZWFyY2ggPSBpc1ByZXNlbnQoc2VhcmNoKSA/IChpc1N0cmluZyhzZWFyY2gpID8gbmV3IFVSTFNlYXJjaFBhcmFtcyg8c3RyaW5nPihzZWFyY2gpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFVSTFNlYXJjaFBhcmFtcz4oc2VhcmNoKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoZSBgUmVxdWVzdE9wdGlvbnNgIGluc3RhbmNlLCB1c2luZyB0aGUgb3B0aW9uYWwgaW5wdXQgYXMgdmFsdWVzIHRvIG92ZXJyaWRlXG4gICAqIGV4aXN0aW5nIHZhbHVlcy4gVGhpcyBtZXRob2Qgd2lsbCBub3QgY2hhbmdlIHRoZSB2YWx1ZXMgb2YgdGhlIGluc3RhbmNlIG9uIHdoaWNoIGl0IGlzIGJlaW5nXG4gICAqIGNhbGxlZC5cbiAgICpcbiAgICogTm90ZSB0aGF0IGBoZWFkZXJzYCBhbmQgYHNlYXJjaGAgd2lsbCBvdmVycmlkZSBleGlzdGluZyB2YWx1ZXMgY29tcGxldGVseSBpZiBwcmVzZW50IGluXG4gICAqIHRoZSBgb3B0aW9uc2Agb2JqZWN0LiBJZiB0aGVzZSB2YWx1ZXMgc2hvdWxkIGJlIG1lcmdlZCwgaXQgc2hvdWxkIGJlIGRvbmUgcHJpb3IgdG8gY2FsbGluZ1xuICAgKiBgbWVyZ2VgIG9uIHRoZSBgUmVxdWVzdE9wdGlvbnNgIGluc3RhbmNlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvNnc4WEE4WVRrRFJjUFlwZEI5ZGs/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBpbXBvcnQge1JlcXVlc3RPcHRpb25zLCBSZXF1ZXN0LCBSZXF1ZXN0TWV0aG9kfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAgICpcbiAgICogdmFyIG9wdGlvbnMgPSBuZXcgUmVxdWVzdE9wdGlvbnMoe1xuICAgKiAgIG1ldGhvZDogUmVxdWVzdE1ldGhvZC5Qb3N0XG4gICAqIH0pO1xuICAgKiB2YXIgcmVxID0gbmV3IFJlcXVlc3Qob3B0aW9ucy5tZXJnZSh7XG4gICAqICAgdXJsOiAnaHR0cHM6Ly9nb29nbGUuY29tJ1xuICAgKiB9KSk7XG4gICAqIGNvbnNvbGUubG9nKCdyZXEubWV0aG9kOicsIFJlcXVlc3RNZXRob2RbcmVxLm1ldGhvZF0pOyAvLyBQb3N0XG4gICAqIGNvbnNvbGUubG9nKCdvcHRpb25zLnVybDonLCBvcHRpb25zLnVybCk7IC8vIG51bGxcbiAgICogY29uc29sZS5sb2coJ3JlcS51cmw6JywgcmVxLnVybCk7IC8vIGh0dHBzOi8vZ29vZ2xlLmNvbVxuICAgKiBgYGBcbiAgICovXG4gIG1lcmdlKG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBSZXF1ZXN0T3B0aW9ucyB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0T3B0aW9ucyh7XG4gICAgICBtZXRob2Q6IGlzUHJlc2VudChvcHRpb25zKSAmJiBpc1ByZXNlbnQob3B0aW9ucy5tZXRob2QpID8gb3B0aW9ucy5tZXRob2QgOiB0aGlzLm1ldGhvZCxcbiAgICAgIGhlYWRlcnM6IGlzUHJlc2VudChvcHRpb25zKSAmJiBpc1ByZXNlbnQob3B0aW9ucy5oZWFkZXJzKSA/IG9wdGlvbnMuaGVhZGVycyA6IHRoaXMuaGVhZGVycyxcbiAgICAgIGJvZHk6IGlzUHJlc2VudChvcHRpb25zKSAmJiBpc1ByZXNlbnQob3B0aW9ucy5ib2R5KSA/IG9wdGlvbnMuYm9keSA6IHRoaXMuYm9keSxcbiAgICAgIHVybDogaXNQcmVzZW50KG9wdGlvbnMpICYmIGlzUHJlc2VudChvcHRpb25zLnVybCkgPyBvcHRpb25zLnVybCA6IHRoaXMudXJsLFxuICAgICAgc2VhcmNoOiBpc1ByZXNlbnQob3B0aW9ucykgJiYgaXNQcmVzZW50KG9wdGlvbnMuc2VhcmNoKSA/XG4gICAgICAgICAgICAgICAgICAoaXNTdHJpbmcob3B0aW9ucy5zZWFyY2gpID8gbmV3IFVSTFNlYXJjaFBhcmFtcyg8c3RyaW5nPihvcHRpb25zLnNlYXJjaCkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoPFVSTFNlYXJjaFBhcmFtcz4ob3B0aW9ucy5zZWFyY2gpKS5jbG9uZSgpKSA6XG4gICAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaFxuICAgIH0pO1xuICB9XG59XG5cblxuLyoqXG4gKiBTdWJjbGFzcyBvZiB7QGxpbmsgUmVxdWVzdE9wdGlvbnN9LCB3aXRoIGRlZmF1bHQgdmFsdWVzLlxuICpcbiAqIERlZmF1bHQgdmFsdWVzOlxuICogICogbWV0aG9kOiB7QGxpbmsgUmVxdWVzdE1ldGhvZCBSZXF1ZXN0TWV0aG9kLkdldH1cbiAqICAqIGhlYWRlcnM6IGVtcHR5IHtAbGluayBIZWFkZXJzfSBvYmplY3RcbiAqXG4gKiBUaGlzIGNsYXNzIGNvdWxkIGJlIGV4dGVuZGVkIGFuZCBib3VuZCB0byB0aGUge0BsaW5rIFJlcXVlc3RPcHRpb25zfSBjbGFzc1xuICogd2hlbiBjb25maWd1cmluZyBhbiB7QGxpbmsgSW5qZWN0b3J9LCBpbiBvcmRlciB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zXG4gKiB1c2VkIGJ5IHtAbGluayBIdHRwfSB0byBjcmVhdGUgYW5kIHNlbmQge0BsaW5rIFJlcXVlc3QgUmVxdWVzdHN9LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9MRUtWU3g/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge3Byb3ZpZGUsIGJvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuICogaW1wb3J0IHtIVFRQX1BST1ZJREVSUywgSHR0cCwgQmFzZVJlcXVlc3RPcHRpb25zLCBSZXF1ZXN0T3B0aW9uc30gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKiBpbXBvcnQge0FwcH0gZnJvbSAnLi9teWFwcCc7XG4gKlxuICogY2xhc3MgTXlPcHRpb25zIGV4dGVuZHMgQmFzZVJlcXVlc3RPcHRpb25zIHtcbiAqICAgc2VhcmNoOiBzdHJpbmcgPSAnY29yZVRlYW09dHJ1ZSc7XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcCwgW0hUVFBfUFJPVklERVJTLCBwcm92aWRlKFJlcXVlc3RPcHRpb25zLCB7dXNlQ2xhc3M6IE15T3B0aW9uc30pXSk7XG4gKiBgYGBcbiAqXG4gKiBUaGUgb3B0aW9ucyBjb3VsZCBhbHNvIGJlIGV4dGVuZGVkIHdoZW4gbWFudWFsbHkgY3JlYXRpbmcgYSB7QGxpbmsgUmVxdWVzdH1cbiAqIG9iamVjdC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvb3lCb0V2TnREaE9TZmk5WXhhVmI/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7QmFzZVJlcXVlc3RPcHRpb25zLCBSZXF1ZXN0LCBSZXF1ZXN0TWV0aG9kfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqXG4gKiB2YXIgb3B0aW9ucyA9IG5ldyBCYXNlUmVxdWVzdE9wdGlvbnMoKTtcbiAqIHZhciByZXEgPSBuZXcgUmVxdWVzdChvcHRpb25zLm1lcmdlKHtcbiAqICAgbWV0aG9kOiBSZXF1ZXN0TWV0aG9kLlBvc3QsXG4gKiAgIHVybDogJ2h0dHBzOi8vZ29vZ2xlLmNvbSdcbiAqIH0pKTtcbiAqIGNvbnNvbGUubG9nKCdyZXEubWV0aG9kOicsIFJlcXVlc3RNZXRob2RbcmVxLm1ldGhvZF0pOyAvLyBQb3N0XG4gKiBjb25zb2xlLmxvZygnb3B0aW9ucy51cmw6Jywgb3B0aW9ucy51cmwpOyAvLyBudWxsXG4gKiBjb25zb2xlLmxvZygncmVxLnVybDonLCByZXEudXJsKTsgLy8gaHR0cHM6Ly9nb29nbGUuY29tXG4gKiBgYGBcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJhc2VSZXF1ZXN0T3B0aW9ucyBleHRlbmRzIFJlcXVlc3RPcHRpb25zIHtcbiAgY29uc3RydWN0b3IoKSB7IHN1cGVyKHttZXRob2Q6IFJlcXVlc3RNZXRob2QuR2V0LCBoZWFkZXJzOiBuZXcgSGVhZGVycygpfSk7IH1cbn1cbiJdfQ==