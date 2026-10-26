/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, Interpolation, PropertyRead, SafePropertyRead, TmplAstNode} from '@angular/compiler';
import type {Diagnostic} from '../../diagnostic.js';
import type {TcbTargetInput} from '../../tcb.js';
import {
  formatExtendedError,
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
} from '../api.js';

/**
 * Ensures that functions referenced in text interpolations are invoked.
 *
 * Mirrors `UninvokedFunctionInTextInterpolation` in
 * `ngtsc/typecheck/extended/checks/uninvoked_function_in_text_interpolation/index.ts`.
 */
class UninvokedFunctionInTextInterpolation extends TemplateCheckWithVisitor<8117> {
  override code = 8117 as const;

  override visitNode(
    ctx: TemplateContext<8117>,
    _component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[] {
    if (!(node instanceof Interpolation)) {
      return [];
    }

    for (const expression of node.expressions) {
      if (!(expression instanceof PropertyRead) && !(expression instanceof SafePropertyRead)) {
        continue;
      }

      if (ctx.boundTarget.getExpressionTarget(expression) !== null) {
        continue;
      }

      ctx.addExtendedCheckCandidate?.({
        kind: 'notCallable',
        expr: expression,
        sourceSpan: expression.nameSpan,
        message: formatExtendedError(
          8117,
          `Function in text interpolation should be invoked: ${expression.name}()`,
        ),
      });
    }

    return [];
  }
}

export const factory: TemplateCheckFactory<8117, 'uninvokedFunctionInTextInterpolation'> = {
  code: 8117,
  name: 'uninvokedFunctionInTextInterpolation',
  create: () => new UninvokedFunctionInTextInterpolation(),
};
