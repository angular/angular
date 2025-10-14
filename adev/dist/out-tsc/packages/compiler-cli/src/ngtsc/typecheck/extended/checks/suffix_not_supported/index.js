/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {TmplAstBoundAttribute} from '@angular/compiler';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {TemplateCheckWithVisitor} from '../../api';
const STYLE_SUFFIXES = ['px', '%', 'em'];
/**
 * A check which detects when the `.px`, `.%`, and `.em` suffixes are used with an attribute
 * binding. These suffixes are only available for style bindings.
 */
class SuffixNotSupportedCheck extends TemplateCheckWithVisitor {
  code = ErrorCode.SUFFIX_NOT_SUPPORTED;
  visitNode(ctx, component, node) {
    if (!(node instanceof TmplAstBoundAttribute)) return [];
    if (
      !node.keySpan.toString().startsWith('attr.') ||
      !STYLE_SUFFIXES.some((suffix) => node.name.endsWith(`.${suffix}`))
    ) {
      return [];
    }
    const diagnostic = ctx.makeTemplateDiagnostic(
      node.keySpan,
      `The ${STYLE_SUFFIXES.map((suffix) => `'.${suffix}'`).join(', ')} suffixes are only supported on style bindings.`,
    );
    return [diagnostic];
  }
}
export const factory = {
  code: ErrorCode.SUFFIX_NOT_SUPPORTED,
  name: ExtendedTemplateDiagnosticName.SUFFIX_NOT_SUPPORTED,
  create: () => new SuffixNotSupportedCheck(),
};
//# sourceMappingURL=index.js.map
