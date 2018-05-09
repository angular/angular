/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_INITIALIZER} from './application_init';
import {Provider} from './di/provider';
import {R3JitInitializer, enableRender3Jit} from './render3/jit/glue';

export const ivyEnabled = true;

export function maybeEnableRender3Jit(): void {
  enableRender3Jit();
}

export const R3_JIT_INITIALIZER = R3JitInitializer;
