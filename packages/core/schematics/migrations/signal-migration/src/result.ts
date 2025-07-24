/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {InputDescriptor} from './utils/input_id';
import {ConvertInputPreparation} from './convert-input/prepare_and_check';
import {Replacement} from '../../../utils/tsurge/replacement';
import {ReferenceResult} from './passes/reference_resolution/reference_result';
import {Reference} from './passes/reference_resolution/reference_kinds';

/**
 * State of the migration that is passed between
 * the individual phases.
 *
 * The state/phase captures information like:
 *    - list of inputs that are defined in `.ts` and need migration.
 *    - list of references.
 *    - keeps track of computed replacements.
 *    - imports that may need to be updated.
 */
export class MigrationResult implements ReferenceResult<InputDescriptor> {
  printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});

  // May be `null` if the input cannot be converted. This is also
  // signified by an incompatibility- but the input is tracked here as it
  // still is a "source input".
  sourceInputs = new Map<InputDescriptor, ConvertInputPreparation | null>();

  references: Reference<InputDescriptor>[] = [];

  // Execution data
  replacements: Replacement[] = [];
  inputDecoratorSpecifiers = new Map<
    ts.SourceFile,
    {node: ts.ImportSpecifier; kind: 'signal-input-import' | 'decorator-input-import'}[]
  >();
}
