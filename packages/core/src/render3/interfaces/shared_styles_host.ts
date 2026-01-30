/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '../../di/injection_token';

/**
 * Interface describing the `SharedStylesHost` used in `platform-browser`.
 *
 * It is defined here to avoid circular dependencies between `core` and `platform-browser`.
 */
export interface SharedStylesHost {
  addStyles(styles: string[]): void;
  removeStyles(styles: string[]): void;
  addHost(hostNode: Node): void;
  removeHost(hostNode: Node): void;
}

/**
 * Token used to retrieve the `SharedStylesHost` in `core`.
 */
export const SHARED_STYLES_HOST = new InjectionToken<SharedStylesHost>('SharedStylesHost');
