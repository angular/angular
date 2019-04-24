/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isMaterialImportDeclaration} from '@angular/cdk/schematics';
import {red} from 'chalk';
import {ProgramAwareRuleWalker, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';

/**
 * Rule that detects import declarations that refer to outdated identifiers from Angular Material
 * or the CDK which cannot be updated automatically.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

export class Walker extends ProgramAwareRuleWalker {

  visitImportDeclaration(node: ts.ImportDeclaration) {
    if (!isMaterialImportDeclaration(node) ||
        !node.importClause ||
        !node.importClause.namedBindings) {
      return;
    }

    const namedBindings = node.importClause.namedBindings;

    if (ts.isNamedImports(namedBindings)) {
      this._checkAnimationConstants(namedBindings);
    }
  }

  /**
   * Checks for named imports that refer to the deleted animation constants.
   * https://github.com/angular/material2/commit/9f3bf274c4f15f0b0fbd8ab7dbf1a453076e66d9
   */
  private _checkAnimationConstants(namedImports: ts.NamedImports) {
    namedImports.elements.filter(element => ts.isIdentifier(element.name)).forEach(element => {
      const importName = element.name.text;

      if (importName === 'SHOW_ANIMATION' || importName === 'HIDE_ANIMATION') {
        this.addFailureAtNode(element,
            `Found deprecated symbol "${red(importName)}" which has been removed`);
      }
    });
  }
}
