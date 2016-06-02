import {isPresent, isBlank} from '../../src/facade/lang';
import {CompileInjectorMetadata, CompileDiDependencyMetadata, CompileTokenMetadata, CompileTokenMap, CompileProviderMetadata, CompileTypeMetadata} from '../compile_metadata';
import {Identifiers, identifierToken} from '../identifiers';
import * as o from '../output/output_ast';
import {ParseSourceSpan, ParseLocation, ParseSourceFile} from '../parse_util';
import {AppProviderParser} from '../provider_parser';
import {ProviderAst} from '../template_ast';

import {InjectMethodVars} from './constants';
import {convertValueToOutputAst, createDiTokenExpression} from './util';

var configProp = new o.ReadPropExpr(o.THIS_EXPR, 'config');
var parentInjectorProp = new o.ReadPropExpr(o.THIS_EXPR, 'parent');

export class InjectorCompileResult {
  constructor(public statements: o.Statement[], public injectorFactoryVar: string) {}
}

export class InjectorCompiler {
  compileInjector(injectorMeta: CompileInjectorMetadata): InjectorCompileResult {
    var builder = new _InjectorBuilder(injectorMeta.type);
    var sourceFile = isPresent(injectorMeta.type.moduleUrl) ?
        `${injectorMeta.type.name} in ${injectorMeta.type.moduleUrl}` :
        injectorMeta.type.name;
    var parseFile = new ParseSourceFile('', sourceFile);
    var providerParser = new AppProviderParser(
        new ParseSourceSpan(
            new ParseLocation(parseFile, null, null, null),
            new ParseLocation(parseFile, null, null, null)),
        <Array<CompileProviderMetadata|CompileTypeMetadata|any[]>>injectorMeta.providers);
    providerParser.parse().forEach((provider) => builder.addProvider(provider));
    var injectorClass = builder.build();
    var injectorFactoryVar = `${injectorClass.name}Factory`;
    var injectorFactoryExpr = o.fn(
        injectorClass.constructorMethod.params,
        [new o.ReturnStatement(o.variable(injectorClass.name)
                                   .instantiate(injectorClass.constructorMethod.params.map(
                                       (param) => o.variable(param.name))))],
        o.importType(Identifiers.Injector));
    var injectorFactoryStmt =
        o.variable(injectorFactoryVar)
            .set(o.importExpr(Identifiers.InjectorFactory, [o.importType(injectorMeta.type)])
                     .instantiate(
                         [injectorFactoryExpr],
                         o.importType(
                             Identifiers.InjectorFactory, [o.importType(injectorMeta.type)],
                             [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]);

    return new InjectorCompileResult([injectorClass, injectorFactoryStmt], injectorFactoryVar);
  }
}


class _InjectorBuilder {
  private _instances = new CompileTokenMap<o.Expression>();
  private _fields: o.ClassField[] = [];
  private _ctorStmts: o.Statement[] = [];
  private _getters: o.ClassGetter[] = [];
  private _hasProviderProperties: boolean = false;

  constructor(private _configType: CompileTypeMetadata) {
    this._instances.add(identifierToken(Identifiers.Injector), o.THIS_EXPR);
  }

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
    this._ctorStmts.push(o.SUPER_EXPR
                             .callFn([
                               o.variable(parentInjectorProp.name),
                               o.literal(this._hasProviderProperties), o.variable(configProp.name)
                             ])
                             .toStmt());

    let getMethodStmts: o.Statement[] = this._instances.keys().map((token) => {
      var providerExpr = this._instances.get(token);
      return new o.IfStmt(
          InjectMethodVars.token.identical(createDiTokenExpression(token)),
          [new o.ReturnStatement(providerExpr)]);
    });

    var methods = [new o.ClassMethod(
        'getInternal',
        [
          new o.FnParam(InjectMethodVars.token.name, o.DYNAMIC_TYPE),
          new o.FnParam(InjectMethodVars.notFoundResult.name, o.DYNAMIC_TYPE)
        ],
        getMethodStmts.concat([new o.ReturnStatement(InjectMethodVars.notFoundResult)]),
        o.DYNAMIC_TYPE)];

    var ctor = new o.ClassMethod(
        null,
        [
          new o.FnParam(parentInjectorProp.name, o.importType(Identifiers.Injector)),
          new o.FnParam(configProp.name, o.importType(this._configType))
        ],
        this._ctorStmts);

    var injClassName = `${this._configType.name}Injector`;
    return new o.ClassStmt(
        injClassName, o.importExpr(Identifiers.CodegenInjector, [o.importType(this._configType)]),
        this._fields, this._getters, ctor, methods);
  }

  private _getProviderValue(provider: CompileProviderMetadata): o.Expression {
    if (isPresent(provider.useExisting)) {
      return this._getDependency(new CompileDiDependencyMetadata({token: provider.useExisting}));
    } else if (isPresent(provider.useFactory)) {
      var deps = isPresent(provider.deps) ? provider.deps : provider.useFactory.diDeps;
      var depsExpr = deps.map((dep) => this._getDependency(dep));
      return o.importExpr(provider.useFactory).callFn(depsExpr);
    } else if (isPresent(provider.useClass)) {
      var deps = isPresent(provider.deps) ? provider.deps : provider.useClass.diDeps;
      var depsExpr = deps.map((dep) => this._getDependency(dep));
      return o.importExpr(provider.useClass).instantiate(depsExpr, o.importType(provider.useClass));
    } else if (isPresent(provider.useProperty)) {
      this._hasProviderProperties = true;
      return configProp.prop(provider.useProperty);
    } else {
      return convertValueToOutputAst(provider.useValue);
    }
  }


  private _createProviderProperty(
      propName: string, provider: ProviderAst, providerValueExpressions: o.Expression[],
      isMulti: boolean, isEager: boolean): o.Expression {
    var resolvedProviderValueExpr;
    var type;
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
      this._ctorStmts.push(o.THIS_EXPR.prop(propName).set(resolvedProviderValueExpr).toStmt());
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
    var result = null;
    if (dep.isValue) {
      result = o.literal(dep.value);
    }
    if (isBlank(result) && !dep.isSkipSelf) {
      result = this._instances.get(dep.token);
    }
    if (isBlank(result)) {
      var args = [createDiTokenExpression(dep.token)];
      if (dep.isOptional) {
        args.push(o.NULL_EXPR);
      }
      result = parentInjectorProp.callMethod('get', args);
    }
    return result;
  }
}
