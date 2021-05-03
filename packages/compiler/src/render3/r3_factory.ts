/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '../aot/static_symbol';
import {CompileTypeMetadata, tokenReference} from '../compile_metadata';
import {InjectFlags} from '../core';
import * as o from '../output/output_ast';
import {Identifiers as R3} from '../render3/r3_identifiers';
import {OutputContext} from '../util';

import {R3CompiledExpression, R3Reference, typeWithParameters} from './util';
import {unsupported} from './view/util';



/**
 * Metadata required by the factory generator to generate a `factory` function for a type.
 */
export interface R3ConstructorFactoryMetadata {
  /**
   * String name of the type being generated (used to name the factory function).
   */
  name: string;

  /**
   * An expression representing the interface type being constructed.
   */
  type: R3Reference;

  /**
   * An expression representing the constructor type, intended for use within a class definition
   * itself.
   *
   * This can differ from the outer `type` if the class is being compiled by ngcc and is inside
   * an IIFE structure that uses a different name internally.
   */
  internalType: o.Expression;

  /** Number of arguments for the `type`. */
  typeArgumentCount: number;

  /**
   * Regardless of whether `fnOrClass` is a constructor function or a user-defined factory, it
   * may have 0 or more parameters, which will be injected according to the `R3DependencyMetadata`
   * for those parameters. If this is `null`, then the type's constructor is nonexistent and will
   * be inherited from `fnOrClass` which is interpreted as the current type. If this is `'invalid'`,
   * then one or more of the parameters wasn't resolvable and any attempt to use these deps will
   * result in a runtime error.
   */
  deps: R3DependencyMetadata[]|'invalid'|null;

  /**
   * Type of the target being created by the factory.
   */
  target: FactoryTarget;
}

export enum R3FactoryDelegateType {
  Class = 0,
  Function = 1,
}

export interface R3DelegatedFnOrClassMetadata extends R3ConstructorFactoryMetadata {
  delegate: o.Expression;
  delegateType: R3FactoryDelegateType;
  delegateDeps: R3DependencyMetadata[];
}

export interface R3ExpressionFactoryMetadata extends R3ConstructorFactoryMetadata {
  expression: o.Expression;
}

export type R3FactoryMetadata =
    R3ConstructorFactoryMetadata|R3DelegatedFnOrClassMetadata|R3ExpressionFactoryMetadata;

export enum FactoryTarget {
  Directive = 0,
  Component = 1,
  Injectable = 2,
  Pipe = 3,
  NgModule = 4,
}

export interface R3DependencyMetadata {
  /**
   * An expression representing the token or value to be injected.
   * Or `null` if the dependency could not be resolved - making it invalid.
   */
  token: o.Expression|null;

  /**
   * If an @Attribute decorator is present, this is the literal type of the attribute name, or
   * the unknown type if no literal type is available (e.g. the attribute name is an expression).
   * Otherwise it is null;
   */
  attributeNameType: o.Expression|null;

  /**
   * Whether the dependency has an @Host qualifier.
   */
  host: boolean;

  /**
   * Whether the dependency has an @Optional qualifier.
   */
  optional: boolean;

  /**
   * Whether the dependency has an @Self qualifier.
   */
  self: boolean;

  /**
   * Whether the dependency has an @SkipSelf qualifier.
   */
  skipSelf: boolean;
}

/**
 * Construct a factory function expression for the given `R3FactoryMetadata`.
 */
