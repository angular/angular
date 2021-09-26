/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import ts from 'typescript';

import {migrateFile} from '../query-list-first-last/util';

/** TSLint rule for accesses of `QueryList`'s `first` and `last` (which need to be null-checked). */
export class Rule extends Rules.TypedRule {
  override applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const typeChecker = program.getTypeChecker();

    const failures: RuleFailure[] = [];

    const rewriter =
        (sourceFile: ts.SourceFile, startPos: number, origLength: number, text: string) => {
          const failure = new RuleFailure(
              sourceFile, startPos, startPos + origLength,
              `QueryList's first and last can be undefined so they need to be accessed safely`,
              this.ruleName, new Replacement(startPos, origLength, text));
          failures.push(failure);
        };

    migrateFile(sourceFile, '', typeChecker, rewriter);

    return failures;
  }
}
