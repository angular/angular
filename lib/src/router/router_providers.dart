// import {ROUTER_PROVIDERS_COMMON} from './router_providers_common';
library angular2.src.router.router_providers;

import "package:angular2/router.dart" show ROUTER_PROVIDERS_COMMON;
import "package:angular2/core.dart" show Provider;
import "browser_platform_location.dart" show BrowserPlatformLocation;
import "platform_location.dart" show PlatformLocation;

/**
 * A list of [Provider]s. To use the router, you must add this to your application.
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
const List<dynamic> ROUTER_PROVIDERS = const [
  ROUTER_PROVIDERS_COMMON,
  const Provider(PlatformLocation, useClass: BrowserPlatformLocation)
];
/**
 * Use [ROUTER_PROVIDERS] instead.
 *
 * @deprecated
 */
const ROUTER_BINDINGS = ROUTER_PROVIDERS;
