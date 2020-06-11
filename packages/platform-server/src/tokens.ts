/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
   * The URL for the current application state. This is
   * used for initializing the platform's location and
   * for setting absolute URL resolution for HTTP requests.
   * @default none
   */
  url?: string;
  /**
   * Whether to append the absolute URL to any relative HTTP
   * requests. If set to true, this logic executes prior to
   * any HTTP interceptors that may run later on in the request.
   * @default false
   */
  useAbsoluteUrl?: boolean;
}

/**
 * The DI token for setting the initial config for the platform.
 *
 * @publicApi
 */
export const INITIAL_CONFIG = new InjectionToken<PlatformConfig>('Server.INITIAL_CONFIG');

/**
 * A function that will be executed when calling `renderModuleFactory` or `renderModule` just
 * before current platform state is rendered to string.
 *
 * @publicApi
 */
export const BEFORE_APP_SERIALIZED =
    new InjectionToken<Array<() => void | Promise<void>>>('Server.RENDER_MODULE_HOOK');
