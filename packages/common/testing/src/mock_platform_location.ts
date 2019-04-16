/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LocationChangeEvent, LocationChangeListener, PlatformLocation} from '@angular/common';
import {Injectable, InjectionToken, Optional} from '@angular/core';
import {Subject} from 'rxjs';

function parseUrl(urlStr: string, baseHref: string) {
  const verifyProtocol = /^((http[s]?|ftp):\/\/)/;
  let serverBase;

  // URL class requires full URL. If the URL string doesn't start with protocol, we need to add
  // an arbitrary base URL which can be removed afterward.
  if (!verifyProtocol.test(urlStr)) {
    serverBase = 'http://empty.com/';
  }
  const parsedUrl = new URL(urlStr, serverBase);
  if (parsedUrl.pathname && parsedUrl.pathname.indexOf(baseHref) === 0) {
    parsedUrl.pathname = parsedUrl.pathname.substring(baseHref.length);
  }
  return {
    hostname: !serverBase && parsedUrl.hostname || '',
    protocol: !serverBase && parsedUrl.protocol || '',
    port: !serverBase && parsedUrl.port || '',
    pathname: parsedUrl.pathname || '/',
    search: parsedUrl.search || '',
    hash: parsedUrl.hash || '',
  };
}

export interface MockPlatformLocationConfig {
  startUrl?: string;
  appBaseHref?: string;
}

export const MOCK_PLATFORM_LOCATION_CONFIG = new InjectionToken('MOCK_PLATFORM_LOCATION_CONFIG');

/**
 * Mock implementation of URL state.
 */
@Injectable()
export class MockPlatformLocation implements PlatformLocation {
  private baseHref: string = '';
  private hashUpdate = new Subject<LocationChangeEvent>();
  private urlChanges: {
    hostname: string,
    protocol: string,
    port: string,
    pathname: string,
    search: string,
    hash: string,
    state: unknown
  }[] = [{hostname: '', protocol: '', port: '', pathname: '/', search: '', hash: '', state: null}];

  constructor(@Optional() config?: MockPlatformLocationConfig) {
    if (config) {
      this.baseHref = config.appBaseHref || '';

      const parsedChanges =
          this.parseChanges(null, config.startUrl || 'http://<empty>/', this.baseHref);
      this.urlChanges[0] = {...parsedChanges};
    }
  }

  get hostname() { return this.urlChanges[0].hostname; }
  get protocol() { return this.urlChanges[0].protocol; }
  get port() { return this.urlChanges[0].port; }
  get pathname() { return this.urlChanges[0].pathname; }
  get search() { return this.urlChanges[0].search; }
  get hash() { return this.urlChanges[0].hash; }
  get state() { return this.urlChanges[0].state; }


  getBaseHrefFromDOM(): string { return this.baseHref; }

  onPopState(fn: LocationChangeListener): void {
    // No-op: a state stack is not implemented, so
    // no events will ever come.
  }

  onHashChange(fn: LocationChangeListener): void { this.hashUpdate.subscribe(fn); }

  get href(): string {
    let url = `${this.protocol}//${this.hostname}${this.port ? ':' + this.port : ''}`;
    url += `${this.pathname === '/' ? '' : this.pathname}${this.search}${this.hash}`
    return url;
  }

  get url(): string { return `${this.pathname}${this.search}${this.hash}`; }

  private setHash(value: string, oldUrl: string) {
    if (this.hash === value) {
      // Don't fire events if the hash has not changed.
      return;
    }
    (this as{hash: string}).hash = value;
    const newUrl = this.url;
    scheduleMicroTask(() => this.hashUpdate.next({
      type: 'hashchange', state: null, oldUrl, newUrl
    } as LocationChangeEvent));
  }

  private parseChanges(state: unknown, url: string, baseHref: string = '') {
    // When the `history.state` value is stored, it is always copied.
    state = JSON.parse(JSON.stringify(state));
    return {...parseUrl(url, baseHref), state};
  }

  replaceState(state: any, title: string, newUrl: string): void {
    const oldUrl = this.url;

    const {pathname, search, state: parsedState, hash} = this.parseChanges(state, newUrl);

    this.urlChanges[0] = {...this.urlChanges[0], pathname, search, state: parsedState};
    this.setHash(hash, oldUrl);
  }

  pushState(state: any, title: string, newUrl: string): void {
    const {pathname, search, state: parsedState, hash} = this.parseChanges(state, newUrl);
    this.urlChanges.unshift({...this.urlChanges[0], pathname, search, state: parsedState});
  }

  forward(): void { throw new Error('Not implemented'); }

  back(): void { this.urlChanges.shift(); }

  // History API isn't available on server, therefore return undefined
  getState(): unknown { return this.state; }
}

export function scheduleMicroTask(cb: () => any) {
  Promise.resolve(null).then(cb);
}