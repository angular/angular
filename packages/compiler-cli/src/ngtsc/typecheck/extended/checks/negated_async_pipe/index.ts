/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AST,
  ASTWithSource,
  BindingPipe,
  ParenthesizedExpression,
  PrefixNot,
  TmplAstIfBlock,
  TmplAstNode,
  TmplAstBoundAttribute,
  TmplAstTemplate,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * Ensures there is no negated async pipe in an `ngIf` expression or an `@if` block.
 */
class NegatedAsyncPipeCheck extends TemplateCheckWithVisitor<ErrorCode.NEGATED_ASYNC_PIPE> {
  override code = ErrorCode.NEGATED_ASYNC_PIPE as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.NEGATED_ASYNC_PIPE>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.NEGATED_ASYNC_PIPE>[] {
    if (node instanceof TmplAstTemplate) {
      const negatedAsyncPipe = node.templateAttrs.find(
        (t): t is TmplAstBoundAttribute => t.name === 'ngIf' && isNegatedAsyncPipeExpr(t.value),
      );
      if (negatedAsyncPipe) {
        return [
          ctx.makeTemplateDiagnostic(
            negatedAsyncPipe.sourceSpan,
            `An AsyncPipe should not be negated in an ngIf expression`,
          ),
        ];
      }
    } else if (node instanceof TmplAstIfBlock) {
      const negatedAsyncPipe = node.branches.find(
        (branch) => branch.expression && isNegatedAsyncPipeExpr(branch.expression),
      );
      if (negatedAsyncPipe) {
        return [
          ctx.makeTemplateDiagnostic(
            negatedAsyncPipe.sourceSpan,
            `An AsyncPipe should not be negated in an @if expression`,
          ),
        ];
      }
    }
    return [];
  }
}

function isNegatedAsyncPipeExpr(expr: AST | null | string): boolean {
  return (
    expr instanceof ASTWithSource &&
    expr.ast instanceof PrefixNot &&
    expr.ast.expression instanceof ParenthesizedExpression &&
    expr.ast.expression.expression instanceof BindingPipe &&
    expr.ast.expression.expression.name === 'async'
  );
}

export const factory: TemplateCheckFactory<
  ErrorCode.NEGATED_ASYNC_PIPE,
  ExtendedTemplateDiagnosticName.NEGATED_ASYNC_PIPE
> = {
  code: ErrorCode.NEGATED_ASYNC_PIPE,
  name: ExtendedTemplateDiagnosticName.NEGATED_ASYNC_PIPE,
  create: () => new NegatedAsyncPipeCheck(),
};
