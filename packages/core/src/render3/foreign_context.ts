/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '../di/injection_token';
import {Provider} from '../di/interface/provider';

/**
 * Internal token used to resolve foreign framework context providers.
 */
export const FOREIGN_CONTEXT = new InjectionToken<unknown>('FOREIGN_CONTEXT');

/**
 * Configures an opaque root context for a foreign framework within Angular's dependency injection
 * hierarchy.
 *
 * @param contextFactory The factory function that creates the root context object.
 */
export function provideForeignRootContext(contextFactory: () => unknown): Provider {
  return {
    provide: FOREIGN_CONTEXT,
    useFactory: contextFactory,
  };
}
