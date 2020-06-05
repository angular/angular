/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter, Injectable, ɵɵinject} from '@angular/core';
import {SubscriptionLike} from 'rxjs';
import {LocationStrategy} from './location_strategy';
import {PlatformLocation} from './platform_location';
import {joinWithSlash, normalizeQueryParams, stripTrailingSlash} from './util';

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
 * Depending on the `LocationStrategy` used, `Location` persists
 * to the URL's path or the URL's hash segment.
 *
 * @usageNotes
 *
 * It's better to use the `Router#navigate` service to trigger route changes. Use
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
@Injectable({
  providedIn: 'root',
  // See #23917
  useFactory: createLocation,
})
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
  /** @internal */
  _urlChangeSubscription?: SubscriptionLike;

  constructor(platformStrategy: LocationStrategy, platformLocation: PlatformLocation) {
    this._platformStrategy = platformStrategy;
    const browserBaseHref = this._platformStrategy.getBaseHref();
    this._platformLocation = platformLocation;
    this._baseHref = stripTrailingSlash(_stripIndexHtml(browserBaseHref));
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
   * Normalizes the URL path for this location.
   *
   * @param includeHash True to include an anchor fragment in the path.
   *
   * @returns The normalized URL path.
   */
  // TODO: vsavkin. Remove the boolean flag and always include hash once the deprecated router is
  // removed.
  path(includeHash: boolean = false): string {
    return this.normalize(this._platformStrategy.path(includeHash));
  }

  /**
   * Reports the current state of the location history.
   * @returns The current value of the `history.state` object.
   */
  getState(): unknown {
    return this._platformLocation.getState();
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
    return Location.stripTrailingSlash(_stripBaseHref(this._baseHref, _stripIndexHtml(url)));
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
    return this._platformStrategy.prepareExternalUrl(url);
  }

  // TODO: rename this method to pushState
  /**
   * Changes the browser's URL to a normalized version of a given URL, and pushes a
   * new item onto the platform's history.
   *
   * @param path  URL path to normalize.
   * @param query Query parameters.
   * @param state Location history state.
   *
   */
  go(path: string, query: string = '', state: any = null): void {
    this._platformStrategy.pushState(state, '', path, query);
    this._notifyUrlChangeListeners(
        this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
  }

  /**
   * Changes the browser's URL to a normalized version of the given URL, and replaces
   * the top item on the platform's history stack.
   *
   * @param path  URL path to normalize.
   * @param query Query parameters.
   * @param state Location history state.
   */
  replaceState(path: string, query: string = '', state: any = null): void {
    this._platformStrategy.replaceState(state, '', path, query);
    this._notifyUrlChangeListeners(
        this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
  }

  /**
   * Navigates forward in the platform's history.
   */
  forward(): void {
    this._platformStrategy.forward();
  }

  /**
   * Navigates back in the platform's history.
   */
  back(): void {
    this._platformStrategy.back();
  }

  /**
   * Registers a URL change listener. Use to catch updates performed by the Angular
   * framework that are not detectible through "popstate" or "hashchange" events.
   *
   * @param fn The change handler function, which take a URL and a location history state.
   */
  onUrlChange(fn: (url: string, state: unknown) => void) {
    this._urlChangeListeners.push(fn);

    if (!this._urlChangeSubscription) {
      this._urlChangeSubscription = this.subscribe(v => {
        this._notifyUrlChangeListeners(v.url, v.state);
      });
    }
  }

  /** @internal */
  _notifyUrlChangeListeners(url: string = '', state: unknown) {
    this._urlChangeListeners.forEach(fn => fn(url, state));
  }

  /**
   * Subscribes to the platform's `popState` events.
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

export function createLocation() {
  return new Location(ɵɵinject(LocationStrategy as any), ɵɵinject(PlatformLocation as any));
}

function _stripBaseHref(baseHref: string, url: string): string {
  return baseHref && url.startsWith(baseHref) ? url.substring(baseHref.length) : url;
}

function _stripIndexHtml(url: string): string {
  return url.replace(/\/index.html$/, '');
}
