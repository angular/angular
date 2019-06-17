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
import {PlatformLocation} from './platform_location';

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
 * Depending on the `LocationStrategy` used, `Location` will either persist
 * to the URL's path or the URL's hash segment.
 *
 * @usageNotes
 *
 * It's better to use the {@link Router#navigate} service to trigger route changes. Use
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
 * <code-example path='common/location/ts/path_location_component.ts'
 * region='LocationComponent'></code-example>
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
  /** @internal */
  _platformLocation: PlatformLocation;
  /** @internal */
  _urlChangeListeners: ((url: string, state: unknown) => void)[] = [];

  constructor(platformStrategy: LocationStrategy, platformLocation: PlatformLocation) {
    this._platformStrategy = platformStrategy;
    const browserBaseHref = this._platformStrategy.getBaseHref();
    this._platformLocation = platformLocation;
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
   *
   * @param includeHash Whether path has an anchor fragment.
   *
   * @returns The normalized URL path.
   */
  // TODO: vsavkin. Remove the boolean flag and always include hash once the deprecated router is
  // removed.
  path(includeHash: boolean = false): string {
    return this.normalize(this._platformStrategy.path(includeHash));
  }

  /**
   * Returns the current value of the history.state object.
   */
  getState(): unknown { return this._platformLocation.getState(); }

  /**
   * Normalizes the given path and compares to the current normalized path.
   *
   * @param path The given URL path
   * @param query Query parameters
   *
   * @returns `true` if the given URL path is equal to the current normalized path, `false`
   * otherwise.
   */
  isCurrentPathEqualTo(path: string, query: string = ''): boolean {
    return this.path() == this.normalize(path + Location.normalizeQueryParams(query));
  }

  /**
   * Given a string representing a URL, returns the URL path after stripping the
   * trailing slashes.
   *
   * @param url String representing a URL.
   *
   * @returns Normalized URL string.
   */
  normalize(url: string): string {
    return Location.stripTrailingSlash(_stripBaseHref(this._baseHref, _stripIndexHtml(url)));
  }

  /**
   * Given a string representing a URL, returns the platform-specific external URL path.
   * If the given URL doesn't begin with a leading slash (`'/'`), this method adds one
   * before normalizing. This method also adds a hash if `HashLocationStrategy` is
   * used, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
   *
   *
   * @param url String representing a URL.
   *
   * @returns  A normalized platform-specific URL.
   */
  prepareExternalUrl(url: string): string {
    if (url && url[0] !== '/') {
      url = '/' + url;
    }
    return this._platformStrategy.prepareExternalUrl(url);
  }

  // TODO: rename this method to pushState
  /**
   * Changes the browsers URL to a normalized version of the given URL, and pushes a
   * new item onto the platform's history.
   *
   * @param path  URL path to normalizze
   * @param query Query parameters
   * @param state Location history state
   *
   */
  go(path: string, query: string = '', state: any = null): void {
    this._platformStrategy.pushState(state, '', path, query);
    this._notifyUrlChangeListeners(
        this.prepareExternalUrl(path + Location.normalizeQueryParams(query)), state);
  }

  /**
   * Changes the browser's URL to a normalized version of the given URL, and replaces
   * the top item on the platform's history stack.
   *
   * @param path  URL path to normalizze
   * @param query Query parameters
   * @param state Location history state
   */
  replaceState(path: string, query: string = '', state: any = null): void {
    this._platformStrategy.replaceState(state, '', path, query);
    this._notifyUrlChangeListeners(
        this.prepareExternalUrl(path + Location.normalizeQueryParams(query)), state);
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
   * Register URL change listeners. This API can be used to catch updates performed by the Angular
   * framework. These are not detectible through "popstate" or "hashchange" events.
   */
  onUrlChange(fn: (url: string, state: unknown) => void) {
    this._urlChangeListeners.push(fn);
    this.subscribe(v => { this._notifyUrlChangeListeners(v.url, v.state); });
  }

  /** @internal */
  _notifyUrlChangeListeners(url: string = '', state: unknown) {
    this._urlChangeListeners.forEach(fn => fn(url, state));
  }

  /**
   * Subscribe to the platform's `popState` events.
   *
   * @param value Event that is triggered when the state history changes.
   * @param exception The exception to throw.
   *
   * @returns Subscribed events.
   */
  subscribe(
      onNext: (value: PopStateEvent) => void, onThrow?: ((exception: any) => void)|null,
      onReturn?: (() => void)|null): SubscriptionLike {
    return this._subject.subscribe({next: onNext, error: onThrow, complete: onReturn});
  }

  /**
   * Given a string of url parameters, prepend with `?` if needed, otherwise return the
   * parameters as is.
   *
   *  @param  params String of URL parameters
   *
   *  @returns URL parameters prepended with `?` or the parameters as is.
   */
  public static normalizeQueryParams(params: string): string {
    return params && params[0] !== '?' ? '?' + params : params;
  }

  /**
   * Given 2 parts of a URL, join them with a slash if needed.
   *
   * @param start  URL string
   * @param end    URL string
   *
   *
   * @returns Given URL strings joined with a slash, if needed.
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
   * If URL has a trailing slash, remove it, otherwise return the URL as is. The
   * method looks for the first occurrence of either `#`, `?`, or the end of the
   * line as `/` characters and removes the trailing slash if one exists.
   *
   * @param url URL string
   *
   * @returns Returns a URL string after removing the trailing slash if one exists, otherwise
   * returns the string as is.
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
