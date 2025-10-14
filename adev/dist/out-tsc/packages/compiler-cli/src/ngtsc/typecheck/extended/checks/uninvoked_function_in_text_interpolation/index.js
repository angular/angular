/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {SymbolKind} from '../../../api';
import {TemplateCheckWithVisitor} from '../../api';
import {Interpolation, PropertyRead, SafePropertyRead} from '@angular/compiler';
class UninvokedFunctionInTextInterpolation extends TemplateCheckWithVisitor {
  code = ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION;
  visitNode(ctx, component, node) {
    // interpolations like `{{ myFunction }}`
    if (node instanceof Interpolation) {
      return node.expressions.flatMap((item) => assertExpressionInvoked(item, component, ctx));
    }
    return [];
  }
}
function assertExpressionInvoked(expression, component, ctx) {
  if (!(expression instanceof PropertyRead) && !(expression instanceof SafePropertyRead)) {
    return []; // If the expression is not a property read, skip it.
  }
  const symbol = ctx.templateTypeChecker.getSymbolOfNode(expression, component);
  if (symbol !== null && symbol.kind === SymbolKind.Expression) {
    if (symbol.tsType.getCallSignatures()?.length > 0) {
      const errorString = `Function in text interpolation should be invoked: ${expression.name}()`;
      const templateMapping = ctx.templateTypeChecker.getSourceMappingAtTcbLocation(
        symbol.tcbLocation,
      );
      return [ctx.makeTemplateDiagnostic(templateMapping.span, errorString)];
    }
  }
  return [];
}
export const factory = {
  code: ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION,
  name: ExtendedTemplateDiagnosticName.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION,
  create: () => new UninvokedFunctionInTextInterpolation(),
};
//# sourceMappingURL=index.js.map
