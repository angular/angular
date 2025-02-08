/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Inject, inject, Injectable, InjectionToken, OnDestroy, Optional} from '@angular/core';

import {DOCUMENT} from '../dom_tokens';

import {LocationChangeListener, PlatformLocation} from './platform_location';
import {joinWithSlash, normalizeQueryParams} from './util';

/**
 * Enables the `Location` service to read route state from the browser's URL.
 * Angular provides two strategies:
 * `HashLocationStrategy` and `PathLocationStrategy`.
 *
 * Applications should use the `Router` or `Location` services to
 * interact with application route state.
 *
 * For instance, `HashLocationStrategy` produces URLs like
 * <code class="no-auto-link">http://example.com/#/foo</code>,
 * and `PathLocationStrategy` produces
 * <code class="no-auto-link">http://example.com/foo</code> as an equivalent URL.
 *
 * See these two classes for more.
 *
 * @publicApi
 */
@Injectable({providedIn: 'root', useFactory: () => inject(PathLocationStrategy)})
export abstract class LocationStrategy {
  abstract path(includeHash?: boolean): string;
  abstract prepareExternalUrl(internal: string): string;
  abstract getState(): unknown;
  abstract pushState(state: any, title: string, url: string, queryParams: string): void;
  abstract replaceState(state: any, title: string, url: string, queryParams: string): void;
  abstract forward(): void;
  abstract back(): void;
  historyGo?(relativePosition: number): void {
    throw new Error(ngDevMode ? 'Not implemented' : '');
  }
  abstract onPopState(fn: LocationChangeListener): void;
  abstract getBaseHref(): string;
}

/**
 * A predefined DI token for the base href
 * to be used with the `PathLocationStrategy`.
 * The base href is the URL prefix that should be preserved when generating
 * and recognizing URLs.
 *
 * @usageNotes
 *
 * The following example shows how to use this token to configure the root app injector
 * with a base href value, so that the DI framework can supply the dependency anywhere in the app.
 *
 * ```ts
 * import {NgModule} from '@angular/core';
 * import {APP_BASE_HREF} from '@angular/common';
 *
 * @NgModule({
 *   providers: [{provide: APP_BASE_HREF, useValue: '/my/app'}]
 * })
 * class AppModule {}
 * ```
 *
 * @publicApi
 */
export const APP_BASE_HREF = new InjectionToken<string>(ngDevMode ? 'appBaseHref' : '');

/**
 * @description
 * A {@link LocationStrategy} used to configure the {@link Location} service to
 * represent its state in the
 * [path](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax) of the
 * browser's URL.
 *
 * If you're using `PathLocationStrategy`, you may provide a {@link APP_BASE_HREF}
 * or add a `<base href>` element to the document to override the default.
 *
 * For instance, if you provide an `APP_BASE_HREF` of `'/my/app/'` and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`. To ensure all relative URIs resolve correctly,
 * the `<base href>` and/or `APP_BASE_HREF` should end with a `/`.
 *
 * Similarly, if you add `<base href='/my/app/'/>` to the document and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`.
 *
 * Note that when using `PathLocationStrategy`, neither the query nor
 * the fragment in the `<base href>` will be preserved, as outlined
 * by the [RFC](https://tools.ietf.org/html/rfc3986#section-5.2.2).
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/location/ts/path_location_component.ts region='LocationComponent'}
 *
 * @publicApi
 */
@Injectable({providedIn: 'root'})
export class PathLocationStrategy extends LocationStrategy implements OnDestroy {
  private _baseHref: string;
  private _removeListenerFns: (() => void)[] = [];

  constructor(
    private _platformLocation: PlatformLocation,
    @Optional() @Inject(APP_BASE_HREF) href?: string,
  ) {
    super();

    this._baseHref =
      href ??
      this._platformLocation.getBaseHrefFromDOM() ??
      inject(DOCUMENT).location?.origin ??
      '';
  }

  /** @nodoc */
  ngOnDestroy(): void {
    while (this._removeListenerFns.length) {
      this._removeListenerFns.pop()!();
    }
  }

  override onPopState(fn: LocationChangeListener): void {
    this._removeListenerFns.push(
      this._platformLocation.onPopState(fn),
      this._platformLocation.onHashChange(fn),
    );
  }

  override getBaseHref(): string {
    return this._baseHref;
  }

  override prepareExternalUrl(internal: string): string {
    return joinWithSlash(this._baseHref, internal);
  }

  override path(includeHash: boolean = false): string {
    const pathname =
      this._platformLocation.pathname + normalizeQueryParams(this._platformLocation.search);
    const hash = this._platformLocation.hash;
    return hash && includeHash ? `${pathname}${hash}` : pathname;
  }

  override pushState(state: any, title: string, url: string, queryParams: string) {
    const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
    this._platformLocation.pushState(state, title, externalUrl);
  }

  override replaceState(state: any, title: string, url: string, queryParams: string) {
    const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
    this._platformLocation.replaceState(state, title, externalUrl);
  }

  override forward(): void {
    this._platformLocation.forward();
  }

  override back(): void {
    this._platformLocation.back();
  }

  override getState(): unknown {
    return this._platformLocation.getState();
  }

  override historyGo(relativePosition: number = 0): void {
    this._platformLocation.historyGo?.(relativePosition);
  }
}
