/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ArrowFunction,
  AST,
  ASTWithSource,
  Call,
  Chain,
  Conditional,
  ParsedEventType,
  SafeCall,
  TmplAstBoundEvent,
  TmplAstNode,
} from '@angular/compiler';
import type {Diagnostic} from '../../diagnostic.js';
import type {TcbTargetInput} from '../../tcb.js';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../api.js';

/**
 * Ensures that functions in event bindings are called.
 *
 * Mirrors `UninvokedFunctionInEventBindingSpec` in
 * `ngtsc/typecheck/extended/checks/uninvoked_function_in_event_binding/index.ts`.
 *
 * TODO: Implement the `PropertyRead` / `SafePropertyRead` call-signature check in NG8111, which
 * requires `ts.TypeChecker` (`type.getCallSignatures()`).
 */
class UninvokedFunctionInEventBindingSpec extends TemplateCheckWithVisitor<8111> {
  override code = 8111 as const;

  override visitNode(
    ctx: TemplateContext<8111>,
    component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[] {
    if (!(node instanceof TmplAstBoundEvent)) return [];

    if (node.type !== ParsedEventType.Regular && node.type !== ParsedEventType.LegacyAnimation) {
      return [];
    }

    if (!(node.handler instanceof ASTWithSource)) return [];

    if (node.handler.ast instanceof Chain) {
      return node.handler.ast.expressions.flatMap((expression) =>
        assertExpressionInvoked(expression, component, node, ctx),
      );
    }

    if (node.handler.ast instanceof Conditional) {
      const {trueExp, falseExp} = node.handler.ast;
      return [trueExp, falseExp].flatMap((expression) =>
        assertExpressionInvoked(expression, component, node, ctx),
      );
    }

    return assertExpressionInvoked(node.handler.ast, component, node, ctx);
  }
}

function assertExpressionInvoked(
  expression: AST,
  _component: TcbTargetInput,
  node: TmplAstBoundEvent,
  ctx: TemplateContext<8111>,
): Diagnostic[] {
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

export const factory: TemplateCheckFactory<8111, 'uninvokedFunctionInEventBinding'> = {
  code: 8111,
  name: 'uninvokedFunctionInEventBinding',
  create: () => new UninvokedFunctionInEventBindingSpec(),
};
