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
import { isBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { LocationStrategy, APP_BASE_HREF, normalizeQueryParams, joinWithSlash } from './location_strategy';
import { PlatformLocation } from './platform_location';
/**
 * `PathLocationStrategy` is a {@link LocationStrategy} used to configure the
 * {@link Location} service to represent its state in the
 * [path](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax) of the
 * browser's URL.
 *
 * `PathLocationStrategy` is the default binding for {@link LocationStrategy}
 * provided in {@link ROUTER_PROVIDERS}.
 *
 * If you're using `PathLocationStrategy`, you must provide a provider for
 * {@link APP_BASE_HREF} to a string representing the URL prefix that should
 * be preserved when generating and recognizing URLs.
 *
 * For instance, if you provide an `APP_BASE_HREF` of `'/my/app'` and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`.
 *
 * ### Example
 *
 * ```
 * import {Component, provide} from 'angular2/core';
 * import {
 *   APP_BASE_HREF
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
 * bootstrap(AppCmp, [
 *   ROUTER_PROVIDERS, // includes binding to PathLocationStrategy
 *   provide(APP_BASE_HREF, {useValue: '/my/app'})
 * ]);
 * ```
 */
export let PathLocationStrategy = class extends LocationStrategy {
    constructor(_platformLocation, href) {
        super();
        this._platformLocation = _platformLocation;
        if (isBlank(href)) {
            href = this._platformLocation.getBaseHrefFromDOM();
        }
        if (isBlank(href)) {
            throw new BaseException(`No base href set. Please provide a value for the APP_BASE_HREF token or add a base element to the document.`);
        }
        this._baseHref = href;
    }
    onPopState(fn) {
        this._platformLocation.onPopState(fn);
        this._platformLocation.onHashChange(fn);
    }
    getBaseHref() { return this._baseHref; }
    prepareExternalUrl(internal) { return joinWithSlash(this._baseHref, internal); }
    path() {
        return this._platformLocation.pathname + normalizeQueryParams(this._platformLocation.search);
    }
    pushState(state, title, url, queryParams) {
        var externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
        this._platformLocation.pushState(state, title, externalUrl);
    }
    replaceState(state, title, url, queryParams) {
        var externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
        this._platformLocation.replaceState(state, title, externalUrl);
    }
    forward() { this._platformLocation.forward(); }
    back() { this._platformLocation.back(); }
};
PathLocationStrategy = __decorate([
    Injectable(),
    __param(1, Optional()),
    __param(1, Inject(APP_BASE_HREF)), 
    __metadata('design:paramtypes', [PlatformLocation, String])
], PathLocationStrategy);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aF9sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvcGF0aF9sb2NhdGlvbl9zdHJhdGVneS50cyJdLCJuYW1lcyI6WyJQYXRoTG9jYXRpb25TdHJhdGVneSIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiUGF0aExvY2F0aW9uU3RyYXRlZ3kub25Qb3BTdGF0ZSIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LmdldEJhc2VIcmVmIiwiUGF0aExvY2F0aW9uU3RyYXRlZ3kucHJlcGFyZUV4dGVybmFsVXJsIiwiUGF0aExvY2F0aW9uU3RyYXRlZ3kucGF0aCIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LnB1c2hTdGF0ZSIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LnJlcGxhY2VTdGF0ZSIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LmZvcndhcmQiLCJQYXRoTG9jYXRpb25TdHJhdGVneS5iYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZTtPQUNuRCxFQUFDLE9BQU8sRUFBQyxNQUFNLDBCQUEwQjtPQUN6QyxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUNMLGdCQUFnQixFQUNoQixhQUFhLEVBQ2Isb0JBQW9CLEVBQ3BCLGFBQWEsRUFDZCxNQUFNLHFCQUFxQjtPQUNyQixFQUFDLGdCQUFnQixFQUFvQixNQUFNLHFCQUFxQjtBQUV2RTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Q0c7QUFDSCxnREFDMEMsZ0JBQWdCO0lBR3hEQSxZQUFvQkEsaUJBQW1DQSxFQUNSQSxJQUFhQTtRQUMxREMsT0FBT0EsQ0FBQ0E7UUFGVUEsc0JBQWlCQSxHQUFqQkEsaUJBQWlCQSxDQUFrQkE7UUFJckRBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xCQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLGtCQUFrQkEsRUFBRUEsQ0FBQ0E7UUFDckRBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xCQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUNuQkEsNkdBQTZHQSxDQUFDQSxDQUFDQTtRQUNySEEsQ0FBQ0E7UUFFREEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDeEJBLENBQUNBO0lBRURELFVBQVVBLENBQUNBLEVBQXFCQTtRQUM5QkUsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxVQUFVQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUN0Q0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxZQUFZQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUMxQ0EsQ0FBQ0E7SUFFREYsV0FBV0EsS0FBYUcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFaERILGtCQUFrQkEsQ0FBQ0EsUUFBZ0JBLElBQVlJLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRWhHSixJQUFJQTtRQUNGSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLFFBQVFBLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUMvRkEsQ0FBQ0E7SUFFREwsU0FBU0EsQ0FBQ0EsS0FBVUEsRUFBRUEsS0FBYUEsRUFBRUEsR0FBV0EsRUFBRUEsV0FBbUJBO1FBQ25FTSxJQUFJQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLEdBQUdBLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbkZBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsV0FBV0EsQ0FBQ0EsQ0FBQ0E7SUFDOURBLENBQUNBO0lBRUROLFlBQVlBLENBQUNBLEtBQVVBLEVBQUVBLEtBQWFBLEVBQUVBLEdBQVdBLEVBQUVBLFdBQW1CQTtRQUN0RU8sSUFBSUEsV0FBV0EsR0FBR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxHQUFHQSxHQUFHQSxvQkFBb0JBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1FBQ25GQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLFlBQVlBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBO0lBQ2pFQSxDQUFDQTtJQUVEUCxPQUFPQSxLQUFXUSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRXJEUixJQUFJQSxLQUFXUyxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0FBQ2pEVCxDQUFDQTtBQTlDRDtJQUFDLFVBQVUsRUFBRTtJQUtDLFdBQUMsUUFBUSxFQUFFLENBQUE7SUFBQyxXQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQTs7eUJBeUMvQztBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3QsIE9wdGlvbmFsfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7aXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7XG4gIExvY2F0aW9uU3RyYXRlZ3ksXG4gIEFQUF9CQVNFX0hSRUYsXG4gIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zLFxuICBqb2luV2l0aFNsYXNoXG59IGZyb20gJy4vbG9jYXRpb25fc3RyYXRlZ3knO1xuaW1wb3J0IHtQbGF0Zm9ybUxvY2F0aW9uLCBVcmxDaGFuZ2VMaXN0ZW5lcn0gZnJvbSAnLi9wbGF0Zm9ybV9sb2NhdGlvbic7XG5cbi8qKlxuICogYFBhdGhMb2NhdGlvblN0cmF0ZWd5YCBpcyBhIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fSB1c2VkIHRvIGNvbmZpZ3VyZSB0aGVcbiAqIHtAbGluayBMb2NhdGlvbn0gc2VydmljZSB0byByZXByZXNlbnQgaXRzIHN0YXRlIGluIHRoZVxuICogW3BhdGhdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1VuaWZvcm1fUmVzb3VyY2VfTG9jYXRvciNTeW50YXgpIG9mIHRoZVxuICogYnJvd3NlcidzIFVSTC5cbiAqXG4gKiBgUGF0aExvY2F0aW9uU3RyYXRlZ3lgIGlzIHRoZSBkZWZhdWx0IGJpbmRpbmcgZm9yIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fVxuICogcHJvdmlkZWQgaW4ge0BsaW5rIFJPVVRFUl9QUk9WSURFUlN9LlxuICpcbiAqIElmIHlvdSdyZSB1c2luZyBgUGF0aExvY2F0aW9uU3RyYXRlZ3lgLCB5b3UgbXVzdCBwcm92aWRlIGEgcHJvdmlkZXIgZm9yXG4gKiB7QGxpbmsgQVBQX0JBU0VfSFJFRn0gdG8gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBVUkwgcHJlZml4IHRoYXQgc2hvdWxkXG4gKiBiZSBwcmVzZXJ2ZWQgd2hlbiBnZW5lcmF0aW5nIGFuZCByZWNvZ25pemluZyBVUkxzLlxuICpcbiAqIEZvciBpbnN0YW5jZSwgaWYgeW91IHByb3ZpZGUgYW4gYEFQUF9CQVNFX0hSRUZgIG9mIGAnL215L2FwcCdgIGFuZCBjYWxsXG4gKiBgbG9jYXRpb24uZ28oJy9mb28nKWAsIHRoZSBicm93c2VyJ3MgVVJMIHdpbGwgYmVjb21lXG4gKiBgZXhhbXBsZS5jb20vbXkvYXBwL2Zvb2AuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50LCBwcm92aWRlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7XG4gKiAgIEFQUF9CQVNFX0hSRUZcbiAqICAgUk9VVEVSX0RJUkVDVElWRVMsXG4gKiAgIFJPVVRFUl9QUk9WSURFUlMsXG4gKiAgIFJvdXRlQ29uZmlnLFxuICogICBMb2NhdGlvblxuICogfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7Li4ufSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge1xuICogICBjb25zdHJ1Y3Rvcihsb2NhdGlvbjogTG9jYXRpb24pIHtcbiAqICAgICBsb2NhdGlvbi5nbygnL2ZvbycpO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgW1xuICogICBST1VURVJfUFJPVklERVJTLCAvLyBpbmNsdWRlcyBiaW5kaW5nIHRvIFBhdGhMb2NhdGlvblN0cmF0ZWd5XG4gKiAgIHByb3ZpZGUoQVBQX0JBU0VfSFJFRiwge3VzZVZhbHVlOiAnL215L2FwcCd9KVxuICogXSk7XG4gKiBgYGBcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFBhdGhMb2NhdGlvblN0cmF0ZWd5IGV4dGVuZHMgTG9jYXRpb25TdHJhdGVneSB7XG4gIHByaXZhdGUgX2Jhc2VIcmVmOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbixcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChBUFBfQkFTRV9IUkVGKSBocmVmPzogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGlmIChpc0JsYW5rKGhyZWYpKSB7XG4gICAgICBocmVmID0gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5nZXRCYXNlSHJlZkZyb21ET00oKTtcbiAgICB9XG5cbiAgICBpZiAoaXNCbGFuayhocmVmKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYE5vIGJhc2UgaHJlZiBzZXQuIFBsZWFzZSBwcm92aWRlIGEgdmFsdWUgZm9yIHRoZSBBUFBfQkFTRV9IUkVGIHRva2VuIG9yIGFkZCBhIGJhc2UgZWxlbWVudCB0byB0aGUgZG9jdW1lbnQuYCk7XG4gICAgfVxuXG4gICAgdGhpcy5fYmFzZUhyZWYgPSBocmVmO1xuICB9XG5cbiAgb25Qb3BTdGF0ZShmbjogVXJsQ2hhbmdlTGlzdGVuZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLm9uUG9wU3RhdGUoZm4pO1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ub25IYXNoQ2hhbmdlKGZuKTtcbiAgfVxuXG4gIGdldEJhc2VIcmVmKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9iYXNlSHJlZjsgfVxuXG4gIHByZXBhcmVFeHRlcm5hbFVybChpbnRlcm5hbDogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIGpvaW5XaXRoU2xhc2godGhpcy5fYmFzZUhyZWYsIGludGVybmFsKTsgfVxuXG4gIHBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5wYXRobmFtZSArIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uc2VhcmNoKTtcbiAgfVxuXG4gIHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZywgcXVlcnlQYXJhbXM6IHN0cmluZykge1xuICAgIHZhciBleHRlcm5hbFVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHVybCArIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHF1ZXJ5UGFyYW1zKSk7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5wdXNoU3RhdGUoc3RhdGUsIHRpdGxlLCBleHRlcm5hbFVybCk7XG4gIH1cblxuICByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBzdHJpbmcpIHtcbiAgICB2YXIgZXh0ZXJuYWxVcmwgPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybCh1cmwgKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeVBhcmFtcykpO1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucmVwbGFjZVN0YXRlKHN0YXRlLCB0aXRsZSwgZXh0ZXJuYWxVcmwpO1xuICB9XG5cbiAgZm9yd2FyZCgpOiB2b2lkIHsgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5mb3J3YXJkKCk7IH1cblxuICBiYWNrKCk6IHZvaWQgeyB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmJhY2soKTsgfVxufVxuIl19