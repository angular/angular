/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {findLiteralsToMigrate, migrateLiteral} from '../can-activate-with-redirect-to/util';


/** TSLint rule that removes canActivate from Route configs that also have redirectTo. */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const failures: RuleFailure[] = [];
    const printer = ts.createPrinter();
    const literalsToMigrate = findLiteralsToMigrate(sourceFile);

    for (const literal of Array.from(literalsToMigrate)) {
      const migratedNode = migrateLiteral(literal);
      failures.push(new RuleFailure(
          sourceFile, literal.getStart(), literal.getEnd(),
          'canActivate cannot be used with redirectTo.', this.ruleName,
          new Replacement(
              literal.getStart(), literal.getWidth(),
              printer.printNode(ts.EmitHint.Unspecified, migratedNode, sourceFile))));
    }

    return failures;
  }
}
