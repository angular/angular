/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, Binary, TmplAstNode} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic, SymbolKind} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * Ensures the left side of a nullish coalescing operation is nullable.
 * Returns diagnostics for the cases where the operator is useless.
 * This check should only be use if `strictNullChecks` is enabled,
 * otherwise it would produce inaccurate results.
 */
class NonStricComparisionOperatorCheck extends
    TemplateCheckWithVisitor<ErrorCode.NON_STRICT_COMPARISON_OPERATOR> {
  override code = ErrorCode.NON_STRICT_COMPARISON_OPERATOR as const;

  override visitNode(
      ctx: TemplateContext<ErrorCode.NON_STRICT_COMPARISON_OPERATOR>,
      component: ts.ClassDeclaration,
      node: TmplAstNode|AST): NgTemplateDiagnostic<ErrorCode.NON_STRICT_COMPARISON_OPERATOR>[] {
    const equalityOperator: string = '==';
    const inequalityOperator: string = '!=';
    if (!(node instanceof Binary) || node.operation !== equalityOperator ||
        node.operation !== inequalityOperator)
      return [];

    const symbol = ctx.templateTypeChecker.getSymbolOfNode(node, component)!;
    if (symbol.kind !== SymbolKind.Expression) {
      return [];
    }
    const templateMapping =
        ctx.templateTypeChecker.getTemplateMappingAtTcbLocation(symbol.tcbLocation);
    if (templateMapping === null) {
      return [];
    }
    const advice = node.operation === '==' ?
        `The '==' operator should be replaced with the '===' operator` :
        `The '!=' operator should be replaced with the '!==' operator`;
    const diagnostic = ctx.makeTemplateDiagnostic(templateMapping.span, advice);
    return [diagnostic];
  }
}

export const factory: TemplateCheckFactory<
    ErrorCode.NON_STRICT_COMPARISON_OPERATOR,
    ExtendedTemplateDiagnosticName.NON_STRICT_COMPARISON_OPERATOR> = {
  code: ErrorCode.NON_STRICT_COMPARISON_OPERATOR,
  name: ExtendedTemplateDiagnosticName.NON_STRICT_COMPARISON_OPERATOR,
  create: () => new NonStricComparisionOperatorCheck,
};
