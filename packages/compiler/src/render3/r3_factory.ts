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

export interface R3FactoryMetadata {
  name: string;
  fnOrClass: o.Expression;
  deps: R3DependencyMetadata[];

  useNew: boolean;
  useOptionalParam: boolean;
  injectFn: o.ExternalReference;

  extraResults?: o.Expression[];
}

export enum R3ResolvedDependency {
  Token = 0,
  Attribute = 1,
  Injector = 2,
  ElementRef = 3,
  TemplateRef = 4,
  ViewContainerRef = 5,
}

export interface R3DependencyMetadata {
  token: o.Expression;
  resolved: R3ResolvedDependency;
  host: boolean;
  optional: boolean;
  self: boolean;
  skipSelf: boolean;
}

export function compileFactoryFunction(meta: R3FactoryMetadata): o.Expression {
  const args = meta.deps.map(dep => injectDep(dep, meta.injectFn, meta.useOptionalParam));
  const expr = meta.useNew ? new o.InstantiateExpr(meta.fnOrClass, args) :
                             new o.InvokeFunctionExpr(meta.fnOrClass, args);
  const retExpr =
      meta.extraResults === undefined ? expr : o.literalArr([expr, ...meta.extraResults]);
  return o.fn(
      [], [new o.ReturnStatement(retExpr)], o.INFERRED_TYPE, undefined, `${meta.name}_Factory`);
}

function injectDep(
    dep: R3DependencyMetadata, inject: o.ExternalReference,
    useOptionalParam: boolean): o.Expression {
  switch (dep.resolved) {
    case R3ResolvedDependency.Token:
    case R3ResolvedDependency.Injector: {
      const flags = InjectFlags.Default | (dep.self ? InjectFlags.Self : 0) |
          (dep.skipSelf ? InjectFlags.SkipSelf : 0) | (dep.host ? InjectFlags.Host : 0) |
          (dep.optional ? InjectFlags.Optional : 0);
      let token: o.Expression = dep.token;
      if (dep.resolved === R3ResolvedDependency.Injector) {
        token = o.importExpr(Identifiers.INJECTOR);
      }
      const injectArgs = [dep.token];
      // If this dependency is optional or otherwise has non-default flags, then additional
      // parameters describing how to inject the dependency must be passed to the inject function
      // that's being used.
      if (flags !== InjectFlags.Default || dep.optional) {
        // Either the dependency is optional, or non-default flags are in use. Either of these cases
        // necessitates adding an argument for the default value if such an argument is required
        // by the inject function (useOptionalParam === true).
        if (useOptionalParam) {
          // The inject function requires a default value parameter.
          injectArgs.push(dep.optional ? o.NULL_EXPR : o.literal(undefined));
        }
        // The last parameter is always the InjectFlags, which only need to be specified if they're
        // non-default.
        if (flags !== InjectFlags.Default) {
          injectArgs.push(o.literal(flags));
        }
      }
      return o.importExpr(inject).callFn(injectArgs);
    }
    case R3ResolvedDependency.Attribute:
      return o.importExpr(R3.injectAttribute).callFn([dep.token]);
    case R3ResolvedDependency.ElementRef:
      return o.importExpr(R3.injectElementRef).callFn([]);
    case R3ResolvedDependency.TemplateRef:
      return o.importExpr(R3.injectTemplateRef).callFn([]);
    case R3ResolvedDependency.ViewContainerRef:
      return o.importExpr(R3.injectViewContainerRef).callFn([]);
    default:
      return unsupported(`Unknown R3ResolvedDependency: ${R3ResolvedDependency[dep.resolved]}`);
  }
}

export function dependenciesFromGlobalMetadata(
    type: CompileTypeMetadata, outputCtx: OutputContext,
    reflector: CompileReflector): R3DependencyMetadata[] {
  const deps: R3DependencyMetadata[] = [];
  const elementRef = reflector.resolveExternalReference(Identifiers.ElementRef);
  const templateRef = reflector.resolveExternalReference(Identifiers.TemplateRef);
  const viewContainerRef = reflector.resolveExternalReference(Identifiers.ViewContainerRef);
  const injectorRef = reflector.resolveExternalReference(Identifiers.Injector);
  for (let dependency of type.diDeps) {
    if (dependency.token) {
      const tokenRef = tokenReference(dependency.token);
      let resolved: R3ResolvedDependency = R3ResolvedDependency.Token;
      if (tokenRef === elementRef) {
        resolved = R3ResolvedDependency.ElementRef;
      } else if (tokenRef === templateRef) {
        resolved = R3ResolvedDependency.TemplateRef;
      } else if (tokenRef === viewContainerRef) {
        resolved = R3ResolvedDependency.ViewContainerRef;
      } else if (tokenRef === injectorRef) {
        resolved = R3ResolvedDependency.Injector;
      } else if (dependency.isAttribute) {
        resolved = R3ResolvedDependency.Attribute;
      }

      const token =
          tokenRef instanceof StaticSymbol ? outputCtx.importExpr(tokenRef) : o.literal(tokenRef);

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
