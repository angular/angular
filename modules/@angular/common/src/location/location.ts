/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter, Injectable} from '@angular/core';

import {LocationStrategy} from './location_strategy';


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
 * import {Component} from '@angular/core';
 * import {Location} from '@angular/common';
 *
 * @Component({selector: 'app-component'})
 * class AppCmp {
 *   constructor(location: Location) {
 *     location.go('/foo');
 *   }
 * }
 * ```
 *
 * @stable
 */
@Injectable()
export class Location {
  /** @internal */
  _subject: EventEmitter<any> = new EventEmitter();
  /** @internal */
  _baseHref: string;
  /** @internal */
  _platformStrategy: LocationStrategy;

  constructor(platformStrategy: LocationStrategy) {
    this._platformStrategy = platformStrategy;
    const browserBaseHref = this._platformStrategy.getBaseHref();
    this._baseHref = Location.stripTrailingSlash(_stripIndexHtml(browserBaseHref));
    this._platformStrategy.onPopState((ev) => {
      this._subject.emit({
        'url': this.path(true),
        'pop': true,
        'type': ev.type,
      });
    });
  }

  /**
   * Returns the normalized URL path.
   */
  // TODO: vsavkin. Remove the boolean flag and always include hash once the deprecated router is
  // removed.
  path(includeHash: boolean = false): string {
    return this.normalize(this._platformStrategy.path(includeHash));
  }

  /**
   * Normalizes the given path and compares to the current normalized path.
   */
  isCurrentPathEqualTo(path: string, query: string = ''): boolean {
    return this.path() == this.normalize(path + Location.normalizeQueryParams(query));
  }

  /**
   * Given a string representing a URL, returns the normalized URL path without leading or
   * trailing slashes.
   */
  normalize(url: string): string {
    return Location.stripTrailingSlash(_stripBaseHref(this._baseHref, _stripIndexHtml(url)));
  }

  /**
   * Given a string representing a URL, returns the platform-specific external URL path.
   * If the given URL doesn't begin with a leading slash (`'/'`), this method adds one
   * before normalizing. This method will also add a hash if `HashLocationStrategy` is
   * used, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
   */
  prepareExternalUrl(url: string): string {
    if (url.length > 0 && !url.startsWith('/')) {
      url = '/' + url;
    }
    return this._platformStrategy.prepareExternalUrl(url);
  }

  // TODO: rename this method to pushState
  /**
   * Changes the browsers URL to the normalized version of the given URL, and pushes a
   * new item onto the platform's history.
   */
  go(path: string, query: string = ''): void {
    this._platformStrategy.pushState(null, '', path, query);
  }

  /**
   * Changes the browsers URL to the normalized version of the given URL, and replaces
   * the top item on the platform's history stack.
   */
  replaceState(path: string, query: string = ''): void {
    this._platformStrategy.replaceState(null, '', path, query);
  }

  /**
   * Navigates forward in the platform's history.
   */
  forward(): void { this._platformStrategy.forward(); }

  /**
   * Navigates back in the platform's history.
   */
  back(): void { this._platformStrategy.back(); }

  /**
   * Subscribe to the platform's `popState` events.
   */
  subscribe(
      onNext: (value: any) => void, onThrow: (exception: any) => void = null,
      onReturn: () => void = null): Object {
    return this._subject.subscribe({next: onNext, error: onThrow, complete: onReturn});
  }

  /**
   * Given a string of url parameters, prepend with '?' if needed, otherwise return parameters as
   * is.
   */
  public static normalizeQueryParams(params: string): string {
    return (params.length > 0 && params.substring(0, 1) != '?') ? ('?' + params) : params;
  }

  /**
   * Given 2 parts of a url, join them with a slash if needed.
   */
  public static joinWithSlash(start: string, end: string): string {
    if (start.length == 0) {
      return end;
    }
    if (end.length == 0) {
      return start;
    }
    var slashes = 0;
    if (start.endsWith('/')) {
      slashes++;
    }
    if (end.startsWith('/')) {
      slashes++;
    }
    if (slashes == 2) {
      return start + end.substring(1);
    }
    if (slashes == 1) {
      return start + end;
    }
    return start + '/' + end;
  }

  /**
   * If url has a trailing slash, remove it, otherwise return url as is.
   */
  public static stripTrailingSlash(url: string): string {
    if (/\/$/g.test(url)) {
      url = url.substring(0, url.length - 1);
    }
    return url;
  }
}

function _stripBaseHref(baseHref: string, url: string): string {
  if (baseHref.length > 0 && url.startsWith(baseHref)) {
    return url.substring(baseHref.length);
  }
  return url;
}

function _stripIndexHtml(url: string): string {
  if (/\/index.html$/g.test(url)) {
    // '/index.html'.length == 11
    return url.substring(0, url.length - 11);
  }
  return url;
}
