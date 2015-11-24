library angular2.src.router.location_strategy;

import "package:angular2/core.dart" show OpaqueToken;

/**
 * `LocationStrategy` is responsible for representing and reading route state
 * from the the browser's URL. Angular provides two strategies:
 * [HashLocationStrategy] (default) and [PathLocationStrategy].
 *
 * This is used under the hood of the [Location] service.
 *
 * Applications should use the [Router] or [Location] services to
 * interact with application route state.
 *
 * For instance, [HashLocationStrategy] produces URLs like
 * `http://example.com#/foo`, and [PathLocationStrategy] produces
 * `http://example.com/foo` as an equivalent URL.
 *
 * See these two classes for more.
 */
abstract class LocationStrategy {
  String path();
  String prepareExternalUrl(String internal);
  void pushState(dynamic state, String title, String url, String queryParams);
  void forward();
  void back();
  void onPopState(dynamic /* (_: any) => any */ fn);
  String getBaseHref();
}

/**
 * The `APP_BASE_HREF` token represents the base href to be used with the
 * [PathLocationStrategy].
 *
 * If you're using [PathLocationStrategy], you must provide a provider to a string
 * representing the URL prefix that should be preserved when generating and recognizing
 * URLs.
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/angular2';
 * import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [
 *   ROUTER_PROVIDERS,
 *   PathLocationStrategy,
 *   provide(APP_BASE_HREF, {useValue: '/my/app'})
 * ]);
 * ```
 */
const OpaqueToken APP_BASE_HREF = const OpaqueToken("appBaseHref");
String normalizeQueryParams(String params) {
  return (params.length > 0 && params.substring(0, 1) != "?")
      ? ("?" + params)
      : params;
}
