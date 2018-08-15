/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '../aot/static_symbol';
import {CompileTypeMetadata, tokenReference} from '../compile_metadata';
import {CompileReflector} from '../compile_reflector';
import {InjectFlags} from '../core';
import {Identifiers} from '../identifiers';
import * as o from '../output/output_ast';
import {Identifiers as R3} from '../render3/r3_identifiers';
import {OutputContext} from '../util';

import {R3Reference, typeWithParameters} from './util';
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
   * An expression for the function which will be used to inject dependencies. The API of this
   * function could be different, and other options control how it will be invoked.
   */
  injectFn: o.ExternalReference;

  /**
   * Type of the target being created by the factory.
   */
  target: R3FactoryTarget;
}

export enum R3FactoryDelegateType {
  Class,
  Function,
  Factory,
}

export interface R3DelegatedFactoryMetadata extends R3ConstructorFactoryMetadata {
  delegate: o.Expression;
  delegateType: R3FactoryDelegateType.Factory;
}

export interface R3DelegatedFnOrClassMetadata extends R3ConstructorFactoryMetadata {
  delegate: o.Expression;
  delegateType: R3FactoryDelegateType.Class|R3FactoryDelegateType.Function;
  delegateDeps: R3DependencyMetadata[];
}

export interface R3ExpressionFactoryMetadata extends R3ConstructorFactoryMetadata {
  expression: o.Expression;
}

export type R3FactoryMetadata = R3ConstructorFactoryMetadata|R3DelegatedFactoryMetadata|
    R3DelegatedFnOrClassMetadata|R3ExpressionFactoryMetadata;

export enum R3FactoryTarget {
  Directive = 0,
  Component = 1,
  Injectable = 2,
  Pipe = 3,
  NgModule = 4,
}

/**
 * Resolved type of a dependency.
 *
 * Occasionally, dependencies will have special significance which is known statically. In that
 * case the `R3ResolvedDependencyType` informs the factory generator that a particular dependency
 * should be generated specially (usually by calling a special injection function instead of the
 * standard one).
 */
export enum R3ResolvedDependencyType {
  /**
   * A normal token dependency.
   */
  Token = 0,

  /**
   * The dependency is for an attribute.
   *
   * The token expression is a string representing the attribute name.
   */
  Attribute = 1,

  /**
   * Injecting the `ChangeDetectorRef` token. Needs special handling when injected into a pipe.
   */
  ChangeDetectorRef = 2,

  /**
   * An invalid dependency (no token could be determined). An error should be thrown at runtime.
   */
  Invalid = 3,
}

/**
 * Metadata representing a single dependency to be injected into a constructor or function call.
 */
export interface R3DependencyMetadata {
  /**
   * An expression representing the token or value to be injected.
   */
  token: o.Expression;

  /**
   * If an @Attribute decorator is present, this is the literal type of the attribute name, or
   * the unknown type if no literal type is available (e.g. the attribute name is an expression).
   * Will be null otherwise.
   */
  attribute: o.Expression|null;

  /**
   * An enum indicating whether this dependency has special meaning to Angular and needs to be
   * injected specially.
   */
  resolved: R3ResolvedDependencyType;

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

export interface R3FactoryFn {
  factory: o.Expression;
  statements: o.Statement[];
  type: o.ExpressionType;
}

/**
 * Construct a factory function expression for the given `R3FactoryMetadata`.
 */
export function compileFactoryFunction(meta: R3FactoryMetadata): R3FactoryFn {
  const t = o.variable('t');
  const statements: o.Statement[] = [];
  let ctorDepsType: o.Type = o.NONE_TYPE;

  // The type to instantiate via constructor invocation. If there is no delegated factory, meaning
  // this type is always created by constructor invocation, then this is the type-to-create
  // parameter provided by the user (t) if specified, or the current type if not. If there is a
  // delegated factory (which is used to create the current type) then this is only the type-to-
  // create parameter (t).
  const typeForCtor = !isDelegatedMetadata(meta) ?
      new o.BinaryOperatorExpr(o.BinaryOperator.Or, t, meta.internalType) :
      t;

  let ctorExpr: o.Expression|null = null;
  if (meta.deps !== null) {
    // There is a constructor (either explicitly or implicitly defined).
    if (meta.deps !== 'invalid') {
      ctorExpr = new o.InstantiateExpr(
          typeForCtor,
          injectDependencies(meta.deps, meta.injectFn, meta.target === R3FactoryTarget.Pipe));

      ctorDepsType = createCtorDepsType(meta.deps);
    }
  } else {
    const baseFactory = o.variable(`ɵ${meta.name}_BaseFactory`);
    const getInheritedFactory = o.importExpr(R3.getInheritedFactory);
    const baseFactoryStmt =
        baseFactory
            .set(getInheritedFactory.callFn(
                [meta.internalType], /* sourceSpan */ undefined, /* pure */ true))
            .toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Exported, o.StmtModifier.Final]);
    statements.push(baseFactoryStmt);

