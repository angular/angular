/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, TmplAstNode, TmplAstTextAttribute} from '@angular/compiler';
import {ErrorCode} from '../../error_code.js';
import type {Diagnostic} from '../../diagnostic.js';
import type {TcbTargetInput} from '../../tcb.js';
import {
  formatExtendedError,
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
} from '../api.js';

/**
 * Ensures that attributes that have the "special" angular binding prefix (attr., style., and
 * class.) are interpreted as bindings.
 *
 * Mirrors `TextAttributeNotBindingSpec` in
 * `ngtsc/typecheck/extended/checks/text_attribute_not_binding/index.ts`.
 */
class TextAttributeNotBindingSpec extends TemplateCheckWithVisitor<ErrorCode.TEXT_ATTRIBUTE_NOT_BINDING> {
  override code = ErrorCode.TEXT_ATTRIBUTE_NOT_BINDING as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.TEXT_ATTRIBUTE_NOT_BINDING>,
    _component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[] {
    if (!(node instanceof TmplAstTextAttribute)) return [];

    const name = node.name;
    if (!name.startsWith('attr.') && !name.startsWith('style.') && !name.startsWith('class.')) {
      return [];
    }

    let errorString: string;
    if (name.startsWith('attr.')) {
      const staticAttr = name.replace('attr.', '');
      errorString = `Static attributes should be written without the 'attr.' prefix.`;
      if (node.value) {
        errorString += ` For example, ${staticAttr}="${node.value}".`;
      }
    } else {
      const expectedKey = `[${name}]`;
      const expectedValue =
        node.value === 'true' || node.value === 'false' ? node.value : `'${node.value}'`;
      errorString = 'Attribute, style, and class bindings should be enclosed with square braces.';
      if (node.value) {
        errorString += ` For example, '${expectedKey}="${expectedValue}"'.`;
      }
      errorString = formatExtendedError(ErrorCode.TEXT_ATTRIBUTE_NOT_BINDING, errorString);
    }

    return [ctx.makeTemplateDiagnostic(node.sourceSpan, errorString)];
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.TEXT_ATTRIBUTE_NOT_BINDING,
  'textAttributeNotBinding'
> = {
  code: ErrorCode.TEXT_ATTRIBUTE_NOT_BINDING,
  name: 'textAttributeNotBinding',
  create: () => new TextAttributeNotBindingSpec(),
};
