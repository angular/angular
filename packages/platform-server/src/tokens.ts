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
   * The URL for the current application state. This is used for initializing
   * the platform's location. `protocol`, `hostname`, and `port` will be
   * overridden if `baseUrl` is set.
   * @default none
   */
  url?: string;
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
