/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  getAttributeResolver,
  isNgContainer,
  TmplAstElement,
  TmplAstNode,
} from '@angular/compiler';
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
 * Warns when an attribute resolver binding on an element, such as `(class)`, `(style)`, or
 * `(attr.role)`, sits next to a directive output of the same name.
 */
class OutputShadowedByAttributeResolverCheck extends TemplateCheckWithVisitor<ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER> {
  override code = ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER>[] {
    // A resolver on `<ng-container>` is reported by type checking instead.
    if (!(node instanceof TmplAstElement) || isNgContainer(node.name)) return [];

    const bindings = node.outputs.flatMap((output) => {
      const resolver = getAttributeResolver(output.name, output.type, output.target);
      return resolver === null ? [] : [{output, attribute: resolver.attribute}];
    });
    if (bindings.length === 0) return [];

    const directives = ctx.templateTypeChecker.getDirectivesOfNode(component, node) ?? [];
    const diagnostics: NgTemplateDiagnostic<ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER>[] = [];

    for (const {output, attribute} of bindings) {
      const directive = directives.find((dir) => dir.outputs.hasBindingPropertyName(output.name));
      if (directive === undefined) continue;

      const resolved = attribute === 'class' ? 'classes' : `\`${attribute}\` attribute`;
      const errorString = formatExtendedError(
        ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER,
        `The \`(${output.name})\` binding resolves the element's ${resolved}, so it doesn't ` +
          `listen to the \`${output.name}\` output of \`${directive.name}\`. Rename the output ` +
          `to listen to it.`,
      );
      diagnostics.push(ctx.makeTemplateDiagnostic(output.keySpan, errorString));
    }

    return diagnostics;
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER,
  ExtendedTemplateDiagnosticName.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER
> = {
  code: ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER,
  name: ExtendedTemplateDiagnosticName.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER,
  create: () => new OutputShadowedByAttributeResolverCheck(),
};
