/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
import {
  INPUT_INITIALIZER_FN,
  MODEL_INITIALIZER_FN,
  QUERY_INITIALIZER_FNS,
  tryParseInitializerApi,
} from '../../../annotations';
import {ErrorCode, makeDiagnostic} from '../../../diagnostics';
/** APIs whose usages should be checked by the rule. */
const APIS_TO_CHECK = [INPUT_INITIALIZER_FN, MODEL_INITIALIZER_FN, ...QUERY_INITIALIZER_FNS];
/**
 * Rule that flags forbidden invocations of required initializers in property initializers and constructors.
 */
export class ForbiddenRequiredInitializersInvocationRule {
  reflector;
  importedSymbolsTracker;
  constructor(reflector, importedSymbolsTracker) {
    this.reflector = reflector;
    this.importedSymbolsTracker = importedSymbolsTracker;
  }
  shouldCheck(sourceFile) {
    // Skip the traversal if there are no imports of the initializer APIs.
    return APIS_TO_CHECK.some(({functionName, owningModule}) => {
      return (
        this.importedSymbolsTracker.hasNamedImport(sourceFile, functionName, owningModule) ||
        this.importedSymbolsTracker.hasNamespaceImport(sourceFile, owningModule)
      );
    });
  }
  checkNode(node) {
    if (!ts.isClassDeclaration(node)) return null;
    const requiredInitializerDeclarations = node.members.filter(
      (m) => ts.isPropertyDeclaration(m) && this.isPropDeclarationARequiredInitializer(m),
    );
    const diagnostics = [];
    // Handling of the usages in props initializations
    for (let decl of node.members) {
      if (!ts.isPropertyDeclaration(decl)) continue;
      const initiallizerExpr = decl.initializer;
      if (!initiallizerExpr) continue;
      checkForbiddenInvocation(initiallizerExpr);
    }
    function checkForbiddenInvocation(node) {
      if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) return;
      if (
        ts.isPropertyAccessExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ThisKeyword &&
        // With the following we make sure we only flag invoked required initializers
        ts.isCallExpression(node.parent) &&
        node.parent.expression === node
      ) {
        const requiredProp = requiredInitializerDeclarations.find(
          (prop) => prop.name.getText() === node.name.getText(),
        );
        if (requiredProp) {
          const initializerFn = requiredProp.initializer.expression.expression.getText();
          diagnostics.push(
            makeDiagnostic(
              ErrorCode.FORBIDDEN_REQUIRED_INITIALIZER_INVOCATION,
              node,
              `\`${node.name.getText()}\` is a required \`${initializerFn}\` and does not have a value in this context.`,
            ),
          );
        }
      }
      return node.forEachChild(checkForbiddenInvocation);
    }
    const ctor = getConstructorFromClass(node);
    if (ctor) {
      checkForbiddenInvocation(ctor);
    }
    return diagnostics;
  }
  isPropDeclarationARequiredInitializer(node) {
    if (!node.initializer) return false;
    const identifiedInitializer = tryParseInitializerApi(
      APIS_TO_CHECK,
      node.initializer,
      this.reflector,
      this.importedSymbolsTracker,
    );
    if (identifiedInitializer === null || !identifiedInitializer.isRequired) return false;
    return true;
  }
}
function getConstructorFromClass(node) {
  // We also check for a constructor body to avoid picking up parent constructors.
  return node.members.find((m) => ts.isConstructorDeclaration(m) && m.body !== undefined);
}
//# sourceMappingURL=forbidden_required_initializer_invocation_rule.js.map