export function compileFactoryFunction(meta: R3FactoryMetadata): R3CompiledExpression {
  const t = o.variable('t');
  let baseFactoryVar: o.ReadVarExpr|null = null;

  // The type to instantiate via constructor invocation. If there is no delegated factory, meaning
  // this type is always created by constructor invocation, then this is the type-to-create
  // parameter provided by the user (t) if specified, or the current type if not. If there is a
  // delegated factory (which is used to create the current type) then this is only the type-to-
  // create parameter (t).
  const typeForCtor = !isDelegatedFactoryMetadata(meta) ?
      new o.BinaryOperatorExpr(o.BinaryOperator.Or, t, meta.internalType) :
      t;

  let ctorExpr: o.Expression|null = null;
  if (meta.deps !== null) {
    // There is a constructor (either explicitly or implicitly defined).
    if (meta.deps !== 'invalid') {
      ctorExpr = new o.InstantiateExpr(typeForCtor, injectDependencies(meta.deps, meta.target));
    }
  } else {
    // There is no constructor, use the base class' factory to construct typeForCtor.
    baseFactoryVar = o.variable(`ɵ${meta.name}_BaseFactory`);
    ctorExpr = baseFactoryVar.callFn([typeForCtor]);
  }

  const body: o.Statement[] = [];
  let retExpr: o.Expression|null = null;

  function makeConditionalFactory(nonCtorExpr: o.Expression): o.ReadVarExpr {
    const r = o.variable('r');
    body.push(r.set(o.NULL_EXPR).toDeclStmt());
    const ctorStmt = ctorExpr !== null ? r.set(ctorExpr).toStmt() :
                                         o.importExpr(R3.invalidFactory).callFn([]).toStmt();
    body.push(o.ifStmt(t, [ctorStmt], [r.set(nonCtorExpr).toStmt()]));
    return r;
  }

  if (isDelegatedFactoryMetadata(meta)) {
    // This type is created with a delegated factory. If a type parameter is not specified, call
    // the factory instead.
    const delegateArgs = injectDependencies(meta.delegateDeps, meta.target);
    // Either call `new delegate(...)` or `delegate(...)` depending on meta.delegateType.
    const factoryExpr = new (
        meta.delegateType === R3FactoryDelegateType.Class ?
            o.InstantiateExpr :
            o.InvokeFunctionExpr)(meta.delegate, delegateArgs);
    retExpr = makeConditionalFactory(factoryExpr);
  } else if (isExpressionFactoryMetadata(meta)) {
    // TODO(alxhub): decide whether to lower the value here or in the caller
    retExpr = makeConditionalFactory(meta.expression);
  } else {
    retExpr = ctorExpr;
  }


  if (retExpr === null) {
    // The expression cannot be formed so render an `ɵɵinvalidFactory()` call.
    body.push(o.importExpr(R3.invalidFactory).callFn([]).toStmt());
  } else if (baseFactoryVar !== null) {
    // This factory uses a base factory, so call `ɵɵgetInheritedFactory()` to compute it.
    const getInheritedFactoryCall =
        o.importExpr(R3.getInheritedFactory).callFn([meta.internalType]);
    // Memoize the base factoryFn: `baseFactory || (baseFactory = ɵɵgetInheritedFactory(...))`
    const baseFactory = new o.BinaryOperatorExpr(
        o.BinaryOperator.Or, baseFactoryVar, baseFactoryVar.set(getInheritedFactoryCall));
    body.push(new o.ReturnStatement(baseFactory.callFn([typeForCtor])));
  } else {
    // This is straightforward factory, just return it.
    body.push(new o.ReturnStatement(retExpr));
  }

  let factoryFn: o.Expression = o.fn(
      [new o.FnParam('t', o.DYNAMIC_TYPE)], body, o.INFERRED_TYPE, undefined,
      `${meta.name}_Factory`);

  if (baseFactoryVar !== null) {
    // There is a base factory variable so wrap its declaration along with the factory function into
    // an IIFE.
    factoryFn = o.fn([], [
                   new o.DeclareVarStmt(baseFactoryVar.name!), new o.ReturnStatement(factoryFn)
                 ]).callFn([], /* sourceSpan */ undefined, /* pure */ true);
  }

  return {
    expression: factoryFn,
    statements: [],
    type: createFactoryType(meta),
  };
}

export function createFactoryType(meta: R3FactoryMetadata) {
  const ctorDepsType =
      meta.deps !== null && meta.deps !== 'invalid' ? createCtorDepsType(meta.deps) : o.NONE_TYPE;
  return o.expressionType(o.importExpr(
      R3.FactoryDeclaration,
      [typeWithParameters(meta.type.type, meta.typeArgumentCount), ctorDepsType]));
}

