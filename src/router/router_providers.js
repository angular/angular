'use strict';// import {ROUTER_PROVIDERS_COMMON} from './router_providers_common';
var router_1 = require('angular2/router');
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var browser_platform_location_1 = require('./browser_platform_location');
var platform_location_1 = require('./platform_location');
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
exports.ROUTER_PROVIDERS = lang_1.CONST_EXPR([
    router_1.ROUTER_PROVIDERS_COMMON,
    lang_1.CONST_EXPR(new core_1.Provider(platform_location_1.PlatformLocation, { useClass: browser_platform_location_1.BrowserPlatformLocation })),
]);
/**
 * Use {@link ROUTER_PROVIDERS} instead.
 *
 * @deprecated
 */
exports.ROUTER_BINDINGS = exports.ROUTER_PROVIDERS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX3Byb3ZpZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvcm91dGVyX3Byb3ZpZGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxxRUFBcUU7QUFDckUsdUJBQXNDLGlCQUFpQixDQUFDLENBQUE7QUFDeEQscUJBQXVCLGVBQWUsQ0FBQyxDQUFBO0FBQ3ZDLHFCQUF5QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3BELDBDQUFzQyw2QkFBNkIsQ0FBQyxDQUFBO0FBQ3BFLGtDQUErQixxQkFBcUIsQ0FBQyxDQUFBO0FBRXJEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCRztBQUNVLHdCQUFnQixHQUFVLGlCQUFVLENBQUM7SUFDaEQsZ0NBQXVCO0lBQ3ZCLGlCQUFVLENBQUMsSUFBSSxlQUFRLENBQUMsb0NBQWdCLEVBQUUsRUFBQyxRQUFRLEVBQUUsbURBQXVCLEVBQUMsQ0FBQyxDQUFDO0NBQ2hGLENBQUMsQ0FBQztBQUVIOzs7O0dBSUc7QUFDVSx1QkFBZSxHQUFHLHdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0IHtST1VURVJfUFJPVklERVJTX0NPTU1PTn0gZnJvbSAnLi9yb3V0ZXJfcHJvdmlkZXJzX2NvbW1vbic7XG5pbXBvcnQge1JPVVRFUl9QUk9WSURFUlNfQ09NTU9OfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuaW1wb3J0IHtQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jyb3dzZXJQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICcuL2Jyb3dzZXJfcGxhdGZvcm1fbG9jYXRpb24nO1xuaW1wb3J0IHtQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICcuL3BsYXRmb3JtX2xvY2F0aW9uJztcblxuLyoqXG4gKiBBIGxpc3Qgb2Yge0BsaW5rIFByb3ZpZGVyfXMuIFRvIHVzZSB0aGUgcm91dGVyLCB5b3UgbXVzdCBhZGQgdGhpcyB0byB5b3VyIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9pUlVQOEI1T1VieENXUTNBY0lEbSkpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge1xuICogICBST1VURVJfRElSRUNUSVZFUyxcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgUm91dGVDb25maWdcbiAqIH0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgLy8gLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgW1JPVVRFUl9QUk9WSURFUlNdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgUk9VVEVSX1BST1ZJREVSUzogYW55W10gPSBDT05TVF9FWFBSKFtcbiAgUk9VVEVSX1BST1ZJREVSU19DT01NT04sXG4gIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKFBsYXRmb3JtTG9jYXRpb24sIHt1c2VDbGFzczogQnJvd3NlclBsYXRmb3JtTG9jYXRpb259KSksXG5dKTtcblxuLyoqXG4gKiBVc2Uge0BsaW5rIFJPVVRFUl9QUk9WSURFUlN9IGluc3RlYWQuXG4gKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IFJPVVRFUl9CSU5ESU5HUyA9IFJPVVRFUl9QUk9WSURFUlM7XG4iXX0=