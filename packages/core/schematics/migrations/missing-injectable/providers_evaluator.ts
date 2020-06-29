/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {forwardRefResolver} from '@angular/compiler-cli/src/ngtsc/annotations';
import {ResolvedValue} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {StaticInterpreter} from '@angular/compiler-cli/src/ngtsc/partial_evaluator/src/interpreter';
import * as ts from 'typescript';

export interface ProviderLiteral {
  node: ts.ObjectLiteralExpression;
  resolvedValue: ResolvedValue;
}

/**
 * Providers evaluator that extends the ngtsc static interpreter. This is necessary because
 * the static interpreter by default only exposes the resolved value, but we are also interested
 * in the TypeScript nodes that declare providers. It would be possible to manually traverse the
 * AST to collect these nodes, but that would mean that we need to re-implement the static
 * interpreter in order to handle all possible scenarios. (e.g. spread operator, function calls,
 * callee scope). This can be avoided by simply extending the static interpreter and intercepting
 * the "visitObjectLiteralExpression" method.
 */
export class ProvidersEvaluator extends StaticInterpreter {
  private _providerLiterals: ProviderLiteral[] = [];

  visitObjectLiteralExpression(node: ts.ObjectLiteralExpression, context: any) {
    const resolvedValue =
        super.visitObjectLiteralExpression(node, {...context, insideProviderDef: true});
    // do not collect nested object literals. e.g. a provider could use a
    // spread assignment (which resolves to another object literal). In that
    // case the referenced object literal is not a provider object literal.
    if (!context.insideProviderDef) {
      this._providerLiterals.push({node, resolvedValue});
    }
    return resolvedValue;
  }

  /**
   * Evaluates the given expression and returns its statically resolved value
   * and a list of object literals which define Angular providers.
   */
  evaluate(expr: ts.Expression) {
    this._providerLiterals = [];
    const resolvedValue = this.visit(expr, {
      originatingFile: expr.getSourceFile(),
      absoluteModuleName: null,
      resolutionContext: expr.getSourceFile().fileName,
      scope: new Map(),
      foreignFunctionResolver: forwardRefResolver
    });
    return {resolvedValue, literals: this._providerLiterals};
  }
}
