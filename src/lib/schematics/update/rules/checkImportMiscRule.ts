/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {red} from 'chalk';
import {ProgramAwareRuleWalker, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {isMaterialImportDeclaration} from '../material/typescript-specifiers';

/**
 * Rule that walks through every identifier that is part of Angular Material and replaces the
 * outdated name with the new one.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(new CheckImportMiscWalker(sourceFile, this.getOptions(), program));
  }
}

export class CheckImportMiscWalker extends ProgramAwareRuleWalker {
  visitImportDeclaration(declaration: ts.ImportDeclaration) {
    if (isMaterialImportDeclaration(declaration)) {
      declaration.importClause.namedBindings.forEachChild(n => {
        let importName = n.getFirstToken() && n.getFirstToken().getText();
        if (importName === 'SHOW_ANIMATION' || importName === 'HIDE_ANIMATION') {
          this.addFailureAtNode(
              n,
              `Found deprecated symbol "${red(importName)}" which has been removed`);
        }
      });
    }
  }
}
