/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

import {CompileDiDependencyMetadata, CompileIdentifierMetadata, CompileNgModuleMetadata, CompileProviderMetadata, CompileTokenMetadata} from './compile_metadata';
import {isPresent} from './facade/lang';
import {Identifiers, resolveIdentifier, resolveIdentifierToken} from './identifiers';
import * as o from './output/output_ast';
import {convertValueToOutputAst} from './output/value_util';
import {ParseLocation, ParseSourceFile, ParseSourceSpan} from './parse_util';
import {LifecycleHooks} from './private_import_core';
import {NgModuleProviderAnalyzer} from './provider_analyzer';
import {ProviderAst} from './template_parser/template_ast';
import {createDiTokenExpression} from './util';

export class ComponentFactoryDependency {
  constructor(
      public comp: CompileIdentifierMetadata, public placeholder: CompileIdentifierMetadata) {}
}

export class NgModuleCompileResult {
  constructor(
      public statements: o.Statement[], public ngModuleFactoryVar: string,
      public dependencies: ComponentFactoryDependency[]) {}
}

@Injectable()
export class NgModuleCompiler {
  compile(ngModuleMeta: CompileNgModuleMetadata, extraProviders: CompileProviderMetadata[]):
      NgModuleCompileResult {
    var sourceFileName = isPresent(ngModuleMeta.type.moduleUrl) ?
        `in NgModule ${ngModuleMeta.type.name} in ${ngModuleMeta.type.moduleUrl}` :
        `in NgModule ${ngModuleMeta.type.name}`;
    var sourceFile = new ParseSourceFile('', sourceFileName);
    var sourceSpan = new ParseSourceSpan(
        new ParseLocation(sourceFile, null, null, null),
        new ParseLocation(sourceFile, null, null, null));
    var deps: ComponentFactoryDependency[] = [];
    var bootstrapComponentFactories: CompileIdentifierMetadata[] = [];
    var entryComponentFactories =
        ngModuleMeta.transitiveModule.entryComponents.map((entryComponent) => {
          var id = new CompileIdentifierMetadata({name: entryComponent.name});
          if (ngModuleMeta.bootstrapComponents.indexOf(entryComponent) > -1) {
            bootstrapComponentFactories.push(id);
          }
          deps.push(new ComponentFactoryDependency(entryComponent, id));
          return id;
        });
    var builder = new _InjectorBuilder(
        ngModuleMeta, entryComponentFactories, bootstrapComponentFactories, sourceSpan);

    var providerParser = new NgModuleProviderAnalyzer(ngModuleMeta, extraProviders, sourceSpan);
    providerParser.parse().forEach((provider) => builder.addProvider(provider));
    var injectorClass = builder.build();
    var ngModuleFactoryVar = `${ngModuleMeta.type.name}NgFactory`;
    var ngModuleFactoryStmt =
        o.variable(ngModuleFactoryVar)
            .set(o.importExpr(resolveIdentifier(Identifiers.NgModuleFactory))
                     .instantiate(
                         [o.variable(injectorClass.name), o.importExpr(ngModuleMeta.type)],
                         o.importType(
                             resolveIdentifier(Identifiers.NgModuleFactory),
                             [o.importType(ngModuleMeta.type)], [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]);

    let stmts: o.Statement[] = [injectorClass, ngModuleFactoryStmt];
    if (ngModuleMeta.id) {
      let registerFactoryStmt =
          o.importExpr(resolveIdentifier(Identifiers.RegisterModuleFactoryFn))
              .callFn([o.literal(ngModuleMeta.id), o.variable(ngModuleFactoryVar)])
              .toStmt();
      stmts.push(registerFactoryStmt);
    }

    return new NgModuleCompileResult(stmts, ngModuleFactoryVar, deps);
  }
}

class _InjectorBuilder {
  private _tokens: CompileTokenMetadata[] = [];
  private _instances = new Map<any, o.Expression>();
  private _fields: o.ClassField[] = [];
  private _createStmts: o.Statement[] = [];
  private _destroyStmts: o.Statement[] = [];
  private _getters: o.ClassGetter[] = [];

  constructor(
      private _ngModuleMeta: CompileNgModuleMetadata,
      private _entryComponentFactories: CompileIdentifierMetadata[],
      private _bootstrapComponentFactories: CompileIdentifierMetadata[],
      private _sourceSpan: ParseSourceSpan) {}

  addProvider(resolvedProvider: ProviderAst) {
    var providerValueExpressions =
        resolvedProvider.providers.map((provider) => this._getProviderValue(provider));
    var propName = `_${resolvedProvider.token.name}_${this._instances.size}`;
    var instance = this._createProviderProperty(
        propName, resolvedProvider, providerValueExpressions, resolvedProvider.multiProvider,
        resolvedProvider.eager);
    if (resolvedProvider.lifecycleHooks.indexOf(LifecycleHooks.OnDestroy) !== -1) {
      this._destroyStmts.push(instance.callMethod('ngOnDestroy', []).toStmt());
    }
    this._tokens.push(resolvedProvider.token);
    this._instances.set(resolvedProvider.token.reference, instance);
  }

  build(): o.ClassStmt {
    let getMethodStmts: o.Statement[] = this._tokens.map((token) => {
      var providerExpr = this._instances.get(token.reference);
      return new o.IfStmt(
          InjectMethodVars.token.identical(createDiTokenExpression(token)),
          [new o.ReturnStatement(providerExpr)]);
    });
    var methods = [
      new o.ClassMethod(
        'createInternal', [], this._createStmts.concat(
          new o.ReturnStatement(this._instances.get(this._ngModuleMeta.type.reference))
        ), o.importType(this._ngModuleMeta.type)
      ),
      new o.ClassMethod(
          'getInternal',
          [
            new o.FnParam(InjectMethodVars.token.name, o.DYNAMIC_TYPE),
            new o.FnParam(InjectMethodVars.notFoundResult.name, o.DYNAMIC_TYPE)
          ],
          getMethodStmts.concat([new o.ReturnStatement(InjectMethodVars.notFoundResult)]),
          o.DYNAMIC_TYPE),
      new o.ClassMethod(
        'destroyInternal', [], this._destroyStmts
      ),
    ];

    var ctor = new o.ClassMethod(
        null,
        [new o.FnParam(
            InjectorProps.parent.name, o.importType(resolveIdentifier(Identifiers.Injector)))],
        [o.SUPER_EXPR
             .callFn([
               o.variable(InjectorProps.parent.name),
               o.literalArr(this._entryComponentFactories.map(
                   (componentFactory) => o.importExpr(componentFactory))),
               o.literalArr(this._bootstrapComponentFactories.map(
                   (componentFactory) => o.importExpr(componentFactory)))
             ])
             .toStmt()]);

    var injClassName = `${this._ngModuleMeta.type.name}Injector`;
    return new o.ClassStmt(
        injClassName, o.importExpr(
                          resolveIdentifier(Identifiers.NgModuleInjector),
                          [o.importType(this._ngModuleMeta.type)]),
        this._fields, this._getters, ctor, methods);
  }

  private _getProviderValue(provider: CompileProviderMetadata): o.Expression {
    var result: o.Expression;
    if (isPresent(provider.useExisting)) {
      result = this._getDependency(new CompileDiDependencyMetadata({token: provider.useExisting}));
    } else if (isPresent(provider.useFactory)) {
      var deps = isPresent(provider.deps) ? provider.deps : provider.useFactory.diDeps;
      var depsExpr = deps.map((dep) => this._getDependency(dep));
      result = o.importExpr(provider.useFactory).callFn(depsExpr);
    } else if (isPresent(provider.useClass)) {
      var deps = isPresent(provider.deps) ? provider.deps : provider.useClass.diDeps;
      var depsExpr = deps.map((dep) => this._getDependency(dep));
      result =
          o.importExpr(provider.useClass).instantiate(depsExpr, o.importType(provider.useClass));
    } else {
      result = convertValueToOutputAst(provider.useValue);
    }
    return result;
  }


  private _createProviderProperty(
      propName: string, provider: ProviderAst, providerValueExpressions: o.Expression[],
      isMulti: boolean, isEager: boolean): o.Expression {
    var resolvedProviderValueExpr: o.Expression;
    var type: o.Type;
    if (isMulti) {
      resolvedProviderValueExpr = o.literalArr(providerValueExpressions);
      type = new o.ArrayType(o.DYNAMIC_TYPE);
    } else {
      resolvedProviderValueExpr = providerValueExpressions[0];
      type = providerValueExpressions[0].type;
    }
    if (!type) {
      type = o.DYNAMIC_TYPE;
    }
    if (isEager) {
      this._fields.push(new o.ClassField(propName, type));
      this._createStmts.push(o.THIS_EXPR.prop(propName).set(resolvedProviderValueExpr).toStmt());
    } else {
      var internalField = `_${propName}`;
      this._fields.push(new o.ClassField(internalField, type));
      // Note: Equals is important for JS so that it also checks the undefined case!
      var getterStmts = [
        new o.IfStmt(
            o.THIS_EXPR.prop(internalField).isBlank(),
            [o.THIS_EXPR.prop(internalField).set(resolvedProviderValueExpr).toStmt()]),
        new o.ReturnStatement(o.THIS_EXPR.prop(internalField))
      ];
      this._getters.push(new o.ClassGetter(propName, getterStmts, type));
    }
    return o.THIS_EXPR.prop(propName);
  }

  private _getDependency(dep: CompileDiDependencyMetadata): o.Expression {
    var result: o.Expression = null;
    if (dep.isValue) {
      result = o.literal(dep.value);
    }
    if (!dep.isSkipSelf) {
      if (dep.token &&
          (dep.token.reference === resolveIdentifierToken(Identifiers.Injector).reference ||
           dep.token.reference ===
               resolveIdentifierToken(Identifiers.ComponentFactoryResolver).reference)) {
        result = o.THIS_EXPR;
      }
      if (!result) {
        result = this._instances.get(dep.token.reference);
      }
    }
    if (!result) {
      var args = [createDiTokenExpression(dep.token)];
      if (dep.isOptional) {
        args.push(o.NULL_EXPR);
      }
      result = InjectorProps.parent.callMethod('get', args);
    }
    return result;
  }
}

class InjectorProps {
  static parent = o.THIS_EXPR.prop('parent');
}

class InjectMethodVars {
  static token = o.variable('token');
  static notFoundResult = o.variable('notFoundResult');
}
