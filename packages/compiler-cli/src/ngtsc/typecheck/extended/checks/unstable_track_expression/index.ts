/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  LiteralArray,
  LiteralMap,
  ParenthesizedExpression,
  TmplAstForLoopBlock,
  TmplAstNode,
} from '@angular/compiler';
import ts from 'typescript';

import {DiagnosticCategoryLabel} from '../../../../core/api';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
  formatExtendedError,
} from '../../api';

/** Detects object and array literals used directly as @for tracking keys. */
class UnstableTrackExpressionCheck extends TemplateCheckWithVisitor<ErrorCode.UNSTABLE_TRACK_EXPRESSION> {
  override code = ErrorCode.UNSTABLE_TRACK_EXPRESSION as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.UNSTABLE_TRACK_EXPRESSION>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.UNSTABLE_TRACK_EXPRESSION>[] {
    if (!(node instanceof TmplAstForLoopBlock) || node.trackBy === null) {
      return [];
    }

    let expression = node.trackBy.ast;
    while (expression instanceof ParenthesizedExpression) {
      expression = expression.expression;
    }

    if (!(expression instanceof LiteralMap) && !(expression instanceof LiteralArray)) {
      return [];
    }

    return [
      ctx.makeTemplateDiagnostic(
        node.trackBy.ast.sourceSpan,
        formatExtendedError(
          ErrorCode.UNSTABLE_TRACK_EXPRESSION,
          'The @for tracking expression creates a new object or array on every evaluation. ' +
            'Use a stable tracking key, such as a unique property of the loop item, ' +
            'instead of creating a new object or array.',
        ),
      ),
    ];
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.UNSTABLE_TRACK_EXPRESSION,
  ExtendedTemplateDiagnosticName.UNSTABLE_TRACK_EXPRESSION
> = {
  code: ErrorCode.UNSTABLE_TRACK_EXPRESSION,
  name: ExtendedTemplateDiagnosticName.UNSTABLE_TRACK_EXPRESSION,
  create: (options) => {
    // Require an explicit category so that adding this check cannot break builds that use
    // defaultCategory: 'error'. The existing factory hook also avoids a template traversal
    // for applications that have not opted in.
    const category = options.extendedDiagnostics?.checks?.unstableTrackExpression;
    return category === DiagnosticCategoryLabel.Warning ||
      category === DiagnosticCategoryLabel.Error
      ? new UnstableTrackExpressionCheck()
      : null;
  },
};
