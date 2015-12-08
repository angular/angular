'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var location_strategy_1 = require('./location_strategy');
var async_1 = require('angular2/src/facade/async');
var core_1 = require('angular2/core');
/**
 * `Location` is a service that applications can use to interact with a browser's URL.
 * Depending on which {@link LocationStrategy} is used, `Location` will either persist
 * to the URL's path or the URL's hash segment.
 *
 * Note: it's better to use {@link Router#navigate} service to trigger route changes. Use
 * `Location` only if you need to interact with or create normalized URLs outside of
 * routing.
 *
 * `Location` is responsible for normalizing the URL against the application's base href.
 * A normalized URL is absolute from the URL host, includes the application's base href, and has no
 * trailing slash:
 * - `/my/app/user/123` is normalized
 * - `my/app/user/123` **is not** normalized
 * - `/my/app/user/123/` **is not** normalized
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/angular2';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig,
 *   Location
 * } from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   constructor(location: Location) {
 *     location.go('/foo');
 *   }
 * }
 *
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
var Location = (function () {
    function Location(platformStrategy) {
        var _this = this;
        this.platformStrategy = platformStrategy;
        /** @internal */
        this._subject = new async_1.EventEmitter();
        var browserBaseHref = this.platformStrategy.getBaseHref();
        this._baseHref = stripTrailingSlash(stripIndexHtml(browserBaseHref));
        this.platformStrategy.onPopState(function (_) { async_1.ObservableWrapper.callEmit(_this._subject, { 'url': _this.path(), 'pop': true }); });
    }
    /**
     * Returns the normalized URL path.
     */
    Location.prototype.path = function () { return this.normalize(this.platformStrategy.path()); };
    /**
     * Given a string representing a URL, returns the normalized URL path without leading or
     * trailing slashes
     */
    Location.prototype.normalize = function (url) {
        return stripTrailingSlash(_stripBaseHref(this._baseHref, stripIndexHtml(url)));
    };
    /**
     * Given a string representing a URL, returns the platform-specific external URL path.
     * If the given URL doesn't begin with a leading slash (`'/'`), this method adds one
     * before normalizing. This method will also add a hash if `HashLocationStrategy` is
     * used, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
     */
    Location.prototype.prepareExternalUrl = function (url) {
        if (url.length > 0 && !url.startsWith('/')) {
            url = '/' + url;
        }
        return this.platformStrategy.prepareExternalUrl(url);
    };
    /**
     * Changes the browsers URL to the normalized version of the given URL, and pushes a
     * new item onto the platform's history.
     */
    Location.prototype.go = function (path, query) {
        if (query === void 0) { query = ''; }
        this.platformStrategy.pushState(null, '', path, query);
    };
    /**
     * Navigates forward in the platform's history.
     */
    Location.prototype.forward = function () { this.platformStrategy.forward(); };
    /**
     * Navigates back in the platform's history.
     */
    Location.prototype.back = function () { this.platformStrategy.back(); };
    /**
     * Subscribe to the platform's `popState` events.
     */
    Location.prototype.subscribe = function (onNext, onThrow, onReturn) {
        if (onThrow === void 0) { onThrow = null; }
        if (onReturn === void 0) { onReturn = null; }
        return async_1.ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
    };
    Location = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [location_strategy_1.LocationStrategy])
    ], Location);
    return Location;
})();
exports.Location = Location;
function _stripBaseHref(baseHref, url) {
    if (baseHref.length > 0 && url.startsWith(baseHref)) {
        return url.substring(baseHref.length);
    }
    return url;
}
function stripIndexHtml(url) {
    if (/\/index.html$/g.test(url)) {
        // '/index.html'.length == 11
        return url.substring(0, url.length - 11);
    }
    return url;
}
function stripTrailingSlash(url) {
    if (/\/$/g.test(url)) {
        url = url.substring(0, url.length - 1);
    }
    return url;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbIkxvY2F0aW9uIiwiTG9jYXRpb24uY29uc3RydWN0b3IiLCJMb2NhdGlvbi5wYXRoIiwiTG9jYXRpb24ubm9ybWFsaXplIiwiTG9jYXRpb24ucHJlcGFyZUV4dGVybmFsVXJsIiwiTG9jYXRpb24uZ28iLCJMb2NhdGlvbi5mb3J3YXJkIiwiTG9jYXRpb24uYmFjayIsIkxvY2F0aW9uLnN1YnNjcmliZSIsIl9zdHJpcEJhc2VIcmVmIiwic3RyaXBJbmRleEh0bWwiLCJzdHJpcFRyYWlsaW5nU2xhc2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsa0NBQStCLHFCQUFxQixDQUFDLENBQUE7QUFDckQsc0JBQThDLDJCQUEyQixDQUFDLENBQUE7QUFDMUUscUJBQWlDLGVBQWUsQ0FBQyxDQUFBO0FBRWpEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Q0c7QUFDSDtJQU9FQSxrQkFBbUJBLGdCQUFrQ0E7UUFQdkRDLGlCQWlFQ0E7UUExRG9CQSxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQWtCQTtRQUxyREEsZ0JBQWdCQTtRQUNoQkEsYUFBUUEsR0FBc0JBLElBQUlBLG9CQUFZQSxFQUFFQSxDQUFDQTtRQUsvQ0EsSUFBSUEsZUFBZUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUMxREEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0Esa0JBQWtCQSxDQUFDQSxjQUFjQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNyRUEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxVQUFVQSxDQUM1QkEsVUFBQ0EsQ0FBQ0EsSUFBT0EseUJBQWlCQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxFQUFD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QUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMvQkEsNkJBQTZCQTtRQUM3QkEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsTUFBTUEsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFDM0NBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO0FBQ2JBLENBQUNBO0FBRUQsNEJBQTRCLEdBQVc7SUFDckNDLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3JCQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN6Q0EsQ0FBQ0E7SUFDREEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7QUFDYkEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJy4vbG9jYXRpb25fc3RyYXRlZ3knO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuLyoqXG4gKiBgTG9jYXRpb25gIGlzIGEgc2VydmljZSB0aGF0IGFwcGxpY2F0aW9ucyBjYW4gdXNlIHRvIGludGVyYWN0IHdpdGggYSBicm93c2VyJ3MgVVJMLlxuICogRGVwZW5kaW5nIG9uIHdoaWNoIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fSBpcyB1c2VkLCBgTG9jYXRpb25gIHdpbGwgZWl0aGVyIHBlcnNpc3RcbiAqIHRvIHRoZSBVUkwncyBwYXRoIG9yIHRoZSBVUkwncyBoYXNoIHNlZ21lbnQuXG4gKlxuICogTm90ZTogaXQncyBiZXR0ZXIgdG8gdXNlIHtAbGluayBSb3V0ZXIjbmF2aWdhdGV9IHNlcnZpY2UgdG8gdHJpZ2dlciByb3V0ZSBjaGFuZ2VzLiBVc2VcbiAqIGBMb2NhdGlvbmAgb25seSBpZiB5b3UgbmVlZCB0byBpbnRlcmFjdCB3aXRoIG9yIGNyZWF0ZSBub3JtYWxpemVkIFVSTHMgb3V0c2lkZSBvZlxuICogcm91dGluZy5cbiAqXG4gKiBgTG9jYXRpb25gIGlzIHJlc3BvbnNpYmxlIGZvciBub3JtYWxpemluZyB0aGUgVVJMIGFnYWluc3QgdGhlIGFwcGxpY2F0aW9uJ3MgYmFzZSBocmVmLlxuICogQSBub3JtYWxpemVkIFVSTCBpcyBhYnNvbHV0ZSBmcm9tIHRoZSBVUkwgaG9zdCwgaW5jbHVkZXMgdGhlIGFwcGxpY2F0aW9uJ3MgYmFzZSBocmVmLCBhbmQgaGFzIG5vXG4gKiB0cmFpbGluZyBzbGFzaDpcbiAqIC0gYC9teS9hcHAvdXNlci8xMjNgIGlzIG5vcm1hbGl6ZWRcbiAqIC0gYG15L2FwcC91c2VyLzEyM2AgKippcyBub3QqKiBub3JtYWxpemVkXG4gKiAtIGAvbXkvYXBwL3VzZXIvMTIzL2AgKippcyBub3QqKiBub3JtYWxpemVkXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG4gKiBpbXBvcnQge1xuICogICBST1VURVJfRElSRUNUSVZFUyxcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgUm91dGVDb25maWcsXG4gKiAgIExvY2F0aW9uXG4gKiB9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHsuLi59LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7XG4gKiAgIGNvbnN0cnVjdG9yKGxvY2F0aW9uOiBMb2NhdGlvbikge1xuICogICAgIGxvY2F0aW9uLmdvKCcvZm9vJyk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBbUk9VVEVSX1BST1ZJREVSU10pO1xuICogYGBgXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBMb2NhdGlvbiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N1YmplY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9iYXNlSHJlZjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwbGF0Zm9ybVN0cmF0ZWd5OiBMb2NhdGlvblN0cmF0ZWd5KSB7XG4gICAgdmFyIGJyb3dzZXJCYXNlSHJlZiA9IHRoaXMucGxhdGZvcm1TdHJhdGVneS5nZXRCYXNlSHJlZigpO1xuICAgIHRoaXMuX2Jhc2VIcmVmID0gc3RyaXBUcmFpbGluZ1NsYXNoKHN0cmlwSW5kZXhIdG1sKGJyb3dzZXJCYXNlSHJlZikpO1xuICAgIHRoaXMucGxhdGZvcm1TdHJhdGVneS5vblBvcFN0YXRlKFxuICAgICAgICAoXykgPT4geyBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLl9zdWJqZWN0LCB7J3VybCc6IHRoaXMucGF0aCgpLCAncG9wJzogdHJ1ZX0pOyB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBub3JtYWxpemVkIFVSTCBwYXRoLlxuICAgKi9cbiAgcGF0aCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5ub3JtYWxpemUodGhpcy5wbGF0Zm9ybVN0cmF0ZWd5LnBhdGgoKSk7IH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgVVJMLCByZXR1cm5zIHRoZSBub3JtYWxpemVkIFVSTCBwYXRoIHdpdGhvdXQgbGVhZGluZyBvclxuICAgKiB0cmFpbGluZyBzbGFzaGVzXG4gICAqL1xuICBub3JtYWxpemUodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBzdHJpcFRyYWlsaW5nU2xhc2goX3N0cmlwQmFzZUhyZWYodGhpcy5fYmFzZUhyZWYsIHN0cmlwSW5kZXhIdG1sKHVybCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIHN0cmluZyByZXByZXNlbnRpbmcgYSBVUkwsIHJldHVybnMgdGhlIHBsYXRmb3JtLXNwZWNpZmljIGV4dGVybmFsIFVSTCBwYXRoLlxuICAgKiBJZiB0aGUgZ2l2ZW4gVVJMIGRvZXNuJ3QgYmVnaW4gd2l0aCBhIGxlYWRpbmcgc2xhc2ggKGAnLydgKSwgdGhpcyBtZXRob2QgYWRkcyBvbmVcbiAgICogYmVmb3JlIG5vcm1hbGl6aW5nLiBUaGlzIG1ldGhvZCB3aWxsIGFsc28gYWRkIGEgaGFzaCBpZiBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgIGlzXG4gICAqIHVzZWQsIG9yIHRoZSBgQVBQX0JBU0VfSFJFRmAgaWYgdGhlIGBQYXRoTG9jYXRpb25TdHJhdGVneWAgaXMgaW4gdXNlLlxuICAgKi9cbiAgcHJlcGFyZUV4dGVybmFsVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodXJsLmxlbmd0aCA+IDAgJiYgIXVybC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgIHVybCA9ICcvJyArIHVybDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGxhdGZvcm1TdHJhdGVneS5wcmVwYXJlRXh0ZXJuYWxVcmwodXJsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBicm93c2VycyBVUkwgdG8gdGhlIG5vcm1hbGl6ZWQgdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gVVJMLCBhbmQgcHVzaGVzIGFcbiAgICogbmV3IGl0ZW0gb250byB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5LlxuICAgKi9cbiAgZ28ocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpOiB2b2lkIHtcbiAgICB0aGlzLnBsYXRmb3JtU3RyYXRlZ3kucHVzaFN0YXRlKG51bGwsICcnLCBwYXRoLCBxdWVyeSk7XG4gIH1cblxuICAvKipcbiAgICogTmF2aWdhdGVzIGZvcndhcmQgaW4gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeS5cbiAgICovXG4gIGZvcndhcmQoKTogdm9pZCB7IHRoaXMucGxhdGZvcm1TdHJhdGVneS5mb3J3YXJkKCk7IH1cblxuICAvKipcbiAgICogTmF2aWdhdGVzIGJhY2sgaW4gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeS5cbiAgICovXG4gIGJhY2soKTogdm9pZCB7IHRoaXMucGxhdGZvcm1TdHJhdGVneS5iYWNrKCk7IH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBwbGF0Zm9ybSdzIGBwb3BTdGF0ZWAgZXZlbnRzLlxuICAgKi9cbiAgc3Vic2NyaWJlKG9uTmV4dDogKHZhbHVlOiBhbnkpID0+IHZvaWQsIG9uVGhyb3c6IChleGNlcHRpb246IGFueSkgPT4gdm9pZCA9IG51bGwsXG4gICAgICAgICAgICBvblJldHVybjogKCkgPT4gdm9pZCA9IG51bGwpOiBPYmplY3Qge1xuICAgIHJldHVybiBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUodGhpcy5fc3ViamVjdCwgb25OZXh0LCBvblRocm93LCBvblJldHVybik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX3N0cmlwQmFzZUhyZWYoYmFzZUhyZWY6IHN0cmluZywgdXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoYmFzZUhyZWYubGVuZ3RoID4gMCAmJiB1cmwuc3RhcnRzV2l0aChiYXNlSHJlZikpIHtcbiAgICByZXR1cm4gdXJsLnN1YnN0cmluZyhiYXNlSHJlZi5sZW5ndGgpO1xuICB9XG4gIHJldHVybiB1cmw7XG59XG5cbmZ1bmN0aW9uIHN0cmlwSW5kZXhIdG1sKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKC9cXC9pbmRleC5odG1sJC9nLnRlc3QodXJsKSkge1xuICAgIC8vICcvaW5kZXguaHRtbCcubGVuZ3RoID09IDExXG4gICAgcmV0dXJuIHVybC5zdWJzdHJpbmcoMCwgdXJsLmxlbmd0aCAtIDExKTtcbiAgfVxuICByZXR1cm4gdXJsO1xufVxuXG5mdW5jdGlvbiBzdHJpcFRyYWlsaW5nU2xhc2godXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoL1xcLyQvZy50ZXN0KHVybCkpIHtcbiAgICB1cmwgPSB1cmwuc3Vic3RyaW5nKDAsIHVybC5sZW5ndGggLSAxKTtcbiAgfVxuICByZXR1cm4gdXJsO1xufVxuIl19