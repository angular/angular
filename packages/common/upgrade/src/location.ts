/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location, PlatformLocation} from '@angular/common';
import {LocationStrategy} from '@angular/common/src/common';
import {Injectable, InjectionToken} from '@angular/core';

import {AngularJSUrlCodec} from './params';

const DEFAULT_PORTS: {[key: string]: number} = {
  'http:': 80,
  'https:': 443,
  'ftp:': 21
};

export type SearchParams = string | number | []
    /**
     * A Location service that provides properties and methods to match AngularJS's `$location`
     * service. It is recommended that this LocationUpgradeService be used in place of
     * `$location` in any hybrid Angular/AngularJS applications.
     */
    @Injectable() export class LocationUpgradeService {
  private paramCodec = new AngularJSUrlCodec();

  constructor(
      private location: Location, private platformLocation: PlatformLocation,
      private locationStrategy: LocationStrategy) {}

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
    const baseHref = this.locationStrategy.getBaseHref();
    url += baseHref;
    let path = this.locationStrategy.path(true);
    if (path[0] !== '/') {
      url += '/';
    }
    // Remove baseHref if it's prefixed. This can happen with HashLocationStrategy
    path = path.indexOf(baseHref) === 0 ? path.slice(baseHref.length) : path;

    // Add slash after hash if it's not there to match AngularJS functionaltiy
    if (path.length > 1 && path[1] === '#' && path[2] !== '/') {
      path = `/#/${path.substring(2)}`;
    }

    return url + path;
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
      var DOUBLE_SLASH_REGEX = /^\s*[\\/]{2,}/;
      if (DOUBLE_SLASH_REGEX.test(url)) {
        throw new Error(`Bad Path - URL cannot start with double slashes: ${url}`);
      }

      // If the first character is '#', only set the hash
      if (url[0] === '#') {
        return this.hash(url.substring(1));
      }
      // If the first character is '?', only set the query params
      if (url[0] === '?') {
        url = this.path() + url;
      }
      // Set the URL
      this.locationStrategy.pushState(null, '', url, '');

      // Chainable method
      return this;
    }

    return this.locationStrategy.path(true);
  }

  $$parse(url: string) {
    // Remove protocol & hostname if URL starts with it
    const port = this.platformLocation.port;
    const serverUrl =
        `${this.platformLocation.protocol}//${this.platformLocation.hostname}${port ? ':' + port : ''}`;
    if (url.startsWith(serverUrl)) {
      url = url.substring(serverUrl.length);
    } else {
      throw new Error(`Invalid url "${url}", missing path prefix "${serverUrl}".`);
    }

    this.url(url);
  }

  $$parseLinkUrl(url: string, relHref?: string): boolean {
    // When relHref is passed, it should be a hash and is handled separately
    if (relHref && relHref[0] === '#') {
      this.hash(relHref.slice(1));
      return true;
    }

    // Remove protocol & hostname if URL starts with it
    const port = this.platformLocation.port;
    const serverUrl =
        `${this.platformLocation.protocol}//${this.platformLocation.hostname}${port ? ':' + port : ''}`;

    // If the link is targeting a different hostname/port than the current app, do nothing
    if (!this.location.normalize(url).startsWith(this.location.normalize(serverUrl))) {
      return false;
    }

    // Strip serverUrl
    url = url.substring(serverUrl.length);

    // Strip prefix if URL starts with it
    url = this.location.normalize(url);
    // Set the URL
    this.url(url);
    return true;
  }

  get $$state() { return this.state(); }

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
      path = this.platformLocation.pathname;
      // strip prefix
      const prefix = this.locationStrategy.getBaseHref();
      path = path.startsWith(prefix) ? path.substring(prefix.length) : path;
      return this.paramCodec.decodePath(path);
    }

    // null path converts to empty string. Prepend with "/" if needed.
    path = path !== null ? path.toString() : '';
    path = path.charAt(0) === '/' ? path : '/' + path;
    path = this.paramCodec.encodePath(path);

    // Only changing path, so append search and hash
    let origPath = this.locationStrategy.path(true);
    const searchIdx = origPath.indexOf('?');
    if (searchIdx > -1) {
      path += origPath.substring(searchIdx);
    }

    this.locationStrategy.pushState(null, '', path, '');
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
        const params = this.platformLocation.search;

        return this.paramCodec.decodeSearch(params[0] === '?' ? params.substring(1) : params);
      case 1:
        let path = this.locationStrategy.path(true);

        // Parse out the hash value
        const hashIdx = path.indexOf('#');
        const hash = hashIdx > -1 ? path.substring(hashIdx) : '';
        path = hashIdx > -1 ? path.substring(0, hashIdx) : path;

        // Get path up to search params
        const searchIdx = path.indexOf('?');
        path = path.substring(0, searchIdx > -1 ? searchIdx : Infinity);
        if (typeof search === 'string' || typeof search === 'number') {
          search = this.paramCodec.encodeSearch(search.toString());

          return this.url(`${path}${search}${hash}`);

        } else if (typeof search === 'object') {
          // Copy the object so it's never mutated
          search = {...search};
          // remove object undefined or null properties
          for (const key in search) {
            if (search[key] == null) delete search[key];
          }

          // Convert to string
          search = this.paramCodec.encodeSearch(search);
          return this.url(`${path}${search}${hash}`);
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
    if (typeof hash === 'undefined') {
      const hash = this.platformLocation.hash;
      return this.paramCodec.decodeValue(hash[0] === '#' ? hash.substring(1) : hash);
    }
    hash = hash !== null ? hash.toString() : '';
    if (hash) {
      hash = '#' + this.paramCodec.encodeHash(hash);
    }

    let path = this.location.path(true);
    // Get path up to the first instance of a hash, since we are replacing the hash
    const hashIdx = path.indexOf('#');
    if (hashIdx !== -1) {
      path = path.substring(0, path.indexOf('#'));
    }
    this.locationStrategy.pushState(null, '', path + hash, '');
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
    if (arguments.length) {
      this.platformLocation.replaceState(state, '', this.platformLocation.href);
      return this;
    } else {
      return this.platformLocation.getState();
    }
  }
}
