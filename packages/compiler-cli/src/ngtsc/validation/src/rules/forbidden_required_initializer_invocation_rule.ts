/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {
  InitializerApiFunction,
  INPUT_INITIALIZER_FN,
  MODEL_INITIALIZER_FN,
  QUERY_INITIALIZER_FNS,
  tryParseInitializerApi,
} from '../../../annotations';
import {ErrorCode, makeDiagnostic} from '../../../diagnostics';
import {ImportedSymbolsTracker} from '../../../imports';
import {ReflectionHost} from '../../../reflection';

import {SourceFileValidatorRule} from './api';

/** APIs whose usages should be checked by the rule. */
const APIS_TO_CHECK: InitializerApiFunction[] = [
  INPUT_INITIALIZER_FN,
  MODEL_INITIALIZER_FN,
  ...QUERY_INITIALIZER_FNS,
];

/**
 * Rule that flags forbidden invocations of required initializers in property initializers and constructors.
 */
export class ForbiddenRequiredInitializersInvocationRule implements SourceFileValidatorRule {
  constructor(
    private reflector: ReflectionHost,
    private importedSymbolsTracker: ImportedSymbolsTracker,
  ) {}

  shouldCheck(sourceFile: ts.SourceFile): boolean {
    // Skip the traversal if there are no imports of the initializer APIs.
    return APIS_TO_CHECK.some(({functionName, owningModule}) => {
      return (
        this.importedSymbolsTracker.hasNamedImport(sourceFile, functionName, owningModule) ||
        this.importedSymbolsTracker.hasNamespaceImport(sourceFile, owningModule)
      );
    });
  }

  checkNode(node: ts.Node): ts.Diagnostic[] | null {
    if (!ts.isClassDeclaration(node)) return null;

    const requiredInitializerDeclarations = node.members.filter(
      (m) => ts.isPropertyDeclaration(m) && this.isPropDeclarationARequiredInitializer(m),
    );

    const diagnostics: ts.Diagnostic[] = [];

    // Handling of the usages in props initializations
    for (let decl of node.members) {
      if (!ts.isPropertyDeclaration(decl)) continue;

      const initiallizerExpr = decl.initializer;
      if (!initiallizerExpr) continue;

      checkForbiddenInvocation(initiallizerExpr);
    }

    function checkForbiddenInvocation(node: ts.Node): boolean | undefined {
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
          const initializerFn = (
            requiredProp.initializer.expression as ts.PropertyAccessExpression
          ).expression.getText();
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
  private isPropDeclarationARequiredInitializer(
    node: ts.PropertyDeclaration,
  ): node is ts.PropertyDeclaration & {initializer: ts.CallExpression} {
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

function getConstructorFromClass(node: ts.ClassDeclaration): ts.ConstructorDeclaration | undefined {
  // We also check for a constructor body to avoid picking up parent constructors.
  return node.members.find(
    (m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && m.body !== undefined,
  );
}
