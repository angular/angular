/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {isFunctionLikeDeclaration, unwrapExpression} from '../../../../utils/typescript/functions';
import {getPropertyNameText} from '../../../../utils/typescript/property_name';

export type FunctionContext = Map<ts.Node, ts.Node>;

export enum ResolvedUsage {
  SYNCHRONOUS,
  ASYNCHRONOUS,
  AMBIGUOUS,
}

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
 * List of known asynchronous external call expressions which aren't analyzable
 * but are guaranteed to not execute the passed argument synchronously.
 */
const ASYNC_EXTERNAL_CALLS = [
  {parent: ['Promise'], name: 'then'},
  {parent: ['Promise'], name: 'catch'},
  {parent: [null, 'Window'], name: 'requestAnimationFrame'},
  {parent: [null, 'Window'], name: 'setTimeout'},
  {parent: [null, 'Window'], name: 'setInterval'},
  {parent: ['*'], name: 'addEventListener'},
];

/**
 * Class that can be used to determine if a given TypeScript node is used within
 * other given TypeScript nodes. This is achieved by walking through all children
 * of the given node and checking for usages of the given declaration. The visitor
 * also handles potential control flow changes caused by call/new expressions.
 */
export class DeclarationUsageVisitor {
  /** Set of visited symbols that caused a jump in control flow. */
  private visitedJumpExprNodes = new Set<ts.Node>();

  /**
   * Queue of nodes that need to be checked for declaration usage and
   * are guaranteed to be executed synchronously.
   */
  private nodeQueue: ts.Node[] = [];

  /**
   * Nodes which need to be checked for declaration usage but aren't
   * guaranteed to execute synchronously.
   */
  private ambiguousNodeQueue: ts.Node[] = [];

  /**
   * Function context that holds the TypeScript node values for all parameters
   * of the currently analyzed function block.
   */
  private context: FunctionContext = new Map();

