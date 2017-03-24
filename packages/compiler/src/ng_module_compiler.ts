/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵLifecycleHooks} from '@angular/core';

import {CompileDiDependencyMetadata, CompileIdentifierMetadata, CompileNgModuleMetadata, CompileProviderMetadata, CompileTokenMetadata, identifierModuleUrl, identifierName, tokenName, tokenReference} from './compile_metadata';
import {Identifiers, createIdentifier, resolveIdentifier} from './identifiers';
import {CompilerInjectable} from './injectable';
import {ClassBuilder, createClassStmt} from './output/class_builder';
import * as o from './output/output_ast';
import {convertValueToOutputAst} from './output/value_util';
import {ParseLocation, ParseSourceFile, ParseSourceSpan, typeSourceSpan} from './parse_util';
import {NgModuleProviderAnalyzer} from './provider_analyzer';
import {ProviderAst} from './template_parser/template_ast';


/**
 * This is currently not read, but will probably be used in the future.
 * We keep it as we already pass it through all the rigth places...
 */
export class ComponentFactoryDependency {
  constructor(public compType: any) {}
}

export class NgModuleCompileResult {
  constructor(
      public statements: o.Statement[], public ngModuleFactoryVar: string,
      public dependencies: ComponentFactoryDependency[]) {}
}

