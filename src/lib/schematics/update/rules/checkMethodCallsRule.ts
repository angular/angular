/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold} from 'chalk';
import {ProgramAwareRuleWalker, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {color} from '../material/color';
import {methodCallChecks} from '../material/data/method-call-checks';

/**
 * Rule that walks through every property access expression and updates properties that have
 * been changed in favor of the new name.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(
        new CheckMethodCallsWalker(sourceFile, this.getOptions(), program));
  }
}

export class CheckMethodCallsWalker extends ProgramAwareRuleWalker {
  visitNewExpression(expression: ts.NewExpression) {
    const symbol =  this.getTypeChecker().getTypeAtLocation(expression).symbol;
    if (symbol) {
      const className = symbol.name;
      this.checkConstructor(expression, className);
    }
  }

  visitCallExpression(expression: ts.CallExpression) {
    if (expression.expression.kind !== ts.SyntaxKind.PropertyAccessExpression) {
      const functionName = expression.getFirstToken().getText();

      if (functionName === 'super') {
        const superClassType = this.getTypeChecker().getTypeAtLocation(expression.expression);
        const superClassName = superClassType.symbol && superClassType.symbol.name;

        if (superClassType) {
          this.checkConstructor(expression, superClassName);
        }
      }

      return;
    }

    // TODO(mmalerba): This is probably a bad way to get the class node...
    // Tokens are: [..., <host>, '.', <prop>], so back up 3.
    const accessExp = expression.expression;
    const classNode = accessExp.getChildAt(accessExp.getChildCount() - 3);
    const methodNode = accessExp.getChildAt(accessExp.getChildCount() - 1);
    const methodName = methodNode.getText();
    const type = this.getTypeChecker().getTypeAtLocation(classNode);
    const className = type.symbol && type.symbol.name;

    const currentCheck = methodCallChecks
        .find(data => data.method === methodName && data.className === className);
    if (!currentCheck) {
      return;
    }

    const failure = currentCheck.invalidArgCounts
        .find(countData => countData.count === expression.arguments.length);
    if (failure) {
      this.addFailureAtNode(
          expression,
          `Found call to "${bold(className + '.' + methodName)}" with` +
          ` ${bold(String(failure.count))} arguments. ${color(failure.message)}`);
    }
  }

  private checkConstructor(node: ts.NewExpression | ts.CallExpression, className: string) {
    const currentCheck = methodCallChecks
        .find(data => data.method === 'constructor' && data.className === className);
    if (!currentCheck) {
      return;
    }

    const failure = currentCheck.invalidArgCounts
        .find(countData => !!node.arguments && countData.count === node.arguments.length);
    if (failure) {
      this.addFailureAtNode(
          node,
          `Found "${bold(className)}" constructed with ${bold(String(failure.count))} arguments.` +
          ` ${color(failure.message)}`);
    }
  }
}
