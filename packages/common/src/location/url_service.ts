/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, ɵɵinject} from '@angular/core';

import {LocationStrategy} from './location_strategy';
import {joinWithSlash, normalizeQueryParams, stripTrailingSlash} from './util';

/**
 * @description
 *
 * A service that applications can use to interact with a browser's URL.
 *
 * This service depends on `Location` to normalize and update the URL.
 * @usageNotes
 *
 * It's better to use the `Router.navigate()` service to trigger route changes. Use
 * `UrlService` only if you need to interact with or create normalized URLs outside of
 * routing.
 *
 * `UrlService` is responsible for normalizing the URL against the application's base href.
 * A normalized URL is absolute from the URL host, includes the application's base href, and has no
 * trailing slash:
 * - `/my/app/user/123` is normalized
 * - `my/app/user/123` **is not** normalized
 * - `/my/app/user/123/` **is not** normalized
 *
 * ### Example
 *
 * <code-example path='common/location/ts/path_location_component.ts'
 * region='LocationComponent'></code-example>
 */
@Injectable({
  providedIn: 'root',
})
export class UrlService {
  /** @internal */
  _basePath: string;
  /** @internal */
  _locationStrategy: LocationStrategy;

  constructor(locationStrategy: LocationStrategy) {
    this._locationStrategy = locationStrategy;

    const baseHref = this._locationStrategy.getBaseHref();
    // Note: This class's interaction with base HREF does not fully follow the rules
    // outlined in the spec https://www.freesoft.org/CIE/RFC/1808/18.htm.
    // Instead of trying to fix individual bugs with more and more code, we should
    // investigate using the URL constructor and providing the base as a second
    // argument.
    // https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#parameters
    this._basePath = _stripOrigin(stripTrailingSlash(_stripIndexHtml(baseHref)));
  }

  /**
   * Normalizes the URL path for this location.
   *
   * @param includeHash True to include an anchor fragment in the path.
   *
   * @returns The normalized URL path.
   */
  // TODO: vsavkin. Remove the boolean flag and always include hash once the deprecated router is
  // removed.
  path(includeHash: boolean = false): string {
    return this.normalize(this._locationStrategy.path(includeHash));
  }

  /**
   * Normalizes the given path and compares to the current normalized path.
   *
   * @param path The given URL path.
   * @param query Query parameters.
   *
   * @returns True if the given URL path is equal to the current normalized path, false
   * otherwise.
   */
  isCurrentPathEqualTo(path: string, query: string = ''): boolean {
    return this.path() == this.normalize(path + normalizeQueryParams(query));
  }

  /**
   * Normalizes a URL path by stripping any trailing slashes.
   *
   * @param url String representing a URL.
   *
   * @returns The normalized URL string.
   */
  normalize(url: string): string {
    return stripTrailingSlash(_stripBasePath(this._basePath, _stripIndexHtml(url)));
  }

  /**
   * Normalizes an external URL path.
   * If the given URL doesn't begin with a leading slash (`'/'`), adds one
   * before normalizing. Adds a hash if `HashLocationStrategy` is
   * in use, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
   *
   * @param url String representing a URL.
   *
   * @returns  A normalized platform-specific URL.
   */
  prepareExternalUrl(url: string): string {
    if (url && url[0] !== '/') {
      url = '/' + url;
    }
    return this._locationStrategy.prepareExternalUrl(url);
  }

  /**
   * Normalizes URL parameters by prepending with `?` if needed.
   *
   * @param  params String of URL parameters.
   *
   * @returns The normalized URL parameters string.
   */
  public static normalizeQueryParams: (params: string) => string = normalizeQueryParams;

  /**
   * Joins two parts of a URL with a slash if needed.
   *
   * @param start  URL string
   * @param end    URL string
   *
   *
   * @returns The joined URL string.
   */
  public static joinWithSlash: (start: string, end: string) => string = joinWithSlash;

  /**
   * Removes a trailing slash from a URL string if needed.
   * Looks for the first occurrence of either `#`, `?`, or the end of the
   * line as `/` characters and removes the trailing slash if one exists.
   *
   * @param url URL string.
   *
   * @returns The URL string, modified if needed.
   */
  public static stripTrailingSlash: (url: string) => string = stripTrailingSlash;
}

function _stripBasePath(basePath: string, url: string): string {
  return basePath && url.startsWith(basePath) ? url.substring(basePath.length) : url;
}

function _stripIndexHtml(url: string): string {
  return url.replace(/\/index.html$/, '');
}

function _stripOrigin(baseHref: string): string {
  // DO NOT REFACTOR! Previously, this check looked like this:
  // `/^(https?:)?\/\//.test(baseHref)`, but that resulted in
  // syntactically incorrect code after Closure Compiler minification.
  // This was likely caused by a bug in Closure Compiler, but
  // for now, the check is rewritten to use `new RegExp` instead.
  const isAbsoluteUrl = (new RegExp('^(https?:)?//')).test(baseHref);
  if (isAbsoluteUrl) {
    const [, pathname] = baseHref.split(/\/\/[^\/]+/);
    return pathname;
  }
  return baseHref;
}
