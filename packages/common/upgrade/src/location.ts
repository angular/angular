/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformLocation} from '@angular/common';
import {LocationStrategy} from '@angular/common/src/common';
import {Injectable} from '@angular/core';


const DEFAULT_PORTS: {[key: string]: number} = {
  'http:': 80,
  'https:': 443,
  'ftp:': 21
};

/**
 * A Location service that provides properties and methods to match AngularJS's `$location`
 * service. It is recommended that this LocationUpgradeService be used in place of
 * `$location` in any hybrid Angular/AngularJS applications.
 */
@Injectable()
export class LocationUpgradeService {
  constructor(
      private platformLocation: PlatformLocation, private locationStrategy: LocationStrategy) {}

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
  absUrl(): string { return this.platformLocation.href; }

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
  url(url?: string): string|this {
    if (typeof url === 'string') {
      // Set the URL

      // TODO: Implement setter

      // Chainable method
      return this;
    }

    // TODO(jasonaden): This needs to move to location strategy so we get the correct values when
    // dealing with hash-based location strategy.
    return this.platformLocation.pathname + this.platformLocation.search +
        this.platformLocation.hash;
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
    let port = this.platformLocation.port;
    if (port) {
      port = port.substring(0, port.length - 1);
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
  path(path?: string): string|this {
    if (typeof path === 'undefined') {
      return this.platformLocation.pathname;
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
  search(
      search?: string|number|{[key: string]: string | number | string[]},
      paramValue?: string|number|boolean|string[]): {[key: string]: unknown}|this {
    switch (arguments.length) {
      case 0:
        // TODO(jasonaden): Parse search params & return
        return {};
      case 1:
        if (typeof search === 'string' || typeof search === 'number') {
          search = search.toString();
          // TODO(jasonaden): Parse the search string into key/value pairs

        } else if (typeof search === 'object') {
          search = {...search};
          // remove object undefined or null properties
          for (const key in search) {
            if (search[key] == null) delete search[key];
          }
        } else {
          throw new Error(
              'LocationUpgradeService.search(): First argument must be a string or an object.');
        }
        break;
      default:
        if (typeof paramValue === 'undefined' || paramValue === null) {
          // TODO(jasonaden): Get the current search value and remove `search` from it
        } else {
          // TODO(jasonaden): Get the current search value and set {[search]: paramValue} into it
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
  hash(hash?: string|number): string|this {
    if (typeof hash === 'undefined') {
      return this.platformLocation.hash;
    }
    hash = hash !== null ? hash.toString() : '';
    // TODO(jasonaden): Move the read of URL parts to LocationStrategy so we get correct values with
    // hash-based location strat
    this.locationStrategy.pushState(
        null, '', this.platformLocation.pathname + this.platformLocation.search + '#' + hash, '');
    return this;
  }
}
