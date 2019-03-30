/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {isFunctionLikeDeclaration, unwrapExpression} from '../typescript/functions';

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
    // In case the given expression is already referring to a function-like declaration,
    // we don't need to resolve the symbol of the expression as the jump expression is
    // defined inline and we can just add the given node to the queue.
    if (isFunctionLikeDeclaration(node) && node.body) {
      nodeQueue.push(node.body);
      return;
    }

    const callExprType = this.typeChecker.getTypeAtLocation(node);
    const callExprSymbol = callExprType.getSymbol();

    if (!callExprSymbol || !callExprSymbol.valueDeclaration ||
        !isFunctionLikeDeclaration(callExprSymbol.valueDeclaration)) {
      return;
    }

    const expressionDecl = callExprSymbol.valueDeclaration;

    // Note that we should not add previously visited symbols to the queue as
    // this could cause cycles.
    if (expressionDecl.body && !this.visitedJumpExprSymbols.has(callExprSymbol)) {
      this.visitedJumpExprSymbols.add(callExprSymbol);
      nodeQueue.push(expressionDecl.body);
    }
  }

  private addNewExpressionToQueue(node: ts.NewExpression, nodeQueue: ts.Node[]) {
    const newExprSymbol = this.typeChecker.getSymbolAtLocation(unwrapExpression(node.expression));

    // Only handle new expressions which resolve to classes. Technically "new" could
    // also call void functions or objects with a constructor signature. Also note that
    // we should not visit already visited symbols as this could cause cycles.
    if (!newExprSymbol || !newExprSymbol.valueDeclaration ||
        !ts.isClassDeclaration(newExprSymbol.valueDeclaration) ||
        this.visitedJumpExprSymbols.has(newExprSymbol)) {
      return;
    }

    const targetConstructor =
        newExprSymbol.valueDeclaration.members.find(ts.isConstructorDeclaration);

    if (targetConstructor && targetConstructor.body) {
      this.visitedJumpExprSymbols.add(newExprSymbol);
      nodeQueue.push(targetConstructor.body);
    }
  }

  private visitPropertyAccessExpression(node: ts.PropertyAccessExpression, nodeQueue: ts.Node[]) {
    const propertySymbol = this.typeChecker.getSymbolAtLocation(node.name);

    if (!propertySymbol || !propertySymbol.valueDeclaration ||
        this.visitedJumpExprSymbols.has(propertySymbol)) {
      return;
    }

    const valueDeclaration = propertySymbol.valueDeclaration;

    // In case the property access expression refers to a get accessor, we need to visit
    // the body of the get accessor declaration as there could be logic that uses the
    // given search node synchronously.
    if (ts.isGetAccessorDeclaration(valueDeclaration) && valueDeclaration.body) {
      this.visitedJumpExprSymbols.add(propertySymbol);
      nodeQueue.push(valueDeclaration.body);
    }
  }

  isSynchronouslyUsedInNode(searchNode: ts.Node): boolean {
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
        this.addJumpExpressionToQueue(unwrapExpression(node.expression), nodeQueue);
      }

      // Handle new expressions that cause a jump in control flow. We resolve the
      // constructor declaration of the target class and add it to the node queue.
      if (ts.isNewExpression(node)) {
        this.addNewExpressionToQueue(node, nodeQueue);
      }

      // Handle property access expressions. These could resolve to get-accessor declarations
      // which can contain synchronous logic that accesses the search node.
      if (ts.isPropertyAccessExpression(node)) {
        this.visitPropertyAccessExpression(node, nodeQueue);
      }

      // Do not visit nodes that declare a block of statements but are not executed
      // synchronously (e.g. function declarations). We only want to check TypeScript
      // nodes which are synchronously executed in the control flow.
      if (!isFunctionLikeDeclaration(node)) {
        nodeQueue.push(...node.getChildren());
      }
    }
    return false;
  }
}
