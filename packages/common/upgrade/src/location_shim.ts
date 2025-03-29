/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location, LocationStrategy, PlatformLocation} from '../../index';
import {ɵisPromise as isPromise} from '@angular/core';
import {UpgradeModule} from '@angular/upgrade/static';
import {ReplaySubject} from 'rxjs';

import {UrlCodec} from './params';
import {deepEqual, isAnchor} from './utils';

const PATH_MATCH = /^([^?#]*)(\?([^#]*))?(#(.*))?$/;
const DOUBLE_SLASH_REGEX = /^\s*[\\/]{2,}/;
const IGNORE_URI_REGEXP = /^\s*(javascript|mailto):/i;
const DEFAULT_PORTS: {[key: string]: number} = {
  'http:': 80,
  'https:': 443,
  'ftp:': 21,
};

/**
 * Location service that provides a drop-in replacement for the $location service
 * provided in AngularJS.
 *
 * @see [Using the Angular Unified Location Service](guide/upgrade#using-the-unified-angular-location-service)
 *
 * @publicApi
 */
export class $locationShim {
  private initializing = true;
  private updateBrowser = false;
  private $$absUrl: string = '';
  private $$url: string = '';
  private $$protocol: string;
  private $$host: string = '';
  private $$port: number | null;
  private $$replace: boolean = false;
  private $$path: string = '';
  private $$search: any = '';
  private $$hash: string = '';
  private $$state: unknown;
  private $$changeListeners: [
    (
      url: string,
      state: unknown,
      oldUrl: string,
      oldState: unknown,
      err?: (e: Error) => void,
    ) => void,
    (e: Error) => void,
  ][] = [];

  private cachedState: unknown = null;

  private urlChanges = new ReplaySubject<{newUrl: string; newState: unknown}>(1);

  private readonly removeOnUrlChangeFn: VoidFunction;

  constructor(
    $injector: any,
    private location: Location,
    private platformLocation: PlatformLocation,
    private urlCodec: UrlCodec,
    private locationStrategy: LocationStrategy,
  ) {
    const initialUrl = this.browserUrl();

    let parsedUrl = this.urlCodec.parse(initialUrl);

    if (typeof parsedUrl === 'string') {
      throw 'Invalid URL';
    }

    this.$$protocol = parsedUrl.protocol;
    this.$$host = parsedUrl.hostname;
    this.$$port = parseInt(parsedUrl.port) || DEFAULT_PORTS[parsedUrl.protocol] || null;

    this.$$parseLinkUrl(initialUrl, initialUrl);
    this.cacheState();
    this.$$state = this.browserState();

    this.removeOnUrlChangeFn = this.location.onUrlChange((newUrl, newState) => {
      this.urlChanges.next({newUrl, newState});
    });

    if (isPromise($injector)) {
      $injector.then(($i) => this.initialize($i));
    } else {
      this.initialize($injector);
    }
  }

  private initialize($injector: any) {
    const $rootScope = $injector.get('$rootScope');
    const $rootElement = $injector.get('$rootElement');

    $rootElement.on('click', (event: any) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.which === 2 ||
        event.button === 2
      ) {
        return;
      }

      let elm: (Node & ParentNode) | null = event.target;

      // traverse the DOM up to find first A tag
      while (elm && elm.nodeName.toLowerCase() !== 'a') {
        // ignore rewriting if no A tag (reached root element, or no parent - removed from document)
        if (elm === $rootElement[0] || !(elm = elm.parentNode)) {
          return;
        }
      }

      if (!isAnchor(elm)) {
        return;
      }

      const absHref = elm.href;
      const relHref = elm.getAttribute('href');

      // Ignore when url is started with javascript: or mailto:
      if (IGNORE_URI_REGEXP.test(absHref)) {
        return;
      }

      if (absHref && !elm.getAttribute('target') && !event.isDefaultPrevented()) {
        if (this.$$parseLinkUrl(absHref, relHref)) {
          // We do a preventDefault for all urls that are part of the AngularJS application,
          // in html5mode and also without, so that we are able to abort navigation without
          // getting double entries in the location history.
          event.preventDefault();
          // update location manually
          if (this.absUrl() !== this.browserUrl()) {
            $rootScope.$apply();
          }
        }
      }
    });

    this.urlChanges.subscribe(({newUrl, newState}) => {
      const oldUrl = this.absUrl();
      const oldState = this.$$state;
      this.$$parse(newUrl);
      newUrl = this.absUrl();
      this.$$state = newState;
      const defaultPrevented = $rootScope.$broadcast(
        '$locationChangeStart',
        newUrl,
        oldUrl,
        newState,
        oldState,
      ).defaultPrevented;

      // if the location was changed by a `$locationChangeStart` handler then stop
      // processing this location change
      if (this.absUrl() !== newUrl) return;

      // If default was prevented, set back to old state. This is the state that was locally
      // cached in the $location service.
      if (defaultPrevented) {
        this.$$parse(oldUrl);
        this.state(oldState);
        this.setBrowserUrlWithFallback(oldUrl, false, oldState);
        this.$$notifyChangeListeners(this.url(), this.$$state, oldUrl, oldState);
      } else {
        this.initializing = false;
        $rootScope.$broadcast('$locationChangeSuccess', newUrl, oldUrl, newState, oldState);
        this.resetBrowserUpdate();
      }
      if (!$rootScope.$$phase) {
        $rootScope.$digest();
      }
    });

    // Synchronize the browser's URL and state with the application.
    // Note: There is no need to save the `$watch` return value (deregister listener)
    // into a variable because `$scope.$$watchers` is automatically cleaned up when
    // the root scope is destroyed.
    $rootScope.$watch(() => {
      if (this.initializing || this.updateBrowser) {
        this.updateBrowser = false;

        const oldUrl = this.browserUrl();
        const newUrl = this.absUrl();
        const oldState = this.browserState();
        let currentReplace = this.$$replace;

        const urlOrStateChanged =
          !this.urlCodec.areEqual(oldUrl, newUrl) || oldState !== this.$$state;

        // Fire location changes one time to on initialization. This must be done on the
        // next tick (thus inside $evalAsync()) in order for listeners to be registered
        // before the event fires. Mimicing behavior from $locationWatch:
        // https://github.com/angular/angular.js/blob/master/src/ng/location.js#L983
        if (this.initializing || urlOrStateChanged) {
          this.initializing = false;

          $rootScope.$evalAsync(() => {
            // Get the new URL again since it could have changed due to async update
            const newUrl = this.absUrl();
            const defaultPrevented = $rootScope.$broadcast(
              '$locationChangeStart',
              newUrl,
              oldUrl,
              this.$$state,
              oldState,
            ).defaultPrevented;

            // if the location was changed by a `$locationChangeStart` handler then stop
            // processing this location change
            if (this.absUrl() !== newUrl) return;

            if (defaultPrevented) {
              this.$$parse(oldUrl);
              this.$$state = oldState;
            } else {
              // This block doesn't run when initializing because it's going to perform the update
              // to the URL which shouldn't be needed when initializing.
              if (urlOrStateChanged) {
                this.setBrowserUrlWithFallback(
                  newUrl,
                  currentReplace,
                  oldState === this.$$state ? null : this.$$state,
                );
                this.$$replace = false;
              }
              $rootScope.$broadcast(
                '$locationChangeSuccess',
                newUrl,
                oldUrl,
                this.$$state,
                oldState,
              );
              if (urlOrStateChanged) {
                this.$$notifyChangeListeners(this.url(), this.$$state, oldUrl, oldState);
              }
            }
          });
        }
      }
      this.$$replace = false;
    });

    $rootScope.$on('$destroy', () => {
      this.removeOnUrlChangeFn();
      // Complete the subject to release all active observers when the root
      // scope is destroyed. Before this change, we subscribed to the `urlChanges`
      // subject, and the subscriber captured `this`, leading to a memory leak
      // after the root scope was destroyed.
      this.urlChanges.complete();
    });
  }

  private resetBrowserUpdate() {
    this.$$replace = false;
    this.$$state = this.browserState();
    this.updateBrowser = false;
    this.lastBrowserUrl = this.browserUrl();
  }

  private lastHistoryState: unknown;
  private lastBrowserUrl: string = '';
  private browserUrl(): string;
  private browserUrl(url: string, replace?: boolean, state?: unknown): this;
  private browserUrl(url?: string, replace?: boolean, state?: unknown) {
    // In modern browsers `history.state` is `null` by default; treating it separately
    // from `undefined` would cause `$browser.url('/foo')` to change `history.state`
    // to undefined via `pushState`. Instead, let's change `undefined` to `null` here.
    if (typeof state === 'undefined') {
      state = null;
    }

    // setter
    if (url) {
      let sameState = this.lastHistoryState === state;

      // Normalize the inputted URL
      url = this.urlCodec.parse(url).href;

      // Don't change anything if previous and current URLs and states match.
      if (this.lastBrowserUrl === url && sameState) {
        return this;
      }
      this.lastBrowserUrl = url;
      this.lastHistoryState = state;

      // Remove server base from URL as the Angular APIs for updating URL require
      // it to be the path+.
      url = this.stripBaseUrl(this.getServerBase(), url) || url;

      // Set the URL
      if (replace) {
        this.locationStrategy.replaceState(state, '', url, '');
      } else {
        this.locationStrategy.pushState(state, '', url, '');
      }

      this.cacheState();

      return this;
      // getter
    } else {
      return this.platformLocation.href;
    }
  }

  // This variable should be used *only* inside the cacheState function.
  private lastCachedState: unknown = null;
  private cacheState() {
    // This should be the only place in $browser where `history.state` is read.
    this.cachedState = this.platformLocation.getState();
    if (typeof this.cachedState === 'undefined') {
      this.cachedState = null;
    }

    // Prevent callbacks fo fire twice if both hashchange & popstate were fired.
    if (deepEqual(this.cachedState, this.lastCachedState)) {
      this.cachedState = this.lastCachedState;
    }

    this.lastCachedState = this.cachedState;
    this.lastHistoryState = this.cachedState;
  }

  /**
   * This function emulates the $browser.state() function from AngularJS. It will cause
   * history.state to be cached unless changed with deep equality check.
   */
  private browserState(): unknown {
    return this.cachedState;
  }

  private stripBaseUrl(base: string, url: string) {
    if (url.startsWith(base)) {
      return url.slice(base.length);
    }
    return undefined;
  }

  private getServerBase() {
    const {protocol, hostname, port} = this.platformLocation;
    const baseHref = this.locationStrategy.getBaseHref();
    let url = `${protocol}//${hostname}${port ? ':' + port : ''}${baseHref || '/'}`;
    return url.endsWith('/') ? url : url + '/';
  }

  private parseAppUrl(url: string) {
    if (DOUBLE_SLASH_REGEX.test(url)) {
      throw new Error(`Bad Path - URL cannot start with double slashes: ${url}`);
    }

    let prefixed = url.charAt(0) !== '/';
    if (prefixed) {
      url = '/' + url;
    }
    let match = this.urlCodec.parse(url, this.getServerBase());
    if (typeof match === 'string') {
      throw new Error(`Bad URL - Cannot parse URL: ${url}`);
    }
    let path =
      prefixed && match.pathname.charAt(0) === '/' ? match.pathname.substring(1) : match.pathname;
    this.$$path = this.urlCodec.decodePath(path);
    this.$$search = this.urlCodec.decodeSearch(match.search);
    this.$$hash = this.urlCodec.decodeHash(match.hash);

    // make sure path starts with '/';
    if (this.$$path && this.$$path.charAt(0) !== '/') {
      this.$$path = '/' + this.$$path;
    }
  }

  /**
   * Registers listeners for URL changes. This API is used to catch updates performed by the
   * AngularJS framework. These changes are a subset of the `$locationChangeStart` and
   * `$locationChangeSuccess` events which fire when AngularJS updates its internally-referenced
   * version of the browser URL.
   *
   * It's possible for `$locationChange` events to happen, but for the browser URL
   * (window.location) to remain unchanged. This `onChange` callback will fire only when AngularJS
   * actually updates the browser URL (window.location).
   *
   * @param fn The callback function that is triggered for the listener when the URL changes.
   * @param err The callback function that is triggered when an error occurs.
   */
  onChange(
    fn: (url: string, state: unknown, oldUrl: string, oldState: unknown) => void,
    err: (e: Error) => void = (e: Error) => {},
  ) {
    this.$$changeListeners.push([fn, err]);
  }

  /** @internal */
  $$notifyChangeListeners(
    url: string = '',
    state: unknown,
    oldUrl: string = '',
    oldState: unknown,
  ) {
    this.$$changeListeners.forEach(([fn, err]) => {
      try {
        fn(url, state, oldUrl, oldState);
      } catch (e) {
        err(e as Error);
      }
    });
  }

  /**
   * Parses the provided URL, and sets the current URL to the parsed result.
   *
   * @param url The URL string.
   */
  $$parse(url: string) {
    let pathUrl: string | undefined;
    if (url.startsWith('/')) {
      pathUrl = url;
    } else {
      // Remove protocol & hostname if URL starts with it
      pathUrl = this.stripBaseUrl(this.getServerBase(), url);
    }
    if (typeof pathUrl === 'undefined') {
      throw new Error(`Invalid url "${url}", missing path prefix "${this.getServerBase()}".`);
    }

    this.parseAppUrl(pathUrl);

    this.$$path ||= '/';
    this.composeUrls();
  }

  /**
   * Parses the provided URL and its relative URL.
   *
   * @param url The full URL string.
   * @param relHref A URL string relative to the full URL string.
   */
  $$parseLinkUrl(url: string, relHref?: string | null): boolean {
    // When relHref is passed, it should be a hash and is handled separately
    if (relHref && relHref[0] === '#') {
      this.hash(relHref.slice(1));
      return true;
    }
    let rewrittenUrl;
    let appUrl = this.stripBaseUrl(this.getServerBase(), url);
    if (typeof appUrl !== 'undefined') {
      rewrittenUrl = this.getServerBase() + appUrl;
    } else if (this.getServerBase() === url + '/') {
      rewrittenUrl = this.getServerBase();
    }
    // Set the URL
    if (rewrittenUrl) {
      this.$$parse(rewrittenUrl);
    }
    return !!rewrittenUrl;
  }

  private setBrowserUrlWithFallback(url: string, replace: boolean, state: unknown) {
    const oldUrl = this.url();
    const oldState = this.$$state;
    try {
      this.browserUrl(url, replace, state);

      // Make sure $location.state() returns referentially identical (not just deeply equal)
      // state object; this makes possible quick checking if the state changed in the digest
      // loop. Checking deep equality would be too expensive.
      this.$$state = this.browserState();
    } catch (e) {
      // Restore old values if pushState fails
      this.url(oldUrl);
      this.$$state = oldState;

      throw e;
    }
  }

  private composeUrls() {
    this.$$url = this.urlCodec.normalize(this.$$path, this.$$search, this.$$hash);
    this.$$absUrl = this.getServerBase() + this.$$url.slice(1); // remove '/' from front of URL
    this.updateBrowser = true;
  }

  /**
   * Retrieves the full URL representation with all segments encoded according to
   * rules specified in
   * [RFC 3986](https://tools.ietf.org/html/rfc3986).
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * let absUrl = $location.absUrl();
   * // => "http://example.com/#/some/path?foo=bar&baz=xoxo"
   * ```
   */
  absUrl(): string {
    return this.$$absUrl;
  }

  /**
   * Retrieves the current URL, or sets a new URL. When setting a URL,
   * changes the path, search, and hash, and returns a reference to its own instance.
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * let url = $location.url();
   * // => "/some/path?foo=bar&baz=xoxo"
   * ```
   */
  url(): string;
  url(url: string): this;
  url(url?: string): string | this {
    if (typeof url === 'string') {
      if (!url.length) {
        url = '/';
      }

      const match = PATH_MATCH.exec(url);
      if (!match) return this;
      if (match[1] || url === '') this.path(this.urlCodec.decodePath(match[1]));
      if (match[2] || match[1] || url === '') this.search(match[3] || '');
      this.hash(match[5] || '');

      // Chainable method
      return this;
    }

    return this.$$url;
  }

  /**
   * Retrieves the protocol of the current URL.
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * let protocol = $location.protocol();
   * // => "http"
   * ```
   */
  protocol(): string {
    return this.$$protocol;
  }

  /**
   * Retrieves the protocol of the current URL.
   *
   * In contrast to the non-AngularJS version `location.host` which returns `hostname:port`, this
   * returns the `hostname` portion only.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * let host = $location.host();
   * // => "example.com"
   *
   * // given URL http://user:password@example.com:8080/#/some/path?foo=bar&baz=xoxo
   * host = $location.host();
   * // => "example.com"
   * host = location.host;
   * // => "example.com:8080"
   * ```
   */
  host(): string {
    return this.$$host;
  }

  /**
   * Retrieves the port of the current URL.
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * let port = $location.port();
   * // => 80
   * ```
   */
  port(): number | null {
    return this.$$port;
  }

  /**
   * Retrieves the path of the current URL, or changes the path and returns a reference to its own
   * instance.
   *
   * Paths should always begin with forward slash (/). This method adds the forward slash
   * if it is missing.
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * let path = $location.path();
   * // => "/some/path"
   * ```
   */
  path(): string;
  path(path: string | number | null): this;
  path(path?: string | number | null): string | this {
    if (typeof path === 'undefined') {
      return this.$$path;
    }

    // null path converts to empty string. Prepend with "/" if needed.
    path = path !== null ? path.toString() : '';
    path = path.charAt(0) === '/' ? path : '/' + path;

    this.$$path = path;

    this.composeUrls();
    return this;
  }

  /**
   * Retrieves a map of the search parameters of the current URL, or changes a search
   * part and returns a reference to its own instance.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * let searchObject = $location.search();
   * // => {foo: 'bar', baz: 'xoxo'}
   *
   * // set foo to 'yipee'
   * $location.search('foo', 'yipee');
   * // $location.search() => {foo: 'yipee', baz: 'xoxo'}
   * ```
   *
   * @param {string|Object.<string>|Object.<Array.<string>>} search New search params - string or
   * hash object.
   *
   * When called with a single argument the method acts as a setter, setting the `search` component
   * of `$location` to the specified value.
   *
   * If the argument is a hash object containing an array of values, these values will be encoded
   * as duplicate search parameters in the URL.
   *
   * @param {(string|Number|Array<string>|boolean)=} paramValue If `search` is a string or number,
   *     then `paramValue`
   * will override only a single search property.
   *
   * If `paramValue` is an array, it will override the property of the `search` component of
   * `$location` specified via the first argument.
   *
   * If `paramValue` is `null`, the property specified via the first argument will be deleted.
   *
   * If `paramValue` is `true`, the property specified via the first argument will be added with no
   * value nor trailing equal sign.
   *
   * @return {Object} The parsed `search` object of the current URL, or the changed `search` object.
   */
  search(): {[key: string]: unknown};
  search(search: string | number | {[key: string]: unknown}): this;
  search(
    search: string | number | {[key: string]: unknown},
    paramValue: null | undefined | string | number | boolean | string[],
  ): this;
  search(
    search?: string | number | {[key: string]: unknown},
    paramValue?: null | undefined | string | number | boolean | string[],
  ): {[key: string]: unknown} | this {
    switch (arguments.length) {
      case 0:
        return this.$$search;
      case 1:
        if (typeof search === 'string' || typeof search === 'number') {
          this.$$search = this.urlCodec.decodeSearch(search.toString());
        } else if (typeof search === 'object' && search !== null) {
          // Copy the object so it's never mutated
          search = {...search};
          // remove object undefined or null properties
          for (const key in search) {
            if (search[key] == null) delete search[key];
          }

          this.$$search = search;
        } else {
          throw new Error(
            'LocationProvider.search(): First argument must be a string or an object.',
          );
        }
        break;
      default:
        if (typeof search === 'string') {
          const currentSearch = this.search();
          if (typeof paramValue === 'undefined' || paramValue === null) {
            delete currentSearch[search];
            return this.search(currentSearch);
          } else {
            currentSearch[search] = paramValue;
            return this.search(currentSearch);
          }
        }
    }
    this.composeUrls();
    return this;
  }

  /**
   * Retrieves the current hash fragment, or changes the hash fragment and returns a reference to
   * its own instance.
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo#hashValue
   * let hash = $location.hash();
   * // => "hashValue"
   * ```
   */
  hash(): string;
  hash(hash: string | number | null): this;
  hash(hash?: string | number | null): string | this {
    if (typeof hash === 'undefined') {
      return this.$$hash;
    }

    this.$$hash = hash !== null ? hash.toString() : '';

    this.composeUrls();
    return this;
  }

  /**
   * Changes to `$location` during the current `$digest` will replace the current
   * history record, instead of adding a new one.
   */
  replace(): this {
    this.$$replace = true;
    return this;
  }

  /**
   * Retrieves the history state object when called without any parameter.
   *
   * Change the history state object when called with one parameter and return `$location`.
   * The state object is later passed to `pushState` or `replaceState`.
   *
   * This method is supported only in HTML5 mode and only in browsers supporting
   * the HTML5 History API methods such as `pushState` and `replaceState`. If you need to support
   * older browsers (like Android < 4.0), don't use this method.
   *
   */
  state(): unknown;
  state(state: unknown): this;
  state(state?: unknown): unknown | this {
    if (typeof state === 'undefined') {
      return this.$$state;
    }

    this.$$state = state;
    return this;
  }
}

/**
 * The factory function used to create an instance of the `$locationShim` in Angular,
 * and provides an API-compatible `$locationProvider` for AngularJS.
 *
 * @publicApi
 */
export class $locationShimProvider {
  constructor(
    private ngUpgrade: UpgradeModule,
    private location: Location,
    private platformLocation: PlatformLocation,
    private urlCodec: UrlCodec,
    private locationStrategy: LocationStrategy,
  ) {}

  /**
   * Factory method that returns an instance of the $locationShim
   */
  $get() {
    return new $locationShim(
      this.ngUpgrade.$injector,
      this.location,
      this.platformLocation,
      this.urlCodec,
      this.locationStrategy,
    );
  }

  /**
   * Stub method used to keep API compatible with AngularJS. This setting is configured through
   * the LocationUpgradeModule's `config` method in your Angular app.
   */
  hashPrefix(prefix?: string) {
    throw new Error('Configure LocationUpgrade through LocationUpgradeModule.config method.');
  }

  /**
   * Stub method used to keep API compatible with AngularJS. This setting is configured through
   * the LocationUpgradeModule's `config` method in your Angular app.
   */
  html5Mode(mode?: any) {
    throw new Error('Configure LocationUpgrade through LocationUpgradeModule.config method.');
  }
}
