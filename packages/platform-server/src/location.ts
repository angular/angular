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
import {inject, Injectable, ɵWritable as Writable} from '@angular/core';
import {Subject} from 'rxjs';

import {INITIAL_CONFIG} from './tokens';

/**
 * Parses a URL string and returns a URL object.
 * @param urlStr The string to parse.
 * @param origin The origin to use for resolving the URL.
 * @returns The parsed URL.
 */
export function parseUrl(urlStr: string, origin: string): URL {
  if (URL.canParse(urlStr)) {
    return new URL(urlStr);
  }

  if (urlStr && urlStr[0] !== '/') {
    urlStr = `/${urlStr}`;
  }

  return new URL(origin + urlStr);
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
  private _doc = inject(DOCUMENT);

  constructor() {
    const config = inject(INITIAL_CONFIG, {optional: true});
    if (!config) {
      return;
    }
    if (config.url) {
      const {protocol, hostname, port, pathname, search, hash, href} = parseUrl(
        config.url,
        this._doc.location.origin,
      );
      this.protocol = protocol;
      this.hostname = hostname;
      this.port = port;
      this.pathname = pathname;
      this.search = search;
      this.hash = hash;
      this.href = href;
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
    const {pathname, search, hash, href, protocol} = parseUrl(newUrl, this._doc.location.origin);
    const writableThis = this as Writable<this>;
    writableThis.pathname = pathname;
    writableThis.search = search;
    writableThis.href = href;
    writableThis.protocol = protocol;
    this.setHash(hash, oldUrl);
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
