/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import ts from 'typescript';

import {migrateFile} from '../guard-and-resolve-interfaces/util';

/** TSLint rule for the guard and resolve interfaces migration. */
export class Rule extends Rules.TypedRule {
  override applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const failures: RuleFailure[] = [];

    const rewriter = (startPos: number, origLength: number, text: string) => {
      const failure = new RuleFailure(
          sourceFile, startPos, startPos + origLength,
          'The guard and resolve interfaces in the Angular router are being removed.',
          this.ruleName, new Replacement(startPos, origLength, text));
      failures.push(failure);
    };

    migrateFile(sourceFile, program.getTypeChecker(), rewriter);

    return failures;
  }
}
