/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {LocationStrategy} from '@angular/common';
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
/**
 * A mock implementation of {@link LocationStrategy} that allows tests to fire simulated
 * location events.
 *
 * @publicApi
 */
let MockLocationStrategy = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = LocationStrategy;
  var MockLocationStrategy = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      MockLocationStrategy = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    internalBaseHref = '/';
    internalPath = '/';
    internalTitle = '';
    urlChanges = [];
    /** @internal */
    _subject = new Subject();
    stateChanges = [];
    constructor() {
      super();
    }
    simulatePopState(url) {
      this.internalPath = url;
      this._subject.next(new _MockPopStateEvent(this.path()));
    }
    path(includeHash = false) {
      return this.internalPath;
    }
    prepareExternalUrl(internal) {
      if (internal.startsWith('/') && this.internalBaseHref.endsWith('/')) {
        return this.internalBaseHref + internal.substring(1);
      }
      return this.internalBaseHref + internal;
    }
    pushState(ctx, title, path, query) {
      // Add state change to changes array
      this.stateChanges.push(ctx);
      this.internalTitle = title;
      const url = path + (query.length > 0 ? '?' + query : '');
      this.internalPath = url;
      const externalUrl = this.prepareExternalUrl(url);
      this.urlChanges.push(externalUrl);
    }
    replaceState(ctx, title, path, query) {
      // Reset the last index of stateChanges to the ctx (state) object
      this.stateChanges[(this.stateChanges.length || 1) - 1] = ctx;
      this.internalTitle = title;
      const url = path + (query.length > 0 ? '?' + query : '');
      this.internalPath = url;
      const externalUrl = this.prepareExternalUrl(url);
      this.urlChanges.push('replace: ' + externalUrl);
    }
    onPopState(fn) {
      this._subject.subscribe({next: fn});
    }
    getBaseHref() {
      return this.internalBaseHref;
    }
    back() {
      if (this.urlChanges.length > 0) {
        this.urlChanges.pop();
        this.stateChanges.pop();
        const nextUrl =
          this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
        this.simulatePopState(nextUrl);
      }
    }
    forward() {
      throw 'not implemented';
    }
    getState() {
      return this.stateChanges[(this.stateChanges.length || 1) - 1];
    }
  };
  return (MockLocationStrategy = _classThis);
})();
export {MockLocationStrategy};
class _MockPopStateEvent {
  newUrl;
  pop = true;
  type = 'popstate';
  constructor(newUrl) {
    this.newUrl = newUrl;
  }
}
//# sourceMappingURL=mock_location_strategy.js.map
