/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ClassIncompatibilityReason,
  InputIncompatibilityReason,
} from '../input_detection/incompatibility';
import {ClassFieldUniqueKey} from '../passes/reference_resolution/known_fields';

/** Type of incompatibility. */
export enum IncompatibilityType {
  VIA_CLASS,
  VIA_INPUT,
}

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
      isIncompatible:
        | {kind: IncompatibilityType.VIA_CLASS; reason: ClassIncompatibilityReason}
        | {kind: IncompatibilityType.VIA_INPUT; reason: InputIncompatibilityReason}
        | null;
      seenAsSourceInput: boolean;
      extendsFrom: ClassFieldUniqueKey | null;
    };
  };
}
