/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LTreeStrategy} from './ltree';
import {RTreeStrategy} from './render-tree';

// The order of the strategies matters. Lower indices have higher priority.
const rTreeStrategy = new RTreeStrategy();
const lTreeStrategy = new LTreeStrategy();
const STRATEGIES = [rTreeStrategy, lTreeStrategy];

export function selectTreeStrategy(element: Element): RTreeStrategy | LTreeStrategy | null {
  for (const s of STRATEGIES) {
    if (s.supports(element)) {
      return s;
    }
  }
  return null;
}
