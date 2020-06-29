/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileNgModuleMetadata, CompileProviderMetadata, identifierName} from './compile_metadata';
import {CompileReflector} from './compile_reflector';
import {NodeFlags} from './core';
import {Identifiers} from './identifiers';
import * as o from './output/output_ast';
import {typeSourceSpan} from './parse_util';
import {NgModuleProviderAnalyzer} from './provider_analyzer';
import {OutputContext} from './util';
import {componentFactoryResolverProviderDef, depDef, providerDef} from './view_compiler/provider_compiler';

export class NgModuleCompileResult {
  constructor(public ngModuleFactoryVar: string) {}
}

const LOG_VAR = o.variable('_l');

export class NgModuleCompiler {
  constructor(private reflector: CompileReflector) {}
  compile(
      ctx: OutputContext, ngModuleMeta: CompileNgModuleMetadata,
      extraProviders: CompileProviderMetadata[]): NgModuleCompileResult {
    const sourceSpan = typeSourceSpan('NgModule', ngModuleMeta.type);
    const entryComponentFactories = ngModuleMeta.transitiveModule.entryComponents;
    const bootstrapComponents = ngModuleMeta.bootstrapComponents;
    const providerParser =
        new NgModuleProviderAnalyzer(this.reflector, ngModuleMeta, extraProviders, sourceSpan);
    const providerDefs =
        [componentFactoryResolverProviderDef(
             this.reflector, ctx, NodeFlags.None, entryComponentFactories)]
            .concat(providerParser.parse().map((provider) => providerDef(ctx, provider)))
            .map(({providerExpr, depsExpr, flags, tokenExpr}) => {
              return o.importExpr(Identifiers.moduleProviderDef).callFn([
                o.literal(flags), tokenExpr, providerExpr, depsExpr
              ]);
            });

    const ngModuleDef = o.importExpr(Identifiers.moduleDef).callFn([o.literalArr(providerDefs)]);
    const ngModuleDefFactory =
        o.fn([new o.FnParam(LOG_VAR.name!)], [new o.ReturnStatement(ngModuleDef)], o.INFERRED_TYPE);

    const ngModuleFactoryVar = `${identifierName(ngModuleMeta.type)}NgFactory`;
    this._createNgModuleFactory(
        ctx, ngModuleMeta.type.reference, o.importExpr(Identifiers.createModuleFactory).callFn([
          ctx.importExpr(ngModuleMeta.type.reference),
          o.literalArr(bootstrapComponents.map(id => ctx.importExpr(id.reference))),
          ngModuleDefFactory
        ]));

    if (ngModuleMeta.id) {
      const id = typeof ngModuleMeta.id === 'string' ? o.literal(ngModuleMeta.id) :
                                                       ctx.importExpr(ngModuleMeta.id);
      const registerFactoryStmt = o.importExpr(Identifiers.RegisterModuleFactoryFn)
                                      .callFn([id, o.variable(ngModuleFactoryVar)])
                                      .toStmt();
      ctx.statements.push(registerFactoryStmt);
    }

    return new NgModuleCompileResult(ngModuleFactoryVar);
  }

  createStub(ctx: OutputContext, ngModuleReference: any) {
    this._createNgModuleFactory(ctx, ngModuleReference, o.NULL_EXPR);
  }

  private _createNgModuleFactory(ctx: OutputContext, reference: any, value: o.Expression) {
    const ngModuleFactoryVar = `${identifierName({reference: reference})}NgFactory`;
    const ngModuleFactoryStmt =
        o.variable(ngModuleFactoryVar)
            .set(value)
            .toDeclStmt(
                o.importType(
                    Identifiers.NgModuleFactory, [o.expressionType(ctx.importExpr(reference))!],
                    [o.TypeModifier.Const]),
                [o.StmtModifier.Final, o.StmtModifier.Exported]);

    ctx.statements.push(ngModuleFactoryStmt);
  }
}
