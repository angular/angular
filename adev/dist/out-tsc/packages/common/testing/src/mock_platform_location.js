/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {PlatformNavigation} from '../../index';
import {inject, Injectable, InjectionToken} from '@angular/core';
import {Subject} from 'rxjs';
import {FakeNavigation} from './navigation/fake_navigation';
/**
 * Parser from https://tools.ietf.org/html/rfc3986#appendix-B
 * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
 *  12            3  4          5       6  7        8 9
 *
 * Example: http://www.ics.uci.edu/pub/ietf/uri/#Related
 *
 * Results in:
 *
 * $1 = http:
 * $2 = http
 * $3 = //www.ics.uci.edu
 * $4 = www.ics.uci.edu
 * $5 = /pub/ietf/uri/
 * $6 = <undefined>
 * $7 = <undefined>
 * $8 = #Related
 * $9 = Related
 */
const urlParse = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
function parseUrl(urlStr, baseHref) {
  const verifyProtocol = /^((http[s]?|ftp):\/\/)/;
  let serverBase;
  // URL class requires full URL. If the URL string doesn't start with protocol, we need to add
  // an arbitrary base URL which can be removed afterward.
  if (!verifyProtocol.test(urlStr)) {
    serverBase = 'http://empty.com/';
  }
  let parsedUrl;
  try {
    parsedUrl = new URL(urlStr, serverBase);
  } catch (e) {
    const result = urlParse.exec(serverBase || '' + urlStr);
    if (!result) {
      throw new Error(`Invalid URL: ${urlStr} with base: ${baseHref}`);
    }
    const hostSplit = result[4].split(':');
    parsedUrl = {
      protocol: result[1],
      hostname: hostSplit[0],
      port: hostSplit[1] || '',
      pathname: result[5],
      search: result[6],
      hash: result[8],
    };
  }
  if (parsedUrl.pathname && parsedUrl.pathname.indexOf(baseHref) === 0) {
    parsedUrl.pathname = parsedUrl.pathname.substring(baseHref.length);
  }
  return {
    hostname: (!serverBase && parsedUrl.hostname) || '',
    protocol: (!serverBase && parsedUrl.protocol) || '',
    port: (!serverBase && parsedUrl.port) || '',
    pathname: parsedUrl.pathname || '/',
    search: parsedUrl.search || '',
    hash: parsedUrl.hash || '',
  };
}
/**
 * Provider for mock platform location config
 *
 * @publicApi
 */
export const MOCK_PLATFORM_LOCATION_CONFIG = new InjectionToken('MOCK_PLATFORM_LOCATION_CONFIG');
/**
 * Mock implementation of URL state.
 *
 * @publicApi
 */
