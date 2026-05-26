/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';

import {ɵHTTP_FETCH_MAX_RESPONSE_SIZE as HTTP_FETCH_MAX_RESPONSE_SIZE} from '@angular/common/http';
import {PLATFORM_SERVER_PROVIDERS} from './server';

/**
 * Sets up providers necessary to enable server rendering functionality for the application.
 *
 * @param options An object to configure the server providers. Currently supports the following options:
 * - `maxResponseBodySize`: The maximum allowed response body size when using the Fetch API.
 *
 * @usageNotes
 *
 * Basic example of how you can add server support to your application:
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideServerRendering()]
 * });
 * ```
 *
 * @publicApi
 * @returns A set of providers to setup the server.
 */
export function provideServerRendering(options?: {
  maxResponseBodySize: number;
}): EnvironmentProviders {
  if (typeof ngServerMode === 'undefined') {
    globalThis['ngServerMode'] = true;
  }

  const providers = [...PLATFORM_SERVER_PROVIDERS];
  if (options?.maxResponseBodySize) {
    providers.push({provide: HTTP_FETCH_MAX_RESPONSE_SIZE, useValue: options.maxResponseBodySize});
  }

  return makeEnvironmentProviders(providers);
}