  constructor(
      private declaration: ts.Node, private typeChecker: ts.TypeChecker,
      private baseContext: FunctionContext = new Map()) {}

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
      this.peekIntoJumpExpression(callExpression);
      return;
    }

    const expressionDecl = this._resolveNodeFromContext(callExprSymbol.valueDeclaration);

    // Note that we should not add previously visited symbols to the queue as
    // this could cause cycles.
    if (!isFunctionLikeDeclaration(expressionDecl) ||
        this.visitedJumpExprNodes.has(expressionDecl) || !expressionDecl.body) {
      this.peekIntoJumpExpression(callExpression);
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
      this.peekIntoJumpExpression(node);
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
    } else {
      this.peekIntoJumpExpression(node);
    }
  }

  private visitPropertyAccessors(
      node: ts.PropertyAccessExpression, checkSetter: boolean, checkGetter: boolean) {
    const propertySymbol = this._getPropertyAccessSymbol(node);

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
                d.body && !this.visitedJumpExprNodes.has(d))
        .forEach(d => {
          this.visitedJumpExprNodes.add(d);
          this.nodeQueue.push(d.body!);
        });
  }

  private visitBinaryExpression(node: ts.BinaryExpression): boolean {
    const leftExpr = unwrapExpression(node.left);

    if (!ts.isPropertyAccessExpression(leftExpr)) {
      return false;
    }

    if (BINARY_COMPOUND_TOKENS.indexOf(node.operatorToken.kind) !== -1) {
      // Compound assignments always cause the getter and setter to be called.
      // Therefore we need to check the setter and getter of the property access.
      this.visitPropertyAccessors(leftExpr, /* setter */ true, /* getter */ true);
    } else if (node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      // Value assignments using the equals token only cause the "setter" to be called.
      // Therefore we need to analyze the setter declaration of the property access.
      this.visitPropertyAccessors(leftExpr, /* setter */ true, /* getter */ false);
    } else {
      // If the binary expression is not an assignment, it's a simple property read and
      // we need to check the getter declaration if present.
      this.visitPropertyAccessors(leftExpr, /* setter */ false, /* getter */ true);
    }
    return true;
  }

  getResolvedNodeUsage(searchNode: ts.Node): ResolvedUsage {
    this.nodeQueue = [searchNode];
    this.visitedJumpExprNodes.clear();
    this.context.clear();

    // Copy base context values into the current function block context. The
    // base context is useful if nodes need to be mapped to other nodes. e.g.
    // abstract super class methods are mapped to their implementation node of
    // the derived class.
    this.baseContext.forEach((value, key) => this.context.set(key, value));

    return this.isSynchronouslyUsedInNode(searchNode);
  }

  private isSynchronouslyUsedInNode(searchNode: ts.Node): ResolvedUsage {
    this.ambiguousNodeQueue = [];

    while (this.nodeQueue.length) {
      const node = this.nodeQueue.shift()!;

      if (ts.isIdentifier(node) && this.isReferringToSymbol(node)) {
        return ResolvedUsage.SYNCHRONOUS;
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

      // We also need to handle binary expressions where a value can be either assigned to
      // the property, or a value is read from a property expression. Depending on the
      // binary expression operator, setters or getters need to be analyzed.
      if (ts.isBinaryExpression(node)) {
        // In case the binary expression contained a property expression on the left side, we
        // don't want to continue visiting this property expression on its own. This is necessary
        // because visiting the expression on its own causes a loss of context. e.g. property
        // access expressions *do not* always cause a value read (e.g. property assignments)
        if (this.visitBinaryExpression(node)) {
          this.nodeQueue.push(node.right);
          continue;
        }
      }

      // Handle property access expressions. Property expressions which are part of binary
      // expressions won't be added to the node queue, so these access expressions are
      // guaranteed to be "read" accesses and we need to check the "getter" declaration.
      if (ts.isPropertyAccessExpression(node)) {
        this.visitPropertyAccessors(node, /* setter */ false, /* getter */ true);
      }

      // Do not visit nodes that declare a block of statements but are not executed
      // synchronously (e.g. function declarations). We only want to check TypeScript
      // nodes which are synchronously executed in the control flow.
      if (!isFunctionLikeDeclaration(node)) {
        this.nodeQueue.push(...node.getChildren());
      }
    }

    if (this.ambiguousNodeQueue.length) {
      // Update the node queue to all stored ambiguous nodes. These nodes are not
      // guaranteed to be executed and therefore in case of a synchronous usage
      // within one of those nodes, the resolved usage is ambiguous.
      this.nodeQueue = this.ambiguousNodeQueue;
      const usage = this.isSynchronouslyUsedInNode(searchNode);
      return usage === ResolvedUsage.SYNCHRONOUS ? ResolvedUsage.AMBIGUOUS : usage;
    }
    return ResolvedUsage.ASYNCHRONOUS;
  }

  /**
   * Peeks into the given jump expression by adding all function like declarations
   * which are referenced in the jump expression arguments to the ambiguous node
   * queue. These arguments could technically access the given declaration but it's
   * not guaranteed that the jump expression is executed. In that case the resolved
   * usage is ambiguous.
   */
  private peekIntoJumpExpression(jumpExp: ts.CallExpression|ts.NewExpression) {
    if (!jumpExp.arguments) {
      return;
    }

    // For some call expressions we don't want to add the arguments to the
    // ambiguous node queue. e.g. "setTimeout" is not analyzable but is
    // guaranteed to execute its argument asynchronously. We handle a subset
    // of these call expressions by having a hardcoded list of some.
    if (ts.isCallExpression(jumpExp)) {
      const symbol = this._getDeclarationSymbolOfNode(jumpExp.expression);
      if (symbol && symbol.valueDeclaration) {
        const parentNode = symbol.valueDeclaration.parent;
        if (parentNode && (ts.isInterfaceDeclaration(parentNode) || ts.isSourceFile(parentNode)) &&
            (ts.isMethodSignature(symbol.valueDeclaration) ||
             ts.isFunctionDeclaration(symbol.valueDeclaration)) &&
            symbol.valueDeclaration.name) {
          const parentName = ts.isInterfaceDeclaration(parentNode) ? parentNode.name.text : null;
          const callName = getPropertyNameText(symbol.valueDeclaration.name);
          if (ASYNC_EXTERNAL_CALLS.some(
                  c =>
                      (c.name === callName &&
                       (c.parent.indexOf(parentName) !== -1 || c.parent.indexOf('*') !== -1)))) {
            return;
          }
        }
      }
    }

    jumpExp.arguments!.forEach((node: ts.Node) => {
      node = this._resolveDeclarationOfNode(node);

      if (ts.isVariableDeclaration(node) && node.initializer) {
        node = node.initializer;
      }

      if (isFunctionLikeDeclaration(node) && !!node.body) {
        this.ambiguousNodeQueue.push(node.body);
      }
    });
  }

  /**
   * Resolves a given node from the context. In case the node is not mapped in
   * the context, the original node is returned.
   */
  private _resolveNodeFromContext(node: ts.Node): ts.Node {
    if (this.context.has(node)) {
      return this.context.get(node)!;
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

      if (!argumentNode) {
        if (!parameter.initializer) {
          return;
        }

        // Argument can be undefined in case the function parameter has a default
        // value. In that case we want to store the parameter default value in the context.
        argumentNode = parameter.initializer;
      }

      if (ts.isIdentifier(argumentNode)) {
        this.context.set(parameter, this._resolveDeclarationOfNode(argumentNode));
      } else {
        this.context.set(parameter, argumentNode);
      }
    });
  }

  /**
   * Resolves the declaration of a given TypeScript node. For example an identifier can
   * refer to a function parameter. This parameter can then be resolved through the
   * function context.
   */
  private _resolveDeclarationOfNode(node: ts.Node): ts.Node {
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

  /** Gets the symbol of the given property access expression. */
  private _getPropertyAccessSymbol(node: ts.PropertyAccessExpression): ts.Symbol|null {
    let propertySymbol = this._getDeclarationSymbolOfNode(node.name);

    if (!propertySymbol || !propertySymbol.valueDeclaration) {
      return null;
    }

    if (!this.context.has(propertySymbol.valueDeclaration)) {
      return propertySymbol;
    }

    // In case the context has the value declaration of the given property access
    // name identifier, we need to replace the "propertySymbol" with the symbol
    // referring to the resolved symbol based on the context. e.g. abstract properties
    // can ultimately resolve into an accessor declaration based on the implementation.
    const contextNode = this._resolveNodeFromContext(propertySymbol.valueDeclaration);

    if (!ts.isAccessor(contextNode)) {
      return null;
    }

    // Resolve the symbol referring to the "accessor" using the name identifier
    // of the accessor declaration.
    return this._getDeclarationSymbolOfNode(contextNode.name);
  }
}