    // There is no constructor, use the base class' factory to construct typeForCtor.
    ctorExpr = baseFactory.callFn([typeForCtor]);
  }
  const ctorExprFinal = ctorExpr;

  const body: o.Statement[] = [];
  let retExpr: o.Expression|null = null;

  function makeConditionalFactory(nonCtorExpr: o.Expression): o.ReadVarExpr {
    const r = o.variable('r');
    body.push(r.set(o.NULL_EXPR).toDeclStmt());
    let ctorStmt: o.Statement|null = null;
    if (ctorExprFinal !== null) {
      ctorStmt = r.set(ctorExprFinal).toStmt();
    } else {
      ctorStmt = o.importExpr(R3.invalidFactory).callFn([]).toStmt();
    }
    body.push(o.ifStmt(t, [ctorStmt], [r.set(nonCtorExpr).toStmt()]));
    return r;
  }

  if (isDelegatedMetadata(meta) && meta.delegateType === R3FactoryDelegateType.Factory) {
    const delegateFactory = o.variable(`ɵ${meta.name}_BaseFactory`);
    const getFactoryOf = o.importExpr(R3.getFactoryOf);
    if (meta.delegate.isEquivalent(meta.internalType)) {
      throw new Error(`Illegal state: compiling factory that delegates to itself`);
    }
    const delegateFactoryStmt =
        delegateFactory.set(getFactoryOf.callFn([meta.delegate])).toDeclStmt(o.INFERRED_TYPE, [
          o.StmtModifier.Exported, o.StmtModifier.Final
        ]);

    statements.push(delegateFactoryStmt);
    retExpr = makeConditionalFactory(delegateFactory.callFn([]));
  } else if (isDelegatedMetadata(meta)) {
    // This type is created with a delegated factory. If a type parameter is not specified, call
    // the factory instead.
    const delegateArgs =
        injectDependencies(meta.delegateDeps, meta.injectFn, meta.target === R3FactoryTarget.Pipe);
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

  if (retExpr !== null) {
    body.push(new o.ReturnStatement(retExpr));
  } else {
    body.push(o.importExpr(R3.invalidFactory).callFn([]).toStmt());
  }

  return {
    factory: o.fn(
        [new o.FnParam('t', o.DYNAMIC_TYPE)], body, o.INFERRED_TYPE, undefined,
        `${meta.name}_Factory`),
    statements,
    type: o.expressionType(o.importExpr(
        R3.FactoryDef, [typeWithParameters(meta.type.type, meta.typeArgumentCount), ctorDepsType]))
  };
}

function injectDependencies(
    deps: R3DependencyMetadata[], injectFn: o.ExternalReference, isPipe: boolean): o.Expression[] {
  return deps.map((dep, index) => compileInjectDependency(dep, injectFn, isPipe, index));
}

