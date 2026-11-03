/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, TmplAstNode, TmplAstTemplate} from '@angular/compiler';
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
 * Ensures a user doesn't forget to omit `let` when using ngfor.
 * Will return diagnostic information when `let` is missing.
 *
 * Mirrors `MissingNgForOfLetCheck` in
 * `ngtsc/typecheck/extended/checks/missing_ngforof_let/index.ts`.
 */
class MissingNgForOfLetCheck extends TemplateCheckWithVisitor<ErrorCode.MISSING_NGFOROF_LET> {
  override code = ErrorCode.MISSING_NGFOROF_LET as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.MISSING_NGFOROF_LET>,
    _component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[] {
    if (!(node instanceof TmplAstTemplate)) {
      return [];
    }

    if (node.templateAttrs.length === 0) {
      return [];
    }
    const attr = node.templateAttrs.find((x) => x.name === 'ngFor');
    if (attr === undefined) {
      return [];
    }

    if (node.variables.length > 0) {
      return [];
    }

    const errorString = formatExtendedError(
      ErrorCode.MISSING_NGFOROF_LET,
      `Your ngFor is missing a value. Did you forget to add the \`let\` keyword?`,
    );

    return [ctx.makeTemplateDiagnostic(attr.sourceSpan, errorString)];
  }
}

export const factory: TemplateCheckFactory<ErrorCode.MISSING_NGFOROF_LET, 'missingNgForOfLet'> = {
  code: ErrorCode.MISSING_NGFOROF_LET,
  name: 'missingNgForOfLet',
  create: () => new MissingNgForOfLetCheck(),
};
