/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, TmplAstBoundAttribute, TmplAstNode, TmplAstTextAttribute} from '@angular/compiler';
import type {Diagnostic} from '../../diagnostic.js';
import type {TcbTargetInput} from '../../tcb.js';
import {
  formatExtendedError,
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
} from '../api.js';

const NG_SKIP_HYDRATION_ATTR_NAME = 'ngSkipHydration';

/**
 * Ensures that the special attribute `ngSkipHydration` is not a binding and has no other
 * value than `"true"` or an empty value.
 *
 * Mirrors `NgSkipHydrationSpec` in
 * `ngtsc/typecheck/extended/checks/skip_hydration_not_static/index.ts`.
 */
class NgSkipHydrationSpec extends TemplateCheckWithVisitor<8108> {
  override code = 8108 as const;

  override visitNode(
    ctx: TemplateContext<8108>,
    _component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[] {
    if (node instanceof TmplAstBoundAttribute && node.name === NG_SKIP_HYDRATION_ATTR_NAME) {
      const errorString = formatExtendedError(
        8108,
        `ngSkipHydration should not be used as a binding`,
      );
      return [ctx.makeTemplateDiagnostic(node.sourceSpan, errorString)];
    }

    const acceptedValues = ['true', ''];
    if (
      node instanceof TmplAstTextAttribute &&
      node.name === NG_SKIP_HYDRATION_ATTR_NAME &&
      !acceptedValues.includes(node.value) &&
      node.value !== undefined
    ) {
      const errorString = formatExtendedError(
        8108,
        `ngSkipHydration only accepts "true" or "" as value or no value at all. For example 'ngSkipHydration="true"' or 'ngSkipHydration'`,
      );
      return [ctx.makeTemplateDiagnostic(node.sourceSpan, errorString)];
    }

    return [];
  }
}

export const factory: TemplateCheckFactory<8108, 'skipHydrationNotStatic'> = {
  code: 8108,
  name: 'skipHydrationNotStatic',
  create: () => new NgSkipHydrationSpec(),
};
