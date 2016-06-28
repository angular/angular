/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AppModuleMetadata, ComponentMetadata} from '@angular/core';

import {AppModuleCompiler} from './app_module_compiler';
import {CompileDirectiveMetadata, CompileIdentifierMetadata, CompilePipeMetadata, StaticSymbol, createHostComponentMeta} from './compile_metadata';
import {DirectiveNormalizer} from './directive_normalizer';
import {ListWrapper} from './facade/collection';
import {BaseException} from './facade/exceptions';
import {Identifiers} from './identifiers';
import {CompileMetadataResolver} from './metadata_resolver';
import {OutputEmitter} from './output/abstract_emitter';
import * as o from './output/output_ast';
import {CompiledStylesheet, StyleCompiler} from './style_compiler';
import {TemplateParser} from './template_parser';
import {assetUrl} from './util';
import {ComponentFactoryDependency, ViewCompileResult, ViewCompiler, ViewFactoryDependency} from './view_compiler/view_compiler';
import {XHR} from './xhr';

export class SourceModule {
  constructor(public moduleUrl: string, public source: string) {}
}

export class AppModulesSummary {
  private _compAppModule = new Map<string, StaticSymbol>();
  private _hashKey(type: StaticSymbol) { return `${type.filePath}#${type.name}`; }

  hasComponent(component: StaticSymbol): boolean {
    return this._compAppModule.has(this._hashKey(component));
  }

  addComponent(module: StaticSymbol, component: StaticSymbol) {
    this._compAppModule.set(this._hashKey(component), module);
  }

  getModule(comp: StaticSymbol): StaticSymbol {
    return this._compAppModule.get(this._hashKey(comp));
  }
}
export class OfflineCompiler {
  constructor(
      private _metadataResolver: CompileMetadataResolver,
      private _directiveNormalizer: DirectiveNormalizer, private _templateParser: TemplateParser,
      private _styleCompiler: StyleCompiler, private _viewCompiler: ViewCompiler,
      private _appModuleCompiler: AppModuleCompiler, private _outputEmitter: OutputEmitter) {}

  analyzeModules(appModules: StaticSymbol[]): AppModulesSummary {
    let result = new AppModulesSummary();
    appModules.forEach((appModule) => {
      let appModuleMeta = this._metadataResolver.getAppModuleMetadata(appModule);
      appModuleMeta.precompile.forEach(
          (precompileComp) =>
              this._getTransitiveComponents(appModule, <any>precompileComp.runtime, result));
    });
    return result;
  }

  private _getTransitiveComponents(
      appModule: StaticSymbol, component: StaticSymbol,
      target: AppModulesSummary = new AppModulesSummary()): AppModulesSummary {
    var compMeta = this._metadataResolver.getDirectiveMetadata(<any>component);
    // TODO(tbosch): preserve all modules per component, not just one.
    // Then run the template parser with the union and the intersection of the modules (regarding
    // directives/pipes)
    // and report an error if some directives/pipes are only matched with the union but not with the
    // intersection!
    // -> this means that a component is used in the wrong way!
    if (!compMeta.isComponent || target.hasComponent(component)) {
      return target;
    }
    target.addComponent(appModule, component);
    this._metadataResolver.getViewDirectivesMetadata(<any>component).forEach((dirMeta) => {
      this._getTransitiveComponents(appModule, <any>dirMeta.type.runtime);
    });
    compMeta.precompile.forEach((precompileComp) => {
      this._getTransitiveComponents(appModule, <any>precompileComp.type.runtime);
    });
    return target;
  }

  clearCache() {
    this._directiveNormalizer.clearCache();
    this._metadataResolver.clearCache();
  }

