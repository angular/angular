/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {TmplAstTemplate} from '@angular/compiler';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {TemplateCheckWithVisitor} from '../../api';
/**
 * Ensures a user doesn't forget to omit `let` when using ngfor.
 * Will return diagnostic information when `let` is missing.
 */
class MissingNgForOfLetCheck extends TemplateCheckWithVisitor {
  code = ErrorCode.MISSING_NGFOROF_LET;
  visitNode(ctx, component, node) {
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
export const factory = {
  code: ErrorCode.MISSING_NGFOROF_LET,
  name: ExtendedTemplateDiagnosticName.MISSING_NGFOROF_LET,
  create: () => new MissingNgForOfLetCheck(),
};
//# sourceMappingURL=index.js.map
