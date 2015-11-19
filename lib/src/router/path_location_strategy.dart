library angular2.src.router.path_location_strategy;

import "package:angular2/src/core/dom/dom_adapter.dart" show DOM;
import "package:angular2/angular2.dart" show Injectable, Inject;
import "package:angular2/src/facade/browser.dart"
    show EventListener, History, Location;
import "package:angular2/src/facade/lang.dart" show isBlank;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "location_strategy.dart"
    show LocationStrategy, APP_BASE_HREF, normalizeQueryParams;

/**
 * `PathLocationStrategy` is a [LocationStrategy] used to configure the
 * [Location] service to represent its state in the
 * [path](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax) of the
 * browser's URL.
 *
 * `PathLocationStrategy` is the default binding for [LocationStrategy]
 * provided in [ROUTER_PROVIDERS].
 *
 * If you're using `PathLocationStrategy`, you must provide a provider for
 * [APP_BASE_HREF] to a string representing the URL prefix that should
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
@Injectable()
class PathLocationStrategy extends LocationStrategy {
  Location _location;
  History _history;
  String _baseHref;
  PathLocationStrategy([@Inject(APP_BASE_HREF) String href]) : super() {
    /* super call moved to initializer */;
    if (isBlank(href)) {
      href = DOM.getBaseHref();
    }
    if (isBlank(href)) {
      throw new BaseException(
          '''No base href set. Please provide a value for the APP_BASE_HREF token or add a base element to the document.''');
    }
    this._location = DOM.getLocation();
    this._history = DOM.getHistory();
    this._baseHref = href;
  }
  void onPopState(EventListener fn) {
    DOM.getGlobalEventTarget("window").addEventListener("popstate", fn, false);
    DOM
        .getGlobalEventTarget("window")
        .addEventListener("hashchange", fn, false);
  }

  String getBaseHref() {
    return this._baseHref;
  }

  String prepareExternalUrl(String internal) {
    if (internal.startsWith("/") && this._baseHref.endsWith("/")) {
      return this._baseHref + internal.substring(1);
    }
    return this._baseHref + internal;
  }

  String path() {
    return this._location.pathname +
        normalizeQueryParams(this._location.search);
  }

  pushState(dynamic state, String title, String url, String queryParams) {
    var externalUrl =
        this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
    this._history.pushState(state, title, externalUrl);
  }

  void forward() {
    this._history.forward();
  }

  void back() {
    this._history.back();
  }
}
