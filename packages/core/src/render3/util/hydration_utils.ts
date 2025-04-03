/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {hydrationTriggers} from '../../hydration/utils';
import {getInjector} from './discovery_utils';

export function getIncrementalHydrationInfo(rootElement: Element) {
  const injector = getInjector(rootElement);

  return {
    hydrationTriggers: hydrationTriggers(injector, rootElement),
  };
}
