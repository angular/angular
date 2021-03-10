/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, InjectionToken, ɵɵinject} from '@angular/core';
import {getDOM} from '../dom_adapter';
import {DOCUMENT} from '../dom_tokens';

/**
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 *
 * `PlatformLocation` encapsulates all calls to DOM APIs, which allows the Router to be
 * platform-agnostic.
 * This means that we can have different implementation of `PlatformLocation` for the different
 * platforms that Angular supports. For example, `@angular/platform-browser` provides an
 * implementation specific to the browser environment, while `@angular/platform-server` provides
 * one suitable for use with server-side rendering.
 *
 * The `PlatformLocation` class is used directly by all implementations of {@link LocationStrategy}
 * when they need to interact with the DOM APIs like pushState, popState, etc.
 *
 * {@link LocationStrategy} in turn is used by the {@link Location} service which is used directly
 * by the {@link Router} in order to navigate between routes. Since all interactions between {@link
 * Router} /
 * {@link Location} / {@link LocationStrategy} and DOM APIs flow through the `PlatformLocation`
 * class, they are all platform-agnostic.
 *
 * @publicApi
 */
@Injectable({
  providedIn: 'platform',
  // See #23917
  useFactory: useBrowserPlatformLocation
})
export abstract class PlatformLocation {
  abstract getBaseHrefFromDOM(): string;
  abstract getState(): unknown;
  /**
   * Returns a function that, when executed, removes the `popstate` event handler.
   */
  abstract onPopState(fn: LocationChangeListener): VoidFunction;
  /**
   * Returns a function that, when executed, removes the `hashchange` event handler.
   */
  abstract onHashChange(fn: LocationChangeListener): VoidFunction;

  abstract get href(): string;
  abstract get protocol(): string;
  abstract get hostname(): string;
  abstract get port(): string;
  abstract get pathname(): string;
  abstract get search(): string;
  abstract get hash(): string;

  abstract replaceState(state: any, title: string, url: string): void;

  abstract pushState(state: any, title: string, url: string): void;

  abstract forward(): void;

  abstract back(): void;
}

export function useBrowserPlatformLocation() {
  return ɵɵinject(BrowserPlatformLocation);
}

/**
 * @description
 * Indicates when a location is initialized.
 *
 * @publicApi
 */
export const LOCATION_INITIALIZED = new InjectionToken<Promise<any>>('Location Initialized');

/**
 * @description
 * A serializable version of the event from `onPopState` or `onHashChange`
 *
 * @publicApi
 */
export interface LocationChangeEvent {
  type: string;
  state: any;
}

/**
 * @publicApi
 */
export interface LocationChangeListener {
  (event: LocationChangeEvent): any;
}



/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 */
@Injectable({
  providedIn: 'platform',
  // See #23917
  useFactory: createBrowserPlatformLocation,
})
export class BrowserPlatformLocation extends PlatformLocation {
  public readonly location!: Location;
  private _history!: History;

  constructor(@Inject(DOCUMENT) private _doc: any) {
    super();
    this._init();
  }

  // This is moved to its own method so that `MockPlatformLocationStrategy` can overwrite it
  /** @internal */
  _init() {
    (this as {location: Location}).location = window.location;
    this._history = window.history;
  }

  getBaseHrefFromDOM(): string {
    return getDOM().getBaseHref(this._doc)!;
  }

  onPopState(fn: LocationChangeListener): VoidFunction {
    const window = getDOM().getGlobalEventTarget(this._doc, 'window');
    window.addEventListener('popstate', fn, false);
    return () => window.removeEventListener('popstate', fn);
  }

  onHashChange(fn: LocationChangeListener): VoidFunction {
    const window = getDOM().getGlobalEventTarget(this._doc, 'window');
    window.addEventListener('hashchange', fn, false);
    return () => window.removeEventListener('hashchange', fn);
  }

  get href(): string {
    return this.location.href;
  }
  get protocol(): string {
    return this.location.protocol;
  }
  get hostname(): string {
    return this.location.hostname;
  }
  get port(): string {
    return this.location.port;
  }
  get pathname(): string {
    return this.location.pathname;
  }
  get search(): string {
    return this.location.search;
  }
  get hash(): string {
    return this.location.hash;
  }
  set pathname(newPath: string) {
    this.location.pathname = newPath;
  }

  pushState(state: any, title: string, url: string): void {
    if (supportsState()) {
      this._history.pushState(state, title, url);
    } else {
      this.location.hash = url;
    }
  }

  replaceState(state: any, title: string, url: string): void {
    if (supportsState()) {
      this._history.replaceState(state, title, url);
    } else {
      this.location.hash = url;
    }
  }

  forward(): void {
    this._history.forward();
  }

  back(): void {
    this._history.back();
  }

  getState(): unknown {
    return this._history.state;
  }
}

export function supportsState(): boolean {
  return !!window.history.pushState;
}
export function createBrowserPlatformLocation() {
  return new BrowserPlatformLocation(ɵɵinject(DOCUMENT));
}
