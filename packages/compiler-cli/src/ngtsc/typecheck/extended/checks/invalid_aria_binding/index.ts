/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, BindingType, TmplAstBoundAttribute, TmplAstNode} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * Ensures the two-way binding syntax is correct.
 * Parentheses should be inside the brackets "[()]".
 * Will return diagnostic information when "([])" is found.
 */
class InvalidAriaBinding extends TemplateCheckWithVisitor<ErrorCode.INVALID_ARIA_BINDING> {
  override code = ErrorCode.INVALID_ARIA_BINDING as const;

  override visitNode(
      ctx: TemplateContext<ErrorCode.INVALID_ARIA_BINDING>,
      component: ts.ClassDeclaration,
      node: TmplAstNode|AST,
      ): NgTemplateDiagnostic<ErrorCode.INVALID_ARIA_BINDING>[] {
    if (node instanceof TmplAstBoundAttribute) {
      if (node.type === BindingType.Property && node.name.startsWith('aria-')) {
        const diagnostic = ctx.makeTemplateDiagnostic(
            node.sourceSpan,
            `aria attributes must be bound using the attr. prefix, ex.: attr.${node.name}.`);
        return [diagnostic];
      }
    }

    return [];
  }
}

export const factory: TemplateCheckFactory<
    ErrorCode.INVALID_ARIA_BINDING, ExtendedTemplateDiagnosticName.INVALID_ARIA_BINDING> = {
  code: ErrorCode.INVALID_ARIA_BINDING,
  name: ExtendedTemplateDiagnosticName.INVALID_ARIA_BINDING,
  create: () => new InvalidAriaBinding(),
};
