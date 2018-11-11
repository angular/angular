/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, R3DependencyMetadata, R3Reference, R3ResolvedDependencyType, WrappedNodeExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {ClassMemberKind, Decorator, ReflectionHost} from '../../host';
import {AbsoluteReference, ImportMode, Reference} from '../../metadata';

export function getConstructorDependencies(
    clazz: ts.ClassDeclaration, reflector: ReflectionHost, isCore: boolean): R3DependencyMetadata[]|
    null {
  const useType: R3DependencyMetadata[] = [];
  let ctorParams = reflector.getConstructorParameters(clazz);
  if (ctorParams === null) {
    if (reflector.hasBaseClass(clazz)) {
      return null;
    } else {
      ctorParams = [];
    }
  }
  ctorParams.forEach((param, idx) => {
    let tokenExpr = param.type;
    let optional = false, self = false, skipSelf = false, host = false;
    let resolved = R3ResolvedDependencyType.Token;
    (param.decorators || []).filter(dec => isCore || isAngularCore(dec)).forEach(dec => {
      if (dec.name === 'Inject') {
        if (dec.args === null || dec.args.length !== 1) {
          throw new FatalDiagnosticError(
              ErrorCode.DECORATOR_ARITY_WRONG, dec.node,
              `Unexpected number of arguments to @Inject().`);
        }
        tokenExpr = dec.args[0];
      } else if (dec.name === 'Optional') {
        optional = true;
      } else if (dec.name === 'SkipSelf') {
        skipSelf = true;
      } else if (dec.name === 'Self') {
        self = true;
      } else if (dec.name === 'Host') {
        host = true;
      } else if (dec.name === 'Attribute') {
        if (dec.args === null || dec.args.length !== 1) {
          throw new FatalDiagnosticError(
              ErrorCode.DECORATOR_ARITY_WRONG, dec.node,
              `Unexpected number of arguments to @Attribute().`);
        }
        tokenExpr = dec.args[0];
        resolved = R3ResolvedDependencyType.Attribute;
      } else {
        throw new FatalDiagnosticError(
            ErrorCode.DECORATOR_UNEXPECTED, dec.node,
            `Unexpected decorator ${dec.name} on parameter.`);
      }
    });
    if (tokenExpr === null) {
      throw new FatalDiagnosticError(
          ErrorCode.PARAM_MISSING_TOKEN, param.nameNode,
          `No suitable token for parameter ${param.name || idx} of class ${clazz.name!.text}`);
    }
    const token = new WrappedNodeExpr(tokenExpr);
    useType.push({token, optional, self, skipSelf, host, resolved});
  });
  return useType;
}

export function toR3Reference(
    valueRef: Reference, typeRef: Reference, valueContext: ts.SourceFile,
    typeContext: ts.SourceFile): R3Reference {
  const value = valueRef.toExpression(valueContext, ImportMode.UseExistingImport);
  const type = typeRef.toExpression(typeContext, ImportMode.ForceNewImport);
  if (value === null || type === null) {
    throw new Error(`Could not refer to ${ts.SyntaxKind[valueRef.node.kind]}`);
  }
  return {value, type};
}

export function isAngularCore(decorator: Decorator): boolean {
  return decorator.import !== null && decorator.import.from === '@angular/core';
}

/**
 * Unwrap a `ts.Expression`, removing outer type-casts or parentheses until the expression is in its
 * lowest level form.
 *
 * For example, the expression "(foo as Type)" unwraps to "foo".
 */
export function unwrapExpression(node: ts.Expression): ts.Expression {
  while (ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) {
    node = node.expression;
  }
  return node;
}

function expandForwardRef(arg: ts.Expression): ts.Expression|null {
  if (!ts.isArrowFunction(arg) && !ts.isFunctionExpression(arg)) {
    return null;
  }

  const body = arg.body;
  // Either the body is a ts.Expression directly, or a block with a single return statement.
  if (ts.isBlock(body)) {
    // Block body - look for a single return statement.
    if (body.statements.length !== 1) {
      return null;
    }
    const stmt = body.statements[0];
    if (!ts.isReturnStatement(stmt) || stmt.expression === undefined) {
      return null;
    }
    return stmt.expression;
  } else {
    // Shorthand body - return as an expression.
    return body;
  }
}

/**
 * Possibly resolve a forwardRef() expression into the inner value.
 *
 * @param node the forwardRef() expression to resolve
 * @param reflector a ReflectionHost
 * @returns the resolved expression, if the original expression was a forwardRef(), or the original
 * expression otherwise
 */
export function unwrapForwardRef(node: ts.Expression, reflector: ReflectionHost): ts.Expression {
  if (!ts.isCallExpression(node) || !ts.isIdentifier(node.expression) ||
      node.arguments.length !== 1) {
    return node;
  }
  const expr = expandForwardRef(node.arguments[0]);
  if (expr === null) {
    return node;
  }
  const imp = reflector.getImportOfIdentifier(node.expression);
  if (imp === null || imp.from !== '@angular/core' || imp.name !== 'forwardRef') {
    return node;
  } else {
    return expr;
  }
}

/**
 * A foreign function resolver for `staticallyResolve` which unwraps forwardRef() expressions.
 *
 * @param ref a Reference to the declaration of the function being called (which might be
 * forwardRef)
 * @param args the arguments to the invocation of the forwardRef expression
 * @returns an unwrapped argument if `ref` pointed to forwardRef, or null otherwise
 */
export function forwardRefResolver(
    ref: Reference<ts.FunctionDeclaration|ts.MethodDeclaration>,
    args: ts.Expression[]): ts.Expression|null {
  if (!(ref instanceof AbsoluteReference) || ref.moduleName !== '@angular/core' ||
      ref.symbolName !== 'forwardRef' || args.length !== 1) {
    return null;
  }
  return expandForwardRef(args[0]);
}

export function extractDirectiveGuards(node: ts.Declaration, reflector: ReflectionHost): {
  ngTemplateGuards: string[],
  hasNgTemplateContextGuard: boolean,
} {
  const methods = nodeStaticMethodNames(node, reflector);
  const ngTemplateGuards = methods.filter(method => method.startsWith('ngTemplateGuard_'))
                               .map(method => method.split('_', 2)[1]);
  const hasNgTemplateContextGuard = methods.some(name => name === 'ngTemplateContextGuard');
  return {hasNgTemplateContextGuard, ngTemplateGuards};
}

function nodeStaticMethodNames(node: ts.Declaration, reflector: ReflectionHost): string[] {
  return reflector.getMembersOfClass(node)
      .filter(member => member.kind === ClassMemberKind.Method && member.isStatic)
      .map(member => member.name);
}
