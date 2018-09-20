/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ClassMember, ClassMemberKind, Decorator, FunctionDefinition, Parameter} from '../../../ngtsc/host';
import {reflectObjectLiteral} from '../../../ngtsc/metadata';
import {getNameText} from '../utils';
import {CONSTRUCTOR_PARAMS, Fesm2015ReflectionHost, getPropertyValueFromSymbol} from './fesm2015_host';

/**
 * ESM5 packages contain ECMAScript IIFE functions that act like classes. For example:
 *
 * ```
 * var CommonModule = (function () {
 *  function CommonModule() {
 *  }
 *  CommonModule.decorators = [ ... ];
 * ```
 *
 * * "Classes" are decorated if they have a static property called `decorators`.
 * * Members are decorated if there is a matching key on a static property
 *   called `propDecorators`.
 * * Constructor parameters decorators are found on an object returned from
 *   a static method called `ctorParameters`.
 *
 */
export class Esm5ReflectionHost extends Fesm2015ReflectionHost {
  constructor(checker: ts.TypeChecker) { super(checker); }

  /**
   * Check whether the given node actually represents a class.
   */
  isClass(node: ts.Node): boolean { return super.isClass(node) || !!this.getClassSymbol(node); }

  /**
   * Find a symbol for a node that we think is a class.
   *
   * In ES5, the implementation of a class is a function expression that is hidden inside an IIFE.
   * So we need to dig around inside to get hold of the "class" symbol.
   *
   * `node` might be one of:
   * - A class declaration (from a declaration file).
   * - The declaration of the outer variable, which is assigned the result of the IIFE.
   * - The function declaration inside the IIFE, which is eventually returned and assigned to the
   *   outer variable.
   *
   * @param node The top level declaration that represents an exported class or the function
   *     expression inside the IIFE.
   * @returns The symbol for the node or `undefined` if it is not a "class" or has no symbol.
   */
  getClassSymbol(node: ts.Node): ts.Symbol|undefined {
    const symbol = super.getClassSymbol(node);
    if (symbol) return symbol;

    if (ts.isVariableDeclaration(node)) {
      const iifeBody = getIifeBody(node);
      if (!iifeBody) return undefined;

      const innerClassIdentifier = getReturnIdentifier(iifeBody);
      if (!innerClassIdentifier) return undefined;

      return this.checker.getSymbolAtLocation(innerClassIdentifier);
    } else if (ts.isFunctionDeclaration(node)) {
      // It might be the function expression inside the IIFE. We need to go 5 levels up...

      // 1. IIFE body.
      let outerNode = node.parent;
      if (!outerNode || !ts.isBlock(outerNode)) return undefined;

      // 2. IIFE function expression.
      outerNode = outerNode.parent;
      if (!outerNode || !ts.isFunctionExpression(outerNode)) return undefined;

      // 3. IIFE call expression.
      outerNode = outerNode.parent;
      if (!outerNode || !ts.isCallExpression(outerNode)) return undefined;

      // 4. Parenthesis around IIFE.
      outerNode = outerNode.parent;
      if (!outerNode || !ts.isParenthesizedExpression(outerNode)) return undefined;

      // 5. Outer variable declaration.
      outerNode = outerNode.parent;
      if (!outerNode || !ts.isVariableDeclaration(outerNode)) return undefined;

      return this.getClassSymbol(outerNode);
    }

    return undefined;
  }

  /**
   * Parse a function declaration to find the relevant metadata about it.
   * In ESM5 we need to do special work with optional arguments to the function, since they get
   * their own initializer statement that needs to be parsed and then not included in the "body"
   * statements of the function.
   * @param node the function declaration to parse.
   */
  getDefinitionOfFunction<T extends ts.FunctionDeclaration|ts.MethodDeclaration|
                          ts.FunctionExpression>(node: T): FunctionDefinition<T> {
    const parameters =
        node.parameters.map(p => ({name: getNameText(p.name), node: p, initializer: null}));
    let lookingForParamInitializers = true;

    const statements = node.body && node.body.statements.filter(s => {
      lookingForParamInitializers =
          lookingForParamInitializers && reflectParamInitializer(s, parameters);
      // If we are no longer looking for parameter initializers then we include this statement
      return !lookingForParamInitializers;
    });

    return {node, body: statements || null, parameters};
  }

  /**
   * Find the declarations of the constructor parameters of a class identified by its symbol.
   * In ESM5 there is no "class" so the constructor that we want is actually the declaration
   * function itself.
   */
  protected getConstructorParameterDeclarations(classSymbol: ts.Symbol): ts.ParameterDeclaration[] {
    const constructor = classSymbol.valueDeclaration as ts.FunctionDeclaration;
    if (constructor && constructor.parameters) {
      return Array.from(constructor.parameters);
    }
    return [];
  }

