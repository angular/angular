/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
/**
 * Creates an import and access for a given Angular core import while
 * ensuring the decorator symbol access can be traced back to an Angular core
 * import in order to make the synthetic decorator compatible with the JIT
 * decorator downlevel transform.
 */
export function createSyntheticAngularCoreDecoratorAccess(
  factory,
  importManager,
  ngClassDecorator,
  sourceFile,
  decoratorName,
) {
  const classDecoratorIdentifier = ts.isIdentifier(ngClassDecorator.identifier)
    ? ngClassDecorator.identifier
    : ngClassDecorator.identifier.expression;
  return factory.createPropertyAccessExpression(
    importManager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: null,
      requestedFile: sourceFile,
    }),
    // The synthetic identifier may be checked later by the downlevel decorators
    // transform to resolve to an Angular import using `getSymbolAtLocation`. We trick
    // the transform to think it's not synthetic and comes from Angular core.
    ts.setOriginalNode(factory.createIdentifier(decoratorName), classDecoratorIdentifier),
  );
}
/** Casts the given expression as `any`. */
export function castAsAny(factory, expr) {
  return factory.createAsExpression(expr, factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
}
//# sourceMappingURL=transform_api.js.map
