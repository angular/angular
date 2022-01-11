/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, TmplAstBoundEvent, TmplAstNode} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * Ensures the two-way binding syntax is correct.
 * Parentheses should be inside the brackets "[()]".
 * Will return diagnostic information when "([])" is found.
 */
class InvalidBananaInBoxCheck extends TemplateCheckWithVisitor<ErrorCode.INVALID_BANANA_IN_BOX> {
  override code = ErrorCode.INVALID_BANANA_IN_BOX as const;

  override visitNode(
      ctx: TemplateContext<ErrorCode.INVALID_BANANA_IN_BOX>,
      component: ts.ClassDeclaration,
      node: TmplAstNode|AST,
      ): NgTemplateDiagnostic<ErrorCode.INVALID_BANANA_IN_BOX>[] {
    if (!(node instanceof TmplAstBoundEvent)) return [];

    const name = node.name;
    if (!name.startsWith('[') || !name.endsWith(']')) return [];

    const boundSyntax = node.sourceSpan.toString();
    const expectedBoundSyntax = boundSyntax.replace(`(${name})`, `[(${name.slice(1, -1)})]`);
    const diagnostic = ctx.makeTemplateDiagnostic(
        node.sourceSpan,
        `In the two-way binding syntax the parentheses should be inside the brackets, ex. '${
            expectedBoundSyntax}'.
        Find more at https://angular.io/guide/two-way-binding`);
    return [diagnostic];
  }
}

export const factory: TemplateCheckFactory<
    ErrorCode.INVALID_BANANA_IN_BOX, ExtendedTemplateDiagnosticName.INVALID_BANANA_IN_BOX> = {
  code: ErrorCode.INVALID_BANANA_IN_BOX,
  name: ExtendedTemplateDiagnosticName.INVALID_BANANA_IN_BOX,
  create: () => new InvalidBananaInBoxCheck(),
};
