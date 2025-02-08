/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, TmplAstNode, TmplAstTemplate} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * Ensures a user doesn't forget to omit `let` when using ngfor.
 * Will return diagnostic information when `let` is missing.
 */
class MissingNgForOfLetCheck extends TemplateCheckWithVisitor<ErrorCode.MISSING_NGFOROF_LET> {
  override code = ErrorCode.MISSING_NGFOROF_LET as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.MISSING_NGFOROF_LET>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.MISSING_NGFOROF_LET>[] {
    const isTemplate = node instanceof TmplAstTemplate;
    if (!(node instanceof TmplAstTemplate)) {
      return [];
    }

    if (node.templateAttrs.length === 0) {
      return [];
    }
    const attr = node.templateAttrs.find((x) => x.name === 'ngFor');
    if (attr === undefined) {
      return [];
    }

    if (node.variables.length > 0) {
      return [];
    }
    const errorString = 'Your ngFor is missing a value. Did you forget to add the `let` keyword?';
    const diagnostic = ctx.makeTemplateDiagnostic(attr.sourceSpan, errorString);
    return [diagnostic];
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.MISSING_NGFOROF_LET,
  ExtendedTemplateDiagnosticName.MISSING_NGFOROF_LET
> = {
  code: ErrorCode.MISSING_NGFOROF_LET,
  name: ExtendedTemplateDiagnosticName.MISSING_NGFOROF_LET,
  create: () => new MissingNgForOfLetCheck(),
};
