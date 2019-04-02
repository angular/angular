/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {isFunctionLikeDeclaration, unwrapExpression} from '../typescript/functions';

type FunctionContext = Map<ts.ParameterDeclaration, ts.Node>;

/**
 * Class that can be used to determine if a given TypeScript node is used within
 * other given TypeScript nodes. This is achieved by walking through all children
 * of the given node and checking for usages of the given declaration. The visitor
 * also handles potential control flow changes caused by call/new expressions.
 */
export class DeclarationUsageVisitor {
  /** Set of visited symbols that caused a jump in control flow. */
  private visitedJumpExprNodes = new Set<ts.Node>();

  /** Queue of nodes that need to be checked for declaration usage. */
  private nodeQueue: ts.Node[] = [];

  /**
   * Function context that holds the TypeScript node values for all parameters
   * of the currently analyzed function block.
   */
  private context: FunctionContext = new Map();

  constructor(private declaration: ts.Node, private typeChecker: ts.TypeChecker) {}

  private isReferringToSymbol(node: ts.Node): boolean {
    const symbol = this.typeChecker.getSymbolAtLocation(node);
    return !!symbol && symbol.valueDeclaration === this.declaration;
  }

  private addJumpExpressionToQueue(callExpression: ts.CallExpression) {
    const node = unwrapExpression(callExpression.expression);

    // In case the given expression is already referring to a function-like declaration,
    // we don't need to resolve the symbol of the expression as the jump expression is
    // defined inline and we can just add the given node to the queue.
    if (isFunctionLikeDeclaration(node) && node.body) {
      this.nodeQueue.push(node.body);
      return;
    }

    const callExprSymbol = this._getDeclarationSymbolOfNode(node);

    if (!callExprSymbol || !callExprSymbol.valueDeclaration) {
      return;
    }

    const expressionDecl = this._resolveNodeFromContext(callExprSymbol.valueDeclaration);

    // Note that we should not add previously visited symbols to the queue as
    // this could cause cycles.
    if (!isFunctionLikeDeclaration(expressionDecl) ||
        this.visitedJumpExprNodes.has(expressionDecl) || !expressionDecl.body) {
      return;
    }

    // Update the context for the new jump expression and its specified arguments.
    this._updateContext(callExpression.arguments, expressionDecl.parameters);

    this.visitedJumpExprNodes.add(expressionDecl);
    this.nodeQueue.push(expressionDecl.body);
  }

  private addNewExpressionToQueue(node: ts.NewExpression) {
    const newExprSymbol = this._getDeclarationSymbolOfNode(unwrapExpression(node.expression));

    // Only handle new expressions which resolve to classes. Technically "new" could
    // also call void functions or objects with a constructor signature. Also note that
    // we should not visit already visited symbols as this could cause cycles.
    if (!newExprSymbol || !newExprSymbol.valueDeclaration ||
        !ts.isClassDeclaration(newExprSymbol.valueDeclaration)) {
      return;
    }

    const targetConstructor =
        newExprSymbol.valueDeclaration.members.find(ts.isConstructorDeclaration);

    if (targetConstructor && targetConstructor.body &&
        !this.visitedJumpExprNodes.has(targetConstructor)) {
      // Update the context for the new expression and its specified constructor
      // parameters if arguments are passed to the class constructor.
      if (node.arguments) {
        this._updateContext(node.arguments, targetConstructor.parameters);
      }

      this.visitedJumpExprNodes.add(targetConstructor);
      this.nodeQueue.push(targetConstructor.body);
    }
  }

  private visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
    const propertySymbol = this._getDeclarationSymbolOfNode(node);

    if (!propertySymbol || !propertySymbol.valueDeclaration ||
        this.visitedJumpExprNodes.has(propertySymbol.valueDeclaration)) {
      return;
    }

    const valueDeclaration = propertySymbol.valueDeclaration;

    // In case the property access expression refers to a get accessor, we need to visit
    // the body of the get accessor declaration as there could be logic that uses the
    // given search node synchronously.
    if (ts.isGetAccessorDeclaration(valueDeclaration) && valueDeclaration.body) {
      this.visitedJumpExprNodes.add(valueDeclaration);
      this.nodeQueue.push(valueDeclaration.body);
    }
  }

  isSynchronouslyUsedInNode(searchNode: ts.Node): boolean {
    this.visitedJumpExprNodes.clear();
    this.context.clear();
    this.nodeQueue = [searchNode];

    while (this.nodeQueue.length) {
      const node = this.nodeQueue.shift() !;

      if (ts.isIdentifier(node) && this.isReferringToSymbol(node)) {
        return true;
      }

      // Handle call expressions within TypeScript nodes that cause a jump in control
      // flow. We resolve the call expression value declaration and add it to the node queue.
      if (ts.isCallExpression(node)) {
        this.addJumpExpressionToQueue(node);
      }

      // Handle new expressions that cause a jump in control flow. We resolve the
      // constructor declaration of the target class and add it to the node queue.
      if (ts.isNewExpression(node)) {
        this.addNewExpressionToQueue(node);
      }

      // Handle property access expressions. These could resolve to get-accessor declarations
      // which can contain synchronous logic that accesses the search node.
      if (ts.isPropertyAccessExpression(node)) {
        this.visitPropertyAccessExpression(node);
      }

      // Do not visit nodes that declare a block of statements but are not executed
      // synchronously (e.g. function declarations). We only want to check TypeScript
      // nodes which are synchronously executed in the control flow.
      if (!isFunctionLikeDeclaration(node)) {
        this.nodeQueue.push(...node.getChildren());
      }
    }
    return false;
  }

  /**
   * Resolves a given node from the context. In case the node is not mapped in
   * the context, the original node is returned.
   */
  private _resolveNodeFromContext(node: ts.Node): ts.Node {
    if (ts.isParameter(node) && this.context.has(node)) {
      return this.context.get(node) !;
    }
    return node;
  }

  /**
   * Updates the context to reflect the newly set parameter values. This allows future
   * references to function parameters to be resolved to the actual node through the context.
   */
  private _updateContext(
      callArgs: ts.NodeArray<ts.Expression>, parameters: ts.NodeArray<ts.ParameterDeclaration>) {
    parameters.forEach((parameter, index) => {
      let argumentNode: ts.Node = callArgs[index];
      if (ts.isIdentifier(argumentNode)) {
        this.context.set(parameter, this._resolveIdentifier(argumentNode));
      } else {
        this.context.set(parameter, argumentNode);
      }
    });
  }

  /**
   * Resolves a TypeScript identifier node. For example an identifier can refer to a
   * function parameter which can be resolved through the function context.
   */
  private _resolveIdentifier(node: ts.Identifier): ts.Node {
    const symbol = this._getDeclarationSymbolOfNode(node);

    if (!symbol || !symbol.valueDeclaration) {
      return node;
    }

    return this._resolveNodeFromContext(symbol.valueDeclaration);
  }

  /**
   * Gets the declaration symbol of a given TypeScript node. Resolves aliased
   * symbols to the symbol containing the value declaration.
   */
  private _getDeclarationSymbolOfNode(node: ts.Node): ts.Symbol|null {
    let symbol = this.typeChecker.getSymbolAtLocation(node);

    if (!symbol) {
      return null;
    }

    // Resolve the symbol to it's original declaration symbol.
    while (symbol.flags & ts.SymbolFlags.Alias) {
      symbol = this.typeChecker.getAliasedSymbol(symbol);
    }

    return symbol;
  }
}
