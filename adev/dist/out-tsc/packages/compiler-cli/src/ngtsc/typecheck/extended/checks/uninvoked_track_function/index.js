/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  Call,
  PropertyRead,
  SafeCall,
  SafePropertyRead,
  TmplAstForLoopBlock,
} from '@angular/compiler';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {SymbolKind} from '../../../api';
import {TemplateCheckWithVisitor} from '../../api';
/**
 * Ensures that track functions in @for loops are invoked.
 */
class UninvokedTrackFunctionCheck extends TemplateCheckWithVisitor {
  code = ErrorCode.UNINVOKED_TRACK_FUNCTION;
  visitNode(ctx, component, node) {
    if (!(node instanceof TmplAstForLoopBlock) || !node.trackBy) {
      return [];
    }
    if (node.trackBy.ast instanceof Call || node.trackBy.ast instanceof SafeCall) {
      // If the method is called, skip it.
      return [];
    }
    if (
      !(node.trackBy.ast instanceof PropertyRead) &&
      !(node.trackBy.ast instanceof SafePropertyRead)
    ) {
      // If the expression is not a property read, skip it.
      return [];
    }
    const symbol = ctx.templateTypeChecker.getSymbolOfNode(node.trackBy.ast, component);
    if (
      symbol !== null &&
      symbol.kind === SymbolKind.Expression &&
      symbol.tsType.getCallSignatures()?.length > 0
    ) {
      const fullExpressionText = generateStringFromExpression(
        node.trackBy.ast,
        node.trackBy.source || '',
      );
      const errorString = `The track function in the @for block should be invoked: ${fullExpressionText}(/* arguments */)`;
      return [ctx.makeTemplateDiagnostic(node.sourceSpan, errorString)];
    }
    return [];
  }
}
function generateStringFromExpression(expression, source) {
  return source.substring(expression.span.start, expression.span.end);
}
export const factory = {
  code: ErrorCode.UNINVOKED_TRACK_FUNCTION,
  name: ExtendedTemplateDiagnosticName.UNINVOKED_TRACK_FUNCTION,
  create: () => new UninvokedTrackFunctionCheck(),
};
//# sourceMappingURL=index.js.map
