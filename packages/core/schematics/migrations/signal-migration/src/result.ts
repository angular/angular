/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {Replacement} from './replacement';
import {InputDescriptor} from './utils/input_id';
import {InputReference} from './utils/input_reference';
import {ConvertInputPreparation} from './convert-input/prepare_and_check';

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
export class MigrationResult {
  // May be `null` if the input cannot be converted. This is also
  // signified by an incompatibility- but the input is tracked here as it
  // still is a "source input".
  sourceInputs = new Map<InputDescriptor, ConvertInputPreparation | null>();
  references: InputReference[] = [];

  // Execution data
  replacements = new Map<string, Replacement[]>();
  inputDecoratorSpecifiers = new Map<
    ts.SourceFile,
    {node: ts.ImportSpecifier; kind: 'signal-input-import' | 'decorator-input-import'}[]
  >();

  addReplacement(file: string, replacement: Replacement) {
    if (this.replacements.has(file)) {
      this.replacements.get(file)!.push(replacement);
    } else {
      this.replacements.set(file, [replacement]);
    }
  }
}
