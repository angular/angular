/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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

import {MEANING_SEPARATOR, unsupported} from './view/util';


/**
 * Metadata required by the factory generator to generate a `factory` function for a type.
 */
export interface R3ConstructorFactoryMetadata {
  /**
   * String name of the type being generated (used to name the factory function).
   */
  name: string;

  /**
   * An expression representing the function (or constructor) which will instantiate the requested
   * type.
   *
   * This could be a reference to a constructor type, or to a user-defined factory function. The
   * `useNew` property determines whether it will be called as a constructor or not.
   */
  type: o.Expression;

  /**
   * Regardless of whether `fnOrClass` is a constructor function or a user-defined factory, it
   * may have 0 or more parameters, which will be injected according to the `R3DependencyMetadata`
   * for those parameters. If this is `null`, then the type's constructor is nonexistent and will
   * be inherited from `fnOrClass` which is interpreted as the current type.
   */
  deps: R3DependencyMetadata[]|null;

  /**
   * An expression for the function which will be used to inject dependencies. The API of this
   * function could be different, and other options control how it will be invoked.
   */
  injectFn: o.ExternalReference;
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

export type R3FactoryMetadata = R3ConstructorFactoryMetadata | R3DelegatedFactoryMetadata |
    R3DelegatedFnOrClassMetadata | R3ExpressionFactoryMetadata;

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
   * The dependency is for the `Injector` type itself.
   */
  Injector = 2,

