/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold, green} from 'chalk';
import {ProgramAwareRuleWalker, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';

/**
 * Rule that walks through every identifier that is part of Angular Material and replaces the
 * outdated name with the new one.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(
        new CheckClassDeclarationMiscWalker(sourceFile, this.getOptions(), program));
  }
}

export class CheckClassDeclarationMiscWalker extends ProgramAwareRuleWalker {
  visitClassDeclaration(declaration: ts.ClassDeclaration) {
    if (declaration.heritageClauses) {
      declaration.heritageClauses.forEach(hc => {
        const classes = new Set(hc.types.map(t => t.getFirstToken().getText()));
        if (classes.has('MatFormFieldControl')) {
          const sfl = declaration.members
              .filter(prop => prop.getFirstToken().getText() === 'shouldFloatLabel');
          if (!sfl.length && declaration.name) {
            this.addFailureAtNode(
                declaration,
                `Found class "${bold(declaration.name.text)}" which extends` +
                ` "${bold('MatFormFieldControl')}". This class must define` +
                ` "${green('shouldLabelFloat')}" which is now a required property.`
            );
          }
        }
      });
    }
  }
}
