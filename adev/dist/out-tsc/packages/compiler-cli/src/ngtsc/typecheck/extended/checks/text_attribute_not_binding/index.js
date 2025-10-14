/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {TmplAstTextAttribute} from '@angular/compiler';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {TemplateCheckWithVisitor} from '../../api';
/**
 * Ensures that attributes that have the "special" angular binding prefix (attr., style., and
 * class.) are interpreted as bindings. For example, `<div attr.id="my-id"></div>` will not
 * interpret this as an `AttributeBinding` to `id` but rather just a `TmplAstTextAttribute`. This
 * is likely not the intent of the developer. Instead, the intent is likely to have the `id` be set
 * to 'my-id'.
 */
class TextAttributeNotBindingSpec extends TemplateCheckWithVisitor {
  code = ErrorCode.TEXT_ATTRIBUTE_NOT_BINDING;
  visitNode(ctx, component, node) {
    if (!(node instanceof TmplAstTextAttribute)) return [];
    const name = node.name;
    if (!name.startsWith('attr.') && !name.startsWith('style.') && !name.startsWith('class.')) {
      return [];
    }
    let errorString;
    if (name.startsWith('attr.')) {
      const staticAttr = name.replace('attr.', '');
      errorString = `Static attributes should be written without the 'attr.' prefix.`;
      if (node.value) {
        errorString += ` For example, ${staticAttr}="${node.value}".`;
      }
    } else {
      const expectedKey = `[${name}]`;
      const expectedValue =
        // true/false are special cases because we don't want to convert them to strings but
        // rather maintain the logical true/false when bound.
        node.value === 'true' || node.value === 'false' ? node.value : `'${node.value}'`;
      errorString = 'Attribute, style, and class bindings should be enclosed with square braces.';
      if (node.value) {
        errorString += ` For example, '${expectedKey}="${expectedValue}"'.`;
      }
    }
    const diagnostic = ctx.makeTemplateDiagnostic(node.sourceSpan, errorString);
    return [diagnostic];
  }
}
export const factory = {
  code: ErrorCode.TEXT_ATTRIBUTE_NOT_BINDING,
  name: ExtendedTemplateDiagnosticName.TEXT_ATTRIBUTE_NOT_BINDING,
  create: () => new TextAttributeNotBindingSpec(),
};
//# sourceMappingURL=index.js.map
