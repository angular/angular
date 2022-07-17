/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, TmplAstBoundAttribute, TmplAstNode} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

const STYLE_SUFFIXES = ['px', '%', 'em'];

/**
 * A check which detects when the `.px`, `.%`, and `.em` suffixes are used with an attribute
 * binding. These suffixes are only available for style bindings.
 */
class SuffixNotSupportedCheck extends TemplateCheckWithVisitor<ErrorCode.SUFFIX_NOT_SUPPORTED> {
  override code = ErrorCode.SUFFIX_NOT_SUPPORTED as const;

  override visitNode(
      ctx: TemplateContext<ErrorCode.SUFFIX_NOT_SUPPORTED>, component: ts.ClassDeclaration,
      node: TmplAstNode|AST): NgTemplateDiagnostic<ErrorCode.SUFFIX_NOT_SUPPORTED>[] {
    if (!(node instanceof TmplAstBoundAttribute)) return [];

    if (!node.keySpan.toString().startsWith('attr.') ||
        !STYLE_SUFFIXES.some(suffix => node.name.endsWith(`.${suffix}`))) {
      return [];
    }

    const diagnostic = ctx.makeTemplateDiagnostic(
        node.keySpan,
        `The ${
            STYLE_SUFFIXES.map(suffix => `'.${suffix}'`)
                .join(', ')} suffixes are only supported on style bindings.`);
    return [diagnostic];
  }
}

export const factory: TemplateCheckFactory<
    ErrorCode.SUFFIX_NOT_SUPPORTED, ExtendedTemplateDiagnosticName.SUFFIX_NOT_SUPPORTED> = {
  code: ErrorCode.SUFFIX_NOT_SUPPORTED,
  name: ExtendedTemplateDiagnosticName.SUFFIX_NOT_SUPPORTED,
  create: () => new SuffixNotSupportedCheck(),
};
