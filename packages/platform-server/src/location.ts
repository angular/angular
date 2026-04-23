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
 * Returns the path + query + fragment portion of an untrusted URL-or-path
 * input, discarding any authority the input carries.
 *
 * Security: `INITIAL_CONFIG.url` is populated from `req.url` in SSR handlers.
 * Node preserves absolute-form request-targets (RFC 9112 §3.2.2) in `req.url`
 * verbatim, so attacker-controlled cross-origin inputs (`http://attacker/...`,
 * `//evil/...`, `\\evil/...`) can reach here. The hard-coded `http://localhost/`
 * base is a scaffold for the WHATWG URL parser only; its host never appears in
 * the return value.
 */
export function sanitizeConfigUrl(raw: string | undefined): string {
  try {
    const u = new URL(raw || '/', 'http://localhost/');
    const path = u.pathname.startsWith('/') ? u.pathname : '/' + u.pathname;
    return path + u.search + u.hash;
  } catch {
    return '/';
  }
}

/**
 * Normalizes a trusted-origin configuration string (such as
 * `INITIAL_CONFIG.publicOrigin`) to a bare `scheme://host[:port]` origin.
 *
 * Returns `null` for inputs that are empty, unparseable, or whose scheme is
 * not `http:`/`https:`. Any path, query, fragment, or credentials present in
 * the input are discarded — only the origin is retained.
 */
export function sanitizeOrigin(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.origin;
  } catch {
    return null;
  }
}

/**
 * Resolves a same-origin path within the platform origin.
 * The input is first sanitized to drop any cross-origin authority.
 */
function parseUrl(urlStr: string, origin: string): URL {
  return new URL(sanitizeConfigUrl(urlStr), origin);
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
  // Authority reflected on `PlatformLocation` and used by the SSR HTTP
  // interceptor comes from the operator-supplied `publicOrigin` only.
  // `INITIAL_CONFIG.url` is considered untrusted (attacker-controlled via
  // `req.url`) and never contributes to authority, even in absolute form.
  private _trustedOrigin =
    sanitizeOrigin(inject(INITIAL_CONFIG, {optional: true})?.publicOrigin) ??
    this._doc.location.origin;

  constructor() {
    const config = inject(INITIAL_CONFIG, {optional: true});
    if (!config) {
      return;
    }
    if (config.url || config.publicOrigin) {
      const {protocol, hostname, port, pathname, search, hash, href} = parseUrl(
        config.url ?? '',
        this._trustedOrigin,
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
    const {pathname, search, hash, href, protocol} = parseUrl(newUrl, this._trustedOrigin);
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
