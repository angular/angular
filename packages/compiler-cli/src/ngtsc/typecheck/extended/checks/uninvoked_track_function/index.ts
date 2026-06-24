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
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

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

    if (
      symbol !== null &&
      symbol.kind === SymbolKind.Expression &&
      symbol.tsType.getCallSignatures()?.length > 0
    ) {
      const fullExpressionText = generateStringFromExpression(
        node.trackBy.ast,
        node.trackBy.source || '',
      );
      const errorString = `The track function in the @for block should be invoked: ${fullExpressionText}(/* arguments */)`;
      return [ctx.makeTemplateDiagnostic(node.sourceSpan, errorString)];
    }

    return [];
  }
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