  /**
   * Constructors parameter decorators are declared in the body of static method of the constructor
   * function in ES5. Note that unlike ESM2105 this is a function expression rather than an arrow
   * function:
   *
   * ```
   * SomeDirective.ctorParameters = function() { return [
   *   { type: ViewContainerRef, },
   *   { type: TemplateRef, },
   *   { type: IterableDiffers, },
   *   { type: undefined, decorators: [{ type: Inject, args: [INJECTED_TOKEN,] },] },
   * ]; };
   * ```
   */
  protected getConstructorDecorators(classSymbol: ts.Symbol): (Map<string, ts.Expression>|null)[] {
    const declaration = classSymbol.exports && classSymbol.exports.get(CONSTRUCTOR_PARAMS);
    const paramDecoratorsProperty = declaration && getPropertyValueFromSymbol(declaration);
    const returnStatement = getReturnStatement(paramDecoratorsProperty);
    const expression = returnStatement && returnStatement.expression;
    return expression && ts.isArrayLiteralExpression(expression) ?
        expression.elements.map(reflectArrayElement) :
        [];
  }

  protected reflectMember(symbol: ts.Symbol, decorators?: Decorator[], isStatic?: boolean):
      ClassMember|null {
    const member = super.reflectMember(symbol, decorators, isStatic);
    if (member && member.kind === ClassMemberKind.Method && member.isStatic && member.node &&
        ts.isPropertyAccessExpression(member.node) && member.node.parent &&
        ts.isBinaryExpression(member.node.parent) &&
        ts.isFunctionExpression(member.node.parent.right)) {
      // Recompute the implementation for this member:
      // ES5 static methods are variable declarations so the declaration is actually the
      // initializer of the variable assignment
      member.implementation = member.node.parent.right;
    }
    return member;
  }
}

function getIifeBody(declaration: ts.VariableDeclaration): ts.Block|undefined {
  if (!declaration.initializer || !ts.isParenthesizedExpression(declaration.initializer)) {
    return undefined;
  }
  const call = declaration.initializer;
  return ts.isCallExpression(call.expression) &&
          ts.isFunctionExpression(call.expression.expression) ?
      call.expression.expression.body :
      undefined;
}

function getReturnIdentifier(body: ts.Block): ts.Identifier|undefined {
  const returnStatement = body.statements.find(ts.isReturnStatement);
  return returnStatement && returnStatement.expression &&
          ts.isIdentifier(returnStatement.expression) ?
      returnStatement.expression :
      undefined;
}

function getReturnStatement(declaration: ts.Expression | undefined): ts.ReturnStatement|undefined {
  return declaration && ts.isFunctionExpression(declaration) ?
      declaration.body.statements.find(ts.isReturnStatement) :
      undefined;
}

function reflectArrayElement(element: ts.Expression) {
  return ts.isObjectLiteralExpression(element) ? reflectObjectLiteral(element) : null;
}

/**
 * Parse the statement to extract the ESM5 parameter initializer if there is one.
 * If one is found, add it to the appropriate parameter in the `parameters` collection.
 *
 * The form we are looking for is:
 *
 * ```
 * if (arg === void 0) { arg = initializer; }
 * ```
 *
 * @param statement A statement that may be initializing an optional parameter
 * @param parameters The collection of parameters that were found in the function definition
 * @returns true if the statement was a parameter initializer
 */
function reflectParamInitializer(statement: ts.Statement, parameters: Parameter[]) {
  if (ts.isIfStatement(statement) && isUndefinedComparison(statement.expression) &&
      ts.isBlock(statement.thenStatement) && statement.thenStatement.statements.length === 1) {
    const ifStatementComparison = statement.expression;           // (arg === void 0)
    const thenStatement = statement.thenStatement.statements[0];  // arg = initializer;
    if (isAssignment(thenStatement)) {
      const comparisonName = ifStatementComparison.left.text;
      const assignmentName = thenStatement.expression.left.text;
      if (comparisonName === assignmentName) {
        const parameter = parameters.find(p => p.name === comparisonName);
        if (parameter) {
          parameter.initializer = thenStatement.expression.right;
          return true;
        }
      }
    }
  }
  return false;
}

function isUndefinedComparison(expression: ts.Expression): expression is ts.Expression&
    {left: ts.Identifier, right: ts.Expression} {
  return ts.isBinaryExpression(expression) &&
      expression.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken &&
      ts.isVoidExpression(expression.right) && ts.isIdentifier(expression.left);
}

function isAssignment(statement: ts.Statement): statement is ts.ExpressionStatement&
    {expression: {left: ts.Identifier, right: ts.Expression}} {
  return ts.isExpressionStatement(statement) && ts.isBinaryExpression(statement.expression) &&
      statement.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isIdentifier(statement.expression.left);
}
