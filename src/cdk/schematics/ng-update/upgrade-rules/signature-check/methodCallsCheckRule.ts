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
import {getUpgradeDataFromWalker} from '../../upgrade-data';

/**
 * Rule that visits every TypeScript method call expression and checks if the argument count
 * is invalid and needs to be *manually* updated.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

export class Walker extends ProgramAwareRuleWalker {

  /** Change data that upgrades to the specified target version. */
  data = getUpgradeDataFromWalker(this, 'methodCallChecks');

  visitCallExpression(node: ts.CallExpression) {
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
        `with ${bold(`${failure.count}`)} arguments. Message: ${failure.message}`);
  }
}
