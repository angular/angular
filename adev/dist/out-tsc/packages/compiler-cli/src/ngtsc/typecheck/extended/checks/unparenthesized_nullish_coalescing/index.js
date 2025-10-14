/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Binary} from '@angular/compiler';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {SymbolKind} from '../../../api';
import {TemplateCheckWithVisitor} from '../../api';
/**
 * Ensures that parentheses are used to disambiguate precedence when nullish coalescing is mixed
 * with logical and/or. Returns diagnostics for the cases where parentheses are needed.
 */
class UnparenthesizedNullishCoalescing extends TemplateCheckWithVisitor {
  code = ErrorCode.UNPARENTHESIZED_NULLISH_COALESCING;
  visitNode(ctx, component, node) {
    if (node instanceof Binary) {
      if (node.operation === '&&' || node.operation === '||') {
        if (
          (node.left instanceof Binary && node.left.operation === '??') ||
          (node.right instanceof Binary && node.right.operation === '??')
        ) {
          const symbol = ctx.templateTypeChecker.getSymbolOfNode(node, component);
          if (symbol?.kind !== SymbolKind.Expression) {
            return [];
          }
          const sourceMapping = ctx.templateTypeChecker.getSourceMappingAtTcbLocation(
            symbol.tcbLocation,
          );
          if (sourceMapping === null) {
            return [];
          }
          const diagnostic = ctx.makeTemplateDiagnostic(
            sourceMapping.span,
            `Parentheses are required to disambiguate precedence when mixing '??' with '&&' and '||'.`,
          );
          return [diagnostic];
        }
      }
    }
    return [];
  }
}
export const factory = {
  code: ErrorCode.UNPARENTHESIZED_NULLISH_COALESCING,
  name: ExtendedTemplateDiagnosticName.UNPARENTHESIZED_NULLISH_COALESCING,
  create: () => new UnparenthesizedNullishCoalescing(),
};
//# sourceMappingURL=index.js.map
