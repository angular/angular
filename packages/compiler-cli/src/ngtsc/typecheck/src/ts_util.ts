/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ExpressionIdentifier, hasExpressionIdentifier} from './comments';

export function isAccessExpression(
  node: ts.Node,
): node is ts.ElementAccessExpression | ts.PropertyAccessExpression {
  return ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node);
}

/**
 * Check if a node represents a directive declaration in a TypeCheck Block.
 * Directive declarations can be either:
 * - var _t1: TestDir /*T:D*\/ = null! as TestDir;
 * - var _t1 /*T:D*\/ = _ctor1({});
 */
export function isDirectiveDeclaration(node: ts.Node): node is ts.TypeNode | ts.Identifier {
  const sourceFile = node.getSourceFile();
  return (
    (ts.isTypeNode(node) || ts.isIdentifier(node)) &&
    ts.isVariableDeclaration(node.parent) &&
    (hasExpressionIdentifier(sourceFile, node, ExpressionIdentifier.DIRECTIVE) ||
      hasExpressionIdentifier(sourceFile, node, ExpressionIdentifier.HOST_DIRECTIVE))
  );
}

/**
 * Check if the lastSymbol is an alias of the firstSymbol. For example:
 *
 * The NewBarComponent is an alias of BarComponent.
 *
 * But the NotAliasBarComponent is not an alias of BarComponent, because
 * the NotAliasBarComponent is a new variable.
 *
 * This should work for most cases.
 *
 * https://github.com/microsoft/TypeScript/blob/9e20e032effad965567d4a1e1c30d5433b0a3332/src/compiler/checker.ts#L3638-L3652
 *
 * ```
 * // a.ts
 * export class BarComponent {};
 * // b.ts
 * export {BarComponent as NewBarComponent} from "./a";
 * // c.ts
 * import {BarComponent} from "./a"
 * const NotAliasBarComponent = BarComponent;
 * export {NotAliasBarComponent};
 * ```
 */
export function isSymbolAliasOf(
  firstSymbol: ts.Symbol,
  lastSymbol: ts.Symbol,
  typeChecker: ts.TypeChecker,
): boolean {
  let currentSymbol: ts.Symbol | undefined = lastSymbol;

  const seenSymbol: Set<ts.Symbol> = new Set();
  while (
    firstSymbol !== currentSymbol &&
    currentSymbol !== undefined &&
    currentSymbol.flags & ts.SymbolFlags.Alias
  ) {
    if (seenSymbol.has(currentSymbol)) {
      break;
    }
    seenSymbol.add(currentSymbol);

    currentSymbol = typeChecker.getImmediateAliasedSymbol(currentSymbol);

    if (currentSymbol === firstSymbol) {
      return true;
    }
  }

  return false;
}
