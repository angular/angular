/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import ts from 'typescript';

import {migrateEntryComponentsUsages} from '../entry-components/util';


/** TSLint rule that removes usages of `entryComponents`. */
export class Rule extends Rules.TypedRule {
  override applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const typeChecker = program.getTypeChecker();
    const printer = ts.createPrinter();

    return migrateEntryComponentsUsages(typeChecker, printer, sourceFile).map(usage => {
      return new RuleFailure(
          sourceFile, usage.start, usage.end,
          'entryComponents are deprecated and don\'t need to be passed in.', this.ruleName,
          new Replacement(usage.start, usage.length, usage.replacement));
    });
  }
}
