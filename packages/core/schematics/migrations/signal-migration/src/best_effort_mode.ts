/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {KnownInputs} from './input_detection/known_inputs';
import {nonIgnorableFieldIncompatibilities} from './passes/problematic_patterns/incompatibility';

/** Filters ignorable input incompatibilities when best effort mode is enabled. */
export function filterIncompatibilitiesForBestEffortMode(knownInputs: KnownInputs) {
  knownInputs.knownInputIds.forEach(({container: c}) => {
    // All class incompatibilities are "filterable" right now.
    c.incompatible = null;

    for (const [key, i] of c.memberIncompatibility.entries()) {
      if (!nonIgnorableFieldIncompatibilities.includes(i.reason)) {
        c.memberIncompatibility.delete(key);
      }
    }
  });
}
