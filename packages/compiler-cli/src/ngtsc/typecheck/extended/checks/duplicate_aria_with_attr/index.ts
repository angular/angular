/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  TmplAstBoundAttribute,
  TmplAstElement,
  TmplAstNode,
  BindingType,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

function normalizeAriaPropertyName(name: string): string {
  // Converts ariaLabel → aria-label, ariaKeyShortcuts → aria-keyshortcuts, etc.
  // ARIA attributes follow the pattern: aria-<lowercase-compound-word>
  return name.replace(/^aria([A-Z])(.*)$/, (_, firstChar, rest) => {
    // Convert to all lowercase after 'aria-': KeyShortcuts → keyshortcuts
    const normalized = (firstChar.toLowerCase() + rest).replace(/([A-Z])/g, (match: string) =>
      match.toLowerCase(),
    );
    return 'aria-' + normalized;
  });
}

/**
 * A check which detects when the same ARIA attribute is bound using multiple syntaxes.
 * This occurs when multiple bindings target the same ARIA attribute.
 */
class DuplicateAriaWithAttrCheck extends TemplateCheckWithVisitor<ErrorCode.DUPLICATE_ARIA_WITH_ATTR> {
  override code = ErrorCode.DUPLICATE_ARIA_WITH_ATTR as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.DUPLICATE_ARIA_WITH_ATTR>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.DUPLICATE_ARIA_WITH_ATTR>[] {
    if (!(node instanceof TmplAstElement) || !node.inputs?.length) {
      return [];
    }

    // Early filter to avoid processing elements without aria bindings
    const ariaInputs = node.inputs.filter(
      (input): input is TmplAstBoundAttribute =>
        input instanceof TmplAstBoundAttribute &&
        ((input.type === BindingType.Attribute && input.name.startsWith('aria-')) ||
          (input.type === BindingType.Property && input.name.startsWith('aria'))),
    );

    if (ariaInputs.length < 2) return []; // Need at least 2 aria bindings for conflicts

    // Group aria bindings by normalized name
    const ariaGroups = new Map<string, TmplAstBoundAttribute[]>();

    for (const input of ariaInputs) {
      const normalizedName =
        input.type === BindingType.Attribute
          ? input.name // Already normalized: aria-label
          : normalizeAriaPropertyName(input.name); // Convert ariaLabel → aria-label

      const list = ariaGroups.get(normalizedName) ?? [];
      list.push(input);
      ariaGroups.set(normalizedName, list);
    }

    const diagnostics: NgTemplateDiagnostic<ErrorCode.DUPLICATE_ARIA_WITH_ATTR>[] = [];

    for (const [ariaName, list] of ariaGroups) {
      if (list.length <= 1) continue;

      const attr = list.filter((input) => input.type === BindingType.Attribute);
      const prop = list.filter((input) => input.type === BindingType.Property);

      const winner = attr.length > 0 ? attr[attr.length - 1] : prop[prop.length - 1];
      const ignored = list.filter((input) => input !== winner);

      for (const ig of ignored) {
        const winnerName = winner.type === BindingType.Attribute ? `attr.${ariaName}` : winner.name;
        const ignoredName = ig.type === BindingType.Attribute ? `attr.${ariaName}` : ig.name;
        const diagnostic = ctx.makeTemplateDiagnostic(
          ig.keySpan,
          `Multiple bindings found for '[${ariaName}]'. Both '[${winnerName}]' and '[${ignoredName}]' are present. The binding '[${winnerName}]' will take priority and the binding '[${ignoredName}]' will be ignored.`,
        );
        diagnostics.push(diagnostic);
      }
    }

    return diagnostics;
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.DUPLICATE_ARIA_WITH_ATTR,
  ExtendedTemplateDiagnosticName.DUPLICATE_ARIA_WITH_ATTR
> = {
  code: ErrorCode.DUPLICATE_ARIA_WITH_ATTR,
  name: ExtendedTemplateDiagnosticName.DUPLICATE_ARIA_WITH_ATTR,
  create: () => new DuplicateAriaWithAttrCheck(),
};
