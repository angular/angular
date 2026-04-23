/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';

/**
 * Config object passed to initialize the platform.
 *
 * @publicApi
 */
export interface PlatformConfig {
  /**
   * The initial DOM to use to bootstrap the server application.
   * @default create a new DOM using Domino
   */
  document?: string;
  /**
   * The request target for the current application state (path, query, and
   * fragment). This is used for initializing the router's URL.
   *
   * Security: any authority (scheme, host, port, credentials) present in this
   * value is stripped before use, because SSR handlers typically populate it
   * from `req.url`, which an attacker can control via absolute-form
   * request-targets (RFC 9112 §3.2.2). Use `publicOrigin` to configure the
   * trusted origin of the server instead.
   * @default none
   */
  url?: string;
  /**
   * The trusted origin (scheme + host + port) of the server that clients
   * reach — for example `'https://my-site.com'` or `'http://localhost:4200'`.
   * Populates `PlatformLocation.{protocol, hostname, port, href}` and is used
   * by the SSR HTTP interceptor as the base when rewriting relative
   * `HttpClient` URLs.
   *
   * Security: this MUST be a server-controlled constant (env var, deployment
   * config). NEVER derive it from request headers, `req.url`, or any other
   * value an HTTP client can influence, or you reintroduce SSRF.
   *
   * Accepted values are parsed with the WHATWG URL parser. Any path, query,
   * fragment, credentials, or non-`http(s)` scheme present in the input is
   * discarded and, if the remainder isn't a valid origin, the property falls
   * back to the platform default.
   * @default none
   */
  publicOrigin?: string;
}

/**
 * The DI token for setting the initial config for the platform.
 *
 * @publicApi
 */
export const INITIAL_CONFIG = new InjectionToken<PlatformConfig>('Server.INITIAL_CONFIG');

/**
 * A function that will be executed when calling `renderApplication` or
 * `renderModule` just before current platform state is rendered to string.
 *
 * @publicApi
 */
export const BEFORE_APP_SERIALIZED = new InjectionToken<ReadonlyArray<() => void | Promise<void>>>(
  'Server.RENDER_MODULE_HOOK',
);

export const ENABLE_DOM_EMULATION = new InjectionToken<boolean>('ENABLE_DOM_EMULATION');
