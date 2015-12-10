'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
        this.platformStrategy.onPopState(function (ev) {
            async_1.ObservableWrapper.callEmit(_this._subject, { 'url': _this.path(), 'pop': true, 'type': ev.type });
        });
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
    // TODO: rename this method to pushState
    /**
     * Changes the browsers URL to the normalized version of the given URL, and pushes a
     * new item onto the platform's history.
     */
    Location.prototype.go = function (path, query) {
        if (query === void 0) { query = ''; }
        this.platformStrategy.pushState(null, '', path, query);
    };
    /**
     * Changes the browsers URL to the normalized version of the given URL, and replaces
     * the top item on the platform's history stack.
     */
    Location.prototype.replaceState = function (path, query) {
        if (query === void 0) { query = ''; }
        this.platformStrategy.replaceState(null, '', path, query);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbIkxvY2F0aW9uIiwiTG9jYXRpb24uY29uc3RydWN0b3IiLCJMb2NhdGlvbi5wYXRoIiwiTG9jYXRpb24ubm9ybWFsaXplIiwiTG9jYXRpb24ucHJlcGFyZUV4dGVybmFsVXJsIiwiTG9jYXRpb24uZ28iLCJMb2NhdGlvbi5yZXBsYWNlU3RhdGUiLCJMb2NhdGlvbi5mb3J3YXJkIiwiTG9jYXRpb24uYmFjayIsIkxvY2F0aW9uLnN1YnNjcmliZSIsIl9zdHJpcEJhc2VIcmVmIiwic3RyaXBJbmRleEh0bWwiLCJzdHJpcFRyYWlsaW5nU2xhc2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLGtDQUErQixxQkFBcUIsQ0FBQyxDQUFBO0FBQ3JELHNCQUE4QywyQkFBMkIsQ0FBQyxDQUFBO0FBQzFFLHFCQUFpQyxlQUFlLENBQUMsQ0FBQTtBQUVqRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUNHO0FBQ0g7SUFPRUEsa0JBQW1CQSxnQkFBa0NBO1FBUHZEQyxpQkEyRUNBO1FBcEVvQkEscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUFrQkE7UUFMckRBLGdCQUFnQkE7UUFDaEJBLGFBQVFBLEdBQXNCQSxJQUFJQSxvQkFBWUEsRUFBRUEsQ0FBQ0E7UUFLL0NBLElBQUlBLGVBQWVBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDMURBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLGtCQUFrQkEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDckVBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsVUFBQ0EsRUFBRUE7WUFDbENBLHlCQUFpQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBSUEs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Q0EsUUFBUUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDcERBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLFNBQVNBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQ3hDQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQTtBQUNiQSxDQUFDQTtBQUVELHdCQUF3QixHQUFXO0lBQ2pDQyxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQy9CQSw2QkFBNkJBO1FBQzdCQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUMzQ0EsQ0FBQ0E7SUFDREEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7QUFDYkEsQ0FBQ0E7QUFFRCw0QkFBNEIsR0FBVztJQUNyQ0MsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDckJBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO0lBQ3pDQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQTtBQUNiQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TG9jYXRpb25TdHJhdGVneX0gZnJvbSAnLi9sb2NhdGlvbl9zdHJhdGVneSc7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3R9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG4vKipcbiAqIGBMb2NhdGlvbmAgaXMgYSBzZXJ2aWNlIHRoYXQgYXBwbGljYXRpb25zIGNhbiB1c2UgdG8gaW50ZXJhY3Qgd2l0aCBhIGJyb3dzZXIncyBVUkwuXG4gKiBEZXBlbmRpbmcgb24gd2hpY2gge0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9IGlzIHVzZWQsIGBMb2NhdGlvbmAgd2lsbCBlaXRoZXIgcGVyc2lzdFxuICogdG8gdGhlIFVSTCdzIHBhdGggb3IgdGhlIFVSTCdzIGhhc2ggc2VnbWVudC5cbiAqXG4gKiBOb3RlOiBpdCdzIGJldHRlciB0byB1c2Uge0BsaW5rIFJvdXRlciNuYXZpZ2F0ZX0gc2VydmljZSB0byB0cmlnZ2VyIHJvdXRlIGNoYW5nZXMuIFVzZVxuICogYExvY2F0aW9uYCBvbmx5IGlmIHlvdSBuZWVkIHRvIGludGVyYWN0IHdpdGggb3IgY3JlYXRlIG5vcm1hbGl6ZWQgVVJMcyBvdXRzaWRlIG9mXG4gKiByb3V0aW5nLlxuICpcbiAqIGBMb2NhdGlvbmAgaXMgcmVzcG9uc2libGUgZm9yIG5vcm1hbGl6aW5nIHRoZSBVUkwgYWdhaW5zdCB0aGUgYXBwbGljYXRpb24ncyBiYXNlIGhyZWYuXG4gKiBBIG5vcm1hbGl6ZWQgVVJMIGlzIGFic29sdXRlIGZyb20gdGhlIFVSTCBob3N0LCBpbmNsdWRlcyB0aGUgYXBwbGljYXRpb24ncyBiYXNlIGhyZWYsIGFuZCBoYXMgbm9cbiAqIHRyYWlsaW5nIHNsYXNoOlxuICogLSBgL215L2FwcC91c2VyLzEyM2AgaXMgbm9ybWFsaXplZFxuICogLSBgbXkvYXBwL3VzZXIvMTIzYCAqKmlzIG5vdCoqIG5vcm1hbGl6ZWRcbiAqIC0gYC9teS9hcHAvdXNlci8xMjMvYCAqKmlzIG5vdCoqIG5vcm1hbGl6ZWRcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbiAqIGltcG9ydCB7XG4gKiAgIFJPVVRFUl9ESVJFQ1RJVkVTLFxuICogICBST1VURVJfUFJPVklERVJTLFxuICogICBSb3V0ZUNvbmZpZyxcbiAqICAgTG9jYXRpb25cbiAqIH0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgY29uc3RydWN0b3IobG9jYXRpb246IExvY2F0aW9uKSB7XG4gKiAgICAgbG9jYXRpb24uZ28oJy9mb28nKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFtST1VURVJfUFJPVklERVJTXSk7XG4gKiBgYGBcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIExvY2F0aW9uIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3ViamVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Jhc2VIcmVmOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHBsYXRmb3JtU3RyYXRlZ3k6IExvY2F0aW9uU3RyYXRlZ3kpIHtcbiAgICB2YXIgYnJvd3NlckJhc2VIcmVmID0gdGhpcy5wbGF0Zm9ybVN0cmF0ZWd5LmdldEJhc2VIcmVmKCk7XG4gICAgdGhpcy5fYmFzZUhyZWYgPSBzdHJpcFRyYWlsaW5nU2xhc2goc3RyaXBJbmRleEh0bWwoYnJvd3NlckJhc2VIcmVmKSk7XG4gICAgdGhpcy5wbGF0Zm9ybVN0cmF0ZWd5Lm9uUG9wU3RhdGUoKGV2KSA9PiB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLl9zdWJqZWN0LCB7J3VybCc6IHRoaXMucGF0aCgpLCAncG9wJzogdHJ1ZSwgJ3R5cGUnOiBldi50eXBlfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbm9ybWFsaXplZCBVUkwgcGF0aC5cbiAgICovXG4gIHBhdGgoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMubm9ybWFsaXplKHRoaXMucGxhdGZvcm1TdHJhdGVneS5wYXRoKCkpOyB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgc3RyaW5nIHJlcHJlc2VudGluZyBhIFVSTCwgcmV0dXJucyB0aGUgbm9ybWFsaXplZCBVUkwgcGF0aCB3aXRob3V0IGxlYWRpbmcgb3JcbiAgICogdHJhaWxpbmcgc2xhc2hlc1xuICAgKi9cbiAgbm9ybWFsaXplKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gc3RyaXBUcmFpbGluZ1NsYXNoKF9zdHJpcEJhc2VIcmVmKHRoaXMuX2Jhc2VIcmVmLCBzdHJpcEluZGV4SHRtbCh1cmwpKSk7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgVVJMLCByZXR1cm5zIHRoZSBwbGF0Zm9ybS1zcGVjaWZpYyBleHRlcm5hbCBVUkwgcGF0aC5cbiAgICogSWYgdGhlIGdpdmVuIFVSTCBkb2Vzbid0IGJlZ2luIHdpdGggYSBsZWFkaW5nIHNsYXNoIChgJy8nYCksIHRoaXMgbWV0aG9kIGFkZHMgb25lXG4gICAqIGJlZm9yZSBub3JtYWxpemluZy4gVGhpcyBtZXRob2Qgd2lsbCBhbHNvIGFkZCBhIGhhc2ggaWYgYEhhc2hMb2NhdGlvblN0cmF0ZWd5YCBpc1xuICAgKiB1c2VkLCBvciB0aGUgYEFQUF9CQVNFX0hSRUZgIGlmIHRoZSBgUGF0aExvY2F0aW9uU3RyYXRlZ3lgIGlzIGluIHVzZS5cbiAgICovXG4gIHByZXBhcmVFeHRlcm5hbFVybCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHVybC5sZW5ndGggPiAwICYmICF1cmwuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICB1cmwgPSAnLycgKyB1cmw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnBsYXRmb3JtU3RyYXRlZ3kucHJlcGFyZUV4dGVybmFsVXJsKHVybCk7XG4gIH1cblxuICAvLyBUT0RPOiByZW5hbWUgdGhpcyBtZXRob2QgdG8gcHVzaFN0YXRlXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBicm93c2VycyBVUkwgdG8gdGhlIG5vcm1hbGl6ZWQgdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gVVJMLCBhbmQgcHVzaGVzIGFcbiAgICogbmV3IGl0ZW0gb250byB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5LlxuICAgKi9cbiAgZ28ocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpOiB2b2lkIHtcbiAgICB0aGlzLnBsYXRmb3JtU3RyYXRlZ3kucHVzaFN0YXRlKG51bGwsICcnLCBwYXRoLCBxdWVyeSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgYnJvd3NlcnMgVVJMIHRvIHRoZSBub3JtYWxpemVkIHZlcnNpb24gb2YgdGhlIGdpdmVuIFVSTCwgYW5kIHJlcGxhY2VzXG4gICAqIHRoZSB0b3AgaXRlbSBvbiB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5IHN0YWNrLlxuICAgKi9cbiAgcmVwbGFjZVN0YXRlKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKTogdm9pZCB7XG4gICAgdGhpcy5wbGF0Zm9ybVN0cmF0ZWd5LnJlcGxhY2VTdGF0ZShudWxsLCAnJywgcGF0aCwgcXVlcnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyBmb3J3YXJkIGluIHRoZSBwbGF0Zm9ybSdzIGhpc3RvcnkuXG4gICAqL1xuICBmb3J3YXJkKCk6IHZvaWQgeyB0aGlzLnBsYXRmb3JtU3RyYXRlZ3kuZm9yd2FyZCgpOyB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyBiYWNrIGluIHRoZSBwbGF0Zm9ybSdzIGhpc3RvcnkuXG4gICAqL1xuICBiYWNrKCk6IHZvaWQgeyB0aGlzLnBsYXRmb3JtU3RyYXRlZ3kuYmFjaygpOyB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byB0aGUgcGxhdGZvcm0ncyBgcG9wU3RhdGVgIGV2ZW50cy5cbiAgICovXG4gIHN1YnNjcmliZShvbk5leHQ6ICh2YWx1ZTogYW55KSA9PiB2b2lkLCBvblRocm93OiAoZXhjZXB0aW9uOiBhbnkpID0+IHZvaWQgPSBudWxsLFxuICAgICAgICAgICAgb25SZXR1cm46ICgpID0+IHZvaWQgPSBudWxsKTogT2JqZWN0IHtcbiAgICByZXR1cm4gT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHRoaXMuX3N1YmplY3QsIG9uTmV4dCwgb25UaHJvdywgb25SZXR1cm4pO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9zdHJpcEJhc2VIcmVmKGJhc2VIcmVmOiBzdHJpbmcsIHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKGJhc2VIcmVmLmxlbmd0aCA+IDAgJiYgdXJsLnN0YXJ0c1dpdGgoYmFzZUhyZWYpKSB7XG4gICAgcmV0dXJuIHVybC5zdWJzdHJpbmcoYmFzZUhyZWYubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4gdXJsO1xufVxuXG5mdW5jdGlvbiBzdHJpcEluZGV4SHRtbCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICgvXFwvaW5kZXguaHRtbCQvZy50ZXN0KHVybCkpIHtcbiAgICAvLyAnL2luZGV4Lmh0bWwnLmxlbmd0aCA9PSAxMVxuICAgIHJldHVybiB1cmwuc3Vic3RyaW5nKDAsIHVybC5sZW5ndGggLSAxMSk7XG4gIH1cbiAgcmV0dXJuIHVybDtcbn1cblxuZnVuY3Rpb24gc3RyaXBUcmFpbGluZ1NsYXNoKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKC9cXC8kL2cudGVzdCh1cmwpKSB7XG4gICAgdXJsID0gdXJsLnN1YnN0cmluZygwLCB1cmwubGVuZ3RoIC0gMSk7XG4gIH1cbiAgcmV0dXJuIHVybDtcbn1cbiJdfQ==