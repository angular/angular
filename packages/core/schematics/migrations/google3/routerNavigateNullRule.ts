/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import ts from 'typescript';

import {migrateFile} from '../router-navigate-null/util';

/** TSLint rule for `Router.navigate` and `Router.navigateByUrl` migration. */
export class Rule extends Rules.TypedRule {
  override applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const failures: RuleFailure[] = [];

    const updater = (sourceFile: ts.SourceFile, node: ts.Node, content: string) => {
      const start = node.getStart();
      const end = node.getEnd();
      const failure = new RuleFailure(
          sourceFile, start, end,
          `Router.navigate and Router.navigateByUrl functions may return null when navigation is skipped.`,
          this.ruleName,
          // "replace" by adding text right of the function call
          Replacement.appendText(end, content));
      failures.push(failure);
    };

    migrateFile(sourceFile, program.getTypeChecker(), updater);

    return failures;
  }
}
