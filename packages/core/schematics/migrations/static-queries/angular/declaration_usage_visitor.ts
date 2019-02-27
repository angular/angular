/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/**
 * Class that can be used to determine if a given TypeScript node is used within
 * other given TypeScript nodes. This is achieved by walking through all children
 * of the given node and checking for usages of the given declaration. The visitor
 * also handles potential control flow changes caused by call/new expressions.
 */
export class DeclarationUsageVisitor {
  /** Set of visited symbols that caused a jump in control flow. */
  private visitedJumpExprSymbols = new Set<ts.Symbol>();

  constructor(private declaration: ts.Node, private typeChecker: ts.TypeChecker) {}

  private isReferringToSymbol(node: ts.Node): boolean {
    const symbol = this.typeChecker.getSymbolAtLocation(node);
    return !!symbol && symbol.valueDeclaration === this.declaration;
  }

  private addJumpExpressionToQueue(node: ts.Expression, nodeQueue: ts.Node[]) {
    const callExprSymbol = this.typeChecker.getSymbolAtLocation(node);

    // Note that we should not add previously visited symbols to the queue as this
    // could cause cycles.
    if (callExprSymbol && callExprSymbol.valueDeclaration &&
        !this.visitedJumpExprSymbols.has(callExprSymbol)) {
      this.visitedJumpExprSymbols.add(callExprSymbol);
      nodeQueue.push(callExprSymbol.valueDeclaration);
    }
  }

  private addNewExpressionToQueue(node: ts.NewExpression, nodeQueue: ts.Node[]) {
    const newExprSymbol = this.typeChecker.getSymbolAtLocation(node.expression);

    // Only handle new expressions which resolve to classes. Technically "new" could
    // also call void functions or objects with a constructor signature. Also note that
    // we should not visit already visited symbols as this could cause cycles.
    if (!newExprSymbol || !newExprSymbol.valueDeclaration ||
        !ts.isClassDeclaration(newExprSymbol.valueDeclaration) ||
        this.visitedJumpExprSymbols.has(newExprSymbol)) {
      return;
    }

    const targetConstructor =
        newExprSymbol.valueDeclaration.members.find(d => ts.isConstructorDeclaration(d));

    if (targetConstructor) {
      this.visitedJumpExprSymbols.add(newExprSymbol);
      nodeQueue.push(targetConstructor);
    }
  }

  isUsedInNode(searchNode: ts.Node): boolean {
    const nodeQueue: ts.Node[] = [searchNode];
    this.visitedJumpExprSymbols.clear();

    while (nodeQueue.length) {
      const node = nodeQueue.shift() !;

      if (ts.isIdentifier(node) && this.isReferringToSymbol(node)) {
        return true;
      }

      // Handle call expressions within TypeScript nodes that cause a jump in control
      // flow. We resolve the call expression value declaration and add it to the node queue.
      if (ts.isCallExpression(node)) {
        this.addJumpExpressionToQueue(node.expression, nodeQueue);
      }

      // Handle new expressions that cause a jump in control flow. We resolve the
      // constructor declaration of the target class and add it to the node queue.
      if (ts.isNewExpression(node)) {
        this.addNewExpressionToQueue(node, nodeQueue);
      }

      nodeQueue.push(...node.getChildren());
    }
    return false;
  }
}
