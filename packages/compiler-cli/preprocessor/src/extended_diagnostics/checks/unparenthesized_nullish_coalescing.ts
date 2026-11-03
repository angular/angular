/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, Binary, TmplAstNode} from '@angular/compiler';
import {ErrorCode} from '@angular/compiler-cli/private/hybrid_preprocessor';
import type {Diagnostic} from '../../diagnostic.js';
import type {TcbTargetInput} from '../../tcb.js';
import {
  formatExtendedError,
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
} from '../api.js';

/**
 * Ensures that parentheses are used to disambiguate precedence when nullish coalescing is mixed
 * with logical and/or. Returns diagnostics for the cases where parentheses are needed.
 *
 * Mirrors `UnparenthesizedNullishCoalescing` in
 * `ngtsc/typecheck/extended/checks/unparenthesized_nullish_coalescing/index.ts`.
 */
class UnparenthesizedNullishCoalescing extends TemplateCheckWithVisitor<ErrorCode.UNPARENTHESIZED_NULLISH_COALESCING> {
  override code = ErrorCode.UNPARENTHESIZED_NULLISH_COALESCING as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.UNPARENTHESIZED_NULLISH_COALESCING>,
    _component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[] {
    if (node instanceof Binary) {
      if (node.operation === '&&' || node.operation === '||') {
        if (
          (node.left instanceof Binary && node.left.operation === '??') ||
          (node.right instanceof Binary && node.right.operation === '??')
        ) {
          const diagnostic = ctx.makeTemplateDiagnostic(
            node.sourceSpan,
            formatExtendedError(
              ErrorCode.UNPARENTHESIZED_NULLISH_COALESCING,
              `Parentheses are required to disambiguate precedence when mixing '??' with '&&' and '||'`,
            ),
          );
          return [diagnostic];
        }
      }
    }
    return [];
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.UNPARENTHESIZED_NULLISH_COALESCING,
  'unparenthesizedNullishCoalescing'
> = {
  code: ErrorCode.UNPARENTHESIZED_NULLISH_COALESCING,
  name: 'unparenthesizedNullishCoalescing',
  create: () => new UnparenthesizedNullishCoalescing(),
};
