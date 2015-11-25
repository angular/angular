library angular2.src.router.hash_location_strategy;

import "package:angular2/core.dart" show Injectable, Inject, Optional;
import "location_strategy.dart"
    show LocationStrategy, joinWithSlash, APP_BASE_HREF, normalizeQueryParams;
import "package:angular2/src/facade/browser.dart" show EventListener;
import "package:angular2/src/facade/lang.dart" show isPresent;
import "platform_location.dart" show PlatformLocation;

/**
 * `HashLocationStrategy` is a [LocationStrategy] used to configure the
 * [Location] service to represent its state in the
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
@Injectable()
class HashLocationStrategy extends LocationStrategy {
  PlatformLocation _platformLocation;
  String _baseHref = "";
  HashLocationStrategy(this._platformLocation,
      [@Optional() @Inject(APP_BASE_HREF) String _baseHref])
      : super() {
    /* super call moved to initializer */;
    if (isPresent(_baseHref)) {
      this._baseHref = _baseHref;
    }
  }
  void onPopState(EventListener fn) {
    this._platformLocation.onPopState(fn);
  }

  String getBaseHref() {
    return this._baseHref;
  }

  String path() {
    // the hash value is always prefixed with a `#`

    // and if it is empty then it will stay empty
    var path = this._platformLocation.hash;
    // Dart will complain if a call to substring is

    // executed with a position value that extends the

    // length of string.
    return (path.length > 0 ? path.substring(1) : path) +
        normalizeQueryParams(this._platformLocation.search);
  }

  String prepareExternalUrl(String internal) {
    var url = joinWithSlash(this._baseHref, internal);
    return url.length > 0 ? ("#" + url) : url;
  }

  pushState(dynamic state, String title, String path, String queryParams) {
    var url = this.prepareExternalUrl(path + normalizeQueryParams(queryParams));
    if (url.length == 0) {
      url = this._platformLocation.pathname;
    }
    this._platformLocation.pushState(state, title, url);
  }

  void forward() {
    this._platformLocation.forward();
  }

  void back() {
    this._platformLocation.back();
  }
}