function compileInjectDependency(
    dep: R3DependencyMetadata, injectFn: o.ExternalReference, isPipe: boolean,
    index: number): o.Expression {
  // Interpret the dependency according to its resolved type.
  switch (dep.resolved) {
    case R3ResolvedDependencyType.Token:
    case R3ResolvedDependencyType.ChangeDetectorRef:
      // Build up the injection flags according to the metadata.
      const flags = InjectFlags.Default | (dep.self ? InjectFlags.Self : 0) |
          (dep.skipSelf ? InjectFlags.SkipSelf : 0) | (dep.host ? InjectFlags.Host : 0) |
          (dep.optional ? InjectFlags.Optional : 0);

      // If this dependency is optional or otherwise has non-default flags, then additional
      // parameters describing how to inject the dependency must be passed to the inject function
      // that's being used.
      let flagsParam: o.LiteralExpr|null =
          (flags !== InjectFlags.Default || dep.optional) ? o.literal(flags) : null;

      // We have a separate instruction for injecting ChangeDetectorRef into a pipe.
      if (isPipe && dep.resolved === R3ResolvedDependencyType.ChangeDetectorRef) {
        return o.importExpr(R3.injectPipeChangeDetectorRef).callFn(flagsParam ? [flagsParam] : []);
      }

      // Build up the arguments to the injectFn call.
      const injectArgs = [dep.token];
      if (flagsParam) {
        injectArgs.push(flagsParam);
      }
      return o.importExpr(injectFn).callFn(injectArgs);
    case R3ResolvedDependencyType.Attribute:
      // In the case of attributes, the attribute name in question is given as the token.
      return o.importExpr(R3.injectAttribute).callFn([dep.token]);
    case R3ResolvedDependencyType.Invalid:
      return o.importExpr(R3.invalidFactoryDep).callFn([o.literal(index)]);
    default:
      return unsupported(
          `Unknown R3ResolvedDependencyType: ${R3ResolvedDependencyType[dep.resolved]}`);
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

  if (dep.resolved === R3ResolvedDependencyType.Attribute) {
    if (dep.attribute !== null) {
      entries.push({key: 'attribute', value: dep.attribute, quoted: false});
    }
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

/**
 * A helper function useful for extracting `R3DependencyMetadata` from a Render2
 * `CompileTypeMetadata` instance.
 */
export function dependenciesFromGlobalMetadata(
    type: CompileTypeMetadata, outputCtx: OutputContext,
    reflector: CompileReflector): R3DependencyMetadata[] {
  // Use the `CompileReflector` to look up references to some well-known Angular types. These will
  // be compared with the token to statically determine whether the token has significance to
  // Angular, and set the correct `R3ResolvedDependencyType` as a result.
  const injectorRef = reflector.resolveExternalReference(Identifiers.Injector);

  // Iterate through the type's DI dependencies and produce `R3DependencyMetadata` for each of them.
  const deps: R3DependencyMetadata[] = [];
  for (let dependency of type.diDeps) {
    if (dependency.token) {
      const tokenRef = tokenReference(dependency.token);
      let resolved: R3ResolvedDependencyType = dependency.isAttribute ?
          R3ResolvedDependencyType.Attribute :
          R3ResolvedDependencyType.Token;

      // In the case of most dependencies, the token will be a reference to a type. Sometimes,
      // however, it can be a string, in the case of older Angular code or @Attribute injection.
      const token =
          tokenRef instanceof StaticSymbol ? outputCtx.importExpr(tokenRef) : o.literal(tokenRef);

      // Construct the dependency.
      deps.push({
        token,
        attribute: null,
        resolved,
        host: !!dependency.isHost,
        optional: !!dependency.isOptional,
        self: !!dependency.isSelf,
        skipSelf: !!dependency.isSkipSelf,
      });
    } else {
      unsupported('dependency without a token');
    }
  }

  return deps;
}

function isDelegatedMetadata(meta: R3FactoryMetadata): meta is R3DelegatedFactoryMetadata|
    R3DelegatedFnOrClassMetadata {
  return (meta as any).delegateType !== undefined;
}

function isExpressionFactoryMetadata(meta: R3FactoryMetadata): meta is R3ExpressionFactoryMetadata {
  return (meta as any).expression !== undefined;
}
