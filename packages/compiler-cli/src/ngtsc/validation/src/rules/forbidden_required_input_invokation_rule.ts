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
  tryParseInitializerApi,
} from '../../../annotations';
import {ErrorCode, makeDiagnostic} from '../../../diagnostics';
import {ImportedSymbolsTracker} from '../../../imports';
import {ReflectionHost} from '../../../reflection';

import {SourceFileValidatorRule} from './api';

/** APIs whose usages should be checked by the rule. */
const APIS_TO_CHECK: InitializerApiFunction[] = [INPUT_INITIALIZER_FN];

/**
 * Rule that flags forbidden invokations of required inputs in property initializers and constructors.
 */
export class ForbiddenRequiredInputInvokationRule implements SourceFileValidatorRule {
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
    const propDeclarations = node.members.filter((m): m is ts.PropertyDeclaration =>
      ts.isPropertyDeclaration(m),
    );
    const requiredInputDeclarations = propDeclarations
      .filter((m) => this.isPropDeclarationARequiredInput(m))
      .map((m) => m.name.getText());

    const diagnostics: ts.Diagnostic[] = [];

    // Handling of the usages in props initializations
    for (let decl of propDeclarations) {
      const initiallizerExpr = decl.initializer;
      if (!initiallizerExpr) continue;

      isForbiddenInvokation(initiallizerExpr);
    }

    function isForbiddenInvokation(node: ts.Node): boolean | undefined {
      if (ts.isArrowFunction(node)) return;

      if (
        ts.isPropertyAccessExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ThisKeyword &&
        // With the following we make sure we only flag invoked required inputs
        ts.isCallExpression(node.parent) &&
        node.parent.expression === node
      ) {
        if (requiredInputDeclarations.includes(node.name.getText())) {
          diagnostics.push(
            makeDiagnostic(
              ErrorCode.FORBIDDEN_REQUIRED_INPUT_INVOKATION,
              node,
              `\`${node.name.getText()}\` is a required input and does not have a value in this context.`,
            ),
          );
        }
      }

      return node.forEachChild(isForbiddenInvokation);
    }

    const ctor = getConstructorFromClass(node);
    if (ctor) {
      isForbiddenInvokation(ctor);
    }

    return diagnostics;
  }
  private isPropDeclarationARequiredInput(node: ts.PropertyDeclaration) {
    if (!node.initializer) return false;

    const identifiedInitializer = tryParseInitializerApi(
      [INPUT_INITIALIZER_FN],
      node.initializer,
      this.reflector,
      this.importedSymbolsTracker,
    );

    if (identifiedInitializer === null || !identifiedInitializer.isRequired) return false;

    return true;
  }
}

function getConstructorFromClass(node: ts.ClassDeclaration): ts.ConstructorDeclaration | undefined {
  return node.members.find(
    (m): m is ts.ConstructorDeclaration => m.kind === ts.SyntaxKind.Constructor,
  );
}
