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
import type {Diagnostic} from '../../diagnostic.js';
import type {TcbTargetInput} from '../../tcb.js';
import {
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
  formatExtendedError,
} from '../api.js';

/** Detects object and array literals used directly as @for tracking keys. */
class UnstableTrackExpressionCheck extends TemplateCheckWithVisitor<8120> {
  override code = 8120 as const;

  override visitNode(
    ctx: TemplateContext<8120>,
    _component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[] {
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
          8120,
          'The @for tracking expression creates a new object or array on every evaluation. ' +
            'Use a stable tracking key, such as a unique property of the loop item, ' +
            'instead of creating a new object or array.',
        ),
      ),
    ];
  }
}

export const factory: TemplateCheckFactory<8120, 'unstableTrackExpression'> = {
  code: 8120,
  name: 'unstableTrackExpression',
  create: (options) => {
    // Require an explicit category so that adding this check cannot break builds that use
    // defaultCategory: 'error'. The existing factory hook also avoids a template traversal
    // for applications that have not opted in.
    const category = options?.extendedDiagnostics?.checks?.unstableTrackExpression;
    return category === 'warning' || category === 'error'
      ? new UnstableTrackExpressionCheck()
      : null;
  },
};
