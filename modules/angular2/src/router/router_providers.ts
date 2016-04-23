import {ROUTER_PROVIDERS_COMMON} from './router_providers_common';
import {Provider} from 'angular2/core';
import {
  BrowserPlatformLocation
} from 'angular2/src/platform/browser/location/browser_platform_location';
import {PlatformLocation} from 'angular2/platform/common';
import {CONST_EXPR} from 'angular2/src/facade/lang';

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
export const ROUTER_PROVIDERS: any[] = CONST_EXPR([
  ROUTER_PROVIDERS_COMMON,
  CONST_EXPR(new Provider(PlatformLocation, {useClass: BrowserPlatformLocation})),
]);

/**
 * Use {@link ROUTER_PROVIDERS} instead.
 *
 * @deprecated
 */
export const ROUTER_BINDINGS = ROUTER_PROVIDERS;
