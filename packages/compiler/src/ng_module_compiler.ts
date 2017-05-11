/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵNodeFlags as NodeFlags} from '@angular/core';

import {CompileNgModuleMetadata, CompileProviderMetadata, identifierName} from './compile_metadata';
import {Identifiers, createIdentifier} from './identifiers';
import {CompilerInjectable} from './injectable';
import * as o from './output/output_ast';
import {typeSourceSpan} from './parse_util';
import {NgModuleProviderAnalyzer} from './provider_analyzer';
import {componentFactoryResolverProviderDef, depDef, providerDef} from './view_compiler/provider_compiler';

export class NgModuleCompileResult {
  constructor(public statements: o.Statement[], public ngModuleFactoryVar: string) {}
}

const LOG_VAR = o.variable('_l');

@CompilerInjectable()
export class NgModuleCompiler {
  compile(ngModuleMeta: CompileNgModuleMetadata, extraProviders: CompileProviderMetadata[]):
      NgModuleCompileResult {
    const sourceSpan = typeSourceSpan('NgModule', ngModuleMeta.type);
    const entryComponentFactories = ngModuleMeta.transitiveModule.entryComponents;
    const bootstrapComponents = ngModuleMeta.bootstrapComponents;
    const providerParser = new NgModuleProviderAnalyzer(ngModuleMeta, extraProviders, sourceSpan);
    const providerDefs =
        [componentFactoryResolverProviderDef(NodeFlags.None, entryComponentFactories)]
            .concat(providerParser.parse().map((provider) => providerDef(provider)))
            .map(({providerExpr, depsExpr, flags, tokenExpr}) => {
              return o.importExpr(createIdentifier(Identifiers.moduleProviderDef)).callFn([
                o.literal(flags), tokenExpr, providerExpr, depsExpr
              ]);
            });

    const ngModuleDef =
        o.importExpr(createIdentifier(Identifiers.moduleDef)).callFn([o.literalArr(providerDefs)]);
    const ngModuleDefFactory = o.fn(
        [new o.FnParam(LOG_VAR.name !)], [new o.ReturnStatement(ngModuleDef)], o.INFERRED_TYPE);

    const ngModuleFactoryVar = `${identifierName(ngModuleMeta.type)}NgFactory`;
    const ngModuleFactoryStmt =
        o.variable(ngModuleFactoryVar)
            .set(o.importExpr(createIdentifier(Identifiers.createModuleFactory)).callFn([
              o.importExpr(ngModuleMeta.type),
              o.literalArr(bootstrapComponents.map(id => o.importExpr(id))), ngModuleDefFactory
            ]))
            .toDeclStmt(
                o.importType(
                    createIdentifier(Identifiers.NgModuleFactory),
                    [o.importType(ngModuleMeta.type) !], [o.TypeModifier.Const]),
                [o.StmtModifier.Final]);

    const stmts: o.Statement[] = [ngModuleFactoryStmt];
    if (ngModuleMeta.id) {
      const registerFactoryStmt =
          o.importExpr(createIdentifier(Identifiers.RegisterModuleFactoryFn))
              .callFn([o.literal(ngModuleMeta.id), o.variable(ngModuleFactoryVar)])
              .toStmt();
      stmts.push(registerFactoryStmt);
    }

    return new NgModuleCompileResult(stmts, ngModuleFactoryVar);
  }
}
