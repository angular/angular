/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {tick} from '@angular/core/testing';

/** Ticks the specified amount of `requestAnimationFrame`-s. */
export function tickAnimationFrames(amount: number) {
  tick(16.6 * amount); // Angular turns rAF calls into 16.6ms timeouts in tests.
}
