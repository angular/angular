'use strict';"use strict";
var router_providers_common_1 = require('./router_providers_common');
var browser_platform_location_1 = require('angular2/src/platform/browser/location/browser_platform_location');
var common_1 = require('angular2/platform/common');
/**
 * A list of {@link Provider}s. To use the router, you must add this to your application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from 'angular2/core';
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
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
exports.ROUTER_PROVIDERS = [
    router_providers_common_1.ROUTER_PROVIDERS_COMMON,
    /*@ts2dart_const*/ (
    /* @ts2dart_Provider */ { provide: common_1.PlatformLocation, useClass: browser_platform_location_1.BrowserPlatformLocation }),
];
/**
 * Use {@link ROUTER_PROVIDERS} instead.
 *
 * @deprecated
 */
exports.ROUTER_BINDINGS = exports.ROUTER_PROVIDERS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX3Byb3ZpZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9yb3V0ZXIvcm91dGVyX3Byb3ZpZGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsd0NBQXNDLDJCQUEyQixDQUFDLENBQUE7QUFFbEUsMENBRU8sa0VBQWtFLENBQUMsQ0FBQTtBQUMxRSx1QkFBK0IsMEJBQTBCLENBQUMsQ0FBQTtBQUUxRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDVSx3QkFBZ0IsR0FBNEI7SUFDdkQsaURBQXVCO0lBQ3ZCLGtCQUFrQixDQUFDO0lBQ2YsdUJBQXVCLENBQUMsRUFBQyxPQUFPLEVBQUUseUJBQWdCLEVBQUUsUUFBUSxFQUFFLG1EQUF1QixFQUFDLENBQUM7Q0FDNUYsQ0FBQztBQUVGOzs7O0dBSUc7QUFDVSx1QkFBZSxHQUFzQix3QkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Uk9VVEVSX1BST1ZJREVSU19DT01NT059IGZyb20gJy4vcm91dGVyX3Byb3ZpZGVyc19jb21tb24nO1xuaW1wb3J0IHtQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1xuICBCcm93c2VyUGxhdGZvcm1Mb2NhdGlvblxufSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci9sb2NhdGlvbi9icm93c2VyX3BsYXRmb3JtX2xvY2F0aW9uJztcbmltcG9ydCB7UGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vY29tbW9uJztcblxuLyoqXG4gKiBBIGxpc3Qgb2Yge0BsaW5rIFByb3ZpZGVyfXMuIFRvIHVzZSB0aGUgcm91dGVyLCB5b3UgbXVzdCBhZGQgdGhpcyB0byB5b3VyIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9pUlVQOEI1T1VieENXUTNBY0lEbSkpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge1xuICogICBST1VURVJfRElSRUNUSVZFUyxcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgUm91dGVDb25maWdcbiAqIH0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgLy8gLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgW1JPVVRFUl9QUk9WSURFUlNdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgUk9VVEVSX1BST1ZJREVSUzogYW55W10gPSAvKkB0czJkYXJ0X2NvbnN0Ki9bXG4gIFJPVVRFUl9QUk9WSURFUlNfQ09NTU9OLFxuICAvKkB0czJkYXJ0X2NvbnN0Ki8gKFxuICAgICAgLyogQHRzMmRhcnRfUHJvdmlkZXIgKi8ge3Byb3ZpZGU6IFBsYXRmb3JtTG9jYXRpb24sIHVzZUNsYXNzOiBCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbn0pLFxuXTtcblxuLyoqXG4gKiBVc2Uge0BsaW5rIFJPVVRFUl9QUk9WSURFUlN9IGluc3RlYWQuXG4gKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IFJPVVRFUl9CSU5ESU5HUyA9IC8qQHRzMmRhcnRfY29uc3QqLyBST1VURVJfUFJPVklERVJTO1xuIl19