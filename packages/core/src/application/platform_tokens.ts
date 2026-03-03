/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '../di/injection_token';

/**
 * Injection token representing the current HTTP request object.
 *
 * Use this token to access the current request when handling server-side
 * rendering (SSR).
 *
 * @remarks
 * This token may be `null` in the following scenarios:
 *
 * * During the build processes.
 * * When the application is rendered in the browser (client-side rendering).
 * * When performing static site generation (SSG).
 * * During route extraction in development (at the time of the request).
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Request `Request` on MDN}
 *
 * @see [Accessing Request and Response via DI](guide/ssr#accessing-request-and-response-via-di)
 *
 * @publicApi
 */
export const REQUEST = new InjectionToken<Request | null>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'REQUEST' : '',
  {
    providedIn: 'platform',
    factory: () => null,
  },
);

/**
 * Type that represents the initialization options for a response.
 *
 * @publicApi
 */
export type ResponseInit = {
  // This is needed as `@types/node` and Undici marks all these properties as readonly. This is not the case in lib.dom.d.ts
  -readonly [P in keyof globalThis.ResponseInit]: globalThis.ResponseInit[P];
};

/**
 * Injection token for response initialization options.
 *
 * Use this token to provide response options for configuring or initializing
 * HTTP responses in server-side rendering or API endpoints.
 *
 * @remarks
 * This token may be `null` in the following scenarios:
 *
 * * During the build processes.
 * * When the application is rendered in the browser (client-side rendering).
 * * When performing static site generation (SSG).
 * * During route extraction in development (at the time of the request).
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response/Response `ResponseInit` on MDN}
 *
 * @publicApi
 * @see [Accessing Request and Response via DI](guide/ssr#accessing-request-and-response-via-di)
 */
export const RESPONSE_INIT = new InjectionToken<ResponseInit | null>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'RESPONSE_INIT' : '',
  {
    providedIn: 'platform',
    factory: () => null,
  },
);

/**
 * Injection token for additional request context.
 *
 * Use this token to pass custom metadata or context related to the current request in server-side rendering.
 *
 * @remarks
 * This token is only available during server-side rendering and will be `null` in other contexts.
 *
 * @publicApi
 * @see [Accessing Request and Response via DI](guide/ssr#accessing-request-and-response-via-di)
 */
export const REQUEST_CONTEXT = new InjectionToken<unknown>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'REQUEST_CONTEXT' : '',
  {
    providedIn: 'platform',
    factory: () => null,
  },
);
