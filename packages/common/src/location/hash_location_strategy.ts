/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, Optional} from '@angular/core';


import {Location} from './location';
import {APP_BASE_HREF, LocationStrategy} from './location_strategy';
import {LocationChangeListener, PlatformLocation} from './platform_location';



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
 * You can provide a {@link APP_BASE_HREF} or add a base element to the document.
 * This URL prefix that will be preserved when generating and recognizing URLs.
 *
 * For example, if you provide an `APP_BASE_HREF` of `'/my/app'` and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app#/foo`.
 *
 * Similarly, if you add `<base href='/my/app'/>` to the document and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app#/foo`.
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
export class HashLocationStrategy extends LocationStrategy {
  private _baseHref: string;
  private _hashFragmentPrefix: string;
  constructor(
      private _platformLocation: PlatformLocation,
      @Optional() @Inject(APP_BASE_HREF) _baseHref?: string) {
    super();
    _baseHref = _baseHref || '';
    if (!_baseHref.startsWith('/')) {
      if (_baseHref.startsWith('#')) {
        _baseHref = _baseHref.substring(1);
      }
      _baseHref = ('' === _baseHref) ? _baseHref : ('#' + _baseHref);
    }
    const hashSignAt = _baseHref.indexOf('#');
    if (hashSignAt >= 0) {
      this._baseHref = _baseHref.substring(0, hashSignAt);
      this._hashFragmentPrefix =
          '#' + Location.stripTrailingSlash(_baseHref.substring(hashSignAt + 1));
    } else {
      this._baseHref = _baseHref;
      this._hashFragmentPrefix = '#';
    }
  }

  onPopState(fn: LocationChangeListener): void {
    this._platformLocation.onPopState(fn);
    this._platformLocation.onHashChange(fn);
  }

  getBaseHref(): string { return this._baseHref + this._hashFragmentPrefix; }

  path(includeHash: boolean = false): string {
    // the hash value is always prefixed with a `#`
    // and if it is empty then it will stay empty
    let path = this._platformLocation.hash;
    if (path == null) {
      path = this._hashFragmentPrefix;
    }
    if (path.startsWith(this._hashFragmentPrefix)) {
      return path.substring(this._hashFragmentPrefix.length);
    }
    return path.length > 0 ? path.substring(1) : path;
  }

  prepareExternalUrl(internal: string): string {
    if (internal.length === 0) {
      return this._baseHref + this._hashFragmentPrefix + '/';
    }
    const mark =
        internal.startsWith('/') ? this._hashFragmentPrefix : (this._hashFragmentPrefix + '/');
    return this._baseHref + mark + internal;
  }

  pushState(state: any, title: string, path: string, queryParams: string) {
    let url: string|null =
        this.prepareExternalUrl(path + Location.normalizeQueryParams(queryParams));
    if (url.length == 0) {
      url = this._platformLocation.pathname;
    }
    this._platformLocation.pushState(state, title, url);
  }

  replaceState(state: any, title: string, path: string, queryParams: string) {
    let url = this.prepareExternalUrl(path + Location.normalizeQueryParams(queryParams));
    if (url.length == 0) {
      url = this._platformLocation.pathname;
    }
    this._platformLocation.replaceState(state, title, url);
  }

  forward(): void { this._platformLocation.forward(); }

  back(): void { this._platformLocation.back(); }
}
