/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, TmplAstNode, TmplAstReference as Reference} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * Ensures component variables don't shadow any template reference.
 * Will return diagnostic information when any shadow is found.
 */
class ComponentVariableShadowsTemplateReference extends
    TemplateCheckWithVisitor<ErrorCode.COMPONENT_VARIABLE_SHADOWS_TEMPLATE_REFERENCE> {
  override code = ErrorCode.COMPONENT_VARIABLE_SHADOWS_TEMPLATE_REFERENCE as const;

  override visitNode(
      ctx: TemplateContext<ErrorCode.COMPONENT_VARIABLE_SHADOWS_TEMPLATE_REFERENCE>,
      component: ts.ClassDeclaration,
      node: TmplAstNode|AST,
      ): NgTemplateDiagnostic<ErrorCode.COMPONENT_VARIABLE_SHADOWS_TEMPLATE_REFERENCE>[] {
    if (!(node instanceof Reference)) return [];

    const templateReference = node.name;
    const componentVariables =
        component.members.map(member => (member.name as ts.Identifier)?.escapedText.toString());

    if (!componentVariables.includes(templateReference)) {
      return [];
    }

    const diagnostic = ctx.makeTemplateDiagnostic(
        node.sourceSpan,
        `you have a component variable and template reference with the same name "${
            templateReference}"`);

    return [diagnostic];
  }
}
export const factory: TemplateCheckFactory<
    ErrorCode.COMPONENT_VARIABLE_SHADOWS_TEMPLATE_REFERENCE,
    ExtendedTemplateDiagnosticName.COMPONENT_VARIABLE_SHADOWS_TEMPLATE_REFERENCE> = {
  code: ErrorCode.COMPONENT_VARIABLE_SHADOWS_TEMPLATE_REFERENCE,
  name: ExtendedTemplateDiagnosticName.COMPONENT_VARIABLE_SHADOWS_TEMPLATE_REFERENCE,
  create: () => new ComponentVariableShadowsTemplateReference(),
};
