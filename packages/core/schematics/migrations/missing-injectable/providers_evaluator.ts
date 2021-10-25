/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import type {ResolvedValue, TypeScriptReflectionHost} from '@angular/compiler-cli/private/migrations';

export interface ProviderLiteral {
  node: ts.ObjectLiteralExpression;
  resolvedValue: ResolvedValue;
}

/**
 * A factory function to create an evaluator for providers. This is required to be a
 * factory function because the underlying class extends a class that is only available
 * from within a dynamically imported module (`@angular/compiler-cli/private/migrations`)
 * and is therefore not available at module evaluation time.
 */
export function createProvidersEvaluator(
    compilerCliMigrationsModule: typeof import('@angular/compiler-cli/private/migrations'),
    host: TypeScriptReflectionHost, checker: ts.TypeChecker): {
  evaluate:
      (expr: ts.Expression) => {
        resolvedValue: ResolvedValue, literals: ProviderLiteral[]
      }
} {
  /**
   * Providers evaluator that extends the ngtsc static interpreter. This is necessary because
   * the static interpreter by default only exposes the resolved value, but we are also interested
   * in the TypeScript nodes that declare providers. It would be possible to manually traverse the
   * AST to collect these nodes, but that would mean that we need to re-implement the static
   * interpreter in order to handle all possible scenarios. (e.g. spread operator, function calls,
   * callee scope). This can be avoided by simply extending the static interpreter and intercepting
   * the "visitObjectLiteralExpression" method.
   */
  class ProvidersEvaluator extends compilerCliMigrationsModule.StaticInterpreter {
    private _providerLiterals: ProviderLiteral[] = [];

    override visitObjectLiteralExpression(node: ts.ObjectLiteralExpression, context: any) {
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
        foreignFunctionResolver: compilerCliMigrationsModule.forwardRefResolver
      });
      return {resolvedValue, literals: this._providerLiterals};
    }
  }

  return new ProvidersEvaluator(host, checker, /* dependencyTracker */ null);
}
