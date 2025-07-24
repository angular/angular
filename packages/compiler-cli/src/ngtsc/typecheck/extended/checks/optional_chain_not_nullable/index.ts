/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, SafeCall, SafeKeyedRead, SafePropertyRead, TmplAstNode} from '@angular/compiler';
import ts from 'typescript';

import {NgCompilerOptions} from '../../../../core/api';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic, SymbolKind} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * Ensures the left side of an optional chain operation is nullable.
 * Returns diagnostics for the cases where the operator is useless.
 * This check should only be use if `strictNullChecks` is enabled,
 * otherwise it would produce inaccurate results.
 */
class OptionalChainNotNullableCheck extends TemplateCheckWithVisitor<ErrorCode.OPTIONAL_CHAIN_NOT_NULLABLE> {
  override readonly canVisitStructuralAttributes = false;
  override code = ErrorCode.OPTIONAL_CHAIN_NOT_NULLABLE as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.OPTIONAL_CHAIN_NOT_NULLABLE>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.OPTIONAL_CHAIN_NOT_NULLABLE>[] {
    if (
      !(node instanceof SafeCall) &&
      !(node instanceof SafePropertyRead) &&
      !(node instanceof SafeKeyedRead)
    )
      return [];

    const symbolLeft = ctx.templateTypeChecker.getSymbolOfNode(node.receiver, component);
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
    const templateMapping = ctx.templateTypeChecker.getSourceMappingAtTcbLocation(
      symbol.tcbLocation,
    );
    if (templateMapping === null) {
      return [];
    }
    const advice =
      node instanceof SafePropertyRead
        ? `the '?.' operator can be replaced with the '.' operator`
        : `the '?.' operator can be safely removed`;
    const diagnostic = ctx.makeTemplateDiagnostic(
      templateMapping.span,
      `The left side of this optional chain operation does not include 'null' or 'undefined' in its type, therefore ${advice}.`,
    );
    return [diagnostic];
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.OPTIONAL_CHAIN_NOT_NULLABLE,
  ExtendedTemplateDiagnosticName.OPTIONAL_CHAIN_NOT_NULLABLE
> = {
  code: ErrorCode.OPTIONAL_CHAIN_NOT_NULLABLE,
  name: ExtendedTemplateDiagnosticName.OPTIONAL_CHAIN_NOT_NULLABLE,
  create: (options: NgCompilerOptions) => {
    // Require `strictNullChecks` to be enabled.
    const strictNullChecks =
      options.strictNullChecks === undefined ? !!options.strict : !!options.strictNullChecks;
    if (!strictNullChecks) {
      return null;
    }

    return new OptionalChainNotNullableCheck();
  },
};
