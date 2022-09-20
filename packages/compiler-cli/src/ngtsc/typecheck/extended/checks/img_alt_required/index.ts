/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, ParseSourceSpan, TmplAstElement, TmplAstNode} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic, SymbolKind} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

class ImgAltRequiredCheck extends TemplateCheckWithVisitor<ErrorCode.IMG_ALT_REQUIRED> {
  override code = ErrorCode.IMG_ALT_REQUIRED as const;

  override visitNode(
      ctx: TemplateContext<ErrorCode.IMG_ALT_REQUIRED>,
      component: ts.ClassDeclaration,
      node: TmplAstNode|AST,
      ): NgTemplateDiagnostic<ErrorCode.IMG_ALT_REQUIRED>[] {
    // Image tags can only be elements.
    if (!(node instanceof TmplAstElement)) return [];

    // Limit to just `<img />` tags.
    if (node.name !== 'img') return [];

    // If the `alt` already has a value, then no issue. `valueSpan` is set only if there is an
    // assigned value (`alt="foo"` vs `alt`). We use this to emit a diagnostic for `alt` (which is
    // wrong) but not emit a diagnostic for `alt=""`, which signals that the image is not
    // semantically meaningful and should be ignored for a11y purposes.
    const alt = node.attributes.find(({name}) => name === 'alt');
    if (alt && alt.valueSpan) return [];

    // Check for a data binding on the `alt` attribute.
    const boundAlt = node.inputs.find(({name}) => name === 'alt');
    if (boundAlt) {
      // `alt` attribute is bound, validate it's type, since a nullable or optional type will remove
      // the `alt` tag if not set.
      const boundSymbol = ctx.templateTypeChecker.getSymbolOfNode(boundAlt.value, component);
      if (!boundSymbol || boundSymbol.kind !== SymbolKind.Expression) return [];

      const boundType = boundSymbol.tsType;
      if (boundType.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
        // Don't make any assumptions about `any` or `unknown`, binding `alt` to these types may
        // sometimes be reasonable, so we assume it always is.
        return [];
      }

      // If the `alt` binding is a non-nullable type (does not allow `null` or `undefined`), then it
      // will always be set to some valid value.
      if (boundType.getNonNullableType() === boundType) return [];

      // `alt` binding may be `null` or `undefined`, and doing so will lead to a removed or invalid
      // `alt` attribute.
      return [ctx.makeTemplateDiagnostic(
          boundAlt.keySpan,
          `
The \`alt\` attribute is bound to a type which includes \`null\` or \`undefined\`. When used, these
values remove the \`alt\` attribute entirely and reduce site accessibility. Remove \`null\` and
\`undefined\` from the bound type.
        `.trim()
              .split('\n')
              .join(' '),
          )];
    } else {
      // `<img />` tag is missing an `alt` attribute. Emit a diagnostic.
      // Place the error at the empty `alt` attribute if present, otherwise place it at the `img`
      // tag so as not to highlight a potentially large amount of text.
      const span = alt?.keySpan ?? getTagSpan(node);
      return [ctx.makeTemplateDiagnostic(
          span,
          `
The \`alt\` attribute is required for \`img\` tags to describe the image for users and
improve site accessibility.
        `.trim()
              .split('\n')
              .join(' '),
          )];
    }
  }
}

/** Returns a span for the tag name of the given element. */
function getTagSpan(node: TmplAstElement): ParseSourceSpan {
  return {
    ...node.startSourceSpan,
    start: node.startSourceSpan.start.moveBy('<'.length),
    end: node.startSourceSpan.start.moveBy('<img'.length),
  };
}

export const factory: TemplateCheckFactory<
    ErrorCode.IMG_ALT_REQUIRED, ExtendedTemplateDiagnosticName.IMG_ALT_REQUIRED> = {
  code: ErrorCode.IMG_ALT_REQUIRED,
  name: ExtendedTemplateDiagnosticName.IMG_ALT_REQUIRED,
  create: () => new ImgAltRequiredCheck(),
};
