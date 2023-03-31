/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import ts from 'typescript';

import {migrateFile} from '../querylist-changes/util';

/** TSLint rule to add Observable<any> assertion to QueryList.changes */
export class Rule extends Rules.TypedRule {
  override applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const failures: RuleFailure[] = [];

    const rewriter = (startPos: number, origLength: number, text: string) => {
      const failure = new RuleFailure(
          sourceFile, startPos, startPos + origLength,
          'QueryList.changes are now asserted as Observable<any>.', this.ruleName,
          new Replacement(startPos, origLength, text));
      failures.push(failure);
    };

    migrateFile(sourceFile, program.getTypeChecker(), rewriter);

    return failures;
  }
}
