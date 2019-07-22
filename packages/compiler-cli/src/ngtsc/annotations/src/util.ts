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
import {DefaultImportRecorder, ImportMode, Reference, ReferenceEmitter} from '../../imports';
import {ForeignFunctionResolver, PartialEvaluator} from '../../partial_evaluator';
import {ClassDeclaration, CtorParameter, Decorator, Import, ReflectionHost, TypeValueReference, isNamedClassDeclaration} from '../../reflection';

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
    clazz: ClassDeclaration, reflector: ReflectionHost,
    defaultImportRecorder: DefaultImportRecorder, isCore: boolean): ConstructorDeps|null {
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
    let token = valueReferenceToExpression(param.typeValueReference, defaultImportRecorder);
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

    if (token instanceof ExternalExpr && token.value.name === 'ChangeDetectorRef' &&
        token.value.moduleName === '@angular/core') {
      resolved = R3ResolvedDependencyType.ChangeDetectorRef;
    }
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
export function valueReferenceToExpression(
    valueRef: TypeValueReference, defaultImportRecorder: DefaultImportRecorder): Expression;
export function valueReferenceToExpression(
    valueRef: null, defaultImportRecorder: DefaultImportRecorder): null;
export function valueReferenceToExpression(
    valueRef: TypeValueReference | null, defaultImportRecorder: DefaultImportRecorder): Expression|
    null;
export function valueReferenceToExpression(
    valueRef: TypeValueReference | null, defaultImportRecorder: DefaultImportRecorder): Expression|
    null {
  if (valueRef === null) {
    return null;
  } else if (valueRef.local) {
    if (defaultImportRecorder !== null && valueRef.defaultImportStatement !== null &&
        ts.isIdentifier(valueRef.expression)) {
      defaultImportRecorder.recordImportedIdentifier(
          valueRef.expression, valueRef.defaultImportStatement);
    }
    return new WrappedNodeExpr(valueRef.expression);
  } else {
    // TODO(alxhub): this cast is necessary because the g3 typescript version doesn't narrow here.
    return new ExternalExpr(valueRef as{moduleName: string, name: string});
  }
}

export function getValidConstructorDependencies(
    clazz: ClassDeclaration, reflector: ReflectionHost,
    defaultImportRecorder: DefaultImportRecorder, isCore: boolean): R3DependencyMetadata[]|null {
  return validateConstructorDependencies(
      clazz, getConstructorDependencies(clazz, reflector, defaultImportRecorder, isCore));
}

export function validateConstructorDependencies(
    clazz: ClassDeclaration, deps: ConstructorDeps | null): R3DependencyMetadata[]|null {
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
        `No suitable injection token for parameter '${param.name || index}' of class '${clazz.name.text}'.\n` +
            (param.typeNode !== null ? `Found ${param.typeNode.getText()}` :
                                       'no type or decorator'));
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

export function isAngularCore(decorator: Decorator): decorator is Decorator&{import: Import} {
  return decorator.import !== null && decorator.import.from === '@angular/core';
}

export function isAngularCoreReference(reference: Reference, symbolName: string): boolean {
  return reference.ownedByModuleGuess === '@angular/core' && reference.debugName === symbolName;
}

export function findAngularDecorator(
    decorators: Decorator[], name: string, isCore: boolean): Decorator|undefined {
  return decorators.find(decorator => isAngularDecorator(decorator, name, isCore));
}

export function isAngularDecorator(decorator: Decorator, name: string, isCore: boolean): boolean {
  if (isCore) {
    return decorator.name === name;
  } else if (isAngularCore(decorator)) {
    return decorator.import.name === name;
  }
  return false;
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
  arg = unwrapExpression(arg);
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
  node = unwrapExpression(node);
  if (!ts.isCallExpression(node) || node.arguments.length !== 1) {
    return node;
  }

  const fn =
      ts.isPropertyAccessExpression(node.expression) ? node.expression.name : node.expression;
  if (!ts.isIdentifier(fn)) {
    return node;
  }

  const expr = expandForwardRef(node.arguments[0]);
  if (expr === null) {
    return node;
  }
  const imp = reflector.getImportOfIdentifier(fn);
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
    ref: Reference<ts.FunctionDeclaration|ts.MethodDeclaration|ts.FunctionExpression>,
    args: ReadonlyArray<ts.Expression>): ts.Expression|null {
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
  return (ref: Reference<ts.FunctionDeclaration|ts.MethodDeclaration|ts.FunctionExpression>,
          args: ReadonlyArray<ts.Expression>): ts.Expression |
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

export function isExpressionForwardReference(
    expr: Expression, context: ts.Node, contextSource: ts.SourceFile): boolean {
  if (isWrappedTsNodeExpr(expr)) {
    const node = ts.getOriginalNode(expr.node);
    return node.getSourceFile() === contextSource && context.pos < node.pos;
  } else {
    return false;
  }
}

export function isWrappedTsNodeExpr(expr: Expression): expr is WrappedNodeExpr<ts.Node> {
  return expr instanceof WrappedNodeExpr;
}

export function readBaseClass(
    node: ClassDeclaration, reflector: ReflectionHost,
    evaluator: PartialEvaluator): Reference<ClassDeclaration>|'dynamic'|null {
  if (!isNamedClassDeclaration(node)) {
    // If the node isn't a ts.ClassDeclaration, consider any base class to be dynamic for now.
    return reflector.hasBaseClass(node) ? 'dynamic' : null;
  }

  const baseExpression = reflector.getBaseClassExpression(node);
  if (baseExpression !== null) {
    const baseClass = evaluator.evaluate(baseExpression);
    if (baseClass instanceof Reference && isNamedClassDeclaration(baseClass.node)) {
      return baseClass as Reference<ClassDeclaration>;
    } else {
      return 'dynamic';
    }
  }

  return null;
}
