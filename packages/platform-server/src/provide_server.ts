/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';

import {PLATFORM_SERVER_PROVIDERS} from './server';

/**
 * Sets up providers necessary to enable server rendering functionality for the application.
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
export function provideServerRendering(): EnvironmentProviders {
  if (typeof ngServerMode === 'undefined') {
    globalThis['ngServerMode'] = true;
  }

  return makeEnvironmentProviders([...PLATFORM_SERVER_PROVIDERS]);
}
