/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, TmplAstNode, TmplAstTextAttribute} from '@angular/compiler';
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
class TextAttributeNotBindingSpec extends TemplateCheckWithVisitor<8104> {
  override code = 8104 as const;

  override visitNode(
    ctx: TemplateContext<8104>,
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
      errorString = formatExtendedError(8104, errorString);
    }

    return [ctx.makeTemplateDiagnostic(node.sourceSpan, errorString)];
  }
}

export const factory: TemplateCheckFactory<8104, 'textAttributeNotBinding'> = {
  code: 8104,
  name: 'textAttributeNotBinding',
  create: () => new TextAttributeNotBindingSpec(),
};
