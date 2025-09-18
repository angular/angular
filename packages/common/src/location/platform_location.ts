/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injectable, InjectionToken, DOCUMENT} from '@angular/core';

import {getDOM} from '../dom_adapter';

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
 * by the {@link /api/router/Router Router} in order to navigate between routes. Since all interactions between
 * {@link /api/router/Router Router} /
 * {@link Location} / {@link LocationStrategy} and DOM APIs flow through the `PlatformLocation`
 * class, they are all platform-agnostic.
 *
 * @publicApi
 */
@Injectable({providedIn: 'platform', useFactory: () => inject(BrowserPlatformLocation)})
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

  historyGo?(relativePosition: number): void {
    throw new Error(ngDevMode ? 'Not implemented' : '');
  }
}

/**
 * @description
 * Indicates when a location is initialized.
 *
 * @publicApi
 */
export const LOCATION_INITIALIZED = new InjectionToken<Promise<any>>(
  ngDevMode ? 'Location Initialized' : '',
);

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
 *
 * @publicApi
 */
@Injectable({
  providedIn: 'platform',
  useFactory: () => new BrowserPlatformLocation(),
})
export class BrowserPlatformLocation extends PlatformLocation {
  private _location: Location;
  private _history: History;
  private _doc = inject(DOCUMENT);

  constructor() {
    super();
    this._location = window.location;
    this._history = window.history;
  }

  override getBaseHrefFromDOM(): string {
    return getDOM().getBaseHref(this._doc)!;
  }

  override onPopState(fn: LocationChangeListener): VoidFunction {
    const window = getDOM().getGlobalEventTarget(this._doc, 'window');
    window.addEventListener('popstate', fn, false);
    return () => window.removeEventListener('popstate', fn);
  }

  override onHashChange(fn: LocationChangeListener): VoidFunction {
    const window = getDOM().getGlobalEventTarget(this._doc, 'window');
    window.addEventListener('hashchange', fn, false);
    return () => window.removeEventListener('hashchange', fn);
  }

  override get href(): string {
    return this._location.href;
  }
  override get protocol(): string {
    return this._location.protocol;
  }
  override get hostname(): string {
    return this._location.hostname;
  }
  override get port(): string {
    return this._location.port;
  }
  override get pathname(): string {
    return this._location.pathname;
  }
  override get search(): string {
    return this._location.search;
  }
  override get hash(): string {
    return this._location.hash;
  }
  override set pathname(newPath: string) {
    this._location.pathname = newPath;
  }

  override pushState(state: any, title: string, url: string): void {
    try {
      this._history.pushState(state, title, url);
    } catch (error) {
      // If the exception is because `state` can't be serialized, let that throw
      // outwards just like a replace call would so the dev knows the cause
      // https://html.spec.whatwg.org/multipage/nav-history-apis.html#shared-history-push/replace-state-steps
      // https://html.spec.whatwg.org/multipage/structured-data.html#structuredserializeinternal
      if (error instanceof DOMException && error.name === 'DataCloneError') {
        throw error;
      }
      // They are going to lose state here, but there is no real
      // way to warn them about it since the page will refresh...
      this._location.assign(url);
    }
  }

  override replaceState(state: any, title: string, url: string): void {
    this._history.replaceState(state, title, url);
  }

  override forward(): void {
    this._history.forward();
  }

  override back(): void {
    this._history.back();
  }

  override historyGo(relativePosition: number = 0): void {
    this._history.go(relativePosition);
  }

  override getState(): unknown {
    return this._history.state;
  }
}