let MockPlatformLocation = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var MockPlatformLocation = class {
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
      MockPlatformLocation = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    baseHref = '';
    hashUpdate = new Subject();
    popStateSubject = new Subject();
    urlChangeIndex = 0;
    urlChanges = [
      {hostname: '', protocol: '', port: '', pathname: '/', search: '', hash: '', state: null},
    ];
    constructor(config) {
      if (config) {
        this.baseHref = config.appBaseHref || '';
        const parsedChanges = this.parseChanges(
          null,
          config.startUrl || 'http://_empty_/',
          this.baseHref,
        );
        this.urlChanges[0] = {...parsedChanges};
      }
    }
    get hostname() {
      return this.urlChanges[this.urlChangeIndex].hostname;
    }
    get protocol() {
      return this.urlChanges[this.urlChangeIndex].protocol;
    }
    get port() {
      return this.urlChanges[this.urlChangeIndex].port;
    }
    get pathname() {
      return this.urlChanges[this.urlChangeIndex].pathname;
    }
    get search() {
      return this.urlChanges[this.urlChangeIndex].search;
    }
    get hash() {
      return this.urlChanges[this.urlChangeIndex].hash;
    }
    get state() {
      return this.urlChanges[this.urlChangeIndex].state;
    }
    getBaseHrefFromDOM() {
      return this.baseHref;
    }
    onPopState(fn) {
      const subscription = this.popStateSubject.subscribe(fn);
      return () => subscription.unsubscribe();
    }
    onHashChange(fn) {
      const subscription = this.hashUpdate.subscribe(fn);
      return () => subscription.unsubscribe();
    }
    get href() {
      let url = `${this.protocol}//${this.hostname}${this.port ? ':' + this.port : ''}`;
      url += `${this.pathname === '/' ? '' : this.pathname}${this.search}${this.hash}`;
      return url;
    }
    get url() {
      return `${this.pathname}${this.search}${this.hash}`;
    }
    parseChanges(state, url, baseHref = '') {
      // When the `history.state` value is stored, it is always copied.
      state = JSON.parse(JSON.stringify(state));
      return {...parseUrl(url, baseHref), state};
    }
    replaceState(state, title, newUrl) {
      const {pathname, search, state: parsedState, hash} = this.parseChanges(state, newUrl);
      this.urlChanges[this.urlChangeIndex] = {
        ...this.urlChanges[this.urlChangeIndex],
        pathname,
        search,
        hash,
        state: parsedState,
      };
    }
    pushState(state, title, newUrl) {
      const {pathname, search, state: parsedState, hash} = this.parseChanges(state, newUrl);
      if (this.urlChangeIndex > 0) {
        this.urlChanges.splice(this.urlChangeIndex + 1);
      }
      this.urlChanges.push({
        ...this.urlChanges[this.urlChangeIndex],
        pathname,
        search,
        hash,
        state: parsedState,
      });
      this.urlChangeIndex = this.urlChanges.length - 1;
    }
    forward() {
      const oldUrl = this.url;
      const oldHash = this.hash;
      if (this.urlChangeIndex < this.urlChanges.length) {
        this.urlChangeIndex++;
      }
      this.emitEvents(oldHash, oldUrl);
    }
    back() {
      const oldUrl = this.url;
      const oldHash = this.hash;
      if (this.urlChangeIndex > 0) {
        this.urlChangeIndex--;
      }
      this.emitEvents(oldHash, oldUrl);
    }
    historyGo(relativePosition = 0) {
      const oldUrl = this.url;
      const oldHash = this.hash;
      const nextPageIndex = this.urlChangeIndex + relativePosition;
      if (nextPageIndex >= 0 && nextPageIndex < this.urlChanges.length) {
        this.urlChangeIndex = nextPageIndex;
      }
      this.emitEvents(oldHash, oldUrl);
    }
    getState() {
      return this.state;
    }
    /**
     * Browsers are inconsistent in when they fire events and perform the state updates
     * The most easiest thing to do in our mock is synchronous and that happens to match
     * Firefox and Chrome, at least somewhat closely
     *
     * https://github.com/WICG/navigation-api#watching-for-navigations
     * https://docs.google.com/document/d/1Pdve-DJ1JCGilj9Yqf5HxRJyBKSel5owgOvUJqTauwU/edit#heading=h.3ye4v71wsz94
     * popstate is always sent before hashchange:
     * https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event#when_popstate_is_sent
     */
    emitEvents(oldHash, oldUrl) {
      this.popStateSubject.next({
        type: 'popstate',
        state: this.getState(),
        oldUrl,
        newUrl: this.url,
      });
      if (oldHash !== this.hash) {
        this.hashUpdate.next({
          type: 'hashchange',
          state: null,
          oldUrl,
          newUrl: this.url,
        });
      }
    }
  };
  return (MockPlatformLocation = _classThis);
})();
export {MockPlatformLocation};
/**
 * Mock implementation of URL state.
 */
let FakeNavigationPlatformLocation = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var FakeNavigationPlatformLocation = class {
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
      FakeNavigationPlatformLocation = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _platformNavigation;
    constructor() {
      const platformNavigation = inject(PlatformNavigation);
      if (!(platformNavigation instanceof FakeNavigation)) {
        throw new Error(
          'FakePlatformNavigation cannot be used without FakeNavigation. Use ' +
            '`provideFakeNavigation` to have all these services provided together.',
        );
      }
      this._platformNavigation = platformNavigation;
    }
    config = inject(MOCK_PLATFORM_LOCATION_CONFIG, {optional: true});
    getBaseHrefFromDOM() {
      return this.config?.appBaseHref ?? '';
    }
    onPopState(fn) {
      this._platformNavigation.window.addEventListener('popstate', fn);
      return () => this._platformNavigation.window.removeEventListener('popstate', fn);
    }
    onHashChange(fn) {
      this._platformNavigation.window.addEventListener('hashchange', fn);
      return () => this._platformNavigation.window.removeEventListener('hashchange', fn);
    }
    get href() {
      return this._platformNavigation.currentEntry.url;
    }
    get protocol() {
      return new URL(this._platformNavigation.currentEntry.url).protocol;
    }
    get hostname() {
      return new URL(this._platformNavigation.currentEntry.url).hostname;
    }
    get port() {
      return new URL(this._platformNavigation.currentEntry.url).port;
    }
    get pathname() {
      return new URL(this._platformNavigation.currentEntry.url).pathname;
    }
    get search() {
      return new URL(this._platformNavigation.currentEntry.url).search;
    }
    get hash() {
      return new URL(this._platformNavigation.currentEntry.url).hash;
    }
    pushState(state, title, url) {
      this._platformNavigation.pushState(state, title, url);
    }
    replaceState(state, title, url) {
      this._platformNavigation.replaceState(state, title, url);
    }
    forward() {
      this._platformNavigation.forward();
    }
    back() {
      this._platformNavigation.back();
    }
    historyGo(relativePosition = 0) {
      this._platformNavigation.go(relativePosition);
    }
    getState() {
      return this._platformNavigation.currentEntry.getHistoryState();
    }
  };
  return (FakeNavigationPlatformLocation = _classThis);
})();
export {FakeNavigationPlatformLocation};
//# sourceMappingURL=mock_platform_location.js.map
