/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Inject, Injectable, OnDestroy, Optional} from '@angular/core';

import {APP_BASE_HREF, LocationStrategy} from './location_strategy';
import {LocationChangeListener, PlatformLocation} from './platform_location';
import {joinWithSlash, normalizeQueryParams} from './util';

/**
 * @description
 * A {@link LocationStrategy} used to configure the {@link Location} service to
 * represent its state in the
 * [hash fragment](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax)
 * of the browser's URL.
 *
 * For instance, if you call `location.go('/foo')`, the browser's URL will become
 * `example.com#/foo`.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/location/ts/hash_location_component.ts region='LocationComponent'}
 *
 * @publicApi
 */
@Injectable()
export class HashLocationStrategy extends LocationStrategy implements OnDestroy {
  private _baseHref: string = '';
  private _removeListenerFns: (() => void)[] = [];

  constructor(
    private _platformLocation: PlatformLocation,
    @Optional() @Inject(APP_BASE_HREF) _baseHref?: string,
  ) {
    super();
    if (_baseHref != null) {
      this._baseHref = _baseHref;
    }
  }

  /** @docs-private */
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

  override path(includeHash: boolean = false): string {
    // the hash value is always prefixed with a `#`
    // and if it is empty then it will stay empty
    const path = this._platformLocation.hash ?? '#';

    return path.length > 0 ? path.substring(1) : path;
  }

  override prepareExternalUrl(internal: string): string {
    const url = joinWithSlash(this._baseHref, internal);
    return url.length > 0 ? '#' + url : url;
  }

  override pushState(state: any, title: string, path: string, queryParams: string) {
    const url = this.prepareHistoryUrl(path, queryParams);
    this._platformLocation.pushState(state, title, url);
  }

  override replaceState(state: any, title: string, path: string, queryParams: string) {
    const url = this.prepareHistoryUrl(path, queryParams);
    this._platformLocation.replaceState(state, title, url);
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

  private prepareHistoryUrl(path: string, queryParams: string): string {
    const externalUrl = this.prepareExternalUrl(path + normalizeQueryParams(queryParams));
    if (!externalUrl) {
      // Fallback to the current pathname if the external URL is empty.
      return this._platformLocation.pathname;
    }

    // Create full URL by combining the current href (up to the hash) with the external URL.
    const href = this._platformLocation.href;
    const hashIndex = href.indexOf('#');
    return `${hashIndex === -1 ? href : href.slice(0, hashIndex)}${externalUrl}`;
  }
}
