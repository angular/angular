/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, TmplAstNode, TmplAstReference} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
  formatExtendedError,
} from '../../api';

/**
 * Ensures that template reference variables do not shadow component class members.
 */
class TemplateReferenceShadowsClassMemberCheck extends TemplateCheckWithVisitor<ErrorCode.TEMPLATE_REFERENCE_SHADOWS_CLASS_MEMBER> {
  override code = ErrorCode.TEMPLATE_REFERENCE_SHADOWS_CLASS_MEMBER as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.TEMPLATE_REFERENCE_SHADOWS_CLASS_MEMBER>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.TEMPLATE_REFERENCE_SHADOWS_CLASS_MEMBER>[] {
    if (!(node instanceof TmplAstReference)) {
      return [];
    }

    const refName = node.name;

    // Check if any member of the component class (including inherited members) has the same name.
    const componentType = ctx.typeChecker.getTypeAtLocation(component);
    const classMember = componentType.getProperty(refName);
    if (classMember === undefined) {
      return [];
    }

    const errorString = formatExtendedError(
      ErrorCode.TEMPLATE_REFERENCE_SHADOWS_CLASS_MEMBER,
      `Template reference variable '#${refName}' shadows the class member '${refName}'. ` +
        `Within the template, '${refName}' will refer to the template reference, ` +
        `not the class property.`,
    );

    const diagnostic = ctx.makeTemplateDiagnostic(node.keySpan, errorString);
    return [diagnostic];
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.TEMPLATE_REFERENCE_SHADOWS_CLASS_MEMBER,
  ExtendedTemplateDiagnosticName.TEMPLATE_REFERENCE_SHADOWS_CLASS_MEMBER
> = {
  code: ErrorCode.TEMPLATE_REFERENCE_SHADOWS_CLASS_MEMBER,
  name: ExtendedTemplateDiagnosticName.TEMPLATE_REFERENCE_SHADOWS_CLASS_MEMBER,
  create: () => new TemplateReferenceShadowsClassMemberCheck(),
};
