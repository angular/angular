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
import { isPresent, isString } from 'angular2/src/facade/lang';
import { Headers } from './headers';
import { RequestMethods } from './enums';
import { Injectable } from 'angular2/core';
import { URLSearchParams } from './url_search_params';
import { normalizeMethodName } from './http_utils';
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
 * import {RequestOptions, Request, RequestMethods} from 'angular2/http';
 *
 * var options = new RequestOptions({
 *   method: RequestMethods.Post,
 *   url: 'https://google.com'
 * });
 * var req = new Request(options);
 * console.log('req.method:', RequestMethods[req.method]); // Post
 * console.log('options.url:', options.url); // https://google.com
 * ```
 */
export class RequestOptions {
    constructor({ method, headers, body, url, search } = {}) {
        this.method = isPresent(method) ? normalizeMethodName(method) : null;
        this.headers = isPresent(headers) ? headers : null;
        this.body = isPresent(body) ? body : null;
        this.url = isPresent(url) ? url : null;
        this.search = isPresent(search) ? (isString(search) ? new URLSearchParams((search)) :
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
     * import {RequestOptions, Request, RequestMethods} from 'angular2/http';
     *
     * var options = new RequestOptions({
     *   method: RequestMethods.Post
     * });
     * var req = new Request(options.merge({
     *   url: 'https://google.com'
     * }));
     * console.log('req.method:', RequestMethods[req.method]); // Post
     * console.log('options.url:', options.url); // null
     * console.log('req.url:', req.url); // https://google.com
     * ```
     */
    merge(options) {
        return new RequestOptions({
            method: isPresent(options) && isPresent(options.method) ? options.method : this.method,
            headers: isPresent(options) && isPresent(options.headers) ? options.headers : this.headers,
            body: isPresent(options) && isPresent(options.body) ? options.body : this.body,
            url: isPresent(options) && isPresent(options.url) ? options.url : this.url,
            search: isPresent(options) && isPresent(options.search) ?
                (isString(options.search) ? new URLSearchParams((options.search)) :
                    (options.search).clone()) :
                this.search
        });
    }
}
/**
 * Subclass of {@link RequestOptions}, with default values.
 *
 * Default values:
 *  * method: {@link RequestMethods RequestMethods.Get}
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
 * import {BaseRequestOptions, Request, RequestMethods} from 'angular2/http';
 *
 * var options = new BaseRequestOptions();
 * var req = new Request(options.merge({
 *   method: RequestMethods.Post,
 *   url: 'https://google.com'
 * }));
 * console.log('req.method:', RequestMethods[req.method]); // Post
 * console.log('options.url:', options.url); // null
 * console.log('req.url:', req.url); // https://google.com
 * ```
 */
