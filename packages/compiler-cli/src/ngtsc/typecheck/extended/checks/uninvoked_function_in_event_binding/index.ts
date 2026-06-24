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
  Chain,
  Conditional,
  ParsedEventType,
  PropertyRead,
  SafeCall,
  SafePropertyRead,
  TmplAstBoundEvent,
  TmplAstNode,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic, SymbolKind} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * Ensures that function in event bindings are called. For example, `<button (click)="myFunc"></button>`
 * will not call `myFunc` when the button is clicked. Instead, it should be `<button (click)="myFunc()"></button>`.
 * This is likely not the intent of the developer. Instead, the intent is likely to call `myFunc`.
 */
class UninvokedFunctionInEventBindingSpec extends TemplateCheckWithVisitor<ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING> {
  override code = ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING>[] {
    // If the node is not a bound event, skip it.
    if (!(node instanceof TmplAstBoundEvent)) return [];

    // If the node is not a regular or animation event, skip it.
    if (node.type !== ParsedEventType.Regular && node.type !== ParsedEventType.LegacyAnimation)
      return [];

    if (!(node.handler instanceof ASTWithSource)) return [];

    const sourceExpressionText = node.handler.source || '';

    if (node.handler.ast instanceof Chain) {
      // (click)="increment; decrement"
      return node.handler.ast.expressions.flatMap((expression) =>
        assertExpressionInvoked(expression, component, node, sourceExpressionText, ctx),
      );
    }

    if (node.handler.ast instanceof Conditional) {
      // (click)="true ? increment : decrement"
      const {trueExp, falseExp} = node.handler.ast;
      return [trueExp, falseExp].flatMap((expression) =>
        assertExpressionInvoked(expression, component, node, sourceExpressionText, ctx),
      );
    }

    // (click)="increment"
    return assertExpressionInvoked(node.handler.ast, component, node, sourceExpressionText, ctx);
  }
}

/**
 * Asserts that the expression is invoked.
 * If the expression is a property read, and it has a call signature, a diagnostic is generated.
 */
function assertExpressionInvoked(
  expression: AST,
  component: ts.ClassDeclaration,
  node: TmplAstBoundEvent,
  expressionText: string,
  ctx: TemplateContext<ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING>,
): NgTemplateDiagnostic<ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING>[] {
  if (expression instanceof Call || expression instanceof SafeCall) {
    return []; // If the method is called, skip it.
  }

  if (!(expression instanceof PropertyRead) && !(expression instanceof SafePropertyRead)) {
    return []; // If the expression is not a property read, skip it.
  }

  const symbol = ctx.templateTypeChecker.getSymbolOfNode(expression, component);

  if (symbol !== null && symbol.kind === SymbolKind.Expression) {
    if (symbol.tsType.getCallSignatures()?.length > 0) {
      const fullExpressionText = generateStringFromExpression(expression, expressionText);
      const errorString = `Function in event binding should be invoked: ${fullExpressionText}()`;
      return [ctx.makeTemplateDiagnostic(node.sourceSpan, errorString)];
    }
  }

  return [];
}

function generateStringFromExpression(expression: AST, source: string): string {
  return source.substring(expression.span.start, expression.span.end);
}

export const factory: TemplateCheckFactory<
  ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING,
  ExtendedTemplateDiagnosticName.UNINVOKED_FUNCTION_IN_EVENT_BINDING
> = {
  code: ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING,
  name: ExtendedTemplateDiagnosticName.UNINVOKED_FUNCTION_IN_EVENT_BINDING,
  create: () => new UninvokedFunctionInEventBindingSpec(),
};
