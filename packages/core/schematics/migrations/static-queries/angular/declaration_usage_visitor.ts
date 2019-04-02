/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {isFunctionLikeDeclaration, unwrapExpression} from '../../../utils/typescript/functions';

/**
 * List of TypeScript syntax tokens that can be used within a binary expression as
 * compound assignment. These imply a read and write of the left-side expression.
 */
const BINARY_COMPOUND_TOKENS = [
  ts.SyntaxKind.CaretEqualsToken,
  ts.SyntaxKind.AsteriskEqualsToken,
  ts.SyntaxKind.AmpersandEqualsToken,
  ts.SyntaxKind.BarEqualsToken,
  ts.SyntaxKind.AsteriskAsteriskEqualsToken,
  ts.SyntaxKind.PlusEqualsToken,
  ts.SyntaxKind.MinusEqualsToken,
  ts.SyntaxKind.SlashEqualsToken,
];

/**
 * Class that can be used to determine if a given TypeScript node is used within
 * other given TypeScript nodes. This is achieved by walking through all children
 * of the given node and checking for usages of the given declaration. The visitor
 * also handles potential control flow changes caused by call/new expressions.
 */
export class DeclarationUsageVisitor {
  /** Set of visited symbols that caused a jump in control flow. */
  private visitedJumpExprSymbols = new Set<ts.Symbol>();

  /** Set of visited accessor nodes that caused a jump in control flow. */
  private visitedAccessorNodes = new Set<ts.AccessorDeclaration>();

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

  private visitPropertyAccessors(
      node: ts.PropertyAccessExpression, nodeQueue: ts.Node[], checkSetter: boolean,
      checkGetter: boolean) {
    const propertySymbol = this.typeChecker.getSymbolAtLocation(node.name);

    if (!propertySymbol || !propertySymbol.declarations.length ||
        (propertySymbol.getFlags() & ts.SymbolFlags.Accessor) === 0) {
      return;
    }

    // Since we checked the symbol flags and the symbol is describing an accessor, the
    // declarations are guaranteed to only contain the getters and setters.
    const accessors = propertySymbol.declarations as ts.AccessorDeclaration[];

    accessors
        .filter(
            d => (checkSetter && ts.isSetAccessor(d) || checkGetter && ts.isGetAccessor(d)) &&
                d.body && !this.visitedAccessorNodes.has(d))
        .forEach(d => {
          this.visitedAccessorNodes.add(d);
          nodeQueue.push(d.body !);
        });
  }

  private visitBinaryExpression(node: ts.BinaryExpression, nodeQueue: ts.Node[]): boolean {
    const leftExpr = unwrapExpression(node.left);

    if (!ts.isPropertyAccessExpression(leftExpr)) {
      return false;
    }

    const symbol = this.typeChecker.getSymbolAtLocation(leftExpr.name);

    if (!symbol || !symbol.declarations.length ||
        (symbol.getFlags() & ts.SymbolFlags.Accessor) === 0) {
      return false;
    }

    if (BINARY_COMPOUND_TOKENS.indexOf(node.operatorToken.kind) !== -1) {
      // Compound assignments always cause the getter and setter to be called.
      // Therefore we need to check the setter and getter of the property access.
      this.visitPropertyAccessors(leftExpr, nodeQueue, /* setter */ true, /* getter */ true);
    } else if (node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      // Value assignments using the equals token only cause the "setter" to be called.
      // Therefore we need to analyze the setter declaration of the property access.
      this.visitPropertyAccessors(leftExpr, nodeQueue, /* setter */ true, /* getter */ false);
    } else {
      // If the binary expression is not an assignment, it's a simple property read and
      // we need to check the getter declaration if present.
      this.visitPropertyAccessors(leftExpr, nodeQueue, /* setter */ false, /* getter */ true);
    }
    return true;
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

      // We also need to handle binary expressions where a value can be either assigned to
      // the property, or a value is read from a property expression. Depending on the
      // binary expression operator, setters or getters need to be analyzed.
      if (ts.isBinaryExpression(node)) {
        // In case the binary expression contained a property expression on the left side, we
        // don't want to continue visiting this property expression on its own. This is necessary
        // because visiting the expression on its own causes a loss of context. e.g. property
        // access expressions *do not* always cause a value read (e.g. property assignments)
        if (this.visitBinaryExpression(node, nodeQueue)) {
          nodeQueue.push(node.right);
          continue;
        }
      }

      // Handle property access expressions. Property expressions which are part of binary
      // expressions won't be added to the node queue, so these access expressions are
      // guaranteed to be "read" accesses and we need to check the "getter" declaration.
      if (ts.isPropertyAccessExpression(node)) {
        this.visitPropertyAccessors(node, nodeQueue, /* setter */ false, /* getter */ true);
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
