/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter, Injectable} from '@angular/core';
import {SubscriptionLike} from 'rxjs';

import {LocationStrategy} from './location_strategy';

/** @publicApi */
export interface PopStateEvent {
  pop?: boolean;
  state?: any;
  type?: string;
  url?: string;
}

/**
 * @description
 *
 * A service that applications can use to interact with a browser's URL.
 *
 * Depending on which {@link LocationStrategy} is used, `Location` will either persist
 * to the URL's path or the URL's hash segment.
 *
 * @usageNotes
 *
 * It's better to use {@link Router#navigate} service to trigger route changes. Use
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
 * {@example common/location/ts/path_location_component.ts region='LocationComponent'}
 *
 * @publicApi
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
        'state': ev.state,
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
    if (url && url[0] !== '/') {
      url = '/' + url;
    }
    return this._platformStrategy.prepareExternalUrl(url);
  }

  // TODO: rename this method to pushState
  /**
   * Changes the browsers URL to the normalized version of the given URL, and pushes a
   * new item onto the platform's history.
   */
  go(path: string, query: string = '', state: any = null): void {
    this._platformStrategy.pushState(state, '', path, query);
  }

  /**
   * Changes the browsers URL to the normalized version of the given URL, and replaces
   * the top item on the platform's history stack.
   */
  replaceState(path: string, query: string = '', state: any = null): void {
    this._platformStrategy.replaceState(state, '', path, query);
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
      onNext: (value: PopStateEvent) => void, onThrow?: ((exception: any) => void)|null,
      onReturn?: (() => void)|null): SubscriptionLike {
    return this._subject.subscribe({next: onNext, error: onThrow, complete: onReturn});
  }

  /**
   * Given a string of url parameters, prepend with '?' if needed, otherwise return parameters as
   * is.
   */
  public static normalizeQueryParams(params: string): string {
    return params && params[0] !== '?' ? '?' + params : params;
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
    let slashes = 0;
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
   * If url has a trailing slash, remove it, otherwise return url as is. This
   * method looks for the first occurrence of either #, ?, or the end of the
   * line as `/` characters after any of these should not be replaced.
   */
  public static stripTrailingSlash(url: string): string {
    const match = url.match(/#|\?|$/);
    const pathEndIdx = match && match.index || url.length;
    const droppedSlashIdx = pathEndIdx - (url[pathEndIdx - 1] === '/' ? 1 : 0);
    return url.slice(0, droppedSlashIdx) + url.slice(pathEndIdx);
  }
}

function _stripBaseHref(baseHref: string, url: string): string {
  return baseHref && url.startsWith(baseHref) ? url.substring(baseHref.length) : url;
}

function _stripIndexHtml(url: string): string {
  return url.replace(/\/index.html$/, '');
}
