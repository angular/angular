/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, TmplAstElement, TmplAstNode} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * Makes sure user doesn't forget to add `*` when using ngFor, ngIf, ngSwitchCase or
 * ngSwitchDefault. Will return diagnostic when `*` is missing.
 */

class MissingAsteriskStructuralDirectives extends
    TemplateCheckWithVisitor<ErrorCode.MISSING_ASTERISK_STRUCTURAL_DIRECTIVES> {
  override code = ErrorCode.MISSING_ASTERISK_STRUCTURAL_DIRECTIVES as const;

  override visitNode(
      ctx: TemplateContext<ErrorCode.MISSING_ASTERISK_STRUCTURAL_DIRECTIVES>,
      component: ts.ClassDeclaration, node: TmplAstNode|AST):
      NgTemplateDiagnostic<ErrorCode.MISSING_ASTERISK_STRUCTURAL_DIRECTIVES>[] {
    if (!(node instanceof TmplAstElement)) return [];

    if (node.attributes.length === 0) return [];

    const directives: string[] = ['ngFor', 'ngIf', 'ngSwitchCase', 'ngSwitchDefault'];

    const attrIndex: number =
        node.attributes.findIndex((attribute) => directives.includes(attribute.name));

    if (attrIndex === -1) {
      return [];
    }

    const errorString = 'You seems to be missing `*` for ' + node.attributes[attrIndex].name + '.';
    const diagnostic = ctx.makeTemplateDiagnostic(node.sourceSpan, errorString);
    return [diagnostic];
  }
}

export const factory: TemplateCheckFactory<
    ErrorCode.MISSING_ASTERISK_STRUCTURAL_DIRECTIVES,
    ExtendedTemplateDiagnosticName.MISSING_ASTERISK_STRUCTURAL_DIRECTIVES> = {
  code: ErrorCode.MISSING_ASTERISK_STRUCTURAL_DIRECTIVES,
  name: ExtendedTemplateDiagnosticName.MISSING_ASTERISK_STRUCTURAL_DIRECTIVES,
  create: () => new MissingAsteriskStructuralDirectives(),
};
