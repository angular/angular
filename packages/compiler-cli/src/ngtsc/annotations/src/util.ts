/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, ExternalExpr, R3DependencyMetadata, R3Reference, R3ResolvedDependencyType, WrappedNodeExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {ImportMode, Reference, ReferenceEmitter} from '../../imports';
import {ForeignFunctionResolver} from '../../partial_evaluator';
import {ClassMemberKind, CtorParameter, Decorator, ReflectionHost, TypeValueReference} from '../../reflection';

export enum ConstructorDepErrorKind {
  NO_SUITABLE_TOKEN,
}

export type ConstructorDeps = {
  deps: R3DependencyMetadata[];
} |
{
  deps: null;
  errors: ConstructorDepError[];
};

export interface ConstructorDepError {
  index: number;
  param: CtorParameter;
  kind: ConstructorDepErrorKind;
}

export function getConstructorDependencies(
    clazz: ts.ClassDeclaration, reflector: ReflectionHost, isCore: boolean): ConstructorDeps|null {
  const deps: R3DependencyMetadata[] = [];
  const errors: ConstructorDepError[] = [];
  let ctorParams = reflector.getConstructorParameters(clazz);
  if (ctorParams === null) {
    if (reflector.hasBaseClass(clazz)) {
      return null;
    } else {
      ctorParams = [];
    }
  }
  ctorParams.forEach((param, idx) => {
    let token = valueReferenceToExpression(param.typeValueReference);
    let optional = false, self = false, skipSelf = false, host = false;
    let resolved = R3ResolvedDependencyType.Token;
    (param.decorators || []).filter(dec => isCore || isAngularCore(dec)).forEach(dec => {
      const name = isCore || dec.import === null ? dec.name : dec.import !.name;
      if (name === 'Inject') {
        if (dec.args === null || dec.args.length !== 1) {
          throw new FatalDiagnosticError(
              ErrorCode.DECORATOR_ARITY_WRONG, dec.node,
              `Unexpected number of arguments to @Inject().`);
        }
        token = new WrappedNodeExpr(dec.args[0]);
      } else if (name === 'Optional') {
        optional = true;
      } else if (name === 'SkipSelf') {
        skipSelf = true;
      } else if (name === 'Self') {
        self = true;
      } else if (name === 'Host') {
        host = true;
      } else if (name === 'Attribute') {
        if (dec.args === null || dec.args.length !== 1) {
          throw new FatalDiagnosticError(
              ErrorCode.DECORATOR_ARITY_WRONG, dec.node,
              `Unexpected number of arguments to @Attribute().`);
        }
        token = new WrappedNodeExpr(dec.args[0]);
        resolved = R3ResolvedDependencyType.Attribute;
      } else {
        throw new FatalDiagnosticError(
            ErrorCode.DECORATOR_UNEXPECTED, dec.node, `Unexpected decorator ${name} on parameter.`);
      }
    });
    if (token === null) {
      errors.push({
        index: idx,
        kind: ConstructorDepErrorKind.NO_SUITABLE_TOKEN, param,
      });
    } else {
      deps.push({token, optional, self, skipSelf, host, resolved});
    }
  });
  if (errors.length === 0) {
    return {deps};
  } else {
    return {deps: null, errors};
  }
}

/**
 * Convert a `TypeValueReference` to an `Expression` which refers to the type as a value.
 *
 * Local references are converted to a `WrappedNodeExpr` of the TypeScript expression, and non-local
 * references are converted to an `ExternalExpr`. Note that this is only valid in the context of the
 * file in which the `TypeValueReference` originated.
 */
export function valueReferenceToExpression(valueRef: TypeValueReference): Expression;
export function valueReferenceToExpression(valueRef: null): null;
export function valueReferenceToExpression(valueRef: TypeValueReference | null): Expression|null;
export function valueReferenceToExpression(valueRef: TypeValueReference | null): Expression|null {
  if (valueRef === null) {
    return null;
  } else if (valueRef.local) {
    return new WrappedNodeExpr(valueRef.expression);
  } else {
    // TODO(alxhub): this cast is necessary because the g3 typescript version doesn't narrow here.
    return new ExternalExpr(valueRef as{moduleName: string, name: string});
  }
}

export function getValidConstructorDependencies(
    clazz: ts.ClassDeclaration, reflector: ReflectionHost, isCore: boolean): R3DependencyMetadata[]|
    null {
  return validateConstructorDependencies(
      clazz, getConstructorDependencies(clazz, reflector, isCore));
}

export function validateConstructorDependencies(
    clazz: ts.ClassDeclaration, deps: ConstructorDeps | null): R3DependencyMetadata[]|null {
  if (deps === null) {
    return null;
  } else if (deps.deps !== null) {
    return deps.deps;
  } else {
    // TODO(alxhub): this cast is necessary because the g3 typescript version doesn't narrow here.
    const {param, index} = (deps as{errors: ConstructorDepError[]}).errors[0];
    // There is at least one error.
    throw new FatalDiagnosticError(
        ErrorCode.PARAM_MISSING_TOKEN, param.nameNode,
        `No suitable injection token for parameter '${param.name || index}' of class '${clazz.name!.text}'. Found: ${param.typeNode!.getText()}`);
  }
}

export function toR3Reference(
    valueRef: Reference, typeRef: Reference, valueContext: ts.SourceFile,
    typeContext: ts.SourceFile, refEmitter: ReferenceEmitter): R3Reference {
  const value = refEmitter.emit(valueRef, valueContext, ImportMode.UseExistingImport);
  const type = refEmitter.emit(typeRef, typeContext, ImportMode.ForceNewImport);
  if (value === null || type === null) {
    throw new Error(`Could not refer to ${ts.SyntaxKind[valueRef.node.kind]}`);
  }
  return {value, type};
}

export function isAngularCore(decorator: Decorator): boolean {
  return decorator.import !== null && decorator.import.from === '@angular/core';
}

export function isAngularCoreReference(reference: Reference, symbolName: string) {
  return reference.ownedByModuleGuess === '@angular/core' && reference.debugName === symbolName;
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
  if (!isAngularCoreReference(ref, 'forwardRef') || args.length !== 1) {
    return null;
  }
  return expandForwardRef(args[0]);
}

/**
 * Combines an array of resolver functions into a one.
 * @param resolvers Resolvers to be combined.
 */
export function combineResolvers(resolvers: ForeignFunctionResolver[]): ForeignFunctionResolver {
  return (ref: Reference<ts.FunctionDeclaration|ts.MethodDeclaration>,
          args: ts.Expression[]): ts.Expression |
      null => {
    for (const resolver of resolvers) {
      const resolved = resolver(ref, args);
      if (resolved !== null) {
        return resolved;
      }
    }
    return null;
  };
}
