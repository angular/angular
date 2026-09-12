/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ASTWithSource,
  Call,
  PropertyRead,
  SafeCall,
  SafePropertyRead,
  TmplAstForLoopBlock,
  TmplAstNode,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic, SymbolKind} from '../../../api';
import {
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
  formatExtendedError,
} from '../../api';

/**
 * Ensures that track functions in @for loops are invoked.
 */
class UninvokedTrackFunctionCheck extends TemplateCheckWithVisitor<ErrorCode.UNINVOKED_TRACK_FUNCTION> {
  override code = ErrorCode.UNINVOKED_TRACK_FUNCTION as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.UNINVOKED_TRACK_FUNCTION>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.UNINVOKED_TRACK_FUNCTION>[] {
    if (!(node instanceof TmplAstForLoopBlock) || !node.trackBy) {
      return [];
    }

    if (node.trackBy.ast instanceof Call || node.trackBy.ast instanceof SafeCall) {
      // If the method is called, skip it.
      return [];
    }

    if (
      !(node.trackBy.ast instanceof PropertyRead) &&
      !(node.trackBy.ast instanceof SafePropertyRead)
    ) {
      // If the expression is not a property read, skip it.
      return [];
    }

    const symbol = ctx.templateTypeChecker.getSymbolOfNode(node.trackBy.ast, component);

    if (symbol !== null && symbol.kind === SymbolKind.Expression) {
      const type = ctx.templateTypeChecker.getTypeOfSymbol(symbol);
      if (type) {
        const callSignatures = type.getCallSignatures();
        if (callSignatures.length > 0) {
          const hasParameters = callSignatures.some((sig) => sig.parameters.length > 0);
          const tsSymbol = ctx.templateTypeChecker.getTsSymbolOfSymbol(symbol);
          const isMethod = isMethodSymbol(tsSymbol, callSignatures);

          if (hasParameters || isMethod) {
            const fullExpressionText = generateStringFromExpression(
              node.trackBy.ast,
              node.trackBy.source || '',
            );

            const errorString = formatExtendedError(
              ErrorCode.UNINVOKED_TRACK_FUNCTION,
              `The track function in the @for block should be invoked: ${fullExpressionText}(/* arguments */)`,
            );

            return [ctx.makeTemplateDiagnostic(node.sourceSpan, errorString)];
          }
        }
      }
    }

    return [];
  }
}

function isMethodSymbol(
  tsSymbol: ts.Symbol | null,
  callSignatures: readonly ts.Signature[],
): boolean {
  if (tsSymbol !== null) {
    if ((tsSymbol.flags & ts.SymbolFlags.Method) !== 0) {
      return true;
    }
    const declarations = tsSymbol.getDeclarations();
    if (declarations !== undefined) {
      if (declarations.some((decl) => ts.isMethodDeclaration(decl) || ts.isMethodSignature(decl))) {
        return true;
      }
    }
  }

  return callSignatures.some(
    (sig) =>
      sig.declaration !== undefined &&
      (ts.isMethodDeclaration(sig.declaration) || ts.isMethodSignature(sig.declaration)),
  );
}

function generateStringFromExpression(expression: AST, source: string): string {
  return source.substring(expression.span.start, expression.span.end);
}

export const factory: TemplateCheckFactory<
  ErrorCode.UNINVOKED_TRACK_FUNCTION,
  ExtendedTemplateDiagnosticName.UNINVOKED_TRACK_FUNCTION
> = {
  code: ErrorCode.UNINVOKED_TRACK_FUNCTION,
  name: ExtendedTemplateDiagnosticName.UNINVOKED_TRACK_FUNCTION,
  create: () => new UninvokedTrackFunctionCheck(),
};
