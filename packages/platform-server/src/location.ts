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

function parseUrl(
  urlStr: string,
  origin: string,
): {
  hostname: string;
  protocol: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  href: string;
} {
  let isAbsolute = false;
  try {
    new URL(urlStr);
    isAbsolute = true;
  } catch {}

  const parsedUrl = new URL(urlStr, origin);

  // Security: if the input is not an absolute URL (i.e. it is relative),
  // ensure it cannot override the origin's hostname, protocol, or port.
  // This prevents SSRF via protocol-relative URLs (//evil.com) and
  // backslash bypass URLs (/\evil.com) which the WHATWG URL parser
  // normalizes into authority-changing URLs.
  if (!isAbsolute) {
    let originUrl: URL;
    try {
      originUrl = new URL(origin);
    } catch {
      // If origin itself is not a valid URL (e.g. 'undefined://'),
      // fall through and return parsed values as-is since the
      // interceptor's protocol check will reject non-http protocols.
      return {
        hostname: parsedUrl.hostname,
        href: parsedUrl.href,
        protocol: parsedUrl.protocol,
        port: parsedUrl.port,
        pathname: parsedUrl.pathname,
        search: parsedUrl.search,
        hash: parsedUrl.hash,
      };
    }

    if (
      parsedUrl.hostname !== originUrl.hostname ||
      parsedUrl.protocol !== originUrl.protocol ||
      parsedUrl.port !== originUrl.port
    ) {
      // Neutralize the hostname override: keep only the path components
      // from the user input but use the origin's host identity.
      const safeUrl = new URL(parsedUrl.pathname + parsedUrl.search + parsedUrl.hash, origin);
      return {
        hostname: safeUrl.hostname,
        href: safeUrl.href,
        protocol: safeUrl.protocol,
        port: safeUrl.port,
        pathname: safeUrl.pathname,
        search: safeUrl.search,
        hash: safeUrl.hash,
      };
    }
  }

  return {
    hostname: parsedUrl.hostname,
    href: parsedUrl.href,
    protocol: parsedUrl.protocol,
    port: parsedUrl.port,
    pathname: parsedUrl.pathname,
    search: parsedUrl.search,
    hash: parsedUrl.hash,
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
  private _doc = inject(DOCUMENT);

  constructor() {
    const config = inject(INITIAL_CONFIG, {optional: true});
    if (!config) {
      return;
    }
    if (config.url) {
      const url = parseUrl(config.url, this._doc.location.origin);
      this.protocol = url.protocol;
      this.hostname = url.hostname;
      this.port = url.port;
      this.pathname = url.pathname;
      this.search = url.search;
      this.hash = url.hash;
      this.href = url.href;
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
    const parsedUrl = parseUrl(newUrl, this._doc.location.origin);
    (this as Writable<this>).pathname = parsedUrl.pathname;
    (this as Writable<this>).search = parsedUrl.search;
    (this as Writable<this>).href = parsedUrl.href;
    (this as Writable<this>).protocol = parsedUrl.protocol;
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
