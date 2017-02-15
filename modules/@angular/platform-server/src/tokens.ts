/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';

/**
 * Config object passed to initialize the platform.
 *
 * @experimental
 */
export interface PlatformConfig {
  document?: string;
  url?: string;
}

/**
 * The DI token for setting the initial config for the platform.
 *
 * @experimental
 */
export const INITIAL_CONFIG = new InjectionToken<PlatformConfig>('Server.INITIAL_CONFIG');
