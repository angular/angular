/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, TmplAstBoundEvent, TmplAstNode} from '@angular/compiler';
import {ErrorCode} from '../../error_code.js';
import type {Diagnostic} from '../../diagnostic.js';
import type {TcbTargetInput} from '../../tcb.js';
import {
  formatExtendedError,
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
} from '../api.js';

/**
 * Ensures the two-way binding syntax is correct.
 * Parentheses should be inside the brackets "[()]".
 * Will return diagnostic information when "([])" is found.
 *
 * Mirrors `InvalidBananaInBoxCheck` in
 * `ngtsc/typecheck/extended/checks/invalid_banana_in_box/index.ts`.
 */
class InvalidBananaInBoxCheck extends TemplateCheckWithVisitor<ErrorCode.INVALID_BANANA_IN_BOX> {
  override code = ErrorCode.INVALID_BANANA_IN_BOX as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.INVALID_BANANA_IN_BOX>,
    _component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[] {
    if (!(node instanceof TmplAstBoundEvent)) return [];

    const name = node.name;
    if (!name.startsWith('[') || !name.endsWith(']')) return [];

    const boundSyntax = node.sourceSpan.toString();
    const expectedBoundSyntax = boundSyntax.replace(`(${name})`, `[(${name.slice(1, -1)})]`);
    const diagnostic = ctx.makeTemplateDiagnostic(
      node.sourceSpan,
      formatExtendedError(
        ErrorCode.INVALID_BANANA_IN_BOX,
        `In the two-way binding syntax the parentheses should be inside the brackets, ex. '${expectedBoundSyntax}'`,
      ),
    );
    return [diagnostic];
  }
}

export const factory: TemplateCheckFactory<ErrorCode.INVALID_BANANA_IN_BOX, 'invalidBananaInBox'> =
  {
    code: ErrorCode.INVALID_BANANA_IN_BOX,
    name: 'invalidBananaInBox',
    create: () => new InvalidBananaInBoxCheck(),
  };
