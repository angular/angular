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
var location_strategy_1 = require('./location_strategy');
var lang_1 = require('angular2/src/facade/lang');
var platform_location_1 = require('./platform_location');
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
var HashLocationStrategy = (function (_super) {
    __extends(HashLocationStrategy, _super);
    function HashLocationStrategy(_platformLocation, _baseHref) {
        _super.call(this);
        this._platformLocation = _platformLocation;
        this._baseHref = '';
        if (lang_1.isPresent(_baseHref)) {
            this._baseHref = _baseHref;
        }
    }
    HashLocationStrategy.prototype.onPopState = function (fn) { this._platformLocation.onPopState(fn); };
    HashLocationStrategy.prototype.getBaseHref = function () { return this._baseHref; };
    HashLocationStrategy.prototype.path = function () {
        // the hash value is always prefixed with a `#`
        // and if it is empty then it will stay empty
        var path = this._platformLocation.hash;
        // Dart will complain if a call to substring is
        // executed with a position value that extends the
        // length of string.
        return (path.length > 0 ? path.substring(1) : path) +
            location_strategy_1.normalizeQueryParams(this._platformLocation.search);
    };
    HashLocationStrategy.prototype.prepareExternalUrl = function (internal) {
        var url = location_strategy_1.joinWithSlash(this._baseHref, internal);
        return url.length > 0 ? ('#' + url) : url;
    };
    HashLocationStrategy.prototype.pushState = function (state, title, path, queryParams) {
        var url = this.prepareExternalUrl(path + location_strategy_1.normalizeQueryParams(queryParams));
        if (url.length == 0) {
            url = this._platformLocation.pathname;
        }
        this._platformLocation.pushState(state, title, url);
    };
    HashLocationStrategy.prototype.forward = function () { this._platformLocation.forward(); };
    HashLocationStrategy.prototype.back = function () { this._platformLocation.back(); };
    HashLocationStrategy = __decorate([
        core_1.Injectable(),
        __param(1, core_1.Optional()),
        __param(1, core_1.Inject(location_strategy_1.APP_BASE_HREF)), 
        __metadata('design:paramtypes', [platform_location_1.PlatformLocation, String])
    ], HashLocationStrategy);
    return HashLocationStrategy;
})(location_strategy_1.LocationStrategy);
exports.HashLocationStrategy = HashLocationStrategy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaF9sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvaGFzaF9sb2NhdGlvbl9zdHJhdGVneS50cyJdLCJuYW1lcyI6WyJIYXNoTG9jYXRpb25TdHJhdGVneSIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiSGFzaExvY2F0aW9uU3RyYXRlZ3kub25Qb3BTdGF0ZSIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LmdldEJhc2VIcmVmIiwiSGFzaExvY2F0aW9uU3RyYXRlZ3kucGF0aCIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LnByZXBhcmVFeHRlcm5hbFVybCIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LnB1c2hTdGF0ZSIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LmZvcndhcmQiLCJIYXNoTG9jYXRpb25TdHJhdGVneS5iYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUJBQTJDLGVBQWUsQ0FBQyxDQUFBO0FBQzNELGtDQUtPLHFCQUFxQixDQUFDLENBQUE7QUFFN0IscUJBQXdCLDBCQUEwQixDQUFDLENBQUE7QUFDbkQsa0NBQStCLHFCQUFxQixDQUFDLENBQUE7QUFFckQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQ0c7QUFDSDtJQUMwQ0Esd0NBQWdCQTtJQUV4REEsOEJBQW9CQSxpQkFBbUNBLEVBQ1JBLFNBQWtCQTtRQUMvREMsaUJBQU9BLENBQUNBO1FBRlVBLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBa0JBO1FBRC9DQSxjQUFTQSxHQUFXQSxFQUFFQSxDQUFDQTtRQUk3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pCQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxTQUFTQSxDQUFDQTtRQUM3QkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREQseUNBQVVBLEdBQVZBLFVBQVdBLEVBQWlCQSxJQUFVRSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLFVBQVVBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTlFRiwwQ0FBV0EsR0FBWEEsY0FBd0JHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO0lBRWhESCxtQ0FBSUEsR0FBSkE7UUFDRUksK0NBQStDQTtRQUMvQ0EsNkNBQTZDQTtRQUM3Q0EsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUV2Q0EsK0NBQStDQTtRQUMvQ0Esa0RBQWtEQTtRQUNsREEsb0JBQW9CQTtRQUNwQkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDNUNBLHdDQUFvQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUM3REEsQ0FBQ0E7SUFFREosaURBQWtCQSxHQUFsQkEsVUFBbUJBLFFBQWdCQTtRQUNqQ0ssSUFBSUEsR0FBR0EsR0FBR0EsaUNBQWFBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1FBQ2xEQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQTtJQUM1Q0EsQ0FBQ0E7SUFFREwsd0NBQVNBLEdBQVRBLFVBQVVBLEtBQVVBLEVBQUVBLEtBQWFBLEVBQUVBLElBQVlBLEVBQUVBLFdBQW1CQTtRQUNwRU0sSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxJQUFJQSxHQUFHQSx3Q0FBb0JBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1FBQzVFQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUN4Q0EsQ0FBQ0E7UUFDREEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN0REEsQ0FBQ0E7SUFFRE4sc0NBQU9BLEdBQVBBLGNBQWtCTyxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRXJEUCxtQ0FBSUEsR0FBSkEsY0FBZVEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQTFDakRSO1FBQUNBLGlCQUFVQSxFQUFFQTtRQUlDQSxXQUFDQSxlQUFRQSxFQUFFQSxDQUFBQTtRQUFDQSxXQUFDQSxhQUFNQSxDQUFDQSxpQ0FBYUEsQ0FBQ0EsQ0FBQUE7OzZCQXVDL0NBO0lBQURBLDJCQUFDQTtBQUFEQSxDQUFDQSxBQTNDRCxFQUMwQyxvQ0FBZ0IsRUEwQ3pEO0FBMUNZLDRCQUFvQix1QkEwQ2hDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGUsIEluamVjdCwgT3B0aW9uYWx9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtcbiAgTG9jYXRpb25TdHJhdGVneSxcbiAgam9pbldpdGhTbGFzaCxcbiAgQVBQX0JBU0VfSFJFRixcbiAgbm9ybWFsaXplUXVlcnlQYXJhbXNcbn0gZnJvbSAnLi9sb2NhdGlvbl9zdHJhdGVneSc7XG5pbXBvcnQge0V2ZW50TGlzdGVuZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYnJvd3Nlcic7XG5pbXBvcnQge2lzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7UGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnLi9wbGF0Zm9ybV9sb2NhdGlvbic7XG5cbi8qKlxuICogYEhhc2hMb2NhdGlvblN0cmF0ZWd5YCBpcyBhIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fSB1c2VkIHRvIGNvbmZpZ3VyZSB0aGVcbiAqIHtAbGluayBMb2NhdGlvbn0gc2VydmljZSB0byByZXByZXNlbnQgaXRzIHN0YXRlIGluIHRoZVxuICogW2hhc2ggZnJhZ21lbnRdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1VuaWZvcm1fUmVzb3VyY2VfTG9jYXRvciNTeW50YXgpXG4gKiBvZiB0aGUgYnJvd3NlcidzIFVSTC5cbiAqXG4gKiBGb3IgaW5zdGFuY2UsIGlmIHlvdSBjYWxsIGBsb2NhdGlvbi5nbygnL2ZvbycpYCwgdGhlIGJyb3dzZXIncyBVUkwgd2lsbCBiZWNvbWVcbiAqIGBleGFtcGxlLmNvbSMvZm9vYC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnQsIHByb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbiAqIGltcG9ydCB7XG4gKiAgIFJPVVRFUl9ESVJFQ1RJVkVTLFxuICogICBST1VURVJfUFJPVklERVJTLFxuICogICBSb3V0ZUNvbmZpZyxcbiAqICAgTG9jYXRpb24sXG4gKiAgIExvY2F0aW9uU3RyYXRlZ3ksXG4gKiAgIEhhc2hMb2NhdGlvblN0cmF0ZWd5XG4gKiB9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHsuLi59LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7XG4gKiAgIGNvbnN0cnVjdG9yKGxvY2F0aW9uOiBMb2NhdGlvbikge1xuICogICAgIGxvY2F0aW9uLmdvKCcvZm9vJyk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBbXG4gKiAgIFJPVVRFUl9QUk9WSURFUlMsXG4gKiAgIHByb3ZpZGUoTG9jYXRpb25TdHJhdGVneSwge3VzZUNsYXNzOiBIYXNoTG9jYXRpb25TdHJhdGVneX0pXG4gKiBdKTtcbiAqIGBgYFxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSGFzaExvY2F0aW9uU3RyYXRlZ3kgZXh0ZW5kcyBMb2NhdGlvblN0cmF0ZWd5IHtcbiAgcHJpdmF0ZSBfYmFzZUhyZWY6IHN0cmluZyA9ICcnO1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEFQUF9CQVNFX0hSRUYpIF9iYXNlSHJlZj86IHN0cmluZykge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKGlzUHJlc2VudChfYmFzZUhyZWYpKSB7XG4gICAgICB0aGlzLl9iYXNlSHJlZiA9IF9iYXNlSHJlZjtcbiAgICB9XG4gIH1cblxuICBvblBvcFN0YXRlKGZuOiBFdmVudExpc3RlbmVyKTogdm9pZCB7IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ub25Qb3BTdGF0ZShmbik7IH1cblxuICBnZXRCYXNlSHJlZigpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fYmFzZUhyZWY7IH1cblxuICBwYXRoKCk6IHN0cmluZyB7XG4gICAgLy8gdGhlIGhhc2ggdmFsdWUgaXMgYWx3YXlzIHByZWZpeGVkIHdpdGggYSBgI2BcbiAgICAvLyBhbmQgaWYgaXQgaXMgZW1wdHkgdGhlbiBpdCB3aWxsIHN0YXkgZW1wdHlcbiAgICB2YXIgcGF0aCA9IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uaGFzaDtcblxuICAgIC8vIERhcnQgd2lsbCBjb21wbGFpbiBpZiBhIGNhbGwgdG8gc3Vic3RyaW5nIGlzXG4gICAgLy8gZXhlY3V0ZWQgd2l0aCBhIHBvc2l0aW9uIHZhbHVlIHRoYXQgZXh0ZW5kcyB0aGVcbiAgICAvLyBsZW5ndGggb2Ygc3RyaW5nLlxuICAgIHJldHVybiAocGF0aC5sZW5ndGggPiAwID8gcGF0aC5zdWJzdHJpbmcoMSkgOiBwYXRoKSArXG4gICAgICAgICAgIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uc2VhcmNoKTtcbiAgfVxuXG4gIHByZXBhcmVFeHRlcm5hbFVybChpbnRlcm5hbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB2YXIgdXJsID0gam9pbldpdGhTbGFzaCh0aGlzLl9iYXNlSHJlZiwgaW50ZXJuYWwpO1xuICAgIHJldHVybiB1cmwubGVuZ3RoID4gMCA/ICgnIycgKyB1cmwpIDogdXJsO1xuICB9XG5cbiAgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnlQYXJhbXM6IHN0cmluZykge1xuICAgIHZhciB1cmwgPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybChwYXRoICsgbm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnlQYXJhbXMpKTtcbiAgICBpZiAodXJsLmxlbmd0aCA9PSAwKSB7XG4gICAgICB1cmwgPSB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnBhdGhuYW1lO1xuICAgIH1cbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnB1c2hTdGF0ZShzdGF0ZSwgdGl0bGUsIHVybCk7XG4gIH1cblxuICBmb3J3YXJkKCk6IHZvaWQgeyB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmZvcndhcmQoKTsgfVxuXG4gIGJhY2soKTogdm9pZCB7IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uYmFjaygpOyB9XG59XG4iXX0=