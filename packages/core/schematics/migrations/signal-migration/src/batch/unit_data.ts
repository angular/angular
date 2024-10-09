/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ClassIncompatibilityReason,
  FieldIncompatibilityReason,
} from '../passes/problematic_patterns/incompatibility';
import {ClassFieldUniqueKey} from '../passes/reference_resolution/known_fields';

/**
 * Type describing a serializable compilation unit data.
 *
 * The metadata files are built for every compilation unit in batching
 * mode, and can be merged later, and then used as global analysis metadata
 * when migrating.
 */
export interface CompilationUnitData {
  knownInputs: {
    // Use `string` here so that it's a usable index key.
    [inputIdKey: string]: {
      owningClassIncompatibility: ClassIncompatibilityReason | null;
      memberIncompatibility: FieldIncompatibilityReason | null;
      seenAsSourceInput: boolean;
      extendsFrom: ClassFieldUniqueKey | null;
    };
  };
}
