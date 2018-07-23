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

import {unsupported} from './view/util';

/**
 * Metadata required by the factory generator to generate a `factory` function for a type.
 */
export interface R3FactoryMetadata {
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
  fnOrClass: o.Expression;

  /**
   * Regardless of whether `fnOrClass` is a constructor function or a user-defined factory, it
   * may have 0 or more parameters, which will be injected according to the `R3DependencyMetadata`
   * for those parameters.
   */
  deps: R3DependencyMetadata[];

  /**
   * Whether to interpret `fnOrClass` as a constructor function (`useNew: true`) or as a factory
   * (`useNew: false`).
   */
  useNew: boolean;


  /**
   * An expression for the function which will be used to inject dependencies. The API of this
   * function could be different, and other options control how it will be invoked.
   */
  injectFn: o.ExternalReference;
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
   * The dependency is for the `Injector` type itself.
   */
  Injector = 2,

  /**
   * The dependency is for `ElementRef`.
   */
  ElementRef = 3,

  /**
   * The dependency is for `TemplateRef`.
   */
  TemplateRef = 4,

  /**
   * The dependency is for `ViewContainerRef`.
   */
  ViewContainerRef = 5,

  /**
   * The dependency is for `ChangeDetectorRef`.
   */
  ChangeDetectorRef = 6,
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
export function compileFactoryFunction(meta: R3FactoryMetadata): o.Expression {
  // Each dependency becomes an invocation of an inject*() function.
  const args = meta.deps.map(dep => compileInjectDependency(dep, meta.injectFn));

  // The overall result depends on whether this is construction or function invocation.
  const expr = meta.useNew ? new o.InstantiateExpr(meta.fnOrClass, args) :
                             new o.InvokeFunctionExpr(meta.fnOrClass, args);

  return o.fn(
      [], [new o.ReturnStatement(expr)], o.INFERRED_TYPE, undefined, `${meta.name}_Factory`);
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
    case R3ResolvedDependencyType.ElementRef:
      return o.importExpr(R3.injectElementRef).callFn([]);
    case R3ResolvedDependencyType.TemplateRef:
      return o.importExpr(R3.injectTemplateRef).callFn([]);
    case R3ResolvedDependencyType.ViewContainerRef:
      return o.importExpr(R3.injectViewContainerRef).callFn([]);
    case R3ResolvedDependencyType.ChangeDetectorRef:
      return o.importExpr(R3.injectChangeDetectorRef).callFn([]);
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

  // Iterate through the type's DI dependencies and produce `R3DependencyMetadata` for each of them.
  const deps: R3DependencyMetadata[] = [];
  for (let dependency of type.diDeps) {
    if (dependency.token) {
      const tokenRef = tokenReference(dependency.token);
      let resolved: R3ResolvedDependencyType = R3ResolvedDependencyType.Token;
      if (tokenRef === elementRef) {
        resolved = R3ResolvedDependencyType.ElementRef;
      } else if (tokenRef === templateRef) {
        resolved = R3ResolvedDependencyType.TemplateRef;
      } else if (tokenRef === viewContainerRef) {
        resolved = R3ResolvedDependencyType.ViewContainerRef;
      } else if (tokenRef === injectorRef) {
        resolved = R3ResolvedDependencyType.Injector;
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
