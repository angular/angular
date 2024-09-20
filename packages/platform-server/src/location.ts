/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DOCUMENT,
  LocationChangeEvent,
  LocationChangeListener,
  PlatformLocation,
  ɵgetDOM as getDOM,
} from '@angular/common';
import {Inject, Injectable, Optional, ɵWritable as Writable} from '@angular/core';
import {Subject} from 'rxjs';

import {INITIAL_CONFIG, PlatformConfig} from './tokens';

const RESOLVE_PROTOCOL = 'resolve:';

function parseUrl(urlStr: string): {
  hostname: string;
  protocol: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
} {
  const {hostname, protocol, port, pathname, search, hash} = new URL(
    urlStr,
    RESOLVE_PROTOCOL + '//',
  );

  return {
    hostname,
    protocol: protocol === RESOLVE_PROTOCOL ? '' : protocol,
    port,
    pathname,
    search,
    hash,
  };
}

/**
 * Server-side implementation of URL state. Implements `pathname`, `search`, and `hash`
 * but not the state stack.
 */
@Injectable()
export class ServerPlatformLocation implements PlatformLocation {
  public readonly href: string = '/';
  public readonly hostname: string = '/';
  public readonly protocol: string = '/';
  public readonly port: string = '/';
  public readonly pathname: string = '/';
  public readonly search: string = '';
  public readonly hash: string = '';
  private _hashUpdate = new Subject<LocationChangeEvent>();

  constructor(
    @Inject(DOCUMENT) private _doc: any,
    @Optional() @Inject(INITIAL_CONFIG) _config: any,
  ) {
    const config = _config as PlatformConfig | null;
    if (!config) {
      return;
    }
    if (config.url) {
      const url = parseUrl(config.url);
      this.protocol = url.protocol;
      this.hostname = url.hostname;
      this.port = url.port;
      this.pathname = url.pathname;
      this.search = url.search;
      this.hash = url.hash;
      this.href = _doc.location.href;
    }
  }

  getBaseHrefFromDOM(): string {
    return getDOM().getBaseHref(this._doc)!;
  }

  onPopState(fn: LocationChangeListener): VoidFunction {
    // No-op: a state stack is not implemented, so
    // no events will ever come.
    return () => {};
  }

  onHashChange(fn: LocationChangeListener): VoidFunction {
    const subscription = this._hashUpdate.subscribe(fn);
    return () => subscription.unsubscribe();
  }

  get url(): string {
    return `${this.pathname}${this.search}${this.hash}`;
  }

  private setHash(value: string, oldUrl: string) {
    if (this.hash === value) {
      // Don't fire events if the hash has not changed.
      return;
    }
    (this as Writable<this>).hash = value;
    const newUrl = this.url;
    queueMicrotask(() =>
      this._hashUpdate.next({
        type: 'hashchange',
        state: null,
        oldUrl,
        newUrl,
      } as LocationChangeEvent),
    );
  }

  replaceState(state: any, title: string, newUrl: string): void {
    const oldUrl = this.url;
    const parsedUrl = parseUrl(newUrl);
    (this as Writable<this>).pathname = parsedUrl.pathname;
    (this as Writable<this>).search = parsedUrl.search;
    this.setHash(parsedUrl.hash, oldUrl);
  }

  pushState(state: any, title: string, newUrl: string): void {
    this.replaceState(state, title, newUrl);
  }

  forward(): void {
    throw new Error('Not implemented');
  }

  back(): void {
    throw new Error('Not implemented');
  }

  // History API isn't available on server, therefore return undefined
  getState(): unknown {
    return undefined;
  }
}
