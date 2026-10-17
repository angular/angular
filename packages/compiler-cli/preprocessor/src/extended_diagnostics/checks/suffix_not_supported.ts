/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, BindingType, TmplAstBoundAttribute, TmplAstNode} from '@angular/compiler';
import type {Diagnostic} from '../../diagnostic.js';
import type {TcbTargetInput} from '../../tcb.js';
import {
  formatExtendedError,
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
} from '../api.js';

const STYLE_SUFFIXES = ['px', '%', 'em'];

const SUFFIX_ERROR_MSG = formatExtendedError(
  8106,
  `The ${STYLE_SUFFIXES.map((suffix) => `'.${suffix}'`).join(', ')} suffixes are only supported on style bindings`,
);

/**
 * A check which detects when the `.px`, `.%`, and `.em` suffixes are used with an attribute
 * binding. These suffixes are only available for style bindings.
 *
 * Mirrors `SuffixNotSupportedCheck` in
 * `ngtsc/typecheck/extended/checks/suffix_not_supported/index.ts`.
 */
class SuffixNotSupportedCheck extends TemplateCheckWithVisitor<8106> {
  override code = 8106 as const;

  override visitNode(
    ctx: TemplateContext<8106>,
    _component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[] {
    if (!(node instanceof TmplAstBoundAttribute)) return [];

    if (
      node.type !== BindingType.Attribute ||
      !STYLE_SUFFIXES.some((suffix) => node.name.endsWith(`.${suffix}`))
    ) {
      return [];
    }

    return [ctx.makeTemplateDiagnostic(node.keySpan, SUFFIX_ERROR_MSG)];
  }
}

export const factory: TemplateCheckFactory<8106, 'suffixNotSupported'> = {
  code: 8106,
  name: 'suffixNotSupported',
  create: () => new SuffixNotSupportedCheck(),
};
