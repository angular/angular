/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  TmplAstElement,
  TmplAstNode,
  TmplAstReference,
  TmplAstTemplate,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheck, TemplateCheckFactory, TemplateContext} from '../../api';

/**
 * Detects duplicate template reference variables within the same template scope.
 *
 * Template reference variables (e.g., #ref) must have unique names within their scope
 * to avoid conflicts with ViewChild/ViewChildren queries and ensure predictable behavior.
 *
 * This diagnostic warns when multiple template reference variables with the same name
 * are declared within the same template scope, but allows duplicate names in different
 * scopes (e.g., inside nested ng-template elements).
 */
class DuplicateTemplateReferenceCheck
  implements TemplateCheck<ErrorCode.DUPLICATE_TEMPLATE_REFERENCE>
{
  code = ErrorCode.DUPLICATE_TEMPLATE_REFERENCE as const;

  run(
    ctx: TemplateContext<ErrorCode.DUPLICATE_TEMPLATE_REFERENCE>,
    component: ts.ClassDeclaration,
    template: TmplAstNode[],
  ): NgTemplateDiagnostic<ErrorCode.DUPLICATE_TEMPLATE_REFERENCE>[] {
    // Early return if no template nodes
    if (!template.length) {
      return [];
    }

    // Process the entire template tree to find duplicate references
    return this.checkTemplateScope(template, ctx);
  }

  /**
   * Check for duplicate template references within a specific template scope
   */
  private checkTemplateScope(
    nodes: TmplAstNode[],
    ctx: TemplateContext<ErrorCode.DUPLICATE_TEMPLATE_REFERENCE>,
  ): NgTemplateDiagnostic<ErrorCode.DUPLICATE_TEMPLATE_REFERENCE>[] {
    // Collect all references in the current scope
    const referencesInScope = this.collectReferencesInScope(nodes);

    // Early return if no references found
    if (!referencesInScope.length) {
      // Still need to check child scopes even if current scope has no references
      return this.checkChildTemplateScopes(nodes, ctx);
    }

    // Generate diagnostics for duplicates in current scope
    const currentScopeDiagnostics = this.generateDuplicateDiagnostics(referencesInScope, ctx);

    // Recursively check child template scopes and merge results
    const childDiagnostics = this.checkChildTemplateScopes(nodes, ctx);

    return [...currentScopeDiagnostics, ...childDiagnostics];
  }

  /**
   * Generate diagnostics for duplicate references
   */
  private generateDuplicateDiagnostics(
    references: TmplAstReference[],
    ctx: TemplateContext<ErrorCode.DUPLICATE_TEMPLATE_REFERENCE>,
  ): NgTemplateDiagnostic<ErrorCode.DUPLICATE_TEMPLATE_REFERENCE>[] {
    // Early return if less than 2 references (can't have duplicates)
    if (references.length < 2) {
      return [];
    }

    // Group references by name
    const referencesByName = references.reduce((acc, ref) => {
      if (!acc.has(ref.name)) {
        acc.set(ref.name, []);
      }
      acc.get(ref.name)!.push(ref);
      return acc;
    }, new Map<string, TmplAstReference[]>());

    // Early return if all references have unique names
    if (referencesByName.size === references.length) {
      return [];
    }

    // Generate diagnostics for duplicates
    return Array.from(referencesByName.entries())
      .filter(([_, refs]) => refs.length > 1)
      .flatMap(([name, refs]) =>
        refs
          .slice(1)
          .map((ref) =>
            ctx.makeTemplateDiagnostic(
              ref.sourceSpan,
              `Template reference variable '#${name}' is defined more than once. Previous definition at line ${refs[0].sourceSpan.start.line + 1}.`,
            ),
          ),
      );
  }

  /**
   * Check all child template scopes and return merged diagnostics
   */
  private checkChildTemplateScopes(
    nodes: TmplAstNode[],
    ctx: TemplateContext<ErrorCode.DUPLICATE_TEMPLATE_REFERENCE>,
  ): NgTemplateDiagnostic<ErrorCode.DUPLICATE_TEMPLATE_REFERENCE>[] {
    // Early return if no nodes to process
    if (!nodes.length) {
      return [];
    }

    const allDiagnostics: NgTemplateDiagnostic<ErrorCode.DUPLICATE_TEMPLATE_REFERENCE>[] = [];

    for (const node of nodes) {
      if (node instanceof TmplAstTemplate && node.tagName === 'ng-template') {
        // Only explicit ng-template elements create new child scopes
        const templateDiagnostics = this.checkTemplateScope(node.children, ctx);
        allDiagnostics.push(...templateDiagnostics);
      } else if (node instanceof TmplAstElement) {
        // For elements, check their children for nested templates
        const elementDiagnostics = this.checkElementChildren(node.children, ctx);
        allDiagnostics.push(...elementDiagnostics);
      }
    }

    return allDiagnostics;
  }

  /**
   * Process element children, looking for nested template scopes
   */
  private checkElementChildren(
    nodes: TmplAstNode[],
    ctx: TemplateContext<ErrorCode.DUPLICATE_TEMPLATE_REFERENCE>,
  ): NgTemplateDiagnostic<ErrorCode.DUPLICATE_TEMPLATE_REFERENCE>[] {
    // Early return if no nodes to process
    if (!nodes.length) {
      return [];
    }

    const allDiagnostics: NgTemplateDiagnostic<ErrorCode.DUPLICATE_TEMPLATE_REFERENCE>[] = [];

    for (const node of nodes) {
      if (node instanceof TmplAstTemplate && node.tagName === 'ng-template') {
        // Found a nested ng-template - check its scope
        const templateDiagnostics = this.checkTemplateScope(node.children, ctx);
        allDiagnostics.push(...templateDiagnostics);
      } else if (node instanceof TmplAstElement) {
        // Continue looking in element children
        const childDiagnostics = this.checkElementChildren(node.children, ctx);
        allDiagnostics.push(...childDiagnostics);
      }
    }

    return allDiagnostics;
  }

  /**
   * Collect references that belong to the current scope only (not from child templates)
   */
  private collectReferencesInScope(nodes: TmplAstNode[]): TmplAstReference[] {
    // Early return if no nodes to process
    if (!nodes.length) {
      return [];
    }

    return nodes.flatMap((node) => this.collectReferencesFromNode(node));
  }

  /**
   * Collect references from a single node
   */
  private collectReferencesFromNode(node: TmplAstNode): TmplAstReference[] {
    if (node instanceof TmplAstElement) {
      // Collect element's own references plus children references
      return [...node.references, ...this.collectReferencesInScope(node.children)];
    } else if (node instanceof TmplAstTemplate) {
      // For template nodes, we need to distinguish:
      // - Explicit ng-template: only add template's own references, children are separate scope
      // - Structural directive template: include children in current scope

      const templateRefs = [...node.references];

      // If tagName is not 'ng-template', this is likely a structural directive
      // and its children should be included in the current scope
      if (node.tagName !== 'ng-template') {
        const childRefs = this.collectReferencesInScope(node.children);
        return [...templateRefs, ...childRefs];
      }

      return templateRefs;
    }

    // Other node types (text, etc.) don't have references
    return [];
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.DUPLICATE_TEMPLATE_REFERENCE,
  ExtendedTemplateDiagnosticName.DUPLICATE_TEMPLATE_REFERENCE
> = {
  code: ErrorCode.DUPLICATE_TEMPLATE_REFERENCE,
  name: ExtendedTemplateDiagnosticName.DUPLICATE_TEMPLATE_REFERENCE,
  create: () => new DuplicateTemplateReferenceCheck(),
};
