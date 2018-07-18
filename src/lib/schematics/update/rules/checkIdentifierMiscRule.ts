/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold, red} from 'chalk';
import {ProgramAwareRuleWalker, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';

/**
 * Rule that walks through every identifier that is part of Angular Material and replaces the
 * outdated name with the new one.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(
        new CheckIdentifierMiscWalker(sourceFile, this.getOptions(), program));
  }
}

export class CheckIdentifierMiscWalker extends ProgramAwareRuleWalker {
  visitIdentifier(identifier: ts.Identifier) {
    if (identifier.getText() === 'MatDrawerToggleResult') {
      this.addFailureAtNode(
          identifier,
          `Found "${bold('MatDrawerToggleResult')}" which has changed from a class type to a` +
          ` string literal type. Code may need to be updated`);
    }

    if (identifier.getText() === 'MatListOptionChange') {
      this.addFailureAtNode(
          identifier,
          `Found usage of "${red('MatListOptionChange')}" which has been removed. Please listen` +
          ` for ${bold('selectionChange')} on ${bold('MatSelectionList')} instead`);
    }
  }
}
