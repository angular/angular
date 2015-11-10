library angular2.src.router.hash_location_strategy;

import "package:angular2/src/core/dom/dom_adapter.dart" show DOM;
import "package:angular2/angular2.dart" show Injectable;
import "location_strategy.dart" show LocationStrategy, normalizeQueryParams;
import "package:angular2/src/facade/browser.dart"
    show EventListener, History, Location;

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
  Location _location;
  History _history;
  HashLocationStrategy() : super() {
    /* super call moved to initializer */;
    this._location = DOM.getLocation();
    this._history = DOM.getHistory();
  }
  void onPopState(EventListener fn) {
    DOM.getGlobalEventTarget("window").addEventListener("popstate", fn, false);
  }

  String getBaseHref() {
    return "";
  }

  String path() {
    // the hash value is always prefixed with a `#`

    // and if it is empty then it will stay empty
    var path = this._location.hash;
    // Dart will complain if a call to substring is

    // executed with a position value that extends the

    // length of string.
    return (path.length > 0 ? path.substring(1) : path) +
        normalizeQueryParams(this._location.search);
  }

  String prepareExternalUrl(String internal) {
    return internal.length > 0 ? ("#" + internal) : internal;
  }

  pushState(dynamic state, String title, String path, String queryParams) {
    var url = path + normalizeQueryParams(queryParams);
    if (url.length == 0) {
      url = this._location.pathname;
    } else {
      url = this.prepareExternalUrl(url);
    }
    this._history.pushState(state, title, url);
  }

  void forward() {
    this._history.forward();
  }

  void back() {
    this._history.back();
  }
}
