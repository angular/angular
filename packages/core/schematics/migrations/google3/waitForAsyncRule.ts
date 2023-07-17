/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import ts from 'typescript';

import {getImportSpecifier, replaceImport} from '../../utils/typescript/imports';
import {closestNode} from '../../utils/typescript/nodes';
import {isReferenceToImport} from '../../utils/typescript/symbol';

// This rule is also used inside of Google by Typescript linting.

/** Name of the deprecated function that we're removing. */
const deprecatedFunction = 'async';

/** Name of the function that will replace the deprecated one. */
const newFunction = 'waitForAsync';

/** TSLint rule that migrates from `async` to `waitForAsync`. */
export class Rule extends Rules.TypedRule {
  override applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const failures: RuleFailure[] = [];
    const asyncImportSpecifier =
        getImportSpecifier(sourceFile, '@angular/core/testing', deprecatedFunction);
    const asyncImport =
        asyncImportSpecifier ? closestNode(asyncImportSpecifier, ts.isNamedImports) : null;

    // If there are no imports of `async`, we can exit early.
    if (asyncImportSpecifier && asyncImport) {
      const typeChecker = program.getTypeChecker();
      const printer = ts.createPrinter();
      failures.push(this._getNamedImportsFailure(asyncImport, sourceFile, printer));
      this.findAsyncReferences(sourceFile, typeChecker, asyncImportSpecifier)
          .forEach((node) => failures.push(this._getIdentifierNodeFailure(node, sourceFile)));
    }

    return failures;
  }

  /** Gets a failure for an import of the `async` function. */
  private _getNamedImportsFailure(
      node: ts.NamedImports, sourceFile: ts.SourceFile, printer: ts.Printer): RuleFailure {
    const replacementText = printer.printNode(
        ts.EmitHint.Unspecified, replaceImport(node, deprecatedFunction, newFunction), sourceFile);

    return new RuleFailure(
        sourceFile, node.getStart(), node.getEnd(),
        `Imports of the deprecated ${deprecatedFunction} function are not allowed. Use ${
            newFunction} instead.`,
        this.ruleName, new Replacement(node.getStart(), node.getWidth(), replacementText));
  }

  /** Gets a failure for an identifier node. */
  private _getIdentifierNodeFailure(node: ts.Identifier, sourceFile: ts.SourceFile): RuleFailure {
    return new RuleFailure(
        sourceFile, node.getStart(), node.getEnd(),
        `References to the deprecated ${deprecatedFunction} function are not allowed. Use ${
            newFunction} instead.`,
        this.ruleName, new Replacement(node.getStart(), node.getWidth(), newFunction));
  }

  /** Finds calls to the `async` function. */
  private findAsyncReferences(
      sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker,
      asyncImportSpecifier: ts.ImportSpecifier) {
    const results = new Set<ts.Identifier>();
    ts.forEachChild(sourceFile, function visitNode(node: ts.Node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
          node.expression.text === deprecatedFunction &&
          isReferenceToImport(typeChecker, node.expression, asyncImportSpecifier)) {
        results.add(node.expression);
      }

      ts.forEachChild(node, visitNode);
    });

    return results;
  }
}
