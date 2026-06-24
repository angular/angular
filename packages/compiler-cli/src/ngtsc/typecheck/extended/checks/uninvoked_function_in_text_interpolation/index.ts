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
import {AST, Interpolation, PropertyRead, SafePropertyRead, TmplAstNode} from '@angular/compiler';

class UninvokedFunctionInTextInterpolation extends TemplateCheckWithVisitor<ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION> {
  override code = ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION>[] {
    // interpolations like `{{ myFunction }}`
    if (node instanceof Interpolation) {
      return node.expressions.flatMap((item) => assertExpressionInvoked(item, component, ctx));
    }
    return [];
  }
}

function assertExpressionInvoked(
  expression: AST,
  component: ts.ClassDeclaration,
  ctx: TemplateContext<ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION>,
): NgTemplateDiagnostic<ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION>[] {
  if (!(expression instanceof PropertyRead) && !(expression instanceof SafePropertyRead)) {
    return []; // If the expression is not a property read, skip it.
  }

  const symbol = ctx.templateTypeChecker.getSymbolOfNode(expression, component);

  if (symbol !== null && symbol.kind === SymbolKind.Expression) {
    if (symbol.tsType.getCallSignatures()?.length > 0) {
      const errorString = `Function in text interpolation should be invoked: ${expression.name}()`;
      const templateMapping = ctx.templateTypeChecker.getSourceMappingAtTcbLocation(
        symbol.tcbLocation,
      )!;
      return [ctx.makeTemplateDiagnostic(templateMapping.span, errorString)];
    }
  }

  return [];
}

export const factory: TemplateCheckFactory<
  ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION,
  ExtendedTemplateDiagnosticName.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION
> = {
  code: ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION,
  name: ExtendedTemplateDiagnosticName.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION,
  create: () => new UninvokedFunctionInTextInterpolation(),
};