export let BaseRequestOptions = class extends RequestOptions {
    constructor() {
        super({ method: RequestMethods.Get, headers: new Headers() });
    }
};
BaseRequestOptions = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], BaseRequestOptions);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZV9yZXF1ZXN0X29wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvaHR0cC9iYXNlX3JlcXVlc3Rfb3B0aW9ucy50cyJdLCJuYW1lcyI6WyJSZXF1ZXN0T3B0aW9ucyIsIlJlcXVlc3RPcHRpb25zLmNvbnN0cnVjdG9yIiwiUmVxdWVzdE9wdGlvbnMubWVyZ2UiLCJCYXNlUmVxdWVzdE9wdGlvbnMiLCJCYXNlUmVxdWVzdE9wdGlvbnMuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUUsUUFBUSxFQUFDLE1BQU0sMEJBQTBCO09BQ3JELEVBQUMsT0FBTyxFQUFDLE1BQU0sV0FBVztPQUMxQixFQUFDLGNBQWMsRUFBQyxNQUFNLFNBQVM7T0FFL0IsRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlO09BQ2pDLEVBQUMsZUFBZSxFQUFDLE1BQU0scUJBQXFCO09BQzVDLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxjQUFjO0FBRWhEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCRztBQUNIO0lBdUJFQSxZQUFZQSxFQUFDQSxNQUFNQSxFQUFFQSxPQUFPQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxNQUFNQSxFQUFDQSxHQUF1QkEsRUFBRUE7UUFDdkVDLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDckVBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBO1FBQ25EQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUMxQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FBR0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDdkNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLElBQUlBLGVBQWVBLENBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQ3BCQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUM5Q0EsSUFBSUEsQ0FBQ0E7SUFDekNBLENBQUNBO0lBRUREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0F3QkdBO0lBQ0hBLEtBQUtBLENBQUNBLE9BQTRCQTtRQUNoQ0UsTUFBTUEsQ0FBQ0EsSUFBSUEsY0FBY0EsQ0FBQ0E7WUFDeEJBLE1BQU1BLEVBQUVBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BO1lBQ3RGQSxPQUFPQSxFQUFFQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQTtZQUMxRkEsSUFBSUEsRUFBRUEsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUE7WUFDOUVBLEdBQUdBLEVBQUVBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBO1lBQzFFQSxNQUFNQSxFQUFFQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQTtnQkFDM0NBLENBQUNBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLElBQUlBLGVBQWVBLENBQVNBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO29CQUMzQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7Z0JBQ3hFQSxJQUFJQSxDQUFDQSxNQUFNQTtTQUN4QkEsQ0FBQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7QUFDSEYsQ0FBQ0E7QUFHRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMENHO0FBQ0gsOENBQ3dDLGNBQWM7SUFDcERHO1FBQWdCQyxNQUFNQSxFQUFDQSxNQUFNQSxFQUFFQSxjQUFjQSxDQUFDQSxHQUFHQSxFQUFFQSxPQUFPQSxFQUFFQSxJQUFJQSxPQUFPQSxFQUFFQSxFQUFDQSxDQUFDQSxDQUFDQTtJQUFDQSxDQUFDQTtBQUNoRkQsQ0FBQ0E7QUFIRDtJQUFDLFVBQVUsRUFBRTs7dUJBR1o7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNQcmVzZW50LCBpc1N0cmluZ30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7SGVhZGVyc30gZnJvbSAnLi9oZWFkZXJzJztcbmltcG9ydCB7UmVxdWVzdE1ldGhvZHN9IGZyb20gJy4vZW51bXMnO1xuaW1wb3J0IHtSZXF1ZXN0T3B0aW9uc0FyZ3N9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtVUkxTZWFyY2hQYXJhbXN9IGZyb20gJy4vdXJsX3NlYXJjaF9wYXJhbXMnO1xuaW1wb3J0IHtub3JtYWxpemVNZXRob2ROYW1lfSBmcm9tICcuL2h0dHBfdXRpbHMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSByZXF1ZXN0IG9wdGlvbnMgb2JqZWN0IHRvIGJlIG9wdGlvbmFsbHkgcHJvdmlkZWQgd2hlbiBpbnN0YW50aWF0aW5nIGFcbiAqIHtAbGluayBSZXF1ZXN0fS5cbiAqXG4gKiBUaGlzIGNsYXNzIGlzIGJhc2VkIG9uIHRoZSBgUmVxdWVzdEluaXRgIGRlc2NyaXB0aW9uIGluIHRoZSBbRmV0Y2hcbiAqIFNwZWNdKGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnLyNyZXF1ZXN0aW5pdCkuXG4gKlxuICogQWxsIHZhbHVlcyBhcmUgbnVsbCBieSBkZWZhdWx0LiBUeXBpY2FsIGRlZmF1bHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUge0BsaW5rIEJhc2VSZXF1ZXN0T3B0aW9uc31cbiAqIGNsYXNzLCB3aGljaCBzdWItY2xhc3NlcyBgUmVxdWVzdE9wdGlvbnNgLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC83V3ZpM2xmTHE0MWFRUEtseEI0Tz9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7UmVxdWVzdE9wdGlvbnMsIFJlcXVlc3QsIFJlcXVlc3RNZXRob2RzfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqXG4gKiB2YXIgb3B0aW9ucyA9IG5ldyBSZXF1ZXN0T3B0aW9ucyh7XG4gKiAgIG1ldGhvZDogUmVxdWVzdE1ldGhvZHMuUG9zdCxcbiAqICAgdXJsOiAnaHR0cHM6Ly9nb29nbGUuY29tJ1xuICogfSk7XG4gKiB2YXIgcmVxID0gbmV3IFJlcXVlc3Qob3B0aW9ucyk7XG4gKiBjb25zb2xlLmxvZygncmVxLm1ldGhvZDonLCBSZXF1ZXN0TWV0aG9kc1tyZXEubWV0aG9kXSk7IC8vIFBvc3RcbiAqIGNvbnNvbGUubG9nKCdvcHRpb25zLnVybDonLCBvcHRpb25zLnVybCk7IC8vIGh0dHBzOi8vZ29vZ2xlLmNvbVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXF1ZXN0T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBIdHRwIG1ldGhvZCB3aXRoIHdoaWNoIHRvIGV4ZWN1dGUgYSB7QGxpbmsgUmVxdWVzdH0uXG4gICAqIEFjY2VwdGFibGUgbWV0aG9kcyBhcmUgZGVmaW5lZCBpbiB0aGUge0BsaW5rIFJlcXVlc3RNZXRob2RzfSBlbnVtLlxuICAgKi9cbiAgbWV0aG9kOiBSZXF1ZXN0TWV0aG9kcyB8IHN0cmluZztcbiAgLyoqXG4gICAqIHtAbGluayBIZWFkZXJzfSB0byBiZSBhdHRhY2hlZCB0byBhIHtAbGluayBSZXF1ZXN0fS5cbiAgICovXG4gIGhlYWRlcnM6IEhlYWRlcnM7XG4gIC8qKlxuICAgKiBCb2R5IHRvIGJlIHVzZWQgd2hlbiBjcmVhdGluZyBhIHtAbGluayBSZXF1ZXN0fS5cbiAgICovXG4gIC8vIFRPRE86IHN1cHBvcnQgRm9ybURhdGEsIEJsb2IsIFVSTFNlYXJjaFBhcmFtc1xuICBib2R5OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBVcmwgd2l0aCB3aGljaCB0byBwZXJmb3JtIGEge0BsaW5rIFJlcXVlc3R9LlxuICAgKi9cbiAgdXJsOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBTZWFyY2ggcGFyYW1ldGVycyB0byBiZSBpbmNsdWRlZCBpbiBhIHtAbGluayBSZXF1ZXN0fS5cbiAgICovXG4gIHNlYXJjaDogVVJMU2VhcmNoUGFyYW1zO1xuICBjb25zdHJ1Y3Rvcih7bWV0aG9kLCBoZWFkZXJzLCBib2R5LCB1cmwsIHNlYXJjaH06IFJlcXVlc3RPcHRpb25zQXJncyA9IHt9KSB7XG4gICAgdGhpcy5tZXRob2QgPSBpc1ByZXNlbnQobWV0aG9kKSA/IG5vcm1hbGl6ZU1ldGhvZE5hbWUobWV0aG9kKSA6IG51bGw7XG4gICAgdGhpcy5oZWFkZXJzID0gaXNQcmVzZW50KGhlYWRlcnMpID8gaGVhZGVycyA6IG51bGw7XG4gICAgdGhpcy5ib2R5ID0gaXNQcmVzZW50KGJvZHkpID8gYm9keSA6IG51bGw7XG4gICAgdGhpcy51cmwgPSBpc1ByZXNlbnQodXJsKSA/IHVybCA6IG51bGw7XG4gICAgdGhpcy5zZWFyY2ggPSBpc1ByZXNlbnQoc2VhcmNoKSA/IChpc1N0cmluZyhzZWFyY2gpID8gbmV3IFVSTFNlYXJjaFBhcmFtcyg8c3RyaW5nPihzZWFyY2gpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFVSTFNlYXJjaFBhcmFtcz4oc2VhcmNoKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoZSBgUmVxdWVzdE9wdGlvbnNgIGluc3RhbmNlLCB1c2luZyB0aGUgb3B0aW9uYWwgaW5wdXQgYXMgdmFsdWVzIHRvIG92ZXJyaWRlXG4gICAqIGV4aXN0aW5nIHZhbHVlcy4gVGhpcyBtZXRob2Qgd2lsbCBub3QgY2hhbmdlIHRoZSB2YWx1ZXMgb2YgdGhlIGluc3RhbmNlIG9uIHdoaWNoIGl0IGlzIGJlaW5nXG4gICAqIGNhbGxlZC5cbiAgICpcbiAgICogTm90ZSB0aGF0IGBoZWFkZXJzYCBhbmQgYHNlYXJjaGAgd2lsbCBvdmVycmlkZSBleGlzdGluZyB2YWx1ZXMgY29tcGxldGVseSBpZiBwcmVzZW50IGluXG4gICAqIHRoZSBgb3B0aW9uc2Agb2JqZWN0LiBJZiB0aGVzZSB2YWx1ZXMgc2hvdWxkIGJlIG1lcmdlZCwgaXQgc2hvdWxkIGJlIGRvbmUgcHJpb3IgdG8gY2FsbGluZ1xuICAgKiBgbWVyZ2VgIG9uIHRoZSBgUmVxdWVzdE9wdGlvbnNgIGluc3RhbmNlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvNnc4WEE4WVRrRFJjUFlwZEI5ZGs/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBpbXBvcnQge1JlcXVlc3RPcHRpb25zLCBSZXF1ZXN0LCBSZXF1ZXN0TWV0aG9kc30gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gICAqXG4gICAqIHZhciBvcHRpb25zID0gbmV3IFJlcXVlc3RPcHRpb25zKHtcbiAgICogICBtZXRob2Q6IFJlcXVlc3RNZXRob2RzLlBvc3RcbiAgICogfSk7XG4gICAqIHZhciByZXEgPSBuZXcgUmVxdWVzdChvcHRpb25zLm1lcmdlKHtcbiAgICogICB1cmw6ICdodHRwczovL2dvb2dsZS5jb20nXG4gICAqIH0pKTtcbiAgICogY29uc29sZS5sb2coJ3JlcS5tZXRob2Q6JywgUmVxdWVzdE1ldGhvZHNbcmVxLm1ldGhvZF0pOyAvLyBQb3N0XG4gICAqIGNvbnNvbGUubG9nKCdvcHRpb25zLnVybDonLCBvcHRpb25zLnVybCk7IC8vIG51bGxcbiAgICogY29uc29sZS5sb2coJ3JlcS51cmw6JywgcmVxLnVybCk7IC8vIGh0dHBzOi8vZ29vZ2xlLmNvbVxuICAgKiBgYGBcbiAgICovXG4gIG1lcmdlKG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBSZXF1ZXN0T3B0aW9ucyB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0T3B0aW9ucyh7XG4gICAgICBtZXRob2Q6IGlzUHJlc2VudChvcHRpb25zKSAmJiBpc1ByZXNlbnQob3B0aW9ucy5tZXRob2QpID8gb3B0aW9ucy5tZXRob2QgOiB0aGlzLm1ldGhvZCxcbiAgICAgIGhlYWRlcnM6IGlzUHJlc2VudChvcHRpb25zKSAmJiBpc1ByZXNlbnQob3B0aW9ucy5oZWFkZXJzKSA/IG9wdGlvbnMuaGVhZGVycyA6IHRoaXMuaGVhZGVycyxcbiAgICAgIGJvZHk6IGlzUHJlc2VudChvcHRpb25zKSAmJiBpc1ByZXNlbnQob3B0aW9ucy5ib2R5KSA/IG9wdGlvbnMuYm9keSA6IHRoaXMuYm9keSxcbiAgICAgIHVybDogaXNQcmVzZW50KG9wdGlvbnMpICYmIGlzUHJlc2VudChvcHRpb25zLnVybCkgPyBvcHRpb25zLnVybCA6IHRoaXMudXJsLFxuICAgICAgc2VhcmNoOiBpc1ByZXNlbnQob3B0aW9ucykgJiYgaXNQcmVzZW50KG9wdGlvbnMuc2VhcmNoKSA/XG4gICAgICAgICAgICAgICAgICAoaXNTdHJpbmcob3B0aW9ucy5zZWFyY2gpID8gbmV3IFVSTFNlYXJjaFBhcmFtcyg8c3RyaW5nPihvcHRpb25zLnNlYXJjaCkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoPFVSTFNlYXJjaFBhcmFtcz4ob3B0aW9ucy5zZWFyY2gpKS5jbG9uZSgpKSA6XG4gICAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaFxuICAgIH0pO1xuICB9XG59XG5cblxuLyoqXG4gKiBTdWJjbGFzcyBvZiB7QGxpbmsgUmVxdWVzdE9wdGlvbnN9LCB3aXRoIGRlZmF1bHQgdmFsdWVzLlxuICpcbiAqIERlZmF1bHQgdmFsdWVzOlxuICogICogbWV0aG9kOiB7QGxpbmsgUmVxdWVzdE1ldGhvZHMgUmVxdWVzdE1ldGhvZHMuR2V0fVxuICogICogaGVhZGVyczogZW1wdHkge0BsaW5rIEhlYWRlcnN9IG9iamVjdFxuICpcbiAqIFRoaXMgY2xhc3MgY291bGQgYmUgZXh0ZW5kZWQgYW5kIGJvdW5kIHRvIHRoZSB7QGxpbmsgUmVxdWVzdE9wdGlvbnN9IGNsYXNzXG4gKiB3aGVuIGNvbmZpZ3VyaW5nIGFuIHtAbGluayBJbmplY3Rvcn0sIGluIG9yZGVyIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9wdGlvbnNcbiAqIHVzZWQgYnkge0BsaW5rIEh0dHB9IHRvIGNyZWF0ZSBhbmQgc2VuZCB7QGxpbmsgUmVxdWVzdCBSZXF1ZXN0c30uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0xFS1ZTeD9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7cHJvdmlkZSwgYm9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG4gKiBpbXBvcnQge0hUVFBfUFJPVklERVJTLCBIdHRwLCBCYXNlUmVxdWVzdE9wdGlvbnMsIFJlcXVlc3RPcHRpb25zfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqIGltcG9ydCB7QXBwfSBmcm9tICcuL215YXBwJztcbiAqXG4gKiBjbGFzcyBNeU9wdGlvbnMgZXh0ZW5kcyBCYXNlUmVxdWVzdE9wdGlvbnMge1xuICogICBzZWFyY2g6IHN0cmluZyA9ICdjb3JlVGVhbT10cnVlJztcbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwLCBbSFRUUF9QUk9WSURFUlMsIHByb3ZpZGUoUmVxdWVzdE9wdGlvbnMsIHt1c2VDbGFzczogTXlPcHRpb25zfSldKTtcbiAqIGBgYFxuICpcbiAqIFRoZSBvcHRpb25zIGNvdWxkIGFsc28gYmUgZXh0ZW5kZWQgd2hlbiBtYW51YWxseSBjcmVhdGluZyBhIHtAbGluayBSZXF1ZXN0fVxuICogb2JqZWN0LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9veUJvRXZOdERoT1NmaTlZeGFWYj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtCYXNlUmVxdWVzdE9wdGlvbnMsIFJlcXVlc3QsIFJlcXVlc3RNZXRob2RzfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqXG4gKiB2YXIgb3B0aW9ucyA9IG5ldyBCYXNlUmVxdWVzdE9wdGlvbnMoKTtcbiAqIHZhciByZXEgPSBuZXcgUmVxdWVzdChvcHRpb25zLm1lcmdlKHtcbiAqICAgbWV0aG9kOiBSZXF1ZXN0TWV0aG9kcy5Qb3N0LFxuICogICB1cmw6ICdodHRwczovL2dvb2dsZS5jb20nXG4gKiB9KSk7XG4gKiBjb25zb2xlLmxvZygncmVxLm1ldGhvZDonLCBSZXF1ZXN0TWV0aG9kc1tyZXEubWV0aG9kXSk7IC8vIFBvc3RcbiAqIGNvbnNvbGUubG9nKCdvcHRpb25zLnVybDonLCBvcHRpb25zLnVybCk7IC8vIG51bGxcbiAqIGNvbnNvbGUubG9nKCdyZXEudXJsOicsIHJlcS51cmwpOyAvLyBodHRwczovL2dvb2dsZS5jb21cbiAqIGBgYFxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQmFzZVJlcXVlc3RPcHRpb25zIGV4dGVuZHMgUmVxdWVzdE9wdGlvbnMge1xuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoe21ldGhvZDogUmVxdWVzdE1ldGhvZHMuR2V0LCBoZWFkZXJzOiBuZXcgSGVhZGVycygpfSk7IH1cbn1cbiJdfQ==