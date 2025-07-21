/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentTreeNode} from '../interfaces';
import {LTreeStrategy} from './ltree';
import {RTreeStrategy} from './render-tree';

export {
  getDirectiveHostElement,
  getLViewFromDirectiveOrElementInstance,
  METADATA_PROPERTY_NAME,
} from './ltree';

// The order of the strategies matters. Lower indices have higher priority.
const rTreeStrategy = new RTreeStrategy();
const lTreeStrategy = new LTreeStrategy();
const strategies = [rTreeStrategy, lTreeStrategy];

const selectStrategy = (element: Element): RTreeStrategy | LTreeStrategy | null => {
  for (const s of strategies) {
    if (s.supports(element)) {
      return s;
    }
  }
  return null;
};

export const buildDirectiveForestWithStrategy = (elements: Element[]) => {
  if (!elements || !elements.length) {
    return [];
  }

  // Different roots can have different Angular versions.
  // Diffent versions depend on different component tree discovery strategies.
  const strategies: {
    strategy: RTreeStrategy | LTreeStrategy;
    element: Element;
  }[] = elements
    .map((element) => {
      const strategy = selectStrategy(element);
      if (!strategy) {
        return null;
      }

      return {strategy, element};
    })
    .filter((s) => s !== null);

  const result: ComponentTreeNode[][] = [];
  for (const [index, {strategy, element}] of strategies.entries()) {
    if (strategy === rTreeStrategy) {
      result.push(rTreeStrategy.build(element, index));
    } else if (strategy === lTreeStrategy) {
      result.push(lTreeStrategy.build(element));
    }
  }

  return result.flat();
};
