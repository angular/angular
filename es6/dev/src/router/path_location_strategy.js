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
 * import {Component, provide} from 'angular2/angular2';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aF9sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvcGF0aF9sb2NhdGlvbl9zdHJhdGVneS50cyJdLCJuYW1lcyI6WyJQYXRoTG9jYXRpb25TdHJhdGVneSIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiUGF0aExvY2F0aW9uU3RyYXRlZ3kub25Qb3BTdGF0ZSIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LmdldEJhc2VIcmVmIiwiUGF0aExvY2F0aW9uU3RyYXRlZ3kucHJlcGFyZUV4dGVybmFsVXJsIiwiUGF0aExvY2F0aW9uU3RyYXRlZ3kucGF0aCIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LnB1c2hTdGF0ZSIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LnJlcGxhY2VTdGF0ZSIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LmZvcndhcmQiLCJQYXRoTG9jYXRpb25TdHJhdGVneS5iYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlO09BRW5ELEVBQUMsT0FBTyxFQUFDLE1BQU0sMEJBQTBCO09BQ3pDLEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3JELEVBQ0wsZ0JBQWdCLEVBQ2hCLGFBQWEsRUFDYixvQkFBb0IsRUFDcEIsYUFBYSxFQUNkLE1BQU0scUJBQXFCO09BQ3JCLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUI7QUFFcEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNENHO0FBQ0gsZ0RBQzBDLGdCQUFnQjtJQUd4REEsWUFBb0JBLGlCQUFtQ0EsRUFDUkEsSUFBYUE7UUFDMURDLE9BQU9BLENBQUNBO1FBRlVBLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBa0JBO1FBSXJEQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxrQkFBa0JBLEVBQUVBLENBQUNBO1FBQ3JEQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsTUFBTUEsSUFBSUEsYUFBYUEsQ0FDbkJBLDZHQUE2R0EsQ0FBQ0EsQ0FBQ0E7UUFDckhBLENBQUNBO1FBRURBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBO0lBQ3hCQSxDQUFDQTtJQUVERCxVQUFVQSxDQUFDQSxFQUFpQkE7UUFDMUJFLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDdENBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFDMUNBLENBQUNBO0lBRURGLFdBQVdBLEtBQWFHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO0lBRWhESCxrQkFBa0JBLENBQUNBLFFBQWdCQSxJQUFZSSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVoR0osSUFBSUE7UUFDRkssTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxRQUFRQSxHQUFHQSxvQkFBb0JBLENBQUNBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDL0ZBLENBQUNBO0lBRURMLFNBQVNBLENBQUNBLEtBQVVBLEVBQUVBLEtBQWFBLEVBQUVBLEdBQVdBLEVBQUVBLFdBQW1CQTtRQUNuRU0sSUFBSUEsV0FBV0EsR0FBR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxHQUFHQSxHQUFHQSxvQkFBb0JBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1FBQ25GQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBO0lBQzlEQSxDQUFDQTtJQUVETixZQUFZQSxDQUFDQSxLQUFVQSxFQUFFQSxLQUFhQSxFQUFFQSxHQUFXQSxFQUFFQSxXQUFtQkE7UUFDdEVPLElBQUlBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsR0FBR0EsR0FBR0Esb0JBQW9CQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNuRkEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxZQUFZQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQTtJQUNqRUEsQ0FBQ0E7SUFFRFAsT0FBT0EsS0FBV1EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVyRFIsSUFBSUEsS0FBV1MsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNqRFQsQ0FBQ0E7QUE5Q0Q7SUFBQyxVQUFVLEVBQUU7SUFLQyxXQUFDLFFBQVEsRUFBRSxDQUFBO0lBQUMsV0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUE7O3lCQXlDL0M7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0LCBPcHRpb25hbH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0V2ZW50TGlzdGVuZXIsIEhpc3RvcnksIExvY2F0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2Jyb3dzZXInO1xuaW1wb3J0IHtpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtcbiAgTG9jYXRpb25TdHJhdGVneSxcbiAgQVBQX0JBU0VfSFJFRixcbiAgbm9ybWFsaXplUXVlcnlQYXJhbXMsXG4gIGpvaW5XaXRoU2xhc2hcbn0gZnJvbSAnLi9sb2NhdGlvbl9zdHJhdGVneSc7XG5pbXBvcnQge1BsYXRmb3JtTG9jYXRpb259IGZyb20gJy4vcGxhdGZvcm1fbG9jYXRpb24nO1xuXG4vKipcbiAqIGBQYXRoTG9jYXRpb25TdHJhdGVneWAgaXMgYSB7QGxpbmsgTG9jYXRpb25TdHJhdGVneX0gdXNlZCB0byBjb25maWd1cmUgdGhlXG4gKiB7QGxpbmsgTG9jYXRpb259IHNlcnZpY2UgdG8gcmVwcmVzZW50IGl0cyBzdGF0ZSBpbiB0aGVcbiAqIFtwYXRoXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Vbmlmb3JtX1Jlc291cmNlX0xvY2F0b3IjU3ludGF4KSBvZiB0aGVcbiAqIGJyb3dzZXIncyBVUkwuXG4gKlxuICogYFBhdGhMb2NhdGlvblN0cmF0ZWd5YCBpcyB0aGUgZGVmYXVsdCBiaW5kaW5nIGZvciB7QGxpbmsgTG9jYXRpb25TdHJhdGVneX1cbiAqIHByb3ZpZGVkIGluIHtAbGluayBST1VURVJfUFJPVklERVJTfS5cbiAqXG4gKiBJZiB5b3UncmUgdXNpbmcgYFBhdGhMb2NhdGlvblN0cmF0ZWd5YCwgeW91IG11c3QgcHJvdmlkZSBhIHByb3ZpZGVyIGZvclxuICoge0BsaW5rIEFQUF9CQVNFX0hSRUZ9IHRvIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgVVJMIHByZWZpeCB0aGF0IHNob3VsZFxuICogYmUgcHJlc2VydmVkIHdoZW4gZ2VuZXJhdGluZyBhbmQgcmVjb2duaXppbmcgVVJMcy5cbiAqXG4gKiBGb3IgaW5zdGFuY2UsIGlmIHlvdSBwcm92aWRlIGFuIGBBUFBfQkFTRV9IUkVGYCBvZiBgJy9teS9hcHAnYCBhbmQgY2FsbFxuICogYGxvY2F0aW9uLmdvKCcvZm9vJylgLCB0aGUgYnJvd3NlcidzIFVSTCB3aWxsIGJlY29tZVxuICogYGV4YW1wbGUuY29tL215L2FwcC9mb29gLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuICogaW1wb3J0IHtcbiAqICAgQVBQX0JBU0VfSFJFRlxuICogICBST1VURVJfRElSRUNUSVZFUyxcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgUm91dGVDb25maWcsXG4gKiAgIExvY2F0aW9uXG4gKiB9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHsuLi59LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7XG4gKiAgIGNvbnN0cnVjdG9yKGxvY2F0aW9uOiBMb2NhdGlvbikge1xuICogICAgIGxvY2F0aW9uLmdvKCcvZm9vJyk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBbXG4gKiAgIFJPVVRFUl9QUk9WSURFUlMsIC8vIGluY2x1ZGVzIGJpbmRpbmcgdG8gUGF0aExvY2F0aW9uU3RyYXRlZ3lcbiAqICAgcHJvdmlkZShBUFBfQkFTRV9IUkVGLCB7dXNlVmFsdWU6ICcvbXkvYXBwJ30pXG4gKiBdKTtcbiAqIGBgYFxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGF0aExvY2F0aW9uU3RyYXRlZ3kgZXh0ZW5kcyBMb2NhdGlvblN0cmF0ZWd5IHtcbiAgcHJpdmF0ZSBfYmFzZUhyZWY6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEFQUF9CQVNFX0hSRUYpIGhyZWY/OiBzdHJpbmcpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKGlzQmxhbmsoaHJlZikpIHtcbiAgICAgIGhyZWYgPSB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmdldEJhc2VIcmVmRnJvbURPTSgpO1xuICAgIH1cblxuICAgIGlmIChpc0JsYW5rKGhyZWYpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgTm8gYmFzZSBocmVmIHNldC4gUGxlYXNlIHByb3ZpZGUgYSB2YWx1ZSBmb3IgdGhlIEFQUF9CQVNFX0hSRUYgdG9rZW4gb3IgYWRkIGEgYmFzZSBlbGVtZW50IHRvIHRoZSBkb2N1bWVudC5gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9iYXNlSHJlZiA9IGhyZWY7XG4gIH1cblxuICBvblBvcFN0YXRlKGZuOiBFdmVudExpc3RlbmVyKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5vblBvcFN0YXRlKGZuKTtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLm9uSGFzaENoYW5nZShmbik7XG4gIH1cblxuICBnZXRCYXNlSHJlZigpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fYmFzZUhyZWY7IH1cblxuICBwcmVwYXJlRXh0ZXJuYWxVcmwoaW50ZXJuYWw6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBqb2luV2l0aFNsYXNoKHRoaXMuX2Jhc2VIcmVmLCBpbnRlcm5hbCk7IH1cblxuICBwYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucGF0aG5hbWUgKyBub3JtYWxpemVRdWVyeVBhcmFtcyh0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnNlYXJjaCk7XG4gIH1cblxuICBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBzdHJpbmcpIHtcbiAgICB2YXIgZXh0ZXJuYWxVcmwgPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybCh1cmwgKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeVBhcmFtcykpO1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucHVzaFN0YXRlKHN0YXRlLCB0aXRsZSwgZXh0ZXJuYWxVcmwpO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKSB7XG4gICAgdmFyIGV4dGVybmFsVXJsID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwodXJsICsgbm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnlQYXJhbXMpKTtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnJlcGxhY2VTdGF0ZShzdGF0ZSwgdGl0bGUsIGV4dGVybmFsVXJsKTtcbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uZm9yd2FyZCgpOyB9XG5cbiAgYmFjaygpOiB2b2lkIHsgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5iYWNrKCk7IH1cbn1cbiJdfQ==