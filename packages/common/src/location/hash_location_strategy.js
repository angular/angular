/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate, __param} from 'tslib';
import {Inject, Injectable, Optional} from '@angular/core';
import {APP_BASE_HREF, LocationStrategy} from './location_strategy';
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
let HashLocationStrategy = class HashLocationStrategy extends LocationStrategy {
  constructor(_platformLocation, _baseHref) {
    super();
    this._platformLocation = _platformLocation;
    this._baseHref = '';
    this._removeListenerFns = [];
    if (_baseHref != null) {
      this._baseHref = _baseHref;
    }
  }
  /** @docs-private */
  ngOnDestroy() {
    while (this._removeListenerFns.length) {
      this._removeListenerFns.pop()();
    }
  }
  onPopState(fn) {
    this._removeListenerFns.push(
      this._platformLocation.onPopState(fn),
      this._platformLocation.onHashChange(fn),
    );
  }
  getBaseHref() {
    return this._baseHref;
  }
  path(includeHash = false) {
    // the hash value is always prefixed with a `#`
    // and if it is empty then it will stay empty
    const path = this._platformLocation.hash ?? '#';
    return path.length > 0 ? path.substring(1) : path;
  }
  prepareExternalUrl(internal) {
    const url = joinWithSlash(this._baseHref, internal);
    return url.length > 0 ? '#' + url : url;
  }
  pushState(state, title, path, queryParams) {
    const url =
      this.prepareExternalUrl(path + normalizeQueryParams(queryParams)) ||
      this._platformLocation.pathname;
    this._platformLocation.pushState(state, title, url);
  }
  replaceState(state, title, path, queryParams) {
    const url =
      this.prepareExternalUrl(path + normalizeQueryParams(queryParams)) ||
      this._platformLocation.pathname;
    this._platformLocation.replaceState(state, title, url);
  }
  forward() {
    this._platformLocation.forward();
  }
  back() {
    this._platformLocation.back();
  }
  getState() {
    return this._platformLocation.getState();
  }
  historyGo(relativePosition = 0) {
    this._platformLocation.historyGo?.(relativePosition);
  }
};
HashLocationStrategy = __decorate(
  [Injectable(), __param(1, Optional()), __param(1, Inject(APP_BASE_HREF))],
  HashLocationStrategy,
);
export {HashLocationStrategy};
//# sourceMappingURL=hash_location_strategy.js.map
