/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold, green, red} from 'chalk';
import {ProgramAwareRuleWalker, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';

/**
 * Rule that walks through every identifier that is part of Angular Material and replaces the
 * outdated name with the new one.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(
        new CheckPropertyAccessMiscWalker(sourceFile, this.getOptions(), program));
  }
}

export class CheckPropertyAccessMiscWalker extends ProgramAwareRuleWalker {
  visitPropertyAccessExpression(prop: ts.PropertyAccessExpression) {
    // Recursively call this method for the expression of the current property expression.
    // It can happen that there is a chain of property access expressions.
    // For example: "mySortInstance.mdSortChange.subscribe()"
    if (prop.expression && prop.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
      this.visitPropertyAccessExpression(prop.expression as ts.PropertyAccessExpression);
    }

    // TODO(mmalerba): This is probably a bad way to get the property host...
    // Tokens are: [..., <host>, '.', <prop>], so back up 3.
    const propHost = prop.getChildAt(prop.getChildCount() - 3);

    const type = this.getTypeChecker().getTypeAtLocation(propHost);
    const typeSymbol = type && type.getSymbol();

    if (typeSymbol) {
      const typeName = typeSymbol.getName();

      if (typeName === 'MatListOption' && prop.name.text === 'selectionChange') {
        this.addFailureAtNode(
            prop,
            `Found deprecated property "${red('selectionChange')}" of class` +
            ` "${bold('MatListOption')}". Use the "${green('selectionChange')}" property on the` +
            ` parent "${bold('MatSelectionList')}" instead.`);
      }

      if (typeName === 'MatDatepicker' && prop.name.text === 'selectedChanged') {
        this.addFailureAtNode(
            prop,
            `Found deprecated property "${red('selectedChanged')}" of class` +
            ` "${bold('MatDatepicker')}". Use the "${green('dateChange')}" or` +
            ` "${green('dateInput')}" methods on "${bold('MatDatepickerInput')}" instead`);
      }
    }
  }
}
