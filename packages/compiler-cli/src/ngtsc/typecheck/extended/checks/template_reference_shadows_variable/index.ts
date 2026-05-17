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
 * Warns when a template reference variable (`#ref`) uses the same name as a public member
 * on the component class, since the template reference silently shadows the class member
 * within the template scope.
 */
class TemplateReferenceShadowsVariableCheck extends TemplateCheckWithVisitor<ErrorCode.TEMPLATE_REFERENCE_SHADOWS_COMPONENT_VARIABLE> {
  override code = ErrorCode.TEMPLATE_REFERENCE_SHADOWS_COMPONENT_VARIABLE as const;

  private memberNames = new Set<string>();

  override run(
    ctx: TemplateContext<ErrorCode.TEMPLATE_REFERENCE_SHADOWS_COMPONENT_VARIABLE>,
    component: ts.ClassDeclaration,
    template: TmplAstNode[],
  ): NgTemplateDiagnostic<ErrorCode.TEMPLATE_REFERENCE_SHADOWS_COMPONENT_VARIABLE>[] {
    // Collect once per component so `visitNode` doesn't repeat the work for every node.
    this.memberNames = collectPublicMemberNames(component);
    const diagnostics = super.run(ctx, component, template);
    // Clear after the visit so the instance doesn't hold references between components.
    this.memberNames = new Set();
    return diagnostics;
  }

  override visitNode(
    ctx: TemplateContext<ErrorCode.TEMPLATE_REFERENCE_SHADOWS_COMPONENT_VARIABLE>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.TEMPLATE_REFERENCE_SHADOWS_COMPONENT_VARIABLE>[] {
    // Only template reference variables (`#ref`) can shadow class members.
    if (!(node instanceof TmplAstReference)) return [];
    // No class member with this name — nothing is shadowed.
    if (!this.memberNames.has(node.name)) return [];

    return [
      ctx.makeTemplateDiagnostic(
        node.keySpan,
        formatExtendedError(
          ErrorCode.TEMPLATE_REFERENCE_SHADOWS_COMPONENT_VARIABLE,
          `The template reference #${node.name} shadows the component member '${node.name}'.`,
        ),
      ),
    ];
  }
}

/** Collects names of public, non-static class members accessible in a template. */
function collectPublicMemberNames(component: ts.ClassDeclaration): Set<string> {
  const names = new Set<string>();
  for (const member of component.members) {
    // Constructors and index signatures don't have a usable name, so they can be skipped.
    // Computed property names (for example `[Symbol.iterator]()`) also can't be referenced
    // from a template using a plain identifier, so only simple `ts.Identifier` names are relevant here.
    if (!member.name || !ts.isIdentifier(member.name)) continue;

    const modifiers = ts.canHaveModifiers(member) ? (ts.getModifiers(member) ?? []) : [];
    const isPrivate = modifiers.some((m) => m.kind === ts.SyntaxKind.PrivateKeyword);
    const isStatic = modifiers.some((m) => m.kind === ts.SyntaxKind.StaticKeyword);
    if (!isPrivate && !isStatic) {
      names.add(member.name.text);
    }
  }
  return names;
}

export const factory: TemplateCheckFactory<
  ErrorCode.TEMPLATE_REFERENCE_SHADOWS_COMPONENT_VARIABLE,
  ExtendedTemplateDiagnosticName.TEMPLATE_REFERENCE_SHADOWS_COMPONENT_VARIABLE
> = {
  code: ErrorCode.TEMPLATE_REFERENCE_SHADOWS_COMPONENT_VARIABLE,
  name: ExtendedTemplateDiagnosticName.TEMPLATE_REFERENCE_SHADOWS_COMPONENT_VARIABLE,
  create: () => new TemplateReferenceShadowsVariableCheck(),
};