  /**
   * The dependency is for `Renderer2`.
   */
  Renderer2 = 3,
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

/**
 * Construct a factory function expression for the given `R3FactoryMetadata`.
 */
export function compileFactoryFunction(meta: R3FactoryMetadata):
    {factory: o.Expression, statements: o.Statement[]} {
  const t = o.variable('t');
  const statements: o.Statement[] = [];

  // The type to instantiate via constructor invocation. If there is no delegated factory, meaning
  // this type is always created by constructor invocation, then this is the type-to-create
  // parameter provided by the user (t) if specified, or the current type if not. If there is a
  // delegated factory (which is used to create the current type) then this is only the type-to-
  // create parameter (t).
  const typeForCtor =
      !isDelegatedMetadata(meta) ? new o.BinaryOperatorExpr(o.BinaryOperator.Or, t, meta.type) : t;

  let ctorExpr: o.Expression|null = null;
  if (meta.deps !== null) {
    // There is a constructor (either explicitly or implicitly defined).
    ctorExpr = new o.InstantiateExpr(typeForCtor, injectDependencies(meta.deps, meta.injectFn));
  } else {
    const baseFactory = o.variable(`ɵ${meta.name}_BaseFactory`);
    const getInheritedFactory = o.importExpr(R3.getInheritedFactory);
    const baseFactoryStmt =
        baseFactory.set(getInheritedFactory.callFn([meta.type])).toDeclStmt(o.INFERRED_TYPE, [
          o.StmtModifier.Exported, o.StmtModifier.Final
        ]);
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
    body.push(o.ifStmt(t, [r.set(ctorExprFinal).toStmt()], [r.set(nonCtorExpr).toStmt()]));
    return r;
  }

  if (isDelegatedMetadata(meta) && meta.delegateType === R3FactoryDelegateType.Factory) {
    const delegateFactory = o.variable(`ɵ${meta.name}_BaseFactory`);
    const getFactoryOf = o.importExpr(R3.getFactoryOf);
    if (meta.delegate.isEquivalent(meta.type)) {
      throw new Error(`Illegal state: compiling factory that delegates to itself`);
    }
    const delegateFactoryStmt =
        delegateFactory.set(getFactoryOf.callFn([meta.delegate])).toDeclStmt(o.INFERRED_TYPE, [
          o.StmtModifier.Exported, o.StmtModifier.Final
        ]);

    statements.push(delegateFactoryStmt);
    const r = makeConditionalFactory(delegateFactory.callFn([]));
    retExpr = r;
  } else if (isDelegatedMetadata(meta)) {
    // This type is created with a delegated factory. If a type parameter is not specified, call
    // the factory instead.
    const delegateArgs = injectDependencies(meta.delegateDeps, meta.injectFn);
    // Either call `new delegate(...)` or `delegate(...)` depending on meta.useNewForDelegate.
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

  return {
    factory: o.fn(
        [new o.FnParam('t', o.DYNAMIC_TYPE)], [...body, new o.ReturnStatement(retExpr)],
        o.INFERRED_TYPE, undefined, `${meta.name}_Factory`),
    statements,
  };
}

function injectDependencies(
    deps: R3DependencyMetadata[], injectFn: o.ExternalReference): o.Expression[] {
  return deps.map(dep => compileInjectDependency(dep, injectFn));
}

function compileInjectDependency(
    dep: R3DependencyMetadata, injectFn: o.ExternalReference): o.Expression {
  // Interpret the dependency according to its resolved type.
  switch (dep.resolved) {
    case R3ResolvedDependencyType.Token:
    case R3ResolvedDependencyType.Injector: {
      // Build up the injection flags according to the metadata.
      const flags = InjectFlags.Default | (dep.self ? InjectFlags.Self : 0) |
          (dep.skipSelf ? InjectFlags.SkipSelf : 0) | (dep.host ? InjectFlags.Host : 0) |
          (dep.optional ? InjectFlags.Optional : 0);
      // Determine the token used for injection. In almost all cases this is the given token, but
      // if the dependency is resolved to the `Injector` then the special `INJECTOR` token is used
      // instead.
      let token: o.Expression = dep.token;
      if (dep.resolved === R3ResolvedDependencyType.Injector) {
        token = o.importExpr(Identifiers.INJECTOR);
      }

      // Build up the arguments to the injectFn call.
      const injectArgs = [token];
      // If this dependency is optional or otherwise has non-default flags, then additional
      // parameters describing how to inject the dependency must be passed to the inject function
      // that's being used.
      if (flags !== InjectFlags.Default || dep.optional) {
        injectArgs.push(o.literal(flags));
      }
      return o.importExpr(injectFn).callFn(injectArgs);
    }
    case R3ResolvedDependencyType.Attribute:
      // In the case of attributes, the attribute name in question is given as the token.
      return o.importExpr(R3.injectAttribute).callFn([dep.token]);
    case R3ResolvedDependencyType.Renderer2:
      return o.importExpr(R3.injectRenderer2).callFn([]);
    default:
      return unsupported(
          `Unknown R3ResolvedDependencyType: ${R3ResolvedDependencyType[dep.resolved]}`);
  }
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
  const elementRef = reflector.resolveExternalReference(Identifiers.ElementRef);
  const templateRef = reflector.resolveExternalReference(Identifiers.TemplateRef);
  const viewContainerRef = reflector.resolveExternalReference(Identifiers.ViewContainerRef);
  const injectorRef = reflector.resolveExternalReference(Identifiers.Injector);
  const renderer2 = reflector.resolveExternalReference(Identifiers.Renderer2);

  // Iterate through the type's DI dependencies and produce `R3DependencyMetadata` for each of them.
  const deps: R3DependencyMetadata[] = [];
  for (let dependency of type.diDeps) {
    if (dependency.token) {
      const tokenRef = tokenReference(dependency.token);
      let resolved: R3ResolvedDependencyType = R3ResolvedDependencyType.Token;
      if (tokenRef === injectorRef) {
        resolved = R3ResolvedDependencyType.Injector;
      } else if (tokenRef === renderer2) {
        resolved = R3ResolvedDependencyType.Renderer2;
      } else if (dependency.isAttribute) {
        resolved = R3ResolvedDependencyType.Attribute;
      }

      // In the case of most dependencies, the token will be a reference to a type. Sometimes,
      // however, it can be a string, in the case of older Angular code or @Attribute injection.
      const token =
          tokenRef instanceof StaticSymbol ? outputCtx.importExpr(tokenRef) : o.literal(tokenRef);

      // Construct the dependency.
      deps.push({
        token,
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
