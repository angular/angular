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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbIkxvY2F0aW9uIiwiTG9jYXRpb24uY29uc3RydWN0b3IiLCJMb2NhdGlvbi5wYXRoIiwiTG9jYXRpb24ubm9ybWFsaXplIiwiTG9jYXRpb24ucHJlcGFyZUV4dGVybmFsVXJsIiwiTG9jYXRpb24uZ28iLCJMb2NhdGlvbi5yZXBsYWNlU3RhdGUiLCJMb2NhdGlvbi5mb3J3YXJkIiwiTG9jYXRpb24uYmFjayIsIkxvY2F0aW9uLnN1YnNjcmliZSIsIl9zdHJpcEJhc2VIcmVmIiwic3RyaXBJbmRleEh0bWwiLCJzdHJpcFRyYWlsaW5nU2xhc2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsa0NBQStCLHFCQUFxQixDQUFDLENBQUE7QUFDckQsc0JBQThDLDJCQUEyQixDQUFDLENBQUE7QUFDMUUscUJBQWlDLGVBQWUsQ0FBQyxDQUFBO0FBRWpEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Q0c7QUFDSDtJQU9FQSxrQkFBbUJBLGdCQUFrQ0E7UUFQdkRDLGlCQTJFQ0E7UUFwRW9CQSxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQWtCQTtRQUxyREEsZ0JBQWdCQTtRQUNoQkEsYUFBUUEsR0FBc0JBLElBQUlBLG9CQUFZQSxFQUFFQSxDQUFDQTtRQUsvQ0EsSUFBSUEsZUFBZUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUMxREEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0Esa0JBQWtCQSxDQUFDQSxjQUFjQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNyRUEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxVQUFVQSxDQUFDQSxVQUFDQSxFQUFFQTtZQUNsQ0EseUJBQWlCQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFJ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QUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNwREEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDeENBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO0FBQ2JBLENBQUNBO0FBRUQsd0JBQXdCLEdBQVc7SUFDakNDLEVBQUVBLENBQUNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDL0JBLDZCQUE2QkE7UUFDN0JBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLE1BQU1BLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBO0lBQzNDQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQTtBQUNiQSxDQUFDQTtBQUVELDRCQUE0QixHQUFXO0lBQ3JDQyxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNyQkEsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDekNBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO0FBQ2JBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICcuL2xvY2F0aW9uX3N0cmF0ZWd5JztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbi8qKlxuICogYExvY2F0aW9uYCBpcyBhIHNlcnZpY2UgdGhhdCBhcHBsaWNhdGlvbnMgY2FuIHVzZSB0byBpbnRlcmFjdCB3aXRoIGEgYnJvd3NlcidzIFVSTC5cbiAqIERlcGVuZGluZyBvbiB3aGljaCB7QGxpbmsgTG9jYXRpb25TdHJhdGVneX0gaXMgdXNlZCwgYExvY2F0aW9uYCB3aWxsIGVpdGhlciBwZXJzaXN0XG4gKiB0byB0aGUgVVJMJ3MgcGF0aCBvciB0aGUgVVJMJ3MgaGFzaCBzZWdtZW50LlxuICpcbiAqIE5vdGU6IGl0J3MgYmV0dGVyIHRvIHVzZSB7QGxpbmsgUm91dGVyI25hdmlnYXRlfSBzZXJ2aWNlIHRvIHRyaWdnZXIgcm91dGUgY2hhbmdlcy4gVXNlXG4gKiBgTG9jYXRpb25gIG9ubHkgaWYgeW91IG5lZWQgdG8gaW50ZXJhY3Qgd2l0aCBvciBjcmVhdGUgbm9ybWFsaXplZCBVUkxzIG91dHNpZGUgb2ZcbiAqIHJvdXRpbmcuXG4gKlxuICogYExvY2F0aW9uYCBpcyByZXNwb25zaWJsZSBmb3Igbm9ybWFsaXppbmcgdGhlIFVSTCBhZ2FpbnN0IHRoZSBhcHBsaWNhdGlvbidzIGJhc2UgaHJlZi5cbiAqIEEgbm9ybWFsaXplZCBVUkwgaXMgYWJzb2x1dGUgZnJvbSB0aGUgVVJMIGhvc3QsIGluY2x1ZGVzIHRoZSBhcHBsaWNhdGlvbidzIGJhc2UgaHJlZiwgYW5kIGhhcyBub1xuICogdHJhaWxpbmcgc2xhc2g6XG4gKiAtIGAvbXkvYXBwL3VzZXIvMTIzYCBpcyBub3JtYWxpemVkXG4gKiAtIGBteS9hcHAvdXNlci8xMjNgICoqaXMgbm90Kiogbm9ybWFsaXplZFxuICogLSBgL215L2FwcC91c2VyLzEyMy9gICoqaXMgbm90Kiogbm9ybWFsaXplZFxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuICogaW1wb3J0IHtcbiAqICAgUk9VVEVSX0RJUkVDVElWRVMsXG4gKiAgIFJPVVRFUl9QUk9WSURFUlMsXG4gKiAgIFJvdXRlQ29uZmlnLFxuICogICBMb2NhdGlvblxuICogfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7Li4ufSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge1xuICogICBjb25zdHJ1Y3Rvcihsb2NhdGlvbjogTG9jYXRpb24pIHtcbiAqICAgICBsb2NhdGlvbi5nbygnL2ZvbycpO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgW1JPVVRFUl9QUk9WSURFUlNdKTtcbiAqIGBgYFxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTG9jYXRpb24ge1xuICAvKiogQGludGVybmFsICovXG4gIF9zdWJqZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYmFzZUhyZWY6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGxhdGZvcm1TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneSkge1xuICAgIHZhciBicm93c2VyQmFzZUhyZWYgPSB0aGlzLnBsYXRmb3JtU3RyYXRlZ3kuZ2V0QmFzZUhyZWYoKTtcbiAgICB0aGlzLl9iYXNlSHJlZiA9IHN0cmlwVHJhaWxpbmdTbGFzaChzdHJpcEluZGV4SHRtbChicm93c2VyQmFzZUhyZWYpKTtcbiAgICB0aGlzLnBsYXRmb3JtU3RyYXRlZ3kub25Qb3BTdGF0ZSgoZXYpID0+IHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3N1YmplY3QsIHsndXJsJzogdGhpcy5wYXRoKCksICdwb3AnOiB0cnVlLCAndHlwZSc6IGV2LnR5cGV9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBub3JtYWxpemVkIFVSTCBwYXRoLlxuICAgKi9cbiAgcGF0aCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5ub3JtYWxpemUodGhpcy5wbGF0Zm9ybVN0cmF0ZWd5LnBhdGgoKSk7IH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgVVJMLCByZXR1cm5zIHRoZSBub3JtYWxpemVkIFVSTCBwYXRoIHdpdGhvdXQgbGVhZGluZyBvclxuICAgKiB0cmFpbGluZyBzbGFzaGVzXG4gICAqL1xuICBub3JtYWxpemUodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBzdHJpcFRyYWlsaW5nU2xhc2goX3N0cmlwQmFzZUhyZWYodGhpcy5fYmFzZUhyZWYsIHN0cmlwSW5kZXhIdG1sKHVybCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIHN0cmluZyByZXByZXNlbnRpbmcgYSBVUkwsIHJldHVybnMgdGhlIHBsYXRmb3JtLXNwZWNpZmljIGV4dGVybmFsIFVSTCBwYXRoLlxuICAgKiBJZiB0aGUgZ2l2ZW4gVVJMIGRvZXNuJ3QgYmVnaW4gd2l0aCBhIGxlYWRpbmcgc2xhc2ggKGAnLydgKSwgdGhpcyBtZXRob2QgYWRkcyBvbmVcbiAgICogYmVmb3JlIG5vcm1hbGl6aW5nLiBUaGlzIG1ldGhvZCB3aWxsIGFsc28gYWRkIGEgaGFzaCBpZiBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgIGlzXG4gICAqIHVzZWQsIG9yIHRoZSBgQVBQX0JBU0VfSFJFRmAgaWYgdGhlIGBQYXRoTG9jYXRpb25TdHJhdGVneWAgaXMgaW4gdXNlLlxuICAgKi9cbiAgcHJlcGFyZUV4dGVybmFsVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodXJsLmxlbmd0aCA+IDAgJiYgIXVybC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgIHVybCA9ICcvJyArIHVybDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGxhdGZvcm1TdHJhdGVneS5wcmVwYXJlRXh0ZXJuYWxVcmwodXJsKTtcbiAgfVxuXG4gIC8vIFRPRE86IHJlbmFtZSB0aGlzIG1ldGhvZCB0byBwdXNoU3RhdGVcbiAgLyoqXG4gICAqIENoYW5nZXMgdGhlIGJyb3dzZXJzIFVSTCB0byB0aGUgbm9ybWFsaXplZCB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBVUkwsIGFuZCBwdXNoZXMgYVxuICAgKiBuZXcgaXRlbSBvbnRvIHRoZSBwbGF0Zm9ybSdzIGhpc3RvcnkuXG4gICAqL1xuICBnbyhwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJyk6IHZvaWQge1xuICAgIHRoaXMucGxhdGZvcm1TdHJhdGVneS5wdXNoU3RhdGUobnVsbCwgJycsIHBhdGgsIHF1ZXJ5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBicm93c2VycyBVUkwgdG8gdGhlIG5vcm1hbGl6ZWQgdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gVVJMLCBhbmQgcmVwbGFjZXNcbiAgICogdGhlIHRvcCBpdGVtIG9uIHRoZSBwbGF0Zm9ybSdzIGhpc3Rvcnkgc3RhY2suXG4gICAqL1xuICByZXBsYWNlU3RhdGUocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpOiB2b2lkIHtcbiAgICB0aGlzLnBsYXRmb3JtU3RyYXRlZ3kucmVwbGFjZVN0YXRlKG51bGwsICcnLCBwYXRoLCBxdWVyeSk7XG4gIH1cblxuICAvKipcbiAgICogTmF2aWdhdGVzIGZvcndhcmQgaW4gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeS5cbiAgICovXG4gIGZvcndhcmQoKTogdm9pZCB7IHRoaXMucGxhdGZvcm1TdHJhdGVneS5mb3J3YXJkKCk7IH1cblxuICAvKipcbiAgICogTmF2aWdhdGVzIGJhY2sgaW4gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeS5cbiAgICovXG4gIGJhY2soKTogdm9pZCB7IHRoaXMucGxhdGZvcm1TdHJhdGVneS5iYWNrKCk7IH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBwbGF0Zm9ybSdzIGBwb3BTdGF0ZWAgZXZlbnRzLlxuICAgKi9cbiAgc3Vic2NyaWJlKG9uTmV4dDogKHZhbHVlOiBhbnkpID0+IHZvaWQsIG9uVGhyb3c6IChleGNlcHRpb246IGFueSkgPT4gdm9pZCA9IG51bGwsXG4gICAgICAgICAgICBvblJldHVybjogKCkgPT4gdm9pZCA9IG51bGwpOiBPYmplY3Qge1xuICAgIHJldHVybiBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUodGhpcy5fc3ViamVjdCwgb25OZXh0LCBvblRocm93LCBvblJldHVybik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX3N0cmlwQmFzZUhyZWYoYmFzZUhyZWY6IHN0cmluZywgdXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoYmFzZUhyZWYubGVuZ3RoID4gMCAmJiB1cmwuc3RhcnRzV2l0aChiYXNlSHJlZikpIHtcbiAgICByZXR1cm4gdXJsLnN1YnN0cmluZyhiYXNlSHJlZi5sZW5ndGgpO1xuICB9XG4gIHJldHVybiB1cmw7XG59XG5cbmZ1bmN0aW9uIHN0cmlwSW5kZXhIdG1sKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKC9cXC9pbmRleC5odG1sJC9nLnRlc3QodXJsKSkge1xuICAgIC8vICcvaW5kZXguaHRtbCcubGVuZ3RoID09IDExXG4gICAgcmV0dXJuIHVybC5zdWJzdHJpbmcoMCwgdXJsLmxlbmd0aCAtIDExKTtcbiAgfVxuICByZXR1cm4gdXJsO1xufVxuXG5mdW5jdGlvbiBzdHJpcFRyYWlsaW5nU2xhc2godXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoL1xcLyQvZy50ZXN0KHVybCkpIHtcbiAgICB1cmwgPSB1cmwuc3Vic3RyaW5nKDAsIHVybC5sZW5ndGggLSAxKTtcbiAgfVxuICByZXR1cm4gdXJsO1xufVxuIl19