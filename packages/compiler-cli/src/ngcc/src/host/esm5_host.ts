/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ClassMember, ClassMemberKind, Decorator} from '../../../ngtsc/host';
import {reflectObjectLiteral} from '../../../ngtsc/metadata';
import {CONSTRUCTOR_PARAMS, Esm2015ReflectionHost, getPropertyValueFromSymbol} from './esm2015_host';

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
export class Esm5ReflectionHost extends Esm2015ReflectionHost {
  constructor(checker: ts.TypeChecker) { super(checker); }

  /**
   * Check whether the given declaration node actually represents a class.
   */
  isClass(node: ts.Declaration): boolean { return !!this.getClassSymbol(node); }

  /**
   * In ESM5 the implementation of a class is a function expression that is hidden inside an IIFE.
   * So we need to dig around inside to get hold of the "class" symbol.
   * @param declaration the top level declaration that represents an exported class.
   */
  getClassSymbol(declaration: ts.Declaration): ts.Symbol|undefined {
    if (ts.isVariableDeclaration(declaration)) {
      const iifeBody = getIifeBody(declaration);
      if (iifeBody) {
        const innerClassIdentifier = getReturnIdentifier(iifeBody);
        if (innerClassIdentifier) {
          return this.checker.getSymbolAtLocation(innerClassIdentifier);
        }
      }
    }
    return undefined;
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