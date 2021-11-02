/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, Binary, TmplAstNode} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode} from '../../../../diagnostics';
import {NgTemplateDiagnostic, SymbolKind} from '../../../api';
import {TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * Ensures the left side of a nullish coalescing operation is nullable.
 * Returns diagnostics for the cases where the operator is useless.
 * This check should only be use if `strictNullChecks` is enabled,
 * otherwise it would produce inaccurate results.
 */
export class NullishCoalescingNotNullableCheck extends
    TemplateCheckWithVisitor<ErrorCode.NULLISH_COALESCING_NOT_NULLABLE> {
  override code = ErrorCode.NULLISH_COALESCING_NOT_NULLABLE as const;

  override visitNode(ctx: TemplateContext, component: ts.ClassDeclaration, node: TmplAstNode|AST):
      NgTemplateDiagnostic<ErrorCode.NULLISH_COALESCING_NOT_NULLABLE>[] {
    if (!(node instanceof Binary) || node.operation !== '??') return [];

    const symbolLeft = ctx.templateTypeChecker.getSymbolOfNode(node.left, component);
    if (symbolLeft === null || symbolLeft.kind !== SymbolKind.Expression) {
      return [];
    }
    const typeLeft = symbolLeft.tsType;
    // If the left operand's type is different from its non-nullable self, then it must
    // contain a null or undefined so this nullish coalescing operator is useful. No diagnostic to
    // report.
    if (typeLeft.getNonNullableType() !== typeLeft) return [];

    const symbol = ctx.templateTypeChecker.getSymbolOfNode(node, component)!;
    if (symbol.kind !== SymbolKind.Expression) {
      return [];
    }
    const span =
        ctx.templateTypeChecker.getTemplateMappingAtShimLocation(symbol.shimLocation)!.span;
    const diagnostic = ctx.templateTypeChecker.makeTemplateDiagnostic(
        component, span, ts.DiagnosticCategory.Warning, ErrorCode.NULLISH_COALESCING_NOT_NULLABLE,
        `The left side of this nullish coalescing operation does not include 'null' or 'undefined' in its type, therefore the '??' operator can be safely removed.`);
    return [diagnostic];
  }
}
