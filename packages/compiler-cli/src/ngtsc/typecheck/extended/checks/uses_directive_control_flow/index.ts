/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, TmplAstNode, TmplAstTextAttribute} from '@angular/compiler';
import {Template} from '@angular/compiler/src/render3/r3_ast';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * Ensures that attributes that have the "special" angular binding prefix (attr., style., and
 * class.) are interpreted as bindings. For example, `<div attr.id="my-id"></div>` will not
 * interpret this as an `AttributeBinding` to `id` but rather just a `TmplAstTextAttribute`. This
 * is likely not the intent of the developer. Instead, the intent is likely to have the `id` be set
 * to 'my-id'.
 */

const controlFlowDirectives = ['ngFor', 'ngSwitch', 'ngIf', 'ngForOf'];

class UsesDirectiveControFlowSpec extends
    TemplateCheckWithVisitor<ErrorCode.USES_DIRECTIVE_CONTROL_FLOW> {
  override code = ErrorCode.USES_DIRECTIVE_CONTROL_FLOW as const;

  override visitNode(
      ctx: TemplateContext<ErrorCode.USES_DIRECTIVE_CONTROL_FLOW>,
      component: ts.ClassDeclaration,
      node: TmplAstNode|AST,
      ): NgTemplateDiagnostic<ErrorCode.USES_DIRECTIVE_CONTROL_FLOW>[] {
    if (!(node instanceof Template)) return [];

    const ctrlFlowDirective =
        node.templateAttrs.find(attr => controlFlowDirectives.includes(attr.name));
    if (!ctrlFlowDirective) {
      return [];
    }

    const errorString = `Should not use the ${ctrlFlowDirective.name} directive`;
    const diagnostic = ctx.makeTemplateDiagnostic(node.sourceSpan, errorString);
    return [diagnostic];
  }
}

export const factory: TemplateCheckFactory<
    ErrorCode.USES_DIRECTIVE_CONTROL_FLOW,
    ExtendedTemplateDiagnosticName.USES_DIRECTIVE_CONTROL_FLOW> = {
  code: ErrorCode.USES_DIRECTIVE_CONTROL_FLOW,
  name: ExtendedTemplateDiagnosticName.USES_DIRECTIVE_CONTROL_FLOW,
  create: () => new UsesDirectiveControFlowSpec(),
};
