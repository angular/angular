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
  OUTPUT_INITIALIZER_FNS,
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
  ...OUTPUT_INITIALIZER_FNS,
  ...QUERY_INITIALIZER_FNS,
];

/**
 * Rule that flags any initializer APIs that are used outside of an initializer.
 */
export class InitializerApiUsageRule implements SourceFileValidatorRule {
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

  checkNode(node: ts.Node): ts.Diagnostic | null {
    // We only care about call expressions.
    if (!ts.isCallExpression(node)) {
      return null;
    }

    // Unwrap any parenthesized and `as` expressions since they don't affect the runtime behavior.
    while (
      node.parent &&
      (ts.isParenthesizedExpression(node.parent) || ts.isAsExpression(node.parent))
    ) {
      node = node.parent;
    }

    if (!node.parent || !ts.isCallExpression(node)) {
      return null;
    }

    const identifiedInitializer = tryParseInitializerApi(
      APIS_TO_CHECK,
      node,
      this.reflector,
      this.importedSymbolsTracker,
    );
    if (identifiedInitializer === null) {
      return null;
    }

    const functionName =
      identifiedInitializer.api.functionName +
      (identifiedInitializer.isRequired ? '.required' : '');

    if (ts.isPropertyDeclaration(node.parent) && node.parent.initializer === node) {
      let closestClass: ts.Node = node.parent;

      while (closestClass && !ts.isClassDeclaration(closestClass)) {
        closestClass = closestClass.parent;
      }

      if (closestClass && ts.isClassDeclaration(closestClass)) {
        const decorators = this.reflector.getDecoratorsOfDeclaration(closestClass);
        const isComponentOrDirective =
          decorators !== null &&
          decorators.some((decorator) => {
            return (
              decorator.import?.from === '@angular/core' &&
              (decorator.name === 'Component' || decorator.name === 'Directive')
            );
          });

        return isComponentOrDirective
          ? null
          : makeDiagnostic(
              ErrorCode.UNSUPPORTED_INITIALIZER_API_USAGE,
              node,
              `Unsupported call to the ${functionName} function. This function can only be used as the initializer ` +
                `of a property on a @Component or @Directive class.`,
            );
      }
    }

    return makeDiagnostic(
      ErrorCode.UNSUPPORTED_INITIALIZER_API_USAGE,
      node,
      `Unsupported call to the ${functionName} function. This function can only be called in the initializer of a class member.`,
    );
  }
}
