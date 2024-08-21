/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {nonIgnorableIncompatibilities} from './input_detection/incompatibility';
import {KnownInputs} from './input_detection/known_inputs';

/** Filters ignorable input incompatibilities when best effort mode is enabled. */
export function filterIncompatibilitiesForBestEffortMode(knownInputs: KnownInputs) {
  // Remove all "ignorable" incompatibilities of inputs, if best effort mode is requested.
  knownInputs.knownInputIds.forEach(({container: c}) => {
    if (c.incompatible !== null && !nonIgnorableIncompatibilities.includes(c.incompatible)) {
      c.incompatible = null;
    }
    for (const [key, i] of c.memberIncompatibility.entries()) {
      if (!nonIgnorableIncompatibilities.includes(i.reason)) {
        c.memberIncompatibility.delete(key);
      }
    }
  });
}
