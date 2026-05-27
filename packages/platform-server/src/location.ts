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
import {inject, Injectable, Injector, ɵWritable as Writable} from '@angular/core';
import {Subject} from 'rxjs';

import {INITIAL_CONFIG} from './tokens';
import {getSafeUrl, parseAndValidateAbsoluteUrl} from './url';

const LEADING_SLASHES_REGEX = /^[/\\]+/;

/**
 * Parses a URL string and returns a URL components object.
 * @param urlStr The string to parse.
 * @param origin The origin to use for resolving the URL (optional).
 * @returns The parsed URL components.
 */
export function parseUrl(
  urlStr: string,
  origin?: string,
): {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  href: string;
  origin: string;
} {
  const parsedUrl = parseAndValidateAbsoluteUrl(urlStr);
  if (parsedUrl !== null) {
    return {
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      pathname: parsedUrl.pathname,
      search: parsedUrl.search,
      hash: parsedUrl.hash,
      href: parsedUrl.href,
      origin: parsedUrl.origin,
    };
  }

  if (urlStr) {
    urlStr = '/' + urlStr.replace(LEADING_SLASHES_REGEX, '');
  }

  if (origin) {
    try {
      const url = new URL(urlStr, origin);
      return {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        href: url.href,
        origin: url.origin,
      };
    } catch {
      // Fallback to simple parser if origin is not a valid base (e.g. 'null')
    }
  }

  const hashIdx = urlStr.indexOf('#');
  const hash = hashIdx !== -1 ? urlStr.substring(hashIdx) : '';
  const withoutHash = hashIdx !== -1 ? urlStr.substring(0, hashIdx) : urlStr;

  const queryIdx = withoutHash.indexOf('?');
  const search = queryIdx !== -1 ? withoutHash.substring(queryIdx) : '';
  const pathname = queryIdx !== -1 ? withoutHash.substring(0, queryIdx) : withoutHash;

  return {
    protocol: '',
    hostname: '',
    port: '',
    pathname,
    search,
    hash,
    href: urlStr,
    origin: '',
  };
}

/**
 * Server-side implementation of URL state. Implements `pathname`, `search`, and
 * `hash`
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
  private injector = inject(Injector);
  private get _doc(): any {
    return this.injector.get(DOCUMENT);
  }

  constructor() {
    const config = inject(INITIAL_CONFIG, {optional: true});
    if (!config) {
      return;
    }
    if (config.url) {
      const safeUrl = getSafeUrl(config.url);
      if (safeUrl) {
        const {protocol, hostname, port, pathname, search, hash, href} = parseUrl(safeUrl);
        this.protocol = protocol;
        this.hostname = hostname;
        this.port = port;
        this.pathname = pathname;
        this.search = search;
        this.hash = hash;
        this.href = href;
      }
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
