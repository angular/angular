/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic, SymbolKind} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';
import {
  AbsoluteSourceSpan,
  AST,
  Call,
  Interpolation,
  PropertyRead,
  SafeCall,
  SafePropertyRead,
  TmplAstNode,
} from '@angular/compiler';

class UninvokedFunctionInTextInterpolation extends TemplateCheckWithVisitor<ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION> {
  override code = ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION>[] {
    // interpolations like `{{ myFunction }}`
    if (node instanceof Interpolation) {
      return node.expressions.flatMap((item) =>
        assertExpressionInvoked(item, component, node.sourceSpan, ctx),
      );
    }
    return [];
  }
}

function assertExpressionInvoked(
  expression: AST,
  component: ts.ClassDeclaration,
  sourceSpan: AbsoluteSourceSpan,
  ctx: TemplateContext<ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION>,
): NgTemplateDiagnostic<ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION>[] {
  if (!(expression instanceof PropertyRead) && !(expression instanceof SafePropertyRead)) {
    return []; // If the expression is not a property read, skip it.
  }

  const symbol = ctx.templateTypeChecker.getSymbolOfNode(expression, component);

  if (symbol !== null && symbol.kind === SymbolKind.Expression) {
    if (symbol.tsType.getCallSignatures()?.length > 0) {
      const fullExpressionText = generateStringFromExpression(expression, sourceSpan.toString());

      const errorString = `Function in text interpolation should be invoked: ${fullExpressionText}()`;
      const templateMapping = ctx.templateTypeChecker.getSourceMappingAtTcbLocation(
        symbol.tcbLocation,
      )!;
      return [ctx.makeTemplateDiagnostic(templateMapping.span, errorString)];
    }
  }

  return [];
}

function generateStringFromExpression(expression: AST, source: string): string {
  return source.substring(expression.span.start, expression.span.end);
}

export const factory: TemplateCheckFactory<
  ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION,
  ExtendedTemplateDiagnosticName.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION
> = {
  code: ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION,
  name: ExtendedTemplateDiagnosticName.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION,
  create: () => new UninvokedFunctionInTextInterpolation(),
};
