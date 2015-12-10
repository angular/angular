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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable, Inject, Optional } from 'angular2/core';
import { LocationStrategy, joinWithSlash, APP_BASE_HREF, normalizeQueryParams } from './location_strategy';
import { isPresent } from 'angular2/src/facade/lang';
import { PlatformLocation } from './platform_location';
/**
 * `HashLocationStrategy` is a {@link LocationStrategy} used to configure the
 * {@link Location} service to represent its state in the
 * [hash fragment](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax)
 * of the browser's URL.
 *
 * For instance, if you call `location.go('/foo')`, the browser's URL will become
 * `example.com#/foo`.
 *
 * ### Example
 *
 * ```
 * import {Component, provide} from 'angular2/angular2';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig,
 *   Location,
 *   LocationStrategy,
 *   HashLocationStrategy
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
 * bootstrap(AppCmp, [
 *   ROUTER_PROVIDERS,
 *   provide(LocationStrategy, {useClass: HashLocationStrategy})
 * ]);
 * ```
 */
export let HashLocationStrategy = class extends LocationStrategy {
    constructor(_platformLocation, _baseHref) {
        super();
        this._platformLocation = _platformLocation;
        this._baseHref = '';
        if (isPresent(_baseHref)) {
            this._baseHref = _baseHref;
        }
    }
    onPopState(fn) {
        this._platformLocation.onPopState(fn);
        this._platformLocation.onHashChange(fn);
    }
    getBaseHref() { return this._baseHref; }
    path() {
        // the hash value is always prefixed with a `#`
        // and if it is empty then it will stay empty
        var path = this._platformLocation.hash;
        // Dart will complain if a call to substring is
        // executed with a position value that extends the
        // length of string.
        return (path.length > 0 ? path.substring(1) : path) +
            normalizeQueryParams(this._platformLocation.search);
    }
    prepareExternalUrl(internal) {
        var url = joinWithSlash(this._baseHref, internal);
        return url.length > 0 ? ('#' + url) : url;
    }
    pushState(state, title, path, queryParams) {
        var url = this.prepareExternalUrl(path + normalizeQueryParams(queryParams));
        if (url.length == 0) {
            url = this._platformLocation.pathname;
        }
        this._platformLocation.pushState(state, title, url);
    }
    replaceState(state, title, path, queryParams) {
        var url = this.prepareExternalUrl(path + normalizeQueryParams(queryParams));
        if (url.length == 0) {
            url = this._platformLocation.pathname;
        }
        this._platformLocation.replaceState(state, title, url);
    }
    forward() { this._platformLocation.forward(); }
    back() { this._platformLocation.back(); }
};
HashLocationStrategy = __decorate([
    Injectable(),
    __param(1, Optional()),
    __param(1, Inject(APP_BASE_HREF)), 
    __metadata('design:paramtypes', [PlatformLocation, String])
], HashLocationStrategy);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaF9sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvaGFzaF9sb2NhdGlvbl9zdHJhdGVneS50cyJdLCJuYW1lcyI6WyJIYXNoTG9jYXRpb25TdHJhdGVneSIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiSGFzaExvY2F0aW9uU3RyYXRlZ3kub25Qb3BTdGF0ZSIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LmdldEJhc2VIcmVmIiwiSGFzaExvY2F0aW9uU3RyYXRlZ3kucGF0aCIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LnByZXBhcmVFeHRlcm5hbFVybCIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LnB1c2hTdGF0ZSIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LnJlcGxhY2VTdGF0ZSIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LmZvcndhcmQiLCJIYXNoTG9jYXRpb25TdHJhdGVneS5iYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlO09BQ25ELEVBQ0wsZ0JBQWdCLEVBQ2hCLGFBQWEsRUFDYixhQUFhLEVBQ2Isb0JBQW9CLEVBQ3JCLE1BQU0scUJBQXFCO09BRXJCLEVBQUMsU0FBUyxFQUFDLE1BQU0sMEJBQTBCO09BQzNDLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUI7QUFFcEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQ0c7QUFDSCxnREFDMEMsZ0JBQWdCO0lBRXhEQSxZQUFvQkEsaUJBQW1DQSxFQUNSQSxTQUFrQkE7UUFDL0RDLE9BQU9BLENBQUNBO1FBRlVBLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBa0JBO1FBRC9DQSxjQUFTQSxHQUFXQSxFQUFFQSxDQUFDQTtRQUk3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsU0FB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Q0EsaUJBQWlCQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNqRFQsQ0FBQ0E7QUF0REQ7SUFBQyxVQUFVLEVBQUU7SUFJQyxXQUFDLFFBQVEsRUFBRSxDQUFBO0lBQUMsV0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUE7O3lCQWtEL0M7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0LCBPcHRpb25hbH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1xuICBMb2NhdGlvblN0cmF0ZWd5LFxuICBqb2luV2l0aFNsYXNoLFxuICBBUFBfQkFTRV9IUkVGLFxuICBub3JtYWxpemVRdWVyeVBhcmFtc1xufSBmcm9tICcuL2xvY2F0aW9uX3N0cmF0ZWd5JztcbmltcG9ydCB7RXZlbnRMaXN0ZW5lcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9icm93c2VyJztcbmltcG9ydCB7aXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICcuL3BsYXRmb3JtX2xvY2F0aW9uJztcblxuLyoqXG4gKiBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgIGlzIGEge0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9IHVzZWQgdG8gY29uZmlndXJlIHRoZVxuICoge0BsaW5rIExvY2F0aW9ufSBzZXJ2aWNlIHRvIHJlcHJlc2VudCBpdHMgc3RhdGUgaW4gdGhlXG4gKiBbaGFzaCBmcmFnbWVudF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVW5pZm9ybV9SZXNvdXJjZV9Mb2NhdG9yI1N5bnRheClcbiAqIG9mIHRoZSBicm93c2VyJ3MgVVJMLlxuICpcbiAqIEZvciBpbnN0YW5jZSwgaWYgeW91IGNhbGwgYGxvY2F0aW9uLmdvKCcvZm9vJylgLCB0aGUgYnJvd3NlcidzIFVSTCB3aWxsIGJlY29tZVxuICogYGV4YW1wbGUuY29tIy9mb29gLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuICogaW1wb3J0IHtcbiAqICAgUk9VVEVSX0RJUkVDVElWRVMsXG4gKiAgIFJPVVRFUl9QUk9WSURFUlMsXG4gKiAgIFJvdXRlQ29uZmlnLFxuICogICBMb2NhdGlvbixcbiAqICAgTG9jYXRpb25TdHJhdGVneSxcbiAqICAgSGFzaExvY2F0aW9uU3RyYXRlZ3lcbiAqIH0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgY29uc3RydWN0b3IobG9jYXRpb246IExvY2F0aW9uKSB7XG4gKiAgICAgbG9jYXRpb24uZ28oJy9mb28nKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFtcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgcHJvdmlkZShMb2NhdGlvblN0cmF0ZWd5LCB7dXNlQ2xhc3M6IEhhc2hMb2NhdGlvblN0cmF0ZWd5fSlcbiAqIF0pO1xuICogYGBgXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIYXNoTG9jYXRpb25TdHJhdGVneSBleHRlbmRzIExvY2F0aW9uU3RyYXRlZ3kge1xuICBwcml2YXRlIF9iYXNlSHJlZjogc3RyaW5nID0gJyc7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3BsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb24sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQVBQX0JBU0VfSFJFRikgX2Jhc2VIcmVmPzogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoaXNQcmVzZW50KF9iYXNlSHJlZikpIHtcbiAgICAgIHRoaXMuX2Jhc2VIcmVmID0gX2Jhc2VIcmVmO1xuICAgIH1cbiAgfVxuXG4gIG9uUG9wU3RhdGUoZm46IEV2ZW50TGlzdGVuZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLm9uUG9wU3RhdGUoZm4pO1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ub25IYXNoQ2hhbmdlKGZuKTtcbiAgfVxuXG4gIGdldEJhc2VIcmVmKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9iYXNlSHJlZjsgfVxuXG4gIHBhdGgoKTogc3RyaW5nIHtcbiAgICAvLyB0aGUgaGFzaCB2YWx1ZSBpcyBhbHdheXMgcHJlZml4ZWQgd2l0aCBhIGAjYFxuICAgIC8vIGFuZCBpZiBpdCBpcyBlbXB0eSB0aGVuIGl0IHdpbGwgc3RheSBlbXB0eVxuICAgIHZhciBwYXRoID0gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5oYXNoO1xuXG4gICAgLy8gRGFydCB3aWxsIGNvbXBsYWluIGlmIGEgY2FsbCB0byBzdWJzdHJpbmcgaXNcbiAgICAvLyBleGVjdXRlZCB3aXRoIGEgcG9zaXRpb24gdmFsdWUgdGhhdCBleHRlbmRzIHRoZVxuICAgIC8vIGxlbmd0aCBvZiBzdHJpbmcuXG4gICAgcmV0dXJuIChwYXRoLmxlbmd0aCA+IDAgPyBwYXRoLnN1YnN0cmluZygxKSA6IHBhdGgpICtcbiAgICAgICAgICAgbm9ybWFsaXplUXVlcnlQYXJhbXModGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5zZWFyY2gpO1xuICB9XG5cbiAgcHJlcGFyZUV4dGVybmFsVXJsKGludGVybmFsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciB1cmwgPSBqb2luV2l0aFNsYXNoKHRoaXMuX2Jhc2VIcmVmLCBpbnRlcm5hbCk7XG4gICAgcmV0dXJuIHVybC5sZW5ndGggPiAwID8gKCcjJyArIHVybCkgOiB1cmw7XG4gIH1cblxuICBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKSB7XG4gICAgdmFyIHVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGggKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeVBhcmFtcykpO1xuICAgIGlmICh1cmwubGVuZ3RoID09IDApIHtcbiAgICAgIHVybCA9IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucGF0aG5hbWU7XG4gICAgfVxuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucHVzaFN0YXRlKHN0YXRlLCB0aXRsZSwgdXJsKTtcbiAgfVxuXG4gIHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBzdHJpbmcpIHtcbiAgICB2YXIgdXJsID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwocGF0aCArIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHF1ZXJ5UGFyYW1zKSk7XG4gICAgaWYgKHVybC5sZW5ndGggPT0gMCkge1xuICAgICAgdXJsID0gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5wYXRobmFtZTtcbiAgICB9XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5yZXBsYWNlU3RhdGUoc3RhdGUsIHRpdGxlLCB1cmwpO1xuICB9XG5cbiAgZm9yd2FyZCgpOiB2b2lkIHsgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5mb3J3YXJkKCk7IH1cblxuICBiYWNrKCk6IHZvaWQgeyB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmJhY2soKTsgfVxufVxuIl19