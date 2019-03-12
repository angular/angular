/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location, PlatformLocation} from '@angular/common';
import {LocationStrategy} from '@angular/common/src/common';
import {Injectable} from '@angular/core';

import {UrlCodec} from './params';
import {stripPrefix} from './utils';

const PATH_MATCH = /^([^?#]*)(\?([^#]*))?(#(.*))?$/;
const DEFAULT_PORTS: {[key: string]: number} = {
  'http:': 80,
  'https:': 443,
  'ftp:': 21
};

/**
 * A Location service that provides properties and methods to match AngularJS's `$location`
 * service. It is recommended that this LocationUpgradeService be used in place of
 * `$location` in any hybrid Angular/AngularJS applications.
 *
 * @publicApi
 */
@Injectable()
export class LocationUpgradeService {
  private locationChanges:
      {path: string, search: {[k: string]: unknown}, hash: string, state: unknown}|null = null;
  private lastLocationChanges:
      {path: string, search: {[k: string]: unknown}, hash: string, state: unknown, absUrl: string};
  private replaceHistory: boolean = false;

  constructor(
      private location: Location, private platformLocation: PlatformLocation,
      private locationStrategy: LocationStrategy, private urlCodec: UrlCodec) {
    // Get current location changes & set lastLocationChanges defaults
    this.lastLocationChanges = {...this.getLocationChanges(), absUrl: this.absUrl()};
    // TODO(jasonaden): smelly... needing to reset `locationChanges` to `null` after this read.
    // Needs adjustment.
    this.locationChanges = null;
  }

  /**
   * Get the current set of location changes, or parse the current location into it's parts.
   */
  private getLocationChanges() {
    if (!this.locationChanges) {
      const path = this.path();
      const search = this.search();
      const hash = this.hash();
      const state = this.state();

      this.locationChanges = {path, search, hash, state};
    }
    return this.locationChanges;
  }

  /**
   * Used to determine if there are outstanding changes to be saved.
   */
  getLastUrl(): string { return this.lastLocationChanges.absUrl; }

  /**
   * Used to determine if there are outstanding changes to be saved.
   */
  getLastState(): unknown { return this.lastLocationChanges.state; }

  /**
   * Allows subscribing to the `popstate` and `hashchange` events through `Location` service.
   */
  onUrlChange(fn: (oldUrl: string, oldState: unknown, newUrl: string, newState: unknown) => void):
      void {
    this.location.subscribe(evt => {
      // Grab the current URL. This is either the current, pending URL if one exists (this should be
      // rare as it means a URL change was started but left incomplete).
      // TODO(jasonaden): There is a problem with this code because it looks like it will grab from
      // the browser after this event has fired. Need to use lastLocationChanges and parse the URL
      // from there.
      const oldUrl = this.absUrl();
      const oldState = this.state();

      // If there are pending changes, they should be blown away because by the time this event
      // fires, the URL has been updated
      this.locationChanges = null;

      fn(oldUrl, oldState, this.absUrl(), this.state());

      // Reset locationChanges
      // TODO(jasonaden): I don't like mutating this property, and setting to `null` twice here
      // seems odd. Need a better way to manage current URL and clean it up when needed.
      this.locationChanges = null;
    });
  }

  /**
   * Saves the URL currently stored in this.locationChanges.
   */
  updateLocation() {
    if (!this.locationChanges) {
      return;
    }
    const url = this.urlCodec.normalize(
        this.locationChanges.path, this.locationChanges.search, this.locationChanges.hash,
        this.locationStrategy.getBaseHref());
    // Set the URL
    if (this.replaceHistory) {
      this.locationStrategy.replaceState(null, '', url, '');
    } else {
      this.locationStrategy.pushState(null, '', url, '');
    }
    this.replaceHistory = false;
    this.lastLocationChanges = {...this.locationChanges, absUrl: this.absUrl()};
    this.locationChanges = null;
  }

  getServerBase() {
    const port = this.platformLocation.port;
    return `${this.platformLocation.protocol}//${this.platformLocation.hostname}${port ? ':' + port : ''}`;
  }

  stripServerPrefix(url: string) { return stripPrefix(url, this.getServerBase()) }

  stripBaseHref(url: string) { return stripPrefix(url, this.locationStrategy.getBaseHref()); }

  /**
   * Given a string representing a URL, returns the normalized URL path without leading or
   * trailing slashes.
   */
  normalize(url: string): string { return this.location.normalize(url); }

  /**
   * This method is getter only.
   *
   * Return full URL representation with all segments encoded according to rules specified in
   * [RFC 3986](http://www.ietf.org/rfc/rfc3986.txt).
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * var absUrl = $location.absUrl();
   * // => "http://example.com/#/some/path?foo=bar&baz=xoxo"
   * ```
   */
  absUrl(): string {
    let url = `${this.platformLocation.protocol}//${this.platformLocation.hostname}`;
    const port = this.platformLocation.port;
    url += port ? ':' + port : '';

    const locationChanges = this.getLocationChanges();
    url += this.urlCodec.normalize(
        locationChanges.path, locationChanges.search, locationChanges.hash,
        this.locationStrategy.getBaseHref());

    return url;
  }

  /**
   * This method is getter / setter.
   *
   * Return URL (e.g. `/path?a=b#hash`) when called without any parameter.
   *
   * Change path, search and hash, when called with parameter and return `$location`.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * var url = $location.url();
   * // => "/some/path?foo=bar&baz=xoxo"
   * ```
   */
  url(): string;
  url(url: string): this;
  url(url?: string): string|this {
    if (typeof url === 'string') {
      if (!url.length) {
        url = '/';
      }


      // Verify URL doesn't start with double slashes
      const DOUBLE_SLASH_REGEX = /^\s*[\\/]{2,}/;
      if (DOUBLE_SLASH_REGEX.test(url)) {
        throw new Error(`Bad Path - URL cannot start with double slashes: ${url}`);
      }

      // If the first character is '#', only set the hash
      if (url[0] === '#') {
        return this.hash(url.substring(1));
      }
      const match = PATH_MATCH.exec(url);
      if (!match) return this;
      // If the first character is '?', only set the query params & hash
      if (url[0] !== '?') {
        const locationChanges = this.getLocationChanges();
        locationChanges.path = stripPrefix(match[1] || '', this.locationStrategy.getBaseHref());
      }
      this.search(match[3] || '');
      this.hash(match[5] || '');

      // Chainable method
      return this;
    }

    const locationChanges = this.getLocationChanges();
    return this.urlCodec.encodePath(locationChanges.path) +
        this.urlCodec.encodeSearch(locationChanges.search) +
        this.urlCodec.encodeHash(locationChanges.hash);
  }

  /**
   * This method is getter only.
   *
   * Return protocol of current URL.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * var protocol = $location.protocol();
   * // => "http"
   * ```
   */
  protocol(): string {
    const protocol = this.platformLocation.protocol;
    return protocol.substring(0, protocol.length - 1);
  }

  /**
   * This method is getter only.
   *
   * Return host of current URL.
   *
   * Note: compared to the non-AngularJS version `location.host` which returns `hostname:port`, this
   * returns the `hostname` portion only.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * var host = $location.host();
   * // => "example.com"
   *
   * // given URL http://user:password@example.com:8080/#/some/path?foo=bar&baz=xoxo
   * host = $location.host();
   * // => "example.com"
   * host = location.host;
   * // => "example.com:8080"
   * ```
   */
  host(): string { return this.platformLocation.hostname; }

  /**
   * This method is getter only.
   *
   * Return port of current URL.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * var port = $location.port();
   * // => 80
   * ```
   */
  port(): number|null {
    const port = this.platformLocation.port;
    if (port) {
      return parseInt(port);
    }
    return DEFAULT_PORTS[this.platformLocation.protocol] || null;
  }

  /**
   * This method is getter / setter.
   *
   * Return path of current URL when called without any parameter.
   *
   * Change path when called with parameter and return `$location`.
   *
   * Note: Path should always begin with forward slash (/), this method will add the forward slash
   * if it is missing.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * var path = $location.path();
   * // => "/some/path"
   * ```
   */
  path(): string;
  path(path: string|number|null): this;
  path(path?: string|number|null): string|this {
    if (typeof path === 'undefined') {
      if (this.locationChanges) {
        return this.locationChanges.path;
      }
      path = this.urlCodec.decodePath(this.platformLocation.pathname);
      // strip prefix
      return stripPrefix(path, this.locationStrategy.getBaseHref());
    }

    const locationChanges = this.getLocationChanges();

    // null path converts to empty string. Prepend with "/" if needed.
    path = path !== null ? path.toString() : '';
    path = path.charAt(0) === '/' ? path : '/' + path;

    locationChanges.path = stripPrefix(path, this.locationStrategy.getBaseHref());

    return this;
  }

  /**
   * This method is getter / setter.
   *
   * Return search part (as object) of current URL when called without any parameter.
   *
   * Change search part when called with parameter and return `$location`.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * var searchObject = $location.search();
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
   * @param {(string|Number|Array<string>|boolean)=} paramValue If `search` is a string or number, then `paramValue`
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
   * @return {Object} If called with no arguments returns the parsed `search` object. If called with
   * one or more arguments returns `$location` object itself.
   */
  search(): {[key: string]: unknown};
  search(search: string|number|{[key: string]: unknown}): this;
  search(
      search: string|number|{[key: string]: unknown},
      paramValue: null|undefined|string|number|boolean|string[]): this;
  search(
      search?: string|number|{[key: string]: unknown},
      paramValue?: null|undefined|string|number|boolean|string[]): {[key: string]: unknown}|this {
    switch (arguments.length) {
      case 0:
        if (this.locationChanges) {
          return this.locationChanges.search;
        }
        const params = this.platformLocation.search;

        return this.urlCodec.decodeSearch(params[0] === '?' ? params.substring(1) : params);
      case 1:
        const locationChanges = this.getLocationChanges();

        if (typeof search === 'string' || typeof search === 'number') {
          locationChanges.search = this.urlCodec.decodeSearch(search.toString());
        } else if (typeof search === 'object') {
          // Copy the object so it's never mutated
          search = {...search};
          // remove object undefined or null properties
          for (const key in search) {
            if (search[key] == null) delete search[key];
          }

          // Convert to string
          locationChanges.search = search;
        } else {
          throw new Error(
              'LocationUpgradeService.search(): First argument must be a string or an object.');
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
    return this;
  }

  /**
   * This method is getter / setter.
   *
   * Returns the hash fragment when called without any parameters.
   *
   * Changes the hash fragment when called with a parameter and returns `$location`.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo#hashValue
   * var hash = $location.hash();
   * // => "hashValue"
   * ```
   */
  hash(): string;
  hash(hash: string|number|null): this;
  hash(hash?: string|number|null): string|this {
    if (arguments.length === 0) {
      if (this.locationChanges) {
        return this.locationChanges.hash;
      }
      // We have to get the hash through path. This is because path and hash values are different
      // depending on the strategy used. Pulling hash out of the path makes this consistent.
      const path = this.locationStrategy.path(true);
      const hashIdx = path.indexOf('#');
      const hash = hashIdx !== -1 ? path.substring(hashIdx) : '';
      return this.urlCodec.decodeHash(hash);
    }

    const locationChanges = this.getLocationChanges();
    locationChanges.hash = hash != null ? hash.toString() : '';

    return this;
  }

  /**
   * If called, all changes to $location during the current `$digest` will replace the current
   * history
   * record, instead of adding a new one.
   */
  replace(): this {
    this.replaceHistory = true;
    return this;
  }

  /**
   * This method is getter / setter.
   *
   * Return the history state object when called without any parameter.
   *
   * Change the history state object when called with one parameter and return `$location`.
   * The state object is later passed to `pushState` or `replaceState`.
   *
   * NOTE: This method is supported only in HTML5 mode and only in browsers supporting
   * the HTML5 History API (i.e. methods `pushState` and `replaceState`). If you need to support
   * older browsers (like IE9 or Android < 4.0), don't use this method.
   *
   */
  state(): unknown;
  state(state: unknown): this;
  state(state?: unknown): unknown|this {
    if (typeof state === 'undefined') {
      if (this.locationChanges) {
        return this.locationChanges.state;
      }
      return this.platformLocation.getState();
    }

    const locationChanges = this.getLocationChanges();
    locationChanges.state = state;
    return this;
  }
}
