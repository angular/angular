/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {TmplAstBoundEvent} from '@angular/compiler';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {TemplateCheckWithVisitor} from '../../api';
/**
 * Ensures the two-way binding syntax is correct.
 * Parentheses should be inside the brackets "[()]".
 * Will return diagnostic information when "([])" is found.
 */
class InvalidBananaInBoxCheck extends TemplateCheckWithVisitor {
  code = ErrorCode.INVALID_BANANA_IN_BOX;
  visitNode(ctx, component, node) {
    if (!(node instanceof TmplAstBoundEvent)) return [];
    const name = node.name;
    if (!name.startsWith('[') || !name.endsWith(']')) return [];
    const boundSyntax = node.sourceSpan.toString();
    const expectedBoundSyntax = boundSyntax.replace(`(${name})`, `[(${name.slice(1, -1)})]`);
    const diagnostic = ctx.makeTemplateDiagnostic(
      node.sourceSpan,
      `In the two-way binding syntax the parentheses should be inside the brackets, ex. '${expectedBoundSyntax}'.
        Find more at https://angular.dev/guide/templates/two-way-binding`,
    );
    return [diagnostic];
  }
}
export const factory = {
  code: ErrorCode.INVALID_BANANA_IN_BOX,
  name: ExtendedTemplateDiagnosticName.INVALID_BANANA_IN_BOX,
  create: () => new InvalidBananaInBoxCheck(),
};
//# sourceMappingURL=index.js.map
