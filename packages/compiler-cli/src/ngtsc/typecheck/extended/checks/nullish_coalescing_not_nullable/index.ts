/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, Binary, TmplAstNode} from '@angular/compiler';
import ts from 'typescript';

import {NgCompilerOptions} from '../../../../core/api';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic, SymbolKind} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * Ensures the left side of a nullish coalescing operation is nullable.
 * Returns diagnostics for the cases where the operator is useless.
 * This check should only be use if `strictNullChecks` is enabled,
 * otherwise it would produce inaccurate results.
 */
class NullishCoalescingNotNullableCheck extends
    TemplateCheckWithVisitor<ErrorCode.NULLISH_COALESCING_NOT_NULLABLE> {
  override code = ErrorCode.NULLISH_COALESCING_NOT_NULLABLE as const;

  override visitNode(
      ctx: TemplateContext<ErrorCode.NULLISH_COALESCING_NOT_NULLABLE>,
      component: ts.ClassDeclaration,
      node: TmplAstNode|AST): NgTemplateDiagnostic<ErrorCode.NULLISH_COALESCING_NOT_NULLABLE>[] {
    if (!(node instanceof Binary) || node.operation !== '??') return [];

    const symbolLeft = ctx.templateTypeChecker.getSymbolOfNode(node.left, component);
    if (symbolLeft === null || symbolLeft.kind !== SymbolKind.Expression) {
      return [];
    }
    const typeLeft = symbolLeft.tsType;
    if (typeLeft.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
      // We should not make assumptions about the any and unknown types; using a nullish coalescing
      // operator is acceptable for those.
      return [];
    }

    // If the left operand's type is different from its non-nullable self, then it must
    // contain a null or undefined so this nullish coalescing operator is useful. No diagnostic to
    // report.
    if (typeLeft.getNonNullableType() !== typeLeft) return [];

    const symbol = ctx.templateTypeChecker.getSymbolOfNode(node, component)!;
    if (symbol.kind !== SymbolKind.Expression) {
      return [];
    }
    const templateMapping =
        ctx.templateTypeChecker.getTemplateMappingAtTcbLocation(symbol.tcbLocation);
    if (templateMapping === null) {
      return [];
    }
    const diagnostic = ctx.makeTemplateDiagnostic(
        templateMapping.span,
        `The left side of this nullish coalescing operation does not include 'null' or 'undefined' in its type, therefore the '??' operator can be safely removed.`);
    return [diagnostic];
  }
}

export const factory: TemplateCheckFactory<
    ErrorCode.NULLISH_COALESCING_NOT_NULLABLE,
    ExtendedTemplateDiagnosticName.NULLISH_COALESCING_NOT_NULLABLE> = {
  code: ErrorCode.NULLISH_COALESCING_NOT_NULLABLE,
  name: ExtendedTemplateDiagnosticName.NULLISH_COALESCING_NOT_NULLABLE,
  create: (options: NgCompilerOptions) => {
    // Require `strictNullChecks` to be enabled.
    const strictNullChecks =
        options.strictNullChecks === undefined ? !!options.strict : !!options.strictNullChecks;
    if (!strictNullChecks) {
      return null;
    }

    return new NullishCoalescingNotNullableCheck();
  },
};
