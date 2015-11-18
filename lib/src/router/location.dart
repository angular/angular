library angular2.src.router.location;

import "location_strategy.dart" show LocationStrategy;
import "package:angular2/src/facade/async.dart"
    show EventEmitter, ObservableWrapper;
import "package:angular2/angular2.dart" show Injectable, Inject;

/**
 * `Location` is a service that applications can use to interact with a browser's URL.
 * Depending on which [LocationStrategy] is used, `Location` will either persist
 * to the URL's path or the URL's hash segment.
 *
 * Note: it's better to use [Router#navigate] service to trigger route changes. Use
 * `Location` only if you need to interact with or create normalized URLs outside of
 * routing.
 *
 * `Location` is responsible for normalizing the URL against the application's base href.
 * A normalized URL is absolute from the URL host, includes the application's base href, and has no
 * trailing slash:
 * - `/my/app/user/123` is normalized
 * - `my/app/user/123` **is not** normalized
 * - `/my/app/user/123/` **is not** normalized
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/angular2';
 * import {
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
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
@Injectable()
class Location {
  LocationStrategy platformStrategy;
  /** @internal */
  EventEmitter<dynamic> _subject = new EventEmitter();
  /** @internal */
  String _baseHref;
  Location(this.platformStrategy) {
    var browserBaseHref = this.platformStrategy.getBaseHref();
    this._baseHref = stripTrailingSlash(stripIndexHtml(browserBaseHref));
    this.platformStrategy.onPopState((_) {
      ObservableWrapper.callEmit(
          this._subject, {"url": this.path(), "pop": true});
    });
  }
  /**
   * Returns the normalized URL path.
   */
  String path() {
    return this.normalize(this.platformStrategy.path());
  }

  /**
   * Given a string representing a URL, returns the normalized URL path without leading or
   * trailing slashes
   */
  String normalize(String url) {
    return stripTrailingSlash(
        _stripBaseHref(this._baseHref, stripIndexHtml(url)));
  }

  /**
   * Given a string representing a URL, returns the platform-specific external URL path.
   * If the given URL doesn't begin with a leading slash (`'/'`), this method adds one
   * before normalizing. This method will also add a hash if `HashLocationStrategy` is
   * used, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
   */
  String prepareExternalUrl(String url) {
    if (url.length > 0 && !url.startsWith("/")) {
      url = "/" + url;
    }
    return this.platformStrategy.prepareExternalUrl(url);
  }

  /**
   * Changes the browsers URL to the normalized version of the given URL, and pushes a
   * new item onto the platform's history.
   */
  void go(String path, [String query = ""]) {
    this.platformStrategy.pushState(null, "", path, query);
  }

  /**
   * Navigates forward in the platform's history.
   */
  void forward() {
    this.platformStrategy.forward();
  }

  /**
   * Navigates back in the platform's history.
   */
  void back() {
    this.platformStrategy.back();
  }

  /**
   * Subscribe to the platform's `popState` events.
   */
  Object subscribe(dynamic /* (value: any) => void */ onNext,
      [dynamic /* (exception: any) => void */ onThrow = null,
      dynamic /* () => void */ onReturn = null]) {
    return ObservableWrapper.subscribe(
        this._subject, onNext, onThrow, onReturn);
  }
}

String _stripBaseHref(String baseHref, String url) {
  if (baseHref.length > 0 && url.startsWith(baseHref)) {
    return url.substring(baseHref.length);
  }
  return url;
}

String stripIndexHtml(String url) {
  if (new RegExp(r'\/index.html$').hasMatch(url)) {
    // '/index.html'.length == 11
    return url.substring(0, url.length - 11);
  }
  return url;
}

String stripTrailingSlash(String url) {
  if (new RegExp(r'\/$').hasMatch(url)) {
    url = url.substring(0, url.length - 1);
  }
  return url;
}
