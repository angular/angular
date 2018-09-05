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
import {constructorChecks} from '../../material/data/constructor-checks';

/**
 * Rule that visits every TypeScript new expression or super call and checks if the parameter
 * type signature is invalid and needs to be updated manually.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

export class Walker extends ProgramAwareRuleWalker {

  visitNewExpression(node: ts.NewExpression) {
    this.checkExpressionSignature(node);
    super.visitNewExpression(node);
  }

  visitCallExpression(node: ts.CallExpression) {
    if (node.expression.kind === ts.SyntaxKind.SuperKeyword) {
      this.checkExpressionSignature(node);
    }

    return super.visitCallExpression(node);
  }

  private getParameterTypesFromSignature(signature: ts.Signature): ts.Type[] {
    return signature.getParameters()
      .map(param => param.declarations[0] as ts.ParameterDeclaration)
      .map(node => node.type)
      .map(node => this.getTypeChecker().getTypeFromTypeNode(node));
  }

  private checkExpressionSignature(node: ts.CallExpression | ts.NewExpression) {
    const classType = this.getTypeChecker().getTypeAtLocation(node.expression);
    const className = classType.symbol && classType.symbol.name;
    const isNewExpression = ts.isNewExpression(node);

    // TODO(devversion): Consider handling pass-through classes better.
    // TODO(devversion): e.g. `export class CustomCalendar extends MatCalendar {}`
    if (!classType || !constructorChecks.includes(className)) {
      return;
    }

    const callExpressionSignature = node.arguments
      .map(argument => this.getTypeChecker().getTypeAtLocation(argument));
    const classSignatures = classType.getConstructSignatures()
      .map(signature => this.getParameterTypesFromSignature(signature));

    // TODO(devversion): we should check if the type is assignable to the signature
    // TODO(devversion): blocked on https://github.com/Microsoft/TypeScript/issues/9879
    const doesMatchSignature = classSignatures.some(signature => {
      return signature.every((type, index) => callExpressionSignature[index] === type) &&
          signature.length === callExpressionSignature.length;
    });

    if (!doesMatchSignature) {
      const expressionName = isNewExpression ? `new ${className}` : 'super';
      const signatures = classSignatures
        .map(signature => signature.map(t => this.getTypeChecker().typeToString(t)))
        .map(signature => `${expressionName}(${signature.join(', ')})`)
        .join(' or ');

      this.addFailureAtNode(node, `Found "${bold(className)}" constructed with ` +
        `an invalid signature. Please manually update the ${bold(expressionName)} expression to ` +
        `match the new signature${classSignatures.length > 1 ? 's' : ''}: ${green(signatures)}`);
    }
  }
}
