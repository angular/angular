/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, InjectionToken, Optional, ɵɵinject} from '@angular/core';
import {DOCUMENT} from '../dom_tokens';
import {LocationChangeListener, PlatformLocation} from './platform_location';
import {joinWithSlash, normalizeQueryParams} from './util';

/**
 * Enables the `Location` service to read route state from the browser's URL.
 * Applications can use either the `Router` service or the `Location` service to
 * interact with the application route state.
 *
 * The preferred way to trigger route changes is to use the
 * [Router.navigate() method](api/router/Router#navigate "API reference"),
 * The `Location` service is an alternative that supports applications
 * originally created with AngularJS.
 *
 * When using the `Location` service, Angular provides strategies for different browser URL styles.
 *
 * * `HashLocationStrategy` produce a URL using hash notation. For example:
 *
 *    <code class="no-auto-link">http://example.com#/foo</code>,
 * * `PathLocationStrategy` produces the equivalent URL without hash notation:
 *
 *    <code class="no-auto-link">http://example.com/foo</code>
 *
 * @see `HashLocationStrategy`
 * @see `PathLocationStrategy`
 * @see `APP_BASE_HREF`
 * @see [LocationStrategy and browser URL styles](guide/router#locationstrategy-and-browser-url-styles)
 *
 * @publicApi
 */
@Injectable({providedIn: 'root', useFactory: provideLocationStrategy})
export abstract class LocationStrategy {
  abstract path(includeHash?: boolean): string;
  abstract prepareExternalUrl(internal: string): string;
  abstract pushState(state: any, title: string, url: string, queryParams: string): void;
  abstract replaceState(state: any, title: string, url: string, queryParams: string): void;
  abstract forward(): void;
  abstract back(): void;
  abstract onPopState(fn: LocationChangeListener): void;
  abstract getBaseHref(): string;
}

export function provideLocationStrategy(platformLocation: PlatformLocation) {
  // See #23917
  const location = ɵɵinject(DOCUMENT).location;
  return new PathLocationStrategy(
      ɵɵinject(PlatformLocation as any), location && location.origin || '');
}


/**
 * A predefined [DI token](guide/glossary#di-token "Definition") for the base href
 * to be used with the `PathLocationStrategy`.
 * The base href is the URL prefix that should be preserved when generating
 * and recognizing URLs.
 *
 * The following example shows how to use this token to configure the root app injector
 * with a base href value, so that the DI framework can supply the dependency anywhere in the app.
 *
 * ```typescript
 * import {Component, NgModule} from '@angular/core';
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
export const APP_BASE_HREF = new InjectionToken<string>('appBaseHref');

/**
 * @description
 * A {@link LocationStrategy} used to configure the {@link Location} service to
 * represent its state in the
 * [path](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax) of the
 * browser's URL.
 *
 * When using `PathLocationStrategy`, you must provide a {@link APP_BASE_HREF}
 * or add a `<base href>` element to the document. The base href must
 * end with a slash character (`/`).
 * The base href is prepended to the URL produced by the `Location` service,
 * with the trailing slash removed if necessary.
 *
 * For example, if you provide an `APP_BASE_HREF` of `'/my/app/'` and call
 * `location.go('/foo')`, the browser's URL is normalized to `example.com/my/app/foo`.
 * The result is the same if you add `<base href='/my/app/'/>` to the document and call
 * `location.go('/foo')`.
 *
 * When using `PathLocationStrategy`, neither the query nor
 * the fragment in the `<base href>` is preserved, as outlined
 * by the [RFC](https://tools.ietf.org/html/rfc3986#section-5.2.2).
 *
 * The following example displays the normalized URL produced with this strategy.
 *
 * {@example common/location/ts/path_location_component.ts region='LocationComponent'}
 *
 * @see `LocationStrategy`
 * @see `APP_BASE_HREF`
 * @see [LocationStrategy and browser URL styles](guide/router#locationstrategy-and-browser-url-styles)
 *
 *
 * @publicApi
 */
@Injectable()
export class PathLocationStrategy extends LocationStrategy {
  private _baseHref: string;

  constructor(
      private _platformLocation: PlatformLocation,
      @Optional() @Inject(APP_BASE_HREF) href?: string) {
    super();

    if (href == null) {
      href = this._platformLocation.getBaseHrefFromDOM();
    }

    if (href == null) {
      throw new Error(
          `No base href set. Please provide a value for the APP_BASE_HREF token or add a base element to the document.`);
    }

    this._baseHref = href;
  }

  onPopState(fn: LocationChangeListener): void {
    this._platformLocation.onPopState(fn);
    this._platformLocation.onHashChange(fn);
  }

  getBaseHref(): string {
    return this._baseHref;
  }

  prepareExternalUrl(internal: string): string {
    return joinWithSlash(this._baseHref, internal);
  }

  path(includeHash: boolean = false): string {
    const pathname =
        this._platformLocation.pathname + normalizeQueryParams(this._platformLocation.search);
    const hash = this._platformLocation.hash;
    return hash && includeHash ? `${pathname}${hash}` : pathname;
  }

  pushState(state: any, title: string, url: string, queryParams: string) {
    const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
    this._platformLocation.pushState(state, title, externalUrl);
  }

  replaceState(state: any, title: string, url: string, queryParams: string) {
    const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
    this._platformLocation.replaceState(state, title, externalUrl);
  }

  forward(): void {
    this._platformLocation.forward();
  }

  back(): void {
    this._platformLocation.back();
  }
}
