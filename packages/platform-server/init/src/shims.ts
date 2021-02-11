/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {setDomTypes} from '../../src/domino_adapter';

/**
 * Apply the necessary shims to make DOM globals (such as `Element`, `HTMLElement`, etc.) available
 * on the environment.
 */
export function applyShims(): void {
  setDomTypes();
}
