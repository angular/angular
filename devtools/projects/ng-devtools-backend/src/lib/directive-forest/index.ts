/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LTreeStrategy} from './ltree.js';
import {RTreeStrategy} from './render-tree.js';

export {getDirectiveHostElement, getLViewFromDirectiveOrElementInstance, METADATA_PROPERTY_NAME} from './ltree.js';

// The order of the strategies matters. Lower indices have higher priority.
const strategies = [new RTreeStrategy(), new LTreeStrategy()];

let strategy: null|RTreeStrategy|LTreeStrategy = null;

const selectStrategy = (element: Element) => {
  for (const s of strategies) {
    if (s.supports(element)) {
      return s;
    }
  }
  return null;
};

export const buildDirectiveTree = (element: Element) => {
  if (!strategy) {
    strategy = selectStrategy(element);
  }
  if (!strategy) {
    console.error('Unable to parse the component tree');
    return [];
  }
  return strategy.build(element);
};
