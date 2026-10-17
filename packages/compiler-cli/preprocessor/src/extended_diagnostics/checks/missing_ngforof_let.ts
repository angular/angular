/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, TmplAstNode, TmplAstTemplate} from '@angular/compiler';
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
class MissingNgForOfLetCheck extends TemplateCheckWithVisitor<8105> {
  override code = 8105 as const;

  override visitNode(
    ctx: TemplateContext<8105>,
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
      8105,
      `Your ngFor is missing a value. Did you forget to add the \`let\` keyword?`,
    );

    return [ctx.makeTemplateDiagnostic(attr.sourceSpan, errorString)];
  }
}

export const factory: TemplateCheckFactory<8105, 'missingNgForOfLet'> = {
  code: 8105,
  name: 'missingNgForOfLet',
  create: () => new MissingNgForOfLetCheck(),
};
