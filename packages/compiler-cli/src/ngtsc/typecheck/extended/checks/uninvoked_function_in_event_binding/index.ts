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
  ArrowFunction,
  SafeCall,
  TmplAstBoundEvent,
  TmplAstNode,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
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
    _component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING>[] {
    if (!(node instanceof TmplAstBoundEvent)) return [];

    if (node.type !== ParsedEventType.Regular && node.type !== ParsedEventType.LegacyAnimation) {
      return [];
    }

    if (!(node.handler instanceof ASTWithSource)) return [];

    if (node.handler.ast instanceof Chain) {
      return node.handler.ast.expressions.flatMap((expression) =>
        assertExpressionInvoked(expression, node, ctx),
      );
    }

    if (node.handler.ast instanceof Conditional) {
      const {trueExp, falseExp} = node.handler.ast;
      return [trueExp, falseExp].flatMap((expression) =>
        assertExpressionInvoked(expression, node, ctx),
      );
    }

    return assertExpressionInvoked(node.handler.ast, node, ctx);
  }
}

/**
 * Asserts that the expression is invoked.
 * If the expression is a property read, and it has a call signature, a diagnostic is generated.
 */
function assertExpressionInvoked(
  expression: AST,
  node: TmplAstBoundEvent,
  ctx: TemplateContext<ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING>,
): NgTemplateDiagnostic<ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING>[] {
  if (expression instanceof Call || expression instanceof SafeCall) {
    return [];
  }

  if (expression instanceof ArrowFunction) {
    const errorString =
      'Arrow function will not be invoked in this event listener. Did you intend to call a method?';
    return [ctx.makeTemplateDiagnostic(node.sourceSpan, errorString)];
  }

  return [];
}

export const factory: TemplateCheckFactory<
  ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING,
  ExtendedTemplateDiagnosticName.UNINVOKED_FUNCTION_IN_EVENT_BINDING
> = {
  code: ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING,
  name: ExtendedTemplateDiagnosticName.UNINVOKED_FUNCTION_IN_EVENT_BINDING,
  create: () => new UninvokedFunctionInEventBindingSpec(),
};
