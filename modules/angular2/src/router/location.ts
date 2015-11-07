import {LocationStrategy} from './location_strategy';
import {StringWrapper, isPresent, CONST_EXPR} from 'angular2/src/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {isBlank} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {OpaqueToken, Injectable, Optional, Inject} from 'angular2/angular2';

/**
 * The `APP_BASE_HREF` token represents the base href to be used with the
 * {@link PathLocationStrategy}.
 *
 * If you're using {@link PathLocationStrategy}, you must provide a provider to a string
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
export const APP_BASE_HREF: OpaqueToken = CONST_EXPR(new OpaqueToken('appBaseHref'));

/**
 * `Location` is a service that applications can use to interact with a browser's URL.
 * Depending on which {@link LocationStrategy} is used, `Location` will either persist
 * to the URL's path or the URL's hash segment.
 *
 * Note: it's better to use {@link Router#navigate} service to trigger route changes. Use
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
export class Location {
  /** @internal */
  _subject: EventEmitter<any> = new EventEmitter();
  /** @internal */
  _baseHref: string;

  constructor(public platformStrategy: LocationStrategy,
              @Optional() @Inject(APP_BASE_HREF) href?: string) {
    var browserBaseHref = isPresent(href) ? href : this.platformStrategy.getBaseHref();

    if (isBlank(browserBaseHref)) {
      throw new BaseException(
          `No base href set. Either provide a provider for the APP_BASE_HREF token or add a base element to the document.`);
    }

    this._baseHref = stripTrailingSlash(stripIndexHtml(browserBaseHref));
    this.platformStrategy.onPopState(
        (_) => { ObservableWrapper.callNext(this._subject, {'url': this.path(), 'pop': true}); });
  }

  /**
   * Returns the normalized URL path.
   */
  path(): string { return this.normalize(this.platformStrategy.path()); }

  /**
   * Given a string representing a URL, returns the normalized URL path without leading or
   * trailing slashes
   */
  normalize(url: string): string {
    return stripTrailingSlash(_stripBaseHref(this._baseHref, stripIndexHtml(url)));
  }

  /**
   * Given a string representing a URL, returns the platform-specific external URL path.
   * If the given URL doesn't begin with a leading slash (`'/'`), this method adds one
   * before normalizing. This method will also add a hash if `HashLocationStrategy` is
   * used, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
   */
  prepareExternalUrl(url: string): string {
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    return this.platformStrategy.prepareExternalUrl(
        stripTrailingSlash(_addBaseHref(this._baseHref, url)));
  }

  /**
   * Changes the browsers URL to the normalized version of the given URL, and pushes a
   * new item onto the platform's history.
   */
  go(path: string, query: string = ''): void {
    this.platformStrategy.pushState(null, '', path, query);
  }

  /**
   * Navigates forward in the platform's history.
   */
  forward(): void { this.platformStrategy.forward(); }

  /**
   * Navigates back in the platform's history.
   */
  back(): void { this.platformStrategy.back(); }

  /**
   * Subscribe to the platform's `popState` events.
   */
  subscribe(onNext: (value: any) => void, onThrow: (exception: any) => void = null,
            onReturn: () => void = null): Object {
    return ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
  }
}

function _stripBaseHref(baseHref: string, url: string): string {
  if (baseHref.length > 0 && url.startsWith(baseHref)) {
    return url.substring(baseHref.length);
  }
  return url;
}

function _addBaseHref(baseHref: string, url: string): string {
  if (!url.startsWith(baseHref)) {
    return baseHref + url;
  }
  return url;
}

function stripIndexHtml(url: string): string {
  if (/\/index.html$/g.test(url)) {
    // '/index.html'.length == 11
    return url.substring(0, url.length - 11);
  }
  return url;
}

function stripTrailingSlash(url: string): string {
  if (/\/$/g.test(url)) {
    url = url.substring(0, url.length - 1);
  }
  return url;
}
