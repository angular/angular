/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, TmplAstBoundAttribute, TmplAstNode, TmplAstTextAttribute} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

const NG_SKIP_HYDRATION_ATTR_NAME = 'ngSkipHydration';

/**
 * Ensures that the special attribute `ngSkipHydration` is not a binding and has no other
 * value than `"true"` or an empty value.
 */
class NgSkipHydrationSpec extends TemplateCheckWithVisitor<ErrorCode.SKIP_HYDRATION_NOT_STATIC> {
  override code = ErrorCode.SKIP_HYDRATION_NOT_STATIC as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.SKIP_HYDRATION_NOT_STATIC>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.SKIP_HYDRATION_NOT_STATIC>[] {
    /** Binding should always error */
    if (node instanceof TmplAstBoundAttribute && node.name === NG_SKIP_HYDRATION_ATTR_NAME) {
      const errorString = `ngSkipHydration should not be used as a binding.`;
      const diagnostic = ctx.makeTemplateDiagnostic(node.sourceSpan, errorString);
      return [diagnostic];
    }

    /** No value, empty string or `"true"` are the only valid values */
    const acceptedValues = ['true', '' /* empty string */];
    if (
      node instanceof TmplAstTextAttribute &&
      node.name === NG_SKIP_HYDRATION_ATTR_NAME &&
      !acceptedValues.includes(node.value) &&
      node.value !== undefined
    ) {
      const errorString = `ngSkipHydration only accepts "true" or "" as value or no value at all. For example 'ngSkipHydration="true"' or 'ngSkipHydration'`;
      const diagnostic = ctx.makeTemplateDiagnostic(node.sourceSpan, errorString);
      return [diagnostic];
    }

    return [];
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.SKIP_HYDRATION_NOT_STATIC,
  ExtendedTemplateDiagnosticName.SKIP_HYDRATION_NOT_STATIC
> = {
  code: ErrorCode.SKIP_HYDRATION_NOT_STATIC,
  name: ExtendedTemplateDiagnosticName.SKIP_HYDRATION_NOT_STATIC,
  create: () => new NgSkipHydrationSpec(),
};
