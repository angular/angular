/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {selectTreeStrategy} from './tree-strategies';

export const buildDirectiveForestWithStrategy = (elements: Element[]) => {
  if (!elements || !elements.length) {
    return [];
  }

  let i = 0;
  return elements.flatMap((element) => {
    // Different roots can have different Angular versions.
    // Different versions depend on different component tree discovery strategies.
    const strategy = selectTreeStrategy(element);
    if (!strategy) {
      return [];
    }

    return strategy.build(element, i++);
  });
};
