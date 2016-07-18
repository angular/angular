/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

import {CompileDiDependencyMetadata, CompileIdentifierMap, CompileIdentifierMetadata, CompileNgModuleMetadata, CompileProviderMetadata, CompileTokenMetadata} from './compile_metadata';
import {isBlank, isPresent} from './facade/lang';
import {Identifiers, identifierToken} from './identifiers';
import * as o from './output/output_ast';
import {convertValueToOutputAst} from './output/value_util';
import {ParseLocation, ParseSourceFile, ParseSourceSpan} from './parse_util';
import {NgModuleProviderAnalyzer} from './provider_analyzer';
import {ProviderAst, ProviderAstType} from './template_ast';
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
    var precompileComponents = ngModuleMeta.transitiveModule.precompile.map((precompileComp) => {
      var id = new CompileIdentifierMetadata({name: precompileComp.name});
      deps.push(new ComponentFactoryDependency(precompileComp, id));
      return id;
    });
    var builder = new _InjectorBuilder(ngModuleMeta, precompileComponents, sourceSpan);

    var providerParser = new NgModuleProviderAnalyzer(ngModuleMeta, extraProviders, sourceSpan);
    providerParser.parse().forEach((provider) => builder.addProvider(provider));
    var injectorClass = builder.build();
    var ngModuleFactoryVar = `${ngModuleMeta.type.name}NgFactory`;
    var ngModuleFactoryStmt =
        o.variable(ngModuleFactoryVar)
            .set(o.importExpr(Identifiers.NgModuleFactory)
                     .instantiate(
                         [o.variable(injectorClass.name), o.importExpr(ngModuleMeta.type)],
                         o.importType(
                             Identifiers.NgModuleFactory, [o.importType(ngModuleMeta.type)],
                             [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]);

    return new NgModuleCompileResult(
        [injectorClass, ngModuleFactoryStmt], ngModuleFactoryVar, deps);
  }
}

class _InjectorBuilder {
  private _instances = new CompileIdentifierMap<CompileTokenMetadata, o.Expression>();
  private _fields: o.ClassField[] = [];
  private _createStmts: o.Statement[] = [];
  private _getters: o.ClassGetter[] = [];

  constructor(
      private _ngModuleMeta: CompileNgModuleMetadata,
      private _precompileComponents: CompileIdentifierMetadata[],
      private _sourceSpan: ParseSourceSpan) {}

  addProvider(resolvedProvider: ProviderAst) {
    var providerValueExpressions =
        resolvedProvider.providers.map((provider) => this._getProviderValue(provider));
    var propName = `_${resolvedProvider.token.name}_${this._instances.size}`;
    var instance = this._createProviderProperty(
        propName, resolvedProvider, providerValueExpressions, resolvedProvider.multiProvider,
        resolvedProvider.eager);
    this._instances.add(resolvedProvider.token, instance);
  }

  build(): o.ClassStmt {
    let getMethodStmts: o.Statement[] = this._instances.keys().map((token) => {
      var providerExpr = this._instances.get(token);
      return new o.IfStmt(
          InjectMethodVars.token.identical(createDiTokenExpression(token)),
          [new o.ReturnStatement(providerExpr)]);
    });
    var methods = [
      new o.ClassMethod(
        'createInternal', [], this._createStmts.concat(
          new o.ReturnStatement(this._instances.get(identifierToken(this._ngModuleMeta.type)))
        ), o.importType(this._ngModuleMeta.type)
      ),
      new o.ClassMethod(
          'getInternal',
          [
            new o.FnParam(InjectMethodVars.token.name, o.DYNAMIC_TYPE),
            new o.FnParam(InjectMethodVars.notFoundResult.name, o.DYNAMIC_TYPE)
          ],
          getMethodStmts.concat([new o.ReturnStatement(InjectMethodVars.notFoundResult)]),
          o.DYNAMIC_TYPE)
    ];

    var ctor = new o.ClassMethod(
        null, [new o.FnParam(InjectorProps.parent.name, o.importType(Identifiers.Injector))],
        [o.SUPER_EXPR
             .callFn([
               o.variable(InjectorProps.parent.name),
               o.literalArr(this._precompileComponents.map(
                   (precompiledComponent) => o.importExpr(precompiledComponent)))
             ])
             .toStmt()]);

    var injClassName = `${this._ngModuleMeta.type.name}Injector`;
    return new o.ClassStmt(
        injClassName,
        o.importExpr(Identifiers.NgModuleInjector, [o.importType(this._ngModuleMeta.type)]),
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
    if (isBlank(type)) {
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
          (dep.token.equalsTo(identifierToken(Identifiers.Injector)) ||
           dep.token.equalsTo(identifierToken(Identifiers.ComponentFactoryResolver)))) {
        result = o.THIS_EXPR;
      }
      if (isBlank(result)) {
        result = this._instances.get(dep.token);
      }
    }
    if (isBlank(result)) {
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
