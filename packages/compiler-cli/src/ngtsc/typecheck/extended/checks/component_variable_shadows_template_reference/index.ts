/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, TmplAstNode as Node, TmplAstReference as Reference, TmplAstVariable as Variable} from '@angular/compiler';
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
      node: Node|AST,
      ): NgTemplateDiagnostic<ErrorCode.COMPONENT_VARIABLE_SHADOWS_TEMPLATE_REFERENCE>[] {
    if (!(node instanceof Reference || node instanceof Variable)) return [];

    const templateReference = node.name;
    const parent = component.parent as unknown as
        {classifiableNames: Set<string>, identifiers: Map<string, string>};
    const componentVariables = new Set<string>();
    for (let id of parent.identifiers.keys()) {
      if (!parent.classifiableNames.has(id)) {
        componentVariables.add(id);
      }
    }

    if (!componentVariables.has(templateReference)) {
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
