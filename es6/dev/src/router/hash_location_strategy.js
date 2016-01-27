var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
 * import {Component, provide} from 'angular2/core';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaF9sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvaGFzaF9sb2NhdGlvbl9zdHJhdGVneS50cyJdLCJuYW1lcyI6WyJIYXNoTG9jYXRpb25TdHJhdGVneSIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiSGFzaExvY2F0aW9uU3RyYXRlZ3kub25Qb3BTdGF0ZSIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LmdldEJhc2VIcmVmIiwiSGFzaExvY2F0aW9uU3RyYXRlZ3kucGF0aCIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LnByZXBhcmVFeHRlcm5hbFVybCIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LnB1c2hTdGF0ZSIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LnJlcGxhY2VTdGF0ZSIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LmZvcndhcmQiLCJIYXNoTG9jYXRpb25TdHJhdGVneS5iYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZTtPQUNuRCxFQUNMLGdCQUFnQixFQUNoQixhQUFhLEVBQ2IsYUFBYSxFQUNiLG9CQUFvQixFQUNyQixNQUFNLHFCQUFxQjtPQUVyQixFQUFDLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtPQUMzQyxFQUFDLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCO0FBRXBEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUNHO0FBQ0gsZ0RBQzBDLGdCQUFnQjtJQUV4REEsWUFBb0JBLGlCQUFtQ0EsRUFDUkEsU0FBa0JBO1FBQy9EQyxPQUFPQSxDQUFDQTtRQUZVQSxzQkFBaUJBLEdBQWpCQSxpQkFBaUJBLENBQWtCQTtRQUQvQ0EsY0FBU0EsR0FBV0EsRUFBRUEsQ0FBQ0E7UUFJN0JBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNB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LGlCQUFpQkEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDakRULENBQUNBO0FBdEREO0lBQUMsVUFBVSxFQUFFO0lBSUMsV0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUFDLFdBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFBOzt5QkFrRC9DO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGUsIEluamVjdCwgT3B0aW9uYWx9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtcbiAgTG9jYXRpb25TdHJhdGVneSxcbiAgam9pbldpdGhTbGFzaCxcbiAgQVBQX0JBU0VfSFJFRixcbiAgbm9ybWFsaXplUXVlcnlQYXJhbXNcbn0gZnJvbSAnLi9sb2NhdGlvbl9zdHJhdGVneSc7XG5pbXBvcnQge0V2ZW50TGlzdGVuZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYnJvd3Nlcic7XG5pbXBvcnQge2lzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7UGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnLi9wbGF0Zm9ybV9sb2NhdGlvbic7XG5cbi8qKlxuICogYEhhc2hMb2NhdGlvblN0cmF0ZWd5YCBpcyBhIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fSB1c2VkIHRvIGNvbmZpZ3VyZSB0aGVcbiAqIHtAbGluayBMb2NhdGlvbn0gc2VydmljZSB0byByZXByZXNlbnQgaXRzIHN0YXRlIGluIHRoZVxuICogW2hhc2ggZnJhZ21lbnRdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1VuaWZvcm1fUmVzb3VyY2VfTG9jYXRvciNTeW50YXgpXG4gKiBvZiB0aGUgYnJvd3NlcidzIFVSTC5cbiAqXG4gKiBGb3IgaW5zdGFuY2UsIGlmIHlvdSBjYWxsIGBsb2NhdGlvbi5nbygnL2ZvbycpYCwgdGhlIGJyb3dzZXIncyBVUkwgd2lsbCBiZWNvbWVcbiAqIGBleGFtcGxlLmNvbSMvZm9vYC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnQsIHByb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtcbiAqICAgUk9VVEVSX0RJUkVDVElWRVMsXG4gKiAgIFJPVVRFUl9QUk9WSURFUlMsXG4gKiAgIFJvdXRlQ29uZmlnLFxuICogICBMb2NhdGlvbixcbiAqICAgTG9jYXRpb25TdHJhdGVneSxcbiAqICAgSGFzaExvY2F0aW9uU3RyYXRlZ3lcbiAqIH0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgY29uc3RydWN0b3IobG9jYXRpb246IExvY2F0aW9uKSB7XG4gKiAgICAgbG9jYXRpb24uZ28oJy9mb28nKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFtcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgcHJvdmlkZShMb2NhdGlvblN0cmF0ZWd5LCB7dXNlQ2xhc3M6IEhhc2hMb2NhdGlvblN0cmF0ZWd5fSlcbiAqIF0pO1xuICogYGBgXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIYXNoTG9jYXRpb25TdHJhdGVneSBleHRlbmRzIExvY2F0aW9uU3RyYXRlZ3kge1xuICBwcml2YXRlIF9iYXNlSHJlZjogc3RyaW5nID0gJyc7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3BsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb24sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQVBQX0JBU0VfSFJFRikgX2Jhc2VIcmVmPzogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoaXNQcmVzZW50KF9iYXNlSHJlZikpIHtcbiAgICAgIHRoaXMuX2Jhc2VIcmVmID0gX2Jhc2VIcmVmO1xuICAgIH1cbiAgfVxuXG4gIG9uUG9wU3RhdGUoZm46IEV2ZW50TGlzdGVuZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLm9uUG9wU3RhdGUoZm4pO1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ub25IYXNoQ2hhbmdlKGZuKTtcbiAgfVxuXG4gIGdldEJhc2VIcmVmKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9iYXNlSHJlZjsgfVxuXG4gIHBhdGgoKTogc3RyaW5nIHtcbiAgICAvLyB0aGUgaGFzaCB2YWx1ZSBpcyBhbHdheXMgcHJlZml4ZWQgd2l0aCBhIGAjYFxuICAgIC8vIGFuZCBpZiBpdCBpcyBlbXB0eSB0aGVuIGl0IHdpbGwgc3RheSBlbXB0eVxuICAgIHZhciBwYXRoID0gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5oYXNoO1xuXG4gICAgLy8gRGFydCB3aWxsIGNvbXBsYWluIGlmIGEgY2FsbCB0byBzdWJzdHJpbmcgaXNcbiAgICAvLyBleGVjdXRlZCB3aXRoIGEgcG9zaXRpb24gdmFsdWUgdGhhdCBleHRlbmRzIHRoZVxuICAgIC8vIGxlbmd0aCBvZiBzdHJpbmcuXG4gICAgcmV0dXJuIChwYXRoLmxlbmd0aCA+IDAgPyBwYXRoLnN1YnN0cmluZygxKSA6IHBhdGgpICtcbiAgICAgICAgICAgbm9ybWFsaXplUXVlcnlQYXJhbXModGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5zZWFyY2gpO1xuICB9XG5cbiAgcHJlcGFyZUV4dGVybmFsVXJsKGludGVybmFsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciB1cmwgPSBqb2luV2l0aFNsYXNoKHRoaXMuX2Jhc2VIcmVmLCBpbnRlcm5hbCk7XG4gICAgcmV0dXJuIHVybC5sZW5ndGggPiAwID8gKCcjJyArIHVybCkgOiB1cmw7XG4gIH1cblxuICBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKSB7XG4gICAgdmFyIHVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGggKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeVBhcmFtcykpO1xuICAgIGlmICh1cmwubGVuZ3RoID09IDApIHtcbiAgICAgIHVybCA9IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucGF0aG5hbWU7XG4gICAgfVxuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucHVzaFN0YXRlKHN0YXRlLCB0aXRsZSwgdXJsKTtcbiAgfVxuXG4gIHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBzdHJpbmcpIHtcbiAgICB2YXIgdXJsID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwocGF0aCArIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHF1ZXJ5UGFyYW1zKSk7XG4gICAgaWYgKHVybC5sZW5ndGggPT0gMCkge1xuICAgICAgdXJsID0gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5wYXRobmFtZTtcbiAgICB9XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5yZXBsYWNlU3RhdGUoc3RhdGUsIHRpdGxlLCB1cmwpO1xuICB9XG5cbiAgZm9yd2FyZCgpOiB2b2lkIHsgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5mb3J3YXJkKCk7IH1cblxuICBiYWNrKCk6IHZvaWQgeyB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmJhY2soKTsgfVxufVxuIl19