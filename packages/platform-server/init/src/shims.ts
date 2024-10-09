/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import domino from './bundled-domino';

/**
 * Apply the necessary shims to make DOM globals (such as `Element`, `HTMLElement`, etc.) available
 * on the environment.
 */
export function applyShims(): void {
  // Make all Domino types available in the global env.
  // NB: Any changes here should also be done in `packages/platform-server/src/domino_adapter.ts`.
  Object.assign(globalThis, domino.impl);
  (globalThis as any)['KeyboardEvent'] = domino.impl.Event;
}
