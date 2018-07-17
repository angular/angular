/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {Decorator} from '../../../ngtsc/host';
import {ClassMember, ClassMemberKind} from '../../../ngtsc/host/src/reflection';
import {reflectObjectLiteral} from '../../../ngtsc/metadata/src/reflector';
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
    if (classSymbol.exports && classSymbol.exports.has(CONSTRUCTOR_PARAMS)) {
      const paramDecoratorsProperty =
          getPropertyValueFromSymbol(classSymbol.exports.get(CONSTRUCTOR_PARAMS) !);
      if (paramDecoratorsProperty && ts.isFunctionExpression(paramDecoratorsProperty)) {
        const returnStatement = getReturnStatement(paramDecoratorsProperty.body);
        if (returnStatement && returnStatement.expression &&
            ts.isArrayLiteralExpression(returnStatement.expression)) {
          return returnStatement.expression.elements.map(
              element =>
                  ts.isObjectLiteralExpression(element) ? reflectObjectLiteral(element) : null);
        }
      }
    }
    return [];
  }

  protected reflectMember(symbol: ts.Symbol, decorators?: Decorator[], isStatic?: boolean):
      ClassMember|null {
    const member = super.reflectMember(symbol, decorators, isStatic);
    if (member && member.kind === ClassMemberKind.Method && member.isStatic && member.node &&
        ts.isPropertyAccessExpression(member.node) && member.node.parent &&
        ts.isBinaryExpression(member.node.parent) &&
        ts.isFunctionExpression(member.node.parent.right)) {
      debugger;
      // recompute the declaration for this member, since ES5 static methods are variable
      // declarations
      // so the declaration is actually the initialzer of the variable assignment
      member.declaration = member.node.parent.right;
    }
    return member;
  }
}


function getIifeBody(declaration: ts.VariableDeclaration): ts.Block|undefined {
  if (declaration.initializer && ts.isParenthesizedExpression(declaration.initializer)) {
    const call = declaration.initializer;
    if (ts.isCallExpression(call.expression) &&
        ts.isFunctionExpression(call.expression.expression)) {
      return call.expression.expression.body;
    }
  }
}

function getReturnIdentifier(body: ts.Block): ts.Identifier|undefined {
  const returnStatement = getReturnStatement(body);
  if (returnStatement && returnStatement.expression &&
      ts.isIdentifier(returnStatement.expression)) {
    return returnStatement.expression;
  }
}

function getReturnStatement(body: ts.Block): ts.ReturnStatement|undefined {
  return body.statements.find(ts.isReturnStatement);
}
