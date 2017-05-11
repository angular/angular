/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵDepFlags as DepFlags, ɵLifecycleHooks as LifecycleHooks, ɵNodeFlags as NodeFlags} from '@angular/core';

import {CompileDiDependencyMetadata, CompileEntryComponentMetadata, CompileProviderMetadata, CompileTokenMetadata} from '../compile_metadata';
import {Identifiers, createIdentifier, createIdentifierToken, resolveIdentifier} from '../identifiers';
import * as o from '../output/output_ast';
import {convertValueToOutputAst} from '../output/value_util';
import {ProviderAst, ProviderAstType} from '../template_parser/template_ast';

export function providerDef(providerAst: ProviderAst): {
  providerExpr: o.Expression,
  flags: NodeFlags,
  depsExpr: o.Expression,
  tokenExpr: o.Expression
} {
  let flags = NodeFlags.None;
  if (!providerAst.eager) {
    flags |= NodeFlags.LazyProvider;
  }
  if (providerAst.providerType === ProviderAstType.PrivateService) {
    flags |= NodeFlags.PrivateProvider;
  }
  providerAst.lifecycleHooks.forEach((lifecycleHook) => {
    // for regular providers, we only support ngOnDestroy
    if (lifecycleHook === LifecycleHooks.OnDestroy ||
        providerAst.providerType === ProviderAstType.Directive ||
        providerAst.providerType === ProviderAstType.Component) {
      flags |= lifecycleHookToNodeFlag(lifecycleHook);
    }
  });
  const {providerExpr, flags: providerFlags, depsExpr} = providerAst.multiProvider ?
      multiProviderDef(flags, providerAst.providers) :
      singleProviderDef(flags, providerAst.providerType, providerAst.providers[0]);
  return {
    providerExpr,
    flags: providerFlags, depsExpr,
    tokenExpr: tokenExpr(providerAst.token),
  };
}

function multiProviderDef(flags: NodeFlags, providers: CompileProviderMetadata[]):
    {providerExpr: o.Expression, flags: NodeFlags, depsExpr: o.Expression} {
  const allDepDefs: o.Expression[] = [];
  const allParams: o.FnParam[] = [];
  const exprs = providers.map((provider, providerIndex) => {
    let expr: o.Expression;
    if (provider.useClass) {
      const depExprs = convertDeps(providerIndex, provider.deps || provider.useClass.diDeps);
      expr = o.importExpr(provider.useClass).instantiate(depExprs);
    } else if (provider.useFactory) {
      const depExprs = convertDeps(providerIndex, provider.deps || provider.useFactory.diDeps);
      expr = o.importExpr(provider.useFactory).callFn(depExprs);
    } else if (provider.useExisting) {
      const depExprs = convertDeps(providerIndex, [{token: provider.useExisting}]);
      expr = depExprs[0];
    } else {
      expr = convertValueToOutputAst(provider.useValue);
    }
    return expr;
  });
  const providerExpr =
      o.fn(allParams, [new o.ReturnStatement(o.literalArr(exprs))], o.INFERRED_TYPE);
  return {
    providerExpr,
    flags: flags | NodeFlags.TypeFactoryProvider,
    depsExpr: o.literalArr(allDepDefs)
  };

  function convertDeps(providerIndex: number, deps: CompileDiDependencyMetadata[]) {
    return deps.map((dep, depIndex) => {
      const paramName = `p${providerIndex}_${depIndex}`;
      allParams.push(new o.FnParam(paramName, o.DYNAMIC_TYPE));
      allDepDefs.push(depDef(dep));
      return o.variable(paramName);
    });
  }
}

