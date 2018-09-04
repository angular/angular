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
import {color} from '../../material/color';
import {methodCallChecks} from '../../material/data/method-call-checks';
import {getChangesForTarget} from '../../material/transform-change-data';

/**
 * Rule that visits every TypeScript call expression or TypeScript new expression and checks
 * if the argument count is invalid and needs to be *manually* updated.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

export class Walker extends ProgramAwareRuleWalker {

  /** Change data that upgrades to the specified target version. */
  data = getChangesForTarget(this.getOptions()[0], methodCallChecks);

  visitNewExpression(expression: ts.NewExpression) {
    const classType = this.getTypeChecker().getTypeAtLocation(expression);

    if (classType && classType.symbol) {
      this.checkConstructor(expression, classType.symbol.name);
    }
  }

  visitCallExpression(node: ts.CallExpression) {
    if (node.expression.kind === ts.SyntaxKind.SuperKeyword) {
      const superClassType = this.getTypeChecker().getTypeAtLocation(node.expression);
      const superClassName = superClassType.symbol && superClassType.symbol.name;

      if (superClassName) {
        this.checkConstructor(node, superClassName);
      }
    }

    if (ts.isPropertyAccessExpression(node.expression)) {
      this._checkPropertyAccessMethodCall(node);
    }

    return super.visitCallExpression(node);
  }

  private _checkPropertyAccessMethodCall(node: ts.CallExpression) {
    const propertyAccess = node.expression as ts.PropertyAccessExpression;

    if (!ts.isIdentifier(propertyAccess.name)) {
      return;
    }

    const hostType = this.getTypeChecker().getTypeAtLocation(propertyAccess.expression);
    const hostTypeName = hostType.symbol && hostType.symbol.name;
    const methodName = propertyAccess.name.text;

    if (!hostTypeName) {
      return;
    }

    const failure = this.data
        .filter(data => data.method === methodName && data.className === hostTypeName)
        .map(data => data.invalidArgCounts.find(f => f.count === node.arguments.length))[0];

    if (!failure) {
      return;
    }

    this.addFailureAtNode(node, `Found call to "${bold(hostTypeName + '.' + methodName)}" ` +
        `with ${bold(`${failure.count}`)} arguments. Message: ${color(failure.message)}`);
  }

  private checkConstructor(node: ts.NewExpression | ts.CallExpression, className: string) {
    const argumentsLength = node.arguments ? node.arguments.length : 0;
    const failure = this.data
        .filter(data => data.method === 'constructor' && data.className === className)
        .map(data => data.invalidArgCounts.find(f => f.count === argumentsLength))[0];

    if (!failure) {
      return;
    }

    this.addFailureAtNode(node, `Found "${bold(className)}" constructed with ` +
        `${bold(`${failure.count}`)} arguments. Message: ${color(failure.message)}`);
  }
}
