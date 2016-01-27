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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aF9sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvcGF0aF9sb2NhdGlvbl9zdHJhdGVneS50cyJdLCJuYW1lcyI6WyJQYXRoTG9jYXRpb25TdHJhdGVneSIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiUGF0aExvY2F0aW9uU3RyYXRlZ3kub25Qb3BTdGF0ZSIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LmdldEJhc2VIcmVmIiwiUGF0aExvY2F0aW9uU3RyYXRlZ3kucHJlcGFyZUV4dGVybmFsVXJsIiwiUGF0aExvY2F0aW9uU3RyYXRlZ3kucGF0aCIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LnB1c2hTdGF0ZSIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LnJlcGxhY2VTdGF0ZSIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LmZvcndhcmQiLCJQYXRoTG9jYXRpb25TdHJhdGVneS5iYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZTtPQUVuRCxFQUFDLE9BQU8sRUFBQyxNQUFNLDBCQUEwQjtPQUN6QyxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUNMLGdCQUFnQixFQUNoQixhQUFhLEVBQ2Isb0JBQW9CLEVBQ3BCLGFBQWEsRUFDZCxNQUFNLHFCQUFxQjtPQUNyQixFQUFDLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCO0FBRXBEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRDRztBQUNILGdEQUMwQyxnQkFBZ0I7SUFHeERBLFlBQW9CQSxpQkFBbUNBLEVBQ1JBLElBQWFBO1FBQzFEQyxPQUFPQSxDQUFDQTtRQUZVQSxzQkFBaUJBLEdBQWpCQSxpQkFBaUJBLENBQWtCQTtRQUlyREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbEJBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0Esa0JBQWtCQSxFQUFFQSxDQUFDQTtRQUNyREEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbEJBLE1BQU1BLElBQUlBLGFBQWFBLENBQ25CQSw2R0FBNkdBLENBQUNBLENBQUNBO1FBQ3JIQSxDQUFDQTtRQUVEQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUN4QkEsQ0FBQ0E7SUFFREQsVUFBVUEsQ0FBQ0EsRUFBaUJBO1FBQzFCRSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLFVBQVVBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO1FBQ3RDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLFlBQVlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO0lBQzFDQSxDQUFDQTtJQUVERixXQUFXQSxLQUFhRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVoREgsa0JBQWtCQSxDQUFDQSxRQUFnQkEsSUFBWUksTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFaEdKLElBQUlBO1FBQ0ZLLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsUUFBUUEsR0FBR0Esb0JBQW9CQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQy9GQSxDQUFDQTtJQUVETCxTQUFTQSxDQUFDQSxLQUFVQSxFQUFFQSxLQUFhQSxFQUFFQSxHQUFXQSxFQUFFQSxXQUFtQkE7UUFDbkVNLElBQUlBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsR0FBR0EsR0FBR0Esb0JBQW9CQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNuRkEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQTtJQUM5REEsQ0FBQ0E7SUFFRE4sWUFBWUEsQ0FBQ0EsS0FBVUEsRUFBRUEsS0FBYUEsRUFBRUEsR0FBV0EsRUFBRUEsV0FBbUJBO1FBQ3RFTyxJQUFJQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLEdBQUdBLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbkZBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsV0FBV0EsQ0FBQ0EsQ0FBQ0E7SUFDakVBLENBQUNBO0lBRURQLE9BQU9BLEtBQVdRLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFckRSLElBQUlBLEtBQVdTLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDakRULENBQUNBO0FBOUNEO0lBQUMsVUFBVSxFQUFFO0lBS0MsV0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUFDLFdBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFBOzt5QkF5Qy9DO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGUsIEluamVjdCwgT3B0aW9uYWx9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtFdmVudExpc3RlbmVyLCBIaXN0b3J5LCBMb2NhdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9icm93c2VyJztcbmltcG9ydCB7aXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7XG4gIExvY2F0aW9uU3RyYXRlZ3ksXG4gIEFQUF9CQVNFX0hSRUYsXG4gIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zLFxuICBqb2luV2l0aFNsYXNoXG59IGZyb20gJy4vbG9jYXRpb25fc3RyYXRlZ3knO1xuaW1wb3J0IHtQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICcuL3BsYXRmb3JtX2xvY2F0aW9uJztcblxuLyoqXG4gKiBgUGF0aExvY2F0aW9uU3RyYXRlZ3lgIGlzIGEge0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9IHVzZWQgdG8gY29uZmlndXJlIHRoZVxuICoge0BsaW5rIExvY2F0aW9ufSBzZXJ2aWNlIHRvIHJlcHJlc2VudCBpdHMgc3RhdGUgaW4gdGhlXG4gKiBbcGF0aF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVW5pZm9ybV9SZXNvdXJjZV9Mb2NhdG9yI1N5bnRheCkgb2YgdGhlXG4gKiBicm93c2VyJ3MgVVJMLlxuICpcbiAqIGBQYXRoTG9jYXRpb25TdHJhdGVneWAgaXMgdGhlIGRlZmF1bHQgYmluZGluZyBmb3Ige0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9XG4gKiBwcm92aWRlZCBpbiB7QGxpbmsgUk9VVEVSX1BST1ZJREVSU30uXG4gKlxuICogSWYgeW91J3JlIHVzaW5nIGBQYXRoTG9jYXRpb25TdHJhdGVneWAsIHlvdSBtdXN0IHByb3ZpZGUgYSBwcm92aWRlciBmb3JcbiAqIHtAbGluayBBUFBfQkFTRV9IUkVGfSB0byBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIFVSTCBwcmVmaXggdGhhdCBzaG91bGRcbiAqIGJlIHByZXNlcnZlZCB3aGVuIGdlbmVyYXRpbmcgYW5kIHJlY29nbml6aW5nIFVSTHMuXG4gKlxuICogRm9yIGluc3RhbmNlLCBpZiB5b3UgcHJvdmlkZSBhbiBgQVBQX0JBU0VfSFJFRmAgb2YgYCcvbXkvYXBwJ2AgYW5kIGNhbGxcbiAqIGBsb2NhdGlvbi5nbygnL2ZvbycpYCwgdGhlIGJyb3dzZXIncyBVUkwgd2lsbCBiZWNvbWVcbiAqIGBleGFtcGxlLmNvbS9teS9hcHAvZm9vYC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnQsIHByb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtcbiAqICAgQVBQX0JBU0VfSFJFRlxuICogICBST1VURVJfRElSRUNUSVZFUyxcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgUm91dGVDb25maWcsXG4gKiAgIExvY2F0aW9uXG4gKiB9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHsuLi59LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7XG4gKiAgIGNvbnN0cnVjdG9yKGxvY2F0aW9uOiBMb2NhdGlvbikge1xuICogICAgIGxvY2F0aW9uLmdvKCcvZm9vJyk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBbXG4gKiAgIFJPVVRFUl9QUk9WSURFUlMsIC8vIGluY2x1ZGVzIGJpbmRpbmcgdG8gUGF0aExvY2F0aW9uU3RyYXRlZ3lcbiAqICAgcHJvdmlkZShBUFBfQkFTRV9IUkVGLCB7dXNlVmFsdWU6ICcvbXkvYXBwJ30pXG4gKiBdKTtcbiAqIGBgYFxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGF0aExvY2F0aW9uU3RyYXRlZ3kgZXh0ZW5kcyBMb2NhdGlvblN0cmF0ZWd5IHtcbiAgcHJpdmF0ZSBfYmFzZUhyZWY6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEFQUF9CQVNFX0hSRUYpIGhyZWY/OiBzdHJpbmcpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKGlzQmxhbmsoaHJlZikpIHtcbiAgICAgIGhyZWYgPSB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmdldEJhc2VIcmVmRnJvbURPTSgpO1xuICAgIH1cblxuICAgIGlmIChpc0JsYW5rKGhyZWYpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgTm8gYmFzZSBocmVmIHNldC4gUGxlYXNlIHByb3ZpZGUgYSB2YWx1ZSBmb3IgdGhlIEFQUF9CQVNFX0hSRUYgdG9rZW4gb3IgYWRkIGEgYmFzZSBlbGVtZW50IHRvIHRoZSBkb2N1bWVudC5gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9iYXNlSHJlZiA9IGhyZWY7XG4gIH1cblxuICBvblBvcFN0YXRlKGZuOiBFdmVudExpc3RlbmVyKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5vblBvcFN0YXRlKGZuKTtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLm9uSGFzaENoYW5nZShmbik7XG4gIH1cblxuICBnZXRCYXNlSHJlZigpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fYmFzZUhyZWY7IH1cblxuICBwcmVwYXJlRXh0ZXJuYWxVcmwoaW50ZXJuYWw6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBqb2luV2l0aFNsYXNoKHRoaXMuX2Jhc2VIcmVmLCBpbnRlcm5hbCk7IH1cblxuICBwYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucGF0aG5hbWUgKyBub3JtYWxpemVRdWVyeVBhcmFtcyh0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnNlYXJjaCk7XG4gIH1cblxuICBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBzdHJpbmcpIHtcbiAgICB2YXIgZXh0ZXJuYWxVcmwgPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybCh1cmwgKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeVBhcmFtcykpO1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucHVzaFN0YXRlKHN0YXRlLCB0aXRsZSwgZXh0ZXJuYWxVcmwpO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKSB7XG4gICAgdmFyIGV4dGVybmFsVXJsID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwodXJsICsgbm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnlQYXJhbXMpKTtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnJlcGxhY2VTdGF0ZShzdGF0ZSwgdGl0bGUsIGV4dGVybmFsVXJsKTtcbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uZm9yd2FyZCgpOyB9XG5cbiAgYmFjaygpOiB2b2lkIHsgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5iYWNrKCk7IH1cbn1cbiJdfQ==