  compile(
      moduleUrl: string, appModulesSummary: AppModulesSummary, components: StaticSymbol[],
      appModules: StaticSymbol[]): Promise<SourceModule[]> {
    let fileSuffix = _splitLastSuffix(moduleUrl)[1];
    let statements: o.Statement[] = [];
    let exportedVars: string[] = [];
    let outputSourceModules: SourceModule[] = [];

    // compile app modules
    exportedVars.push(
        ...appModules.map((appModule) => this._compileAppModule(appModule, statements)));

    // compile components
    return Promise
        .all(components.map((compType) => {
          let appModule = appModulesSummary.getModule(compType);
          let appModuleDirectives: CompileDirectiveMetadata[] = [];
          let appModulePipes: CompilePipeMetadata[] = [];
          if (appModule) {
            let appModuleMeta = this._metadataResolver.getAppModuleMetadata(appModule);
            appModuleDirectives.push(...appModuleMeta.directives.map(
                type => this._metadataResolver.getDirectiveMetadata(type.runtime)));
            appModulePipes.push(...appModuleMeta.pipes.map(
                type => this._metadataResolver.getPipeMetadata(type.runtime)));
          }
          return Promise
              .all([
                this._metadataResolver.getDirectiveMetadata(<any>compType), ...appModuleDirectives,
                ...this._metadataResolver.getViewDirectivesMetadata(<any>compType)
              ].map(dirMeta => this._directiveNormalizer.normalizeDirective(dirMeta).asyncResult))
              .then((normalizedCompWithDirectives) => {
                let compMeta = normalizedCompWithDirectives[0];
                let dirMetas = normalizedCompWithDirectives.slice(1);
                _assertComponent(compMeta);

                // compile styles
                let stylesCompileResults = this._styleCompiler.compileComponent(compMeta);
                stylesCompileResults.externalStylesheets.forEach((compiledStyleSheet) => {
                  outputSourceModules.push(this._codgenStyles(compiledStyleSheet, fileSuffix));
                });

                // compile components
                exportedVars.push(this._compileComponentFactory(compMeta, fileSuffix, statements));
                let pipeMetas = [
                  ...appModulePipes,
                  ...this._metadataResolver.getViewPipesMetadata(compMeta.type.runtime)
                ];
                exportedVars.push(this._compileComponent(
                    compMeta, dirMetas, pipeMetas, stylesCompileResults.componentStylesheet,
                    fileSuffix, statements));
              });
        }))
        .then(() => {
          if (statements.length > 0) {
            outputSourceModules.unshift(this._codegenSourceModule(
                _ngfactoryModuleUrl(moduleUrl), statements, exportedVars));
          }
          return outputSourceModules;
        });
  }

  private _compileAppModule(appModuleType: StaticSymbol, targetStatements: o.Statement[]): string {
    let appModuleMeta = this._metadataResolver.getAppModuleMetadata(appModuleType);
    let appCompileResult = this._appModuleCompiler.compile(appModuleMeta);
    appCompileResult.dependencies.forEach((dep) => {
      dep.placeholder.name = _componentFactoryName(dep.comp);
      dep.placeholder.moduleUrl = _ngfactoryModuleUrl(dep.comp.moduleUrl);
    });
    targetStatements.push(...appCompileResult.statements);
    return appCompileResult.appModuleFactoryVar;
  }