@CompilerInjectable()
export class NgModuleCompiler {
  compile(ngModuleMeta: CompileNgModuleMetadata, extraProviders: CompileProviderMetadata[]):
      NgModuleCompileResult {
    const sourceSpan = typeSourceSpan('NgModule', ngModuleMeta.type);
    const deps: ComponentFactoryDependency[] = [];
    const bootstrapComponentFactories: CompileIdentifierMetadata[] = [];
    const entryComponentFactories =
        ngModuleMeta.transitiveModule.entryComponents.map((entryComponent) => {
          if (ngModuleMeta.bootstrapComponents.some(
                  (id) => id.reference === entryComponent.componentType)) {
            bootstrapComponentFactories.push({reference: entryComponent.componentFactory});
          }
          deps.push(new ComponentFactoryDependency(entryComponent.componentType));
          return {reference: entryComponent.componentFactory};
        });
    const builder = new _InjectorBuilder(
        ngModuleMeta, entryComponentFactories, bootstrapComponentFactories, sourceSpan);

    const providerParser = new NgModuleProviderAnalyzer(ngModuleMeta, extraProviders, sourceSpan);
    providerParser.parse().forEach((provider) => builder.addProvider(provider));
    const injectorClass = builder.build();
    const ngModuleFactoryVar = `${identifierName(ngModuleMeta.type)}NgFactory`;
    const ngModuleFactoryStmt =
        o.variable(ngModuleFactoryVar)
            .set(o.importExpr(createIdentifier(Identifiers.NgModuleFactory))
                     .instantiate(
                         [o.variable(injectorClass.name), o.importExpr(ngModuleMeta.type)],
                         o.importType(
                             createIdentifier(Identifiers.NgModuleFactory),
                             [o.importType(ngModuleMeta.type) !], [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]);

    const stmts: o.Statement[] = [injectorClass, ngModuleFactoryStmt];
    if (ngModuleMeta.id) {
      const registerFactoryStmt =
          o.importExpr(createIdentifier(Identifiers.RegisterModuleFactoryFn))
              .callFn([o.literal(ngModuleMeta.id), o.variable(ngModuleFactoryVar)])
              .toStmt();
      stmts.push(registerFactoryStmt);
    }

    return new NgModuleCompileResult(stmts, ngModuleFactoryVar, deps);
  }
}

class _InjectorBuilder implements ClassBuilder {
  fields: o.ClassField[] = [];
  getters: o.ClassGetter[] = [];
  methods: o.ClassMethod[] = [];
  ctorStmts: o.Statement[] = [];
  private _lazyProps = new Map<string, o.Expression>();
  private _tokens: CompileTokenMetadata[] = [];
  private _instances = new Map<any, o.Expression>();
  private _createStmts: o.Statement[] = [];
  private _destroyStmts: o.Statement[] = [];

  constructor(
      private _ngModuleMeta: CompileNgModuleMetadata,
      private _entryComponentFactories: CompileIdentifierMetadata[],
      private _bootstrapComponentFactories: CompileIdentifierMetadata[],
      private _sourceSpan: ParseSourceSpan) {}

  addProvider(resolvedProvider: ProviderAst) {
    const providerValueExpressions =
        resolvedProvider.providers.map((provider) => this._getProviderValue(provider));
    const propName = `_${tokenName(resolvedProvider.token)}_${this._instances.size}`;
    const instance = this._createProviderProperty(
        propName, resolvedProvider, providerValueExpressions, resolvedProvider.multiProvider,
        resolvedProvider.eager);
    if (resolvedProvider.lifecycleHooks.indexOf(ɵLifecycleHooks.OnDestroy) !== -1) {
      let callNgOnDestroy: o.Expression = instance.callMethod('ngOnDestroy', []);
      if (!resolvedProvider.eager) {
        callNgOnDestroy = this._lazyProps.get(instance.name) !.and(callNgOnDestroy);
      }
      this._destroyStmts.push(callNgOnDestroy.toStmt());
    }
    this._tokens.push(resolvedProvider.token);
    this._instances.set(tokenReference(resolvedProvider.token), instance);
  }

  build(): o.ClassStmt {
    const getMethodStmts: o.Statement[] = this._tokens.map((token) => {
      const providerExpr = this._instances.get(tokenReference(token)) !;
      return new o.IfStmt(
          InjectMethodVars.token.identical(createDiTokenExpression(token)),
          [new o.ReturnStatement(providerExpr)]);
    });
    const methods = [
      new o.ClassMethod(
          'createInternal', [], this._createStmts.concat(new o.ReturnStatement(
                                    this._instances.get(this._ngModuleMeta.type.reference) !)),
          o.importType(this._ngModuleMeta.type)),
      new o.ClassMethod(
          'getInternal',
          [
            new o.FnParam(InjectMethodVars.token.name !, o.DYNAMIC_TYPE),
            new o.FnParam(InjectMethodVars.notFoundResult.name !, o.DYNAMIC_TYPE)
          ],
          getMethodStmts.concat([new o.ReturnStatement(InjectMethodVars.notFoundResult)]),
          o.DYNAMIC_TYPE),
      new o.ClassMethod('destroyInternal', [], this._destroyStmts),
    ];

    const parentArgs = [
      o.variable(InjectorProps.parent.name),
      o.literalArr(
          this._entryComponentFactories.map((componentFactory) => o.importExpr(componentFactory))),
      o.literalArr(this._bootstrapComponentFactories.map(
          (componentFactory) => o.importExpr(componentFactory)))
    ];
    const injClassName = `${identifierName(this._ngModuleMeta.type)}Injector`;
    return createClassStmt({
      name: injClassName,
      ctorParams: [new o.FnParam(
          InjectorProps.parent.name, o.importType(createIdentifier(Identifiers.Injector)))],
      parent: o.importExpr(
          createIdentifier(Identifiers.NgModuleInjector),
          [o.importType(this._ngModuleMeta.type) !]),
      parentArgs: parentArgs,
      builders: [{methods}, this]
    });
  }

  private _getProviderValue(provider: CompileProviderMetadata): o.Expression {
    let result: o.Expression;
    if (provider.useExisting != null) {
      result = this._getDependency({token: provider.useExisting});
    } else if (provider.useFactory != null) {
      const deps = provider.deps || provider.useFactory.diDeps;
      const depsExpr = deps.map((dep) => this._getDependency(dep));
      result = o.importExpr(provider.useFactory).callFn(depsExpr);
    } else if (provider.useClass != null) {
      const deps = provider.deps || provider.useClass.diDeps;
      const depsExpr = deps.map((dep) => this._getDependency(dep));
      result =
          o.importExpr(provider.useClass).instantiate(depsExpr, o.importType(provider.useClass));
    } else {
      result = convertValueToOutputAst(provider.useValue);
    }
    return result;
  }


  private _createProviderProperty(
      propName: string, provider: ProviderAst, providerValueExpressions: o.Expression[],
      isMulti: boolean, isEager: boolean): o.ReadPropExpr {
    let resolvedProviderValueExpr: o.Expression;
    let type: o.Type;
    if (isMulti) {
      resolvedProviderValueExpr = o.literalArr(providerValueExpressions);
      type = new o.ArrayType(o.DYNAMIC_TYPE);
    } else {
      resolvedProviderValueExpr = providerValueExpressions[0];
      type = providerValueExpressions[0].type !;
    }
    if (!type) {
      type = o.DYNAMIC_TYPE;
    }
    if (isEager) {
      this.fields.push(new o.ClassField(propName, type));
      this._createStmts.push(o.THIS_EXPR.prop(propName).set(resolvedProviderValueExpr).toStmt());
    } else {
      const internalFieldProp = o.THIS_EXPR.prop(`_${propName}`);
      this.fields.push(new o.ClassField(internalFieldProp.name, type));
      // Note: Equals is important for JS so that it also checks the undefined case!
      const getterStmts = [
        new o.IfStmt(
            internalFieldProp.isBlank(),
            [internalFieldProp.set(resolvedProviderValueExpr).toStmt()]),
        new o.ReturnStatement(internalFieldProp)
      ];
      this.getters.push(new o.ClassGetter(propName, getterStmts, type));
      this._lazyProps.set(propName, internalFieldProp);
    }
    return o.THIS_EXPR.prop(propName);
  }

  private _getDependency(dep: CompileDiDependencyMetadata): o.Expression {
    let result: o.Expression = null !;
    if (dep.isValue) {
      result = o.literal(dep.value);
    }
    if (!dep.isSkipSelf) {
      if (dep.token) {
        if (tokenReference(dep.token) === resolveIdentifier(Identifiers.Injector)) {
          result = o.THIS_EXPR;
        } else if (
            tokenReference(dep.token) === resolveIdentifier(Identifiers.ComponentFactoryResolver)) {
          result = o.THIS_EXPR.prop('componentFactoryResolver');
        }
      }

      if (!result) {
        result = this._instances.get(tokenReference(dep.token !)) !;
      }
    }
    if (!result) {
      const args = [createDiTokenExpression(dep.token !)];
      if (dep.isOptional) {
        args.push(o.NULL_EXPR);
      }
      result = InjectorProps.parent.callMethod('get', args);
    }
    return result;
  }
}

function createDiTokenExpression(token: CompileTokenMetadata): o.Expression {
  if (token.value != null) {
    return o.literal(token.value);
  } else {
    return o.importExpr(token.identifier !);
  }
}

class InjectorProps {
  static parent = o.THIS_EXPR.prop('parent');
}

class InjectMethodVars {
  static token = o.variable('token');
  static notFoundResult = o.variable('notFoundResult');
}
