/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ɵnormalizeQueryParams as normalizeQueryParams} from '@angular/common';
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
/**
 * A spy for {@link Location} that allows tests to fire simulated location events.
 *
 * @publicApi
 */
let SpyLocation = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var SpyLocation = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      SpyLocation = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    urlChanges = [];
    _history = [new LocationState('', '', null)];
    _historyIndex = 0;
    /** @internal */
    _subject = new Subject();
    /** @internal */
    _basePath = '';
    /** @internal */
    _locationStrategy = null;
    /** @internal */
    _urlChangeListeners = [];
    /** @internal */
    _urlChangeSubscription = null;
    /** @docs-private */
    ngOnDestroy() {
      this._urlChangeSubscription?.unsubscribe();
      this._urlChangeListeners = [];
    }
    setInitialPath(url) {
      this._history[this._historyIndex].path = url;
    }
    setBaseHref(url) {
      this._basePath = url;
    }
    path() {
      return this._history[this._historyIndex].path;
    }
    getState() {
      return this._history[this._historyIndex].state;
    }
    isCurrentPathEqualTo(path, query = '') {
      const givenPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
      const currPath = this.path().endsWith('/')
        ? this.path().substring(0, this.path().length - 1)
        : this.path();
      return currPath == givenPath + (query.length > 0 ? '?' + query : '');
    }
    simulateUrlPop(pathname) {
      this._subject.next({'url': pathname, 'pop': true, 'type': 'popstate'});
    }
    simulateHashChange(pathname) {
      const path = this.prepareExternalUrl(pathname);
      this.pushHistory(path, '', null);
      this.urlChanges.push('hash: ' + pathname);
      // the browser will automatically fire popstate event before each `hashchange` event, so we need
      // to simulate it.
      this._subject.next({'url': pathname, 'pop': true, 'type': 'popstate'});
      this._subject.next({'url': pathname, 'pop': true, 'type': 'hashchange'});
    }
    prepareExternalUrl(url) {
      if (url.length > 0 && !url.startsWith('/')) {
        url = '/' + url;
      }
      return this._basePath + url;
    }
    go(path, query = '', state = null) {
      path = this.prepareExternalUrl(path);
      this.pushHistory(path, query, state);
      const locationState = this._history[this._historyIndex - 1];
      if (locationState.path == path && locationState.query == query) {
        return;
      }
      const url = path + (query.length > 0 ? '?' + query : '');
      this.urlChanges.push(url);
      this._notifyUrlChangeListeners(path + normalizeQueryParams(query), state);
    }
    replaceState(path, query = '', state = null) {
      path = this.prepareExternalUrl(path);
      const history = this._history[this._historyIndex];
      history.state = state;
      if (history.path == path && history.query == query) {
        return;
      }
      history.path = path;
      history.query = query;
      const url = path + (query.length > 0 ? '?' + query : '');
      this.urlChanges.push('replace: ' + url);
      this._notifyUrlChangeListeners(path + normalizeQueryParams(query), state);
    }
    forward() {
      if (this._historyIndex < this._history.length - 1) {
        this._historyIndex++;
        this._subject.next({
          'url': this.path(),
          'state': this.getState(),
          'pop': true,
          'type': 'popstate',
        });
      }
    }
    back() {
      if (this._historyIndex > 0) {
        this._historyIndex--;
        this._subject.next({
          'url': this.path(),
          'state': this.getState(),
          'pop': true,
          'type': 'popstate',
        });
      }
    }
    historyGo(relativePosition = 0) {
      const nextPageIndex = this._historyIndex + relativePosition;
      if (nextPageIndex >= 0 && nextPageIndex < this._history.length) {
        this._historyIndex = nextPageIndex;
        this._subject.next({
          'url': this.path(),
          'state': this.getState(),
          'pop': true,
          'type': 'popstate',
        });
      }
    }
    onUrlChange(fn) {
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
    _notifyUrlChangeListeners(url = '', state) {
      this._urlChangeListeners.forEach((fn) => fn(url, state));
    }
    subscribe(onNext, onThrow, onReturn) {
      return this._subject.subscribe({
        next: onNext,
        error: onThrow ?? undefined,
        complete: onReturn ?? undefined,
      });
    }
    normalize(url) {
      return null;
    }
    pushHistory(path, query, state) {
      if (this._historyIndex > 0) {
        this._history.splice(this._historyIndex + 1);
      }
      this._history.push(new LocationState(path, query, state));
      this._historyIndex = this._history.length - 1;
    }
  };
  return (SpyLocation = _classThis);
})();
export {SpyLocation};
class LocationState {
  path;
  query;
  state;
  constructor(path, query, state) {
    this.path = path;
    this.query = query;
    this.state = state;
  }
}
//# sourceMappingURL=location_mock.js.map
