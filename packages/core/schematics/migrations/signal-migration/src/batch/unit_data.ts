/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {AST, TmplAstNode} from '../../../../../../compiler/public_api';
import {
  ClassIncompatibilityReason,
  InputIncompatibilityReason,
} from '../input_detection/incompatibility';
import {
  ClassFieldDescriptor,
  ClassFieldUniqueKey,
} from '../passes/reference_resolution/known_fields';
import {Reference} from '../passes/reference_resolution/reference_kinds';
import {InputDescriptor} from '../utils/input_id';

/** Helper that ensures given type `T` is serializable. */
export type SerializableForBatching<T> = {
  [K in keyof T]: T[K] extends ts.Node | TmplAstNode | AST
    ? {positionEndInFile: number}
    : // Input descriptor should only be the serializable string.
      T[K] extends ClassFieldDescriptor
      ? ClassFieldUniqueKey
      : // If no known type, recursively step into it.
        SerializableForBatching<T[K]>;
};

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
    };
  };

  references: SerializableForBatching<Reference<InputDescriptor>>[];
}
