/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, TmplAstBoundEvent, TmplAstNode} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * Ensures the two-way binding syntax is correct.
 * Parentheses should be inside the brackets "[()]".
 * Will return diagnostic information when "([])" is found.
 */
export class InvalidBananaInBoxCheck extends
    TemplateCheckWithVisitor<ErrorCode.INVALID_BANANA_IN_BOX> {
  override code = ErrorCode.INVALID_BANANA_IN_BOX as const;

  override visitNode(ctx: TemplateContext, component: ts.ClassDeclaration, node: TmplAstNode|AST):
      NgTemplateDiagnostic<ErrorCode.INVALID_BANANA_IN_BOX>[] {
    if (!(node instanceof TmplAstBoundEvent)) return [];

    const name = node.name;
    if (!name.startsWith('[') || !name.endsWith(']')) return [];

    const boundSyntax = node.sourceSpan.toString();
    const expectedBoundSyntax = boundSyntax.replace(`(${name})`, `[(${name.slice(1, -1)})]`);
    const diagnostic = ctx.templateTypeChecker.makeTemplateDiagnostic(
        component, node.sourceSpan, ts.DiagnosticCategory.Warning, ErrorCode.INVALID_BANANA_IN_BOX,
        `In the two-way binding syntax the parentheses should be inside the brackets, ex. '${
            expectedBoundSyntax}'.
        Find more at https://angular.io/guide/two-way-binding`);
    return [diagnostic];
  }
}
