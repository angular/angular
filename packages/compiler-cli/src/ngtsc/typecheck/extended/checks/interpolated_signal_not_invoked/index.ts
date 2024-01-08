/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, Interpolation, PropertyRead, TmplAstNode} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic, SymbolKind} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * Ensures Signals are invoked when used in template interpolations.
 */
class InterpolatedSignalCheck extends
    TemplateCheckWithVisitor<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED> {
  override code = ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED as const;

  override visitNode(
      ctx: TemplateContext<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>,
      component: ts.ClassDeclaration,
      node: TmplAstNode|AST): NgTemplateDiagnostic<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>[] {
    if (node instanceof Interpolation) {
      return node.expressions.filter((item): item is PropertyRead => item instanceof PropertyRead)
          .flatMap((item) => {
            if (item instanceof PropertyRead) {
              return buildDiagnosticForSignal(ctx, item, component);
            }
            return [];
          });
    }
    return [];
  }
}

function isSignal(symbol: ts.Symbol|undefined): boolean {
  return (symbol?.escapedName === 'WritableSignal' || symbol?.escapedName === 'Signal' ||
          symbol?.escapedName === 'InputSignal' ||
          symbol?.escapedName === 'InputSignalWithTransform') &&
      (symbol as any).parent.escapedName.includes('@angular/core');
}

function buildDiagnosticForSignal(
    ctx: TemplateContext<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>, node: PropertyRead,
    component: ts.ClassDeclaration):
    Array<NgTemplateDiagnostic<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>> {
  const symbol = ctx.templateTypeChecker.getSymbolOfNode(node, component);

  if (symbol?.kind === SymbolKind.Expression &&
      (isSignal(symbol.tsType.symbol) || isSignal(symbol.tsType.aliasSymbol))) {
    const templateMapping =
        ctx.templateTypeChecker.getTemplateMappingAtTcbLocation(symbol.tcbLocation)!;

    const errorString = `${node.name} is a function and should be invoked: ${node.name}()`;
    const diagnostic = ctx.makeTemplateDiagnostic(templateMapping.span, errorString);
    return [diagnostic];
  }

  return [];
}

export const factory: TemplateCheckFactory<
    ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED,
    ExtendedTemplateDiagnosticName.INTERPOLATED_SIGNAL_NOT_INVOKED> = {
  code: ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED,
  name: ExtendedTemplateDiagnosticName.INTERPOLATED_SIGNAL_NOT_INVOKED,
  create: () => new InterpolatedSignalCheck(),
};
