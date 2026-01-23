/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, OnDestroy, ɵɵinject} from '@angular/core';
import {Subject, SubscriptionLike} from 'rxjs';

import {LocationStrategy} from './location_strategy';
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
 * It's better to use the `Router.navigate()` service to trigger route changes. Use
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
@Injectable({
  providedIn: 'root',
  // See #23917
  useFactory: createLocation,
})
export class Location implements OnDestroy {
  /** @internal */
  _subject = new Subject<PopStateEvent>();
  /** @internal */
  _basePath: string;
  /** @internal */
  _locationStrategy: LocationStrategy;
  /** @internal */
  _urlChangeListeners: ((url: string, state: unknown) => void)[] = [];
  /** @internal */
  _urlChangeSubscription: SubscriptionLike | null = null;

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
    this._locationStrategy.onPopState((ev) => {
      this._subject.next({
        'url': this.path(true),
        'pop': true,
        'state': ev.state,
        'type': ev.type,
      });
    });
  }

  /** @docs-private */
  ngOnDestroy(): void {
    this._urlChangeSubscription?.unsubscribe();
    this._urlChangeListeners = [];
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
   * Reports the current state of the location history.
   * @returns The current value of the `history.state` object.
   */
  getState(): unknown {
    return this._locationStrategy.getState();
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
    return Location.stripTrailingSlash(_stripBasePath(this._basePath, _stripIndexHtml(url)));
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
    this._locationStrategy.pushState(state, '', path, query);
    this._notifyUrlChangeListeners(
      this.prepareExternalUrl(path + normalizeQueryParams(query)),
      state,
    );
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
    this._locationStrategy.replaceState(state, '', path, query);
    this._notifyUrlChangeListeners(
      this.prepareExternalUrl(path + normalizeQueryParams(query)),
      state,
    );
  }

  /**
   * Navigates forward in the platform's history.
   */
  forward(): void {
    this._locationStrategy.forward();
  }

  /**
   * Navigates back in the platform's history.
   */
  back(): void {
    this._locationStrategy.back();
  }

  /**
   * Navigate to a specific page from session history, identified by its relative position to the
   * current page.
   *
   * @param relativePosition  Position of the target page in the history relative to the current
   *     page.
   * A negative value moves backwards, a positive value moves forwards, e.g. `location.historyGo(2)`
   * moves forward two pages and `location.historyGo(-2)` moves back two pages. When we try to go
   * beyond what's stored in the history session, we stay in the current page. Same behaviour occurs
   * when `relativePosition` equals 0.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/History_API#Moving_to_a_specific_point_in_history
   */
  historyGo(relativePosition: number = 0): void {
    this._locationStrategy.historyGo?.(relativePosition);
  }

  /**
   * Registers a URL change listener. Use to catch updates performed by the Angular
   * framework that are not detectible through "popstate" or "hashchange" events.
   *
   * @param fn The change handler function, which take a URL and a location history state.
   * @returns A function that, when executed, unregisters a URL change listener.
   */
  onUrlChange(fn: (url: string, state: unknown) => void): VoidFunction {
    this._urlChangeListeners.push(fn);

    this._urlChangeSubscription ??= this.subscribe((v) => {
      this._notifyUrlChangeListeners(v.url, v.state);
    });

    return () => {
      const fnIndex = this._urlChangeListeners.indexOf(fn);
      this._urlChangeListeners.splice(fnIndex, 1);

      if (this._urlChangeListeners.length === 0) {
        this._urlChangeSubscription?.unsubscribe();
        this._urlChangeSubscription = null;
      }
    };
  }

  /** @internal */
  _notifyUrlChangeListeners(url: string = '', state: unknown) {
    this._urlChangeListeners.forEach((fn) => fn(url, state));
  }

  /**
   * Subscribes to the platform's `popState` events.
   *
   * Note: `Location.go()` does not trigger the `popState` event in the browser. Use
   * `Location.onUrlChange()` to subscribe to URL changes instead.
   *
   * @param value Event that is triggered when the state history changes.
   * @param exception The exception to throw.
   *
   * @see [onpopstate](https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate)
   *
   * @returns Subscribed events.
   */
  subscribe(
    onNext: (value: PopStateEvent) => void,
    onThrow?: ((exception: any) => void) | null,
    onReturn?: (() => void) | null,
  ): SubscriptionLike {
    return this._subject.subscribe({
      next: onNext,
      error: onThrow ?? undefined,
      complete: onReturn ?? undefined,
    });
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
  return new Location(ɵɵinject(LocationStrategy as any));
}

function _stripBasePath(basePath: string, url: string): string {
  if (!basePath || !url.startsWith(basePath)) {
    return url;
  }
  const strippedUrl = url.substring(basePath.length);
  if (strippedUrl === '' || ['/', ';', '?', '#'].includes(strippedUrl[0])) {
    return strippedUrl;
  }
  return url;
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
  const isAbsoluteUrl = new RegExp('^(https?:)?//').test(baseHref);
  if (isAbsoluteUrl) {
    const [, pathname] = baseHref.split(/\/\/[^\/]+/);
    return pathname;
  }
  return baseHref;
}
