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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var location_strategy_1 = require('./location_strategy');
var platform_location_1 = require('./platform_location');
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
var PathLocationStrategy = (function (_super) {
    __extends(PathLocationStrategy, _super);
    function PathLocationStrategy(_platformLocation, href) {
        _super.call(this);
        this._platformLocation = _platformLocation;
        if (lang_1.isBlank(href)) {
            href = this._platformLocation.getBaseHrefFromDOM();
        }
        if (lang_1.isBlank(href)) {
            throw new exceptions_1.BaseException("No base href set. Please provide a value for the APP_BASE_HREF token or add a base element to the document.");
        }
        this._baseHref = href;
    }
    PathLocationStrategy.prototype.onPopState = function (fn) {
        this._platformLocation.onPopState(fn);
        this._platformLocation.onHashChange(fn);
    };
    PathLocationStrategy.prototype.getBaseHref = function () { return this._baseHref; };
    PathLocationStrategy.prototype.prepareExternalUrl = function (internal) { return location_strategy_1.joinWithSlash(this._baseHref, internal); };
    PathLocationStrategy.prototype.path = function () {
        return this._platformLocation.pathname + location_strategy_1.normalizeQueryParams(this._platformLocation.search);
    };
    PathLocationStrategy.prototype.pushState = function (state, title, url, queryParams) {
        var externalUrl = this.prepareExternalUrl(url + location_strategy_1.normalizeQueryParams(queryParams));
        this._platformLocation.pushState(state, title, externalUrl);
    };
    PathLocationStrategy.prototype.forward = function () { this._platformLocation.forward(); };
    PathLocationStrategy.prototype.back = function () { this._platformLocation.back(); };
    PathLocationStrategy = __decorate([
        core_1.Injectable(),
        __param(1, core_1.Optional()),
        __param(1, core_1.Inject(location_strategy_1.APP_BASE_HREF)), 
        __metadata('design:paramtypes', [platform_location_1.PlatformLocation, String])
    ], PathLocationStrategy);
    return PathLocationStrategy;
})(location_strategy_1.LocationStrategy);
exports.PathLocationStrategy = PathLocationStrategy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aF9sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvcGF0aF9sb2NhdGlvbl9zdHJhdGVneS50cyJdLCJuYW1lcyI6WyJQYXRoTG9jYXRpb25TdHJhdGVneSIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiUGF0aExvY2F0aW9uU3RyYXRlZ3kub25Qb3BTdGF0ZSIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LmdldEJhc2VIcmVmIiwiUGF0aExvY2F0aW9uU3RyYXRlZ3kucHJlcGFyZUV4dGVybmFsVXJsIiwiUGF0aExvY2F0aW9uU3RyYXRlZ3kucGF0aCIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LnB1c2hTdGF0ZSIsIlBhdGhMb2NhdGlvblN0cmF0ZWd5LmZvcndhcmQiLCJQYXRoTG9jYXRpb25TdHJhdGVneS5iYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUJBQTJDLGVBQWUsQ0FBQyxDQUFBO0FBRTNELHFCQUFzQiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ2pELDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELGtDQUtPLHFCQUFxQixDQUFDLENBQUE7QUFDN0Isa0NBQStCLHFCQUFxQixDQUFDLENBQUE7QUFFckQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNENHO0FBQ0g7SUFDMENBLHdDQUFnQkE7SUFHeERBLDhCQUFvQkEsaUJBQW1DQSxFQUNSQSxJQUFhQTtRQUMxREMsaUJBQU9BLENBQUNBO1FBRlVBLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBa0JBO1FBSXJEQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxrQkFBa0JBLEVBQUVBLENBQUNBO1FBQ3JEQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQ25CQSw2R0FBNkdBLENBQUNBLENBQUNBO1FBQ3JIQSxDQUFDQTtRQUVEQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUN4QkEsQ0FBQ0E7SUFFREQseUNBQVVBLEdBQVZBLFVBQVdBLEVBQWlCQTtRQUMxQkUsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxVQUFVQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUN0Q0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxZQUFZQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUMxQ0EsQ0FBQ0E7SUFFREYsMENBQVdBLEdBQVhBLGNBQXdCRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVoREgsaURBQWtCQSxHQUFsQkEsVUFBbUJBLFFBQWdCQSxJQUFZSSxNQUFNQSxDQUFDQSxpQ0FBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFaEdKLG1DQUFJQSxHQUFKQTtRQUNFSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLFFBQVFBLEdBQUdBLHdDQUFvQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUMvRkEsQ0FBQ0E7SUFFREwsd0NBQVNBLEdBQVRBLFVBQVVBLEtBQVVBLEVBQUVBLEtBQWFBLEVBQUVBLEdBQVdBLEVBQUVBLFdBQW1CQTtRQUNuRU0sSUFBSUEsV0FBV0EsR0FBR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxHQUFHQSxHQUFHQSx3Q0FBb0JBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1FBQ25GQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBO0lBQzlEQSxDQUFDQTtJQUVETixzQ0FBT0EsR0FBUEEsY0FBa0JPLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFckRQLG1DQUFJQSxHQUFKQSxjQUFlUSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBeENqRFI7UUFBQ0EsaUJBQVVBLEVBQUVBO1FBS0NBLFdBQUNBLGVBQVFBLEVBQUVBLENBQUFBO1FBQUNBLFdBQUNBLGFBQU1BLENBQUNBLGlDQUFhQSxDQUFDQSxDQUFBQTs7NkJBb0MvQ0E7SUFBREEsMkJBQUNBO0FBQURBLENBQUNBLEFBekNELEVBQzBDLG9DQUFnQixFQXdDekQ7QUF4Q1ksNEJBQW9CLHVCQXdDaEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0LCBPcHRpb25hbH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0V2ZW50TGlzdGVuZXIsIEhpc3RvcnksIExvY2F0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2Jyb3dzZXInO1xuaW1wb3J0IHtpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtcbiAgTG9jYXRpb25TdHJhdGVneSxcbiAgQVBQX0JBU0VfSFJFRixcbiAgbm9ybWFsaXplUXVlcnlQYXJhbXMsXG4gIGpvaW5XaXRoU2xhc2hcbn0gZnJvbSAnLi9sb2NhdGlvbl9zdHJhdGVneSc7XG5pbXBvcnQge1BsYXRmb3JtTG9jYXRpb259IGZyb20gJy4vcGxhdGZvcm1fbG9jYXRpb24nO1xuXG4vKipcbiAqIGBQYXRoTG9jYXRpb25TdHJhdGVneWAgaXMgYSB7QGxpbmsgTG9jYXRpb25TdHJhdGVneX0gdXNlZCB0byBjb25maWd1cmUgdGhlXG4gKiB7QGxpbmsgTG9jYXRpb259IHNlcnZpY2UgdG8gcmVwcmVzZW50IGl0cyBzdGF0ZSBpbiB0aGVcbiAqIFtwYXRoXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Vbmlmb3JtX1Jlc291cmNlX0xvY2F0b3IjU3ludGF4KSBvZiB0aGVcbiAqIGJyb3dzZXIncyBVUkwuXG4gKlxuICogYFBhdGhMb2NhdGlvblN0cmF0ZWd5YCBpcyB0aGUgZGVmYXVsdCBiaW5kaW5nIGZvciB7QGxpbmsgTG9jYXRpb25TdHJhdGVneX1cbiAqIHByb3ZpZGVkIGluIHtAbGluayBST1VURVJfUFJPVklERVJTfS5cbiAqXG4gKiBJZiB5b3UncmUgdXNpbmcgYFBhdGhMb2NhdGlvblN0cmF0ZWd5YCwgeW91IG11c3QgcHJvdmlkZSBhIHByb3ZpZGVyIGZvclxuICoge0BsaW5rIEFQUF9CQVNFX0hSRUZ9IHRvIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgVVJMIHByZWZpeCB0aGF0IHNob3VsZFxuICogYmUgcHJlc2VydmVkIHdoZW4gZ2VuZXJhdGluZyBhbmQgcmVjb2duaXppbmcgVVJMcy5cbiAqXG4gKiBGb3IgaW5zdGFuY2UsIGlmIHlvdSBwcm92aWRlIGFuIGBBUFBfQkFTRV9IUkVGYCBvZiBgJy9teS9hcHAnYCBhbmQgY2FsbFxuICogYGxvY2F0aW9uLmdvKCcvZm9vJylgLCB0aGUgYnJvd3NlcidzIFVSTCB3aWxsIGJlY29tZVxuICogYGV4YW1wbGUuY29tL215L2FwcC9mb29gLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuICogaW1wb3J0IHtcbiAqICAgQVBQX0JBU0VfSFJFRlxuICogICBST1VURVJfRElSRUNUSVZFUyxcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgUm91dGVDb25maWcsXG4gKiAgIExvY2F0aW9uXG4gKiB9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHsuLi59LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7XG4gKiAgIGNvbnN0cnVjdG9yKGxvY2F0aW9uOiBMb2NhdGlvbikge1xuICogICAgIGxvY2F0aW9uLmdvKCcvZm9vJyk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBbXG4gKiAgIFJPVVRFUl9QUk9WSURFUlMsIC8vIGluY2x1ZGVzIGJpbmRpbmcgdG8gUGF0aExvY2F0aW9uU3RyYXRlZ3lcbiAqICAgcHJvdmlkZShBUFBfQkFTRV9IUkVGLCB7dXNlVmFsdWU6ICcvbXkvYXBwJ30pXG4gKiBdKTtcbiAqIGBgYFxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGF0aExvY2F0aW9uU3RyYXRlZ3kgZXh0ZW5kcyBMb2NhdGlvblN0cmF0ZWd5IHtcbiAgcHJpdmF0ZSBfYmFzZUhyZWY6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEFQUF9CQVNFX0hSRUYpIGhyZWY/OiBzdHJpbmcpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKGlzQmxhbmsoaHJlZikpIHtcbiAgICAgIGhyZWYgPSB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmdldEJhc2VIcmVmRnJvbURPTSgpO1xuICAgIH1cblxuICAgIGlmIChpc0JsYW5rKGhyZWYpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgTm8gYmFzZSBocmVmIHNldC4gUGxlYXNlIHByb3ZpZGUgYSB2YWx1ZSBmb3IgdGhlIEFQUF9CQVNFX0hSRUYgdG9rZW4gb3IgYWRkIGEgYmFzZSBlbGVtZW50IHRvIHRoZSBkb2N1bWVudC5gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9iYXNlSHJlZiA9IGhyZWY7XG4gIH1cblxuICBvblBvcFN0YXRlKGZuOiBFdmVudExpc3RlbmVyKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5vblBvcFN0YXRlKGZuKTtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLm9uSGFzaENoYW5nZShmbik7XG4gIH1cblxuICBnZXRCYXNlSHJlZigpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fYmFzZUhyZWY7IH1cblxuICBwcmVwYXJlRXh0ZXJuYWxVcmwoaW50ZXJuYWw6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBqb2luV2l0aFNsYXNoKHRoaXMuX2Jhc2VIcmVmLCBpbnRlcm5hbCk7IH1cblxuICBwYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucGF0aG5hbWUgKyBub3JtYWxpemVRdWVyeVBhcmFtcyh0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnNlYXJjaCk7XG4gIH1cblxuICBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBzdHJpbmcpIHtcbiAgICB2YXIgZXh0ZXJuYWxVcmwgPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybCh1cmwgKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeVBhcmFtcykpO1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucHVzaFN0YXRlKHN0YXRlLCB0aXRsZSwgZXh0ZXJuYWxVcmwpO1xuICB9XG5cbiAgZm9yd2FyZCgpOiB2b2lkIHsgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5mb3J3YXJkKCk7IH1cblxuICBiYWNrKCk6IHZvaWQgeyB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmJhY2soKTsgfVxufVxuIl19