function singleProviderDef(
    flags: NodeFlags, providerType: ProviderAstType, providerMeta: CompileProviderMetadata):
    {providerExpr: o.Expression, flags: NodeFlags, depsExpr: o.Expression} {
  let providerExpr: o.Expression;
  let deps: CompileDiDependencyMetadata[];
  if (providerType === ProviderAstType.Directive || providerType === ProviderAstType.Component) {
    providerExpr = o.importExpr(providerMeta.useClass !);
    flags |= NodeFlags.TypeDirective;
    deps = providerMeta.deps || providerMeta.useClass !.diDeps;
  } else {
    if (providerMeta.useClass) {
      providerExpr = o.importExpr(providerMeta.useClass);
      flags |= NodeFlags.TypeClassProvider;
      deps = providerMeta.deps || providerMeta.useClass.diDeps;
    } else if (providerMeta.useFactory) {
      providerExpr = o.importExpr(providerMeta.useFactory);
      flags |= NodeFlags.TypeFactoryProvider;
      deps = providerMeta.deps || providerMeta.useFactory.diDeps;
    } else if (providerMeta.useExisting) {
      providerExpr = o.NULL_EXPR;
      flags |= NodeFlags.TypeUseExistingProvider;
      deps = [{token: providerMeta.useExisting}];
    } else {
      providerExpr = convertValueToOutputAst(providerMeta.useValue);
      flags |= NodeFlags.TypeValueProvider;
      deps = [];
    }
  }
  const depsExpr = o.literalArr(deps.map(dep => depDef(dep)));
  return {providerExpr, flags, depsExpr};
}

function tokenExpr(tokenMeta: CompileTokenMetadata): o.Expression {
  return tokenMeta.identifier ? o.importExpr(tokenMeta.identifier) : o.literal(tokenMeta.value);
}

export function depDef(dep: CompileDiDependencyMetadata): o.Expression {
  // Note: the following fields have already been normalized out by provider_analyzer:
  // - isAttribute, isSelf, isHost
  const expr = dep.isValue ? convertValueToOutputAst(dep.value) : tokenExpr(dep.token !);
  let flags = DepFlags.None;
  if (dep.isSkipSelf) {
    flags |= DepFlags.SkipSelf;
  }
  if (dep.isOptional) {
    flags |= DepFlags.Optional;
  }
  if (dep.isValue) {
    flags |= DepFlags.Value;
  }
  return flags === DepFlags.None ? expr : o.literalArr([o.literal(flags), expr]);
}

export function lifecycleHookToNodeFlag(lifecycleHook: LifecycleHooks): NodeFlags {
  let nodeFlag = NodeFlags.None;
  switch (lifecycleHook) {
    case LifecycleHooks.AfterContentChecked:
      nodeFlag = NodeFlags.AfterContentChecked;
      break;
    case LifecycleHooks.AfterContentInit:
      nodeFlag = NodeFlags.AfterContentInit;
      break;
    case LifecycleHooks.AfterViewChecked:
      nodeFlag = NodeFlags.AfterViewChecked;
      break;
    case LifecycleHooks.AfterViewInit:
      nodeFlag = NodeFlags.AfterViewInit;
      break;
    case LifecycleHooks.DoCheck:
      nodeFlag = NodeFlags.DoCheck;
      break;
    case LifecycleHooks.OnChanges:
      nodeFlag = NodeFlags.OnChanges;
      break;
    case LifecycleHooks.OnDestroy:
      nodeFlag = NodeFlags.OnDestroy;
      break;
    case LifecycleHooks.OnInit:
      nodeFlag = NodeFlags.OnInit;
      break;
  }
  return nodeFlag;
}

export function componentFactoryResolverProviderDef(
    flags: NodeFlags, entryComponents: CompileEntryComponentMetadata[]): {
  providerExpr: o.Expression,
  flags: NodeFlags,
  depsExpr: o.Expression,
  tokenExpr: o.Expression
} {
  const entryComponentFactories = entryComponents.map(
      (entryComponent) => o.importExpr({reference: entryComponent.componentFactory}));
  const token = createIdentifierToken(Identifiers.ComponentFactoryResolver);
  const classMeta = {
    diDeps: [
      {isValue: true, value: o.literalArr(entryComponentFactories)},
      {token: token, isSkipSelf: true, isOptional: true},
      {token: createIdentifierToken(Identifiers.NgModuleRef)},
    ],
    lifecycleHooks: [],
    reference: resolveIdentifier(Identifiers.CodegenComponentFactoryResolver)
  };
  const {providerExpr, flags: providerFlags, depsExpr} =
      singleProviderDef(flags, ProviderAstType.PrivateService, {
        token,
        multi: false,
        useClass: classMeta,
      });
  return {providerExpr, flags: providerFlags, depsExpr, tokenExpr: tokenExpr(token)};
}