function injectDependencies(deps: R3DependencyMetadata[], target: FactoryTarget): o.Expression[] {
  return deps.map((dep, index) => compileInjectDependency(dep, target, index));
}

function compileInjectDependency(
    dep: R3DependencyMetadata, target: FactoryTarget, index: number): o.Expression {
  // Interpret the dependency according to its resolved type.
  if (dep.token === null) {
    return o.importExpr(R3.invalidFactoryDep).callFn([o.literal(index)]);
  } else if (dep.attributeNameType === null) {
    // Build up the injection flags according to the metadata.
    const flags = InjectFlags.Default | (dep.self ? InjectFlags.Self : 0) |
        (dep.skipSelf ? InjectFlags.SkipSelf : 0) | (dep.host ? InjectFlags.Host : 0) |
        (dep.optional ? InjectFlags.Optional : 0) |
        (target === FactoryTarget.Pipe ? InjectFlags.ForPipe : 0);

    // If this dependency is optional or otherwise has non-default flags, then additional
    // parameters describing how to inject the dependency must be passed to the inject function
    // that's being used.
    let flagsParam: o.LiteralExpr|null =
        (flags !== InjectFlags.Default || dep.optional) ? o.literal(flags) : null;

    // Build up the arguments to the injectFn call.
    const injectArgs = [dep.token];
    if (flagsParam) {
      injectArgs.push(flagsParam);
    }
    const injectFn = getInjectFn(target);
    return o.importExpr(injectFn).callFn(injectArgs);
  } else {
    // The `dep.attributeTypeName` value is defined, which indicates that this is an `@Attribute()`
    // type dependency. For the generated JS we still want to use the `dep.token` value in case the
    // name given for the attribute is not a string literal. For example given `@Attribute(foo())`,
    // we want to generate `ɵɵinjectAttribute(foo())`.
    //
    // The `dep.attributeTypeName` is only actually used (in `createCtorDepType()`) to generate
    // typings.
    return o.importExpr(R3.injectAttribute).callFn([dep.token]);
  }
}

function createCtorDepsType(deps: R3DependencyMetadata[]): o.Type {
  let hasTypes = false;
  const attributeTypes = deps.map(dep => {
    const type = createCtorDepType(dep);
    if (type !== null) {
      hasTypes = true;
      return type;
    } else {
      return o.literal(null);
    }
  });

  if (hasTypes) {
    return o.expressionType(o.literalArr(attributeTypes));
  } else {
    return o.NONE_TYPE;
  }
}

function createCtorDepType(dep: R3DependencyMetadata): o.LiteralMapExpr|null {
  const entries: {key: string, quoted: boolean, value: o.Expression}[] = [];

  if (dep.attributeNameType !== null) {
    entries.push({key: 'attribute', value: dep.attributeNameType, quoted: false});
  }
  if (dep.optional) {
    entries.push({key: 'optional', value: o.literal(true), quoted: false});
  }
  if (dep.host) {
    entries.push({key: 'host', value: o.literal(true), quoted: false});
  }
  if (dep.self) {
    entries.push({key: 'self', value: o.literal(true), quoted: false});
  }
  if (dep.skipSelf) {
    entries.push({key: 'skipSelf', value: o.literal(true), quoted: false});
  }

  return entries.length > 0 ? o.literalMap(entries) : null;
}

export function isDelegatedFactoryMetadata(meta: R3FactoryMetadata):
    meta is R3DelegatedFnOrClassMetadata {
  return (meta as any).delegateType !== undefined;
}

export function isExpressionFactoryMetadata(meta: R3FactoryMetadata):
    meta is R3ExpressionFactoryMetadata {
  return (meta as any).expression !== undefined;
}

function getInjectFn(target: FactoryTarget): o.ExternalReference {
  switch (target) {
    case FactoryTarget.Component:
    case FactoryTarget.Directive:
    case FactoryTarget.Pipe:
      return R3.directiveInject;
    case FactoryTarget.NgModule:
    case FactoryTarget.Injectable:
    default:
      return R3.inject;
  }
}