  private _compileComponentFactory(
      compMeta: CompileDirectiveMetadata, fileSuffix: string,
      targetStatements: o.Statement[]): string {
    var hostMeta = createHostComponentMeta(compMeta.type, compMeta.selector);
    var hostViewFactoryVar =
        this._compileComponent(hostMeta, [compMeta], [], null, fileSuffix, targetStatements);
    var compFactoryVar = _componentFactoryName(compMeta.type);
    targetStatements.push(
        o.variable(compFactoryVar)
            .set(o.importExpr(Identifiers.ComponentFactory, [o.importType(compMeta.type)])
                     .instantiate(
                         [
                           o.literal(compMeta.selector), o.variable(hostViewFactoryVar),
                           o.importExpr(compMeta.type)
                         ],
                         o.importType(
                             Identifiers.ComponentFactory, [o.importType(compMeta.type)],
                             [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]));
    return compFactoryVar;
  }

  private _compileComponent(
      compMeta: CompileDirectiveMetadata, directives: CompileDirectiveMetadata[],
      pipes: CompilePipeMetadata[], componentStyles: CompiledStylesheet, fileSuffix: string,
      targetStatements: o.Statement[]): string {
    var parsedTemplate = this._templateParser.parse(
        compMeta, compMeta.template.template, directives, pipes, compMeta.type.name);
    var stylesExpr = componentStyles ? o.variable(componentStyles.stylesVar) : o.literalArr([]);
    var viewResult =
        this._viewCompiler.compileComponent(compMeta, parsedTemplate, stylesExpr, pipes);
    if (componentStyles) {
      ListWrapper.addAll(targetStatements, _resolveStyleStatements(componentStyles, fileSuffix));
    }
    ListWrapper.addAll(targetStatements, _resolveViewStatements(viewResult));
    return viewResult.viewFactoryVar;
  }

  private _codgenStyles(stylesCompileResult: CompiledStylesheet, fileSuffix: string): SourceModule {
    _resolveStyleStatements(stylesCompileResult, fileSuffix);
    return this._codegenSourceModule(
        _stylesModuleUrl(
            stylesCompileResult.meta.moduleUrl, stylesCompileResult.isShimmed, fileSuffix),
        stylesCompileResult.statements, [stylesCompileResult.stylesVar]);
  }

  private _codegenSourceModule(
      moduleUrl: string, statements: o.Statement[], exportedVars: string[]): SourceModule {
    return new SourceModule(
        moduleUrl, this._outputEmitter.emitStatements(moduleUrl, statements, exportedVars));
  }
}

function _resolveViewStatements(compileResult: ViewCompileResult): o.Statement[] {
  compileResult.dependencies.forEach((dep) => {
    if (dep instanceof ViewFactoryDependency) {
      let vfd = <ViewFactoryDependency>dep;
      vfd.placeholder.moduleUrl = _ngfactoryModuleUrl(vfd.comp.moduleUrl);
    } else if (dep instanceof ComponentFactoryDependency) {
      let cfd = <ComponentFactoryDependency>dep;
      cfd.placeholder.name = _componentFactoryName(cfd.comp);
      cfd.placeholder.moduleUrl = _ngfactoryModuleUrl(cfd.comp.moduleUrl);
    }
  });
  return compileResult.statements;
}


function _resolveStyleStatements(
    compileResult: CompiledStylesheet, fileSuffix: string): o.Statement[] {
  compileResult.dependencies.forEach((dep) => {
    dep.valuePlaceholder.moduleUrl = _stylesModuleUrl(dep.moduleUrl, dep.isShimmed, fileSuffix);
  });
  return compileResult.statements;
}

function _ngfactoryModuleUrl(compUrl: string): string {
  var urlWithSuffix = _splitLastSuffix(compUrl);
  return `${urlWithSuffix[0]}.ngfactory${urlWithSuffix[1]}`;
}

function _componentFactoryName(comp: CompileIdentifierMetadata): string {
  return `${comp.name}NgFactory`;
}

function _stylesModuleUrl(stylesheetUrl: string, shim: boolean, suffix: string): string {
  return shim ? `${stylesheetUrl}.shim${suffix}` : `${stylesheetUrl}${suffix}`;
}

function _assertComponent(meta: CompileDirectiveMetadata) {
  if (!meta.isComponent) {
    throw new BaseException(`Could not compile '${meta.type.name}' because it is not a component.`);
  }
}

function _splitLastSuffix(path: string): string[] {
  let lastDot = path.lastIndexOf('.');
  if (lastDot !== -1) {
    return [path.substring(0, lastDot), path.substring(lastDot)];
  } else {
    return [path, ''];
  }
}
