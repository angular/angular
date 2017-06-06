'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var core_1 = require('angular2/core');
var location_strategy_1 = require('./location_strategy');
var location_1 = require('./location');
var platform_location_1 = require('./platform_location');
var lang_1 = require('angular2/src/facade/lang');
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
 *   Location,
 *   LocationStrategy,
 *   HashLocationStrategy
 * } from 'angular2/platform/common';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig
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
    HashLocationStrategy.prototype.onPopState = function (fn) {
        this._platformLocation.onPopState(fn);
        this._platformLocation.onHashChange(fn);
    };
    HashLocationStrategy.prototype.getBaseHref = function () { return this._baseHref; };
    HashLocationStrategy.prototype.path = function () {
        // the hash value is always prefixed with a `#`
        // and if it is empty then it will stay empty
        var path = this._platformLocation.hash;
        if (!lang_1.isPresent(path))
            path = '#';
        // Dart will complain if a call to substring is
        // executed with a position value that extends the
        // length of string.
        return (path.length > 0 ? path.substring(1) : path);
    };
    HashLocationStrategy.prototype.prepareExternalUrl = function (internal) {
        var url = location_1.Location.joinWithSlash(this._baseHref, internal);
        return url.length > 0 ? ('#' + url) : url;
    };
    HashLocationStrategy.prototype.pushState = function (state, title, path, queryParams) {
        var url = this.prepareExternalUrl(path + location_1.Location.normalizeQueryParams(queryParams));
        if (url.length == 0) {
            url = this._platformLocation.pathname;
        }
        this._platformLocation.pushState(state, title, url);
    };
    HashLocationStrategy.prototype.replaceState = function (state, title, path, queryParams) {
        var url = this.prepareExternalUrl(path + location_1.Location.normalizeQueryParams(queryParams));
        if (url.length == 0) {
            url = this._platformLocation.pathname;
        }
        this._platformLocation.replaceState(state, title, url);
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
}(location_strategy_1.LocationStrategy));
exports.HashLocationStrategy = HashLocationStrategy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaF9sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9icm93c2VyL2xvY2F0aW9uL2hhc2hfbG9jYXRpb25fc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUJBQTJDLGVBQWUsQ0FBQyxDQUFBO0FBQzNELGtDQUE4QyxxQkFBcUIsQ0FBQyxDQUFBO0FBQ3BFLHlCQUF1QixZQUFZLENBQUMsQ0FBQTtBQUNwQyxrQ0FBa0QscUJBQXFCLENBQUMsQ0FBQTtBQUN4RSxxQkFBd0IsMEJBQTBCLENBQUMsQ0FBQTtBQUVuRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUNHO0FBRUg7SUFBMEMsd0NBQWdCO0lBRXhELDhCQUFvQixpQkFBbUMsRUFDUixTQUFrQjtRQUMvRCxpQkFBTyxDQUFDO1FBRlUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUQvQyxjQUFTLEdBQVcsRUFBRSxDQUFDO1FBSTdCLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzdCLENBQUM7SUFDSCxDQUFDO0lBRUQseUNBQVUsR0FBVixVQUFXLEVBQXFCO1FBQzlCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsMENBQVcsR0FBWCxjQUF3QixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFFaEQsbUNBQUksR0FBSjtRQUNFLCtDQUErQztRQUMvQyw2Q0FBNkM7UUFDN0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQztRQUN2QyxFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBRWpDLCtDQUErQztRQUMvQyxrREFBa0Q7UUFDbEQsb0JBQW9CO1FBQ3BCLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELGlEQUFrQixHQUFsQixVQUFtQixRQUFnQjtRQUNqQyxJQUFJLEdBQUcsR0FBRyxtQkFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzNELE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDNUMsQ0FBQztJQUVELHdDQUFTLEdBQVQsVUFBVSxLQUFVLEVBQUUsS0FBYSxFQUFFLElBQVksRUFBRSxXQUFtQjtRQUNwRSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxHQUFHLG1CQUFRLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNyRixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsR0FBRyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7UUFDeEMsQ0FBQztRQUNELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsMkNBQVksR0FBWixVQUFhLEtBQVUsRUFBRSxLQUFhLEVBQUUsSUFBWSxFQUFFLFdBQW1CO1FBQ3ZFLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEdBQUcsbUJBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3JGLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixHQUFHLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztRQUN4QyxDQUFDO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxzQ0FBTyxHQUFQLGNBQWtCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFckQsbUNBQUksR0FBSixjQUFlLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFyRGpEO1FBQUMsaUJBQVUsRUFBRTttQkFJRSxlQUFRLEVBQUU7bUJBQUUsYUFBTSxDQUFDLGlDQUFhLENBQUM7OzRCQUpuQztJQXNEYiwyQkFBQztBQUFELENBQUMsQUFyREQsQ0FBMEMsb0NBQWdCLEdBcUR6RDtBQXJEWSw0QkFBb0IsdUJBcURoQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3QsIE9wdGlvbmFsfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TG9jYXRpb25TdHJhdGVneSwgQVBQX0JBU0VfSFJFRn0gZnJvbSAnLi9sb2NhdGlvbl9zdHJhdGVneSc7XG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICcuL2xvY2F0aW9uJztcbmltcG9ydCB7VXJsQ2hhbmdlTGlzdGVuZXIsIFBsYXRmb3JtTG9jYXRpb259IGZyb20gJy4vcGxhdGZvcm1fbG9jYXRpb24nO1xuaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogYEhhc2hMb2NhdGlvblN0cmF0ZWd5YCBpcyBhIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fSB1c2VkIHRvIGNvbmZpZ3VyZSB0aGVcbiAqIHtAbGluayBMb2NhdGlvbn0gc2VydmljZSB0byByZXByZXNlbnQgaXRzIHN0YXRlIGluIHRoZVxuICogW2hhc2ggZnJhZ21lbnRdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1VuaWZvcm1fUmVzb3VyY2VfTG9jYXRvciNTeW50YXgpXG4gKiBvZiB0aGUgYnJvd3NlcidzIFVSTC5cbiAqXG4gKiBGb3IgaW5zdGFuY2UsIGlmIHlvdSBjYWxsIGBsb2NhdGlvbi5nbygnL2ZvbycpYCwgdGhlIGJyb3dzZXIncyBVUkwgd2lsbCBiZWNvbWVcbiAqIGBleGFtcGxlLmNvbSMvZm9vYC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnQsIHByb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtcbiAqICAgTG9jYXRpb24sXG4gKiAgIExvY2F0aW9uU3RyYXRlZ3ksXG4gKiAgIEhhc2hMb2NhdGlvblN0cmF0ZWd5XG4gKiB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2NvbW1vbic7XG4gKiBpbXBvcnQge1xuICogICBST1VURVJfRElSRUNUSVZFUyxcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgUm91dGVDb25maWdcbiAqIH0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgY29uc3RydWN0b3IobG9jYXRpb246IExvY2F0aW9uKSB7XG4gKiAgICAgbG9jYXRpb24uZ28oJy9mb28nKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFtcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgcHJvdmlkZShMb2NhdGlvblN0cmF0ZWd5LCB7dXNlQ2xhc3M6IEhhc2hMb2NhdGlvblN0cmF0ZWd5fSlcbiAqIF0pO1xuICogYGBgXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIYXNoTG9jYXRpb25TdHJhdGVneSBleHRlbmRzIExvY2F0aW9uU3RyYXRlZ3kge1xuICBwcml2YXRlIF9iYXNlSHJlZjogc3RyaW5nID0gJyc7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3BsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb24sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQVBQX0JBU0VfSFJFRikgX2Jhc2VIcmVmPzogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoaXNQcmVzZW50KF9iYXNlSHJlZikpIHtcbiAgICAgIHRoaXMuX2Jhc2VIcmVmID0gX2Jhc2VIcmVmO1xuICAgIH1cbiAgfVxuXG4gIG9uUG9wU3RhdGUoZm46IFVybENoYW5nZUxpc3RlbmVyKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5vblBvcFN0YXRlKGZuKTtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLm9uSGFzaENoYW5nZShmbik7XG4gIH1cblxuICBnZXRCYXNlSHJlZigpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fYmFzZUhyZWY7IH1cblxuICBwYXRoKCk6IHN0cmluZyB7XG4gICAgLy8gdGhlIGhhc2ggdmFsdWUgaXMgYWx3YXlzIHByZWZpeGVkIHdpdGggYSBgI2BcbiAgICAvLyBhbmQgaWYgaXQgaXMgZW1wdHkgdGhlbiBpdCB3aWxsIHN0YXkgZW1wdHlcbiAgICB2YXIgcGF0aCA9IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uaGFzaDtcbiAgICBpZiAoIWlzUHJlc2VudChwYXRoKSkgcGF0aCA9ICcjJztcblxuICAgIC8vIERhcnQgd2lsbCBjb21wbGFpbiBpZiBhIGNhbGwgdG8gc3Vic3RyaW5nIGlzXG4gICAgLy8gZXhlY3V0ZWQgd2l0aCBhIHBvc2l0aW9uIHZhbHVlIHRoYXQgZXh0ZW5kcyB0aGVcbiAgICAvLyBsZW5ndGggb2Ygc3RyaW5nLlxuICAgIHJldHVybiAocGF0aC5sZW5ndGggPiAwID8gcGF0aC5zdWJzdHJpbmcoMSkgOiBwYXRoKTtcbiAgfVxuXG4gIHByZXBhcmVFeHRlcm5hbFVybChpbnRlcm5hbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB2YXIgdXJsID0gTG9jYXRpb24uam9pbldpdGhTbGFzaCh0aGlzLl9iYXNlSHJlZiwgaW50ZXJuYWwpO1xuICAgIHJldHVybiB1cmwubGVuZ3RoID4gMCA/ICgnIycgKyB1cmwpIDogdXJsO1xuICB9XG5cbiAgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnlQYXJhbXM6IHN0cmluZykge1xuICAgIHZhciB1cmwgPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybChwYXRoICsgTG9jYXRpb24ubm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnlQYXJhbXMpKTtcbiAgICBpZiAodXJsLmxlbmd0aCA9PSAwKSB7XG4gICAgICB1cmwgPSB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnBhdGhuYW1lO1xuICAgIH1cbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnB1c2hTdGF0ZShzdGF0ZSwgdGl0bGUsIHVybCk7XG4gIH1cblxuICByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKSB7XG4gICAgdmFyIHVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGggKyBMb2NhdGlvbi5ub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeVBhcmFtcykpO1xuICAgIGlmICh1cmwubGVuZ3RoID09IDApIHtcbiAgICAgIHVybCA9IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucGF0aG5hbWU7XG4gICAgfVxuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucmVwbGFjZVN0YXRlKHN0YXRlLCB0aXRsZSwgdXJsKTtcbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uZm9yd2FyZCgpOyB9XG5cbiAgYmFjaygpOiB2b2lkIHsgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5iYWNrKCk7IH1cbn1cbiJdfQ==