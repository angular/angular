/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AppModuleFactory, AppModuleMetadata, Compiler, ComponentFactory, ComponentResolver, ComponentStillLoadingError, Injectable, Injector, OptionalMetadata, Provider, SkipSelfMetadata} from '@angular/core';

import {BaseException} from '../src/facade/exceptions';
import {ConcreteType, IS_DART, Type, isBlank, isString, stringify} from '../src/facade/lang';

import {ListWrapper,} from '../src/facade/collection';
import {PromiseWrapper} from '../src/facade/async';
import {createHostComponentMeta, CompileDirectiveMetadata, CompilePipeMetadata, CompileIdentifierMetadata} from './compile_metadata';
import {TemplateAst,} from './template_ast';
import {StyleCompiler, StylesCompileDependency, CompiledStylesheet} from './style_compiler';
import {ViewCompiler, ViewCompileResult, ViewFactoryDependency, ComponentFactoryDependency} from './view_compiler/view_compiler';
import {AppModuleCompiler} from './app_module_compiler';
import {TemplateParser} from './template_parser';
import {DirectiveNormalizer} from './directive_normalizer';
import {CompileMetadataResolver} from './metadata_resolver';
import {CompilerConfig} from './config';
import * as ir from './output/output_ast';
import {jitStatements} from './output/output_jit';
import {interpretStatements} from './output/output_interpreter';
import {SyncAsyncResult} from './util';

/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 *
 * @security  When compiling templates at runtime, you must ensure that the entire template comes
 * from a trusted source. Attacker-controlled data introduced by a template could expose your
 * application to XSS risks.  For more detail, see the [Security Guide](http://g.co/ng/security).
 */
@Injectable()
export class RuntimeCompiler implements ComponentResolver, Compiler {
  private _compiledTemplateCache = new Map<Type, CompiledTemplate>();
  private _compiledHostTemplateCache = new Map<Type, CompiledTemplate>();
  private _compiledAppModuleCache = new Map<Type, AppModuleFactory<any>>();

  constructor(
      private _injector: Injector, private _metadataResolver: CompileMetadataResolver,
      private _templateNormalizer: DirectiveNormalizer, private _templateParser: TemplateParser,
      private _styleCompiler: StyleCompiler, private _viewCompiler: ViewCompiler,
      private _appModuleCompiler: AppModuleCompiler, private _genConfig: CompilerConfig) {}

  get injector(): Injector { return this._injector; }

  resolveComponent(component: Type|string): Promise<ComponentFactory<any>> {
    if (isString(component)) {
      return PromiseWrapper.reject(
          new BaseException(`Cannot resolve component using '${component}'.`), null);
    }
    return this.compileComponentAsync(<ConcreteType<any>>component);
  }

  compileAppModuleSync<T>(moduleType: ConcreteType<T>, metadata: AppModuleMetadata = null):
      AppModuleFactory<T> {
    return this._compileAppModule(moduleType, true, metadata).syncResult;
  }

  compileAppModuleAsync<T>(moduleType: ConcreteType<T>, metadata: AppModuleMetadata = null):
      Promise<AppModuleFactory<T>> {
    return this._compileAppModule(moduleType, false, metadata).asyncResult;
  }

  private _compileAppModule<T>(
      moduleType: ConcreteType<T>, isSync: boolean,
      metadata: AppModuleMetadata = null): SyncAsyncResult<AppModuleFactory<T>> {
    // Only cache if we read the metadata via the reflector,
    // as we use the moduleType as cache key.
    let useCache = !metadata;
    let appModuleFactory = this._compiledAppModuleCache.get(moduleType);
    let componentCompilePromises: Promise<any>[] = [];
    if (!appModuleFactory || !useCache) {
      var compileModuleMeta = this._metadataResolver.getAppModuleMetadata(moduleType, metadata);
      let boundCompilerFactory = (parentResolver: ComponentResolver) => new BoundCompiler(
          this, compileModuleMeta.directives.map(dir => dir.type.runtime),
          compileModuleMeta.pipes.map((pipe) => pipe.type.runtime), parentResolver);
      // Always provide a bound Compiler and ComponentResolver
      compileModuleMeta.providers.push(
          this._metadataResolver.getProviderMetadata(new Provider(Compiler, {
            useFactory: boundCompilerFactory,
            deps: [[new OptionalMetadata(), new SkipSelfMetadata(), ComponentResolver]]
          })));
      compileModuleMeta.providers.push(this._metadataResolver.getProviderMetadata(
          new Provider(ComponentResolver, {useExisting: Compiler})));
      var compileResult = this._appModuleCompiler.compile(compileModuleMeta);
      compileResult.dependencies.forEach((dep) => {
        let compileResult = this._compileComponent(
            dep.comp.runtime, isSync,
            compileModuleMeta.directives.map(compileType => <any>compileType.runtime),
            compileModuleMeta.pipes.map(compileType => <any>compileType.runtime));
        dep.placeholder.runtime = compileResult.syncResult;
        componentCompilePromises.push(compileResult.asyncResult);
        dep.placeholder.name = `compFactory_${dep.comp.name}`;
      });
      if (IS_DART || !this._genConfig.useJit) {
        appModuleFactory =
            interpretStatements(compileResult.statements, compileResult.appModuleFactoryVar);
      } else {
        appModuleFactory = jitStatements(
            `${compileModuleMeta.type.name}.ngfactory.js`, compileResult.statements,
            compileResult.appModuleFactoryVar);
      }
      if (useCache) {
        this._compiledAppModuleCache.set(moduleType, appModuleFactory);
      }
    }
    return new SyncAsyncResult(
        appModuleFactory, Promise.all(componentCompilePromises).then(() => appModuleFactory));
  }

  compileComponentAsync<T>(compType: ConcreteType<T>): Promise<ComponentFactory<T>> {
    return this._compileComponent(compType, false, [], []).asyncResult;
  }

  compileComponentSync<T>(compType: ConcreteType<T>): ComponentFactory<T> {
    return this._compileComponent(compType, true, [], []).syncResult;
  }

  /**
   * @internal
   */
  _compileComponent<T>(
      compType: ConcreteType<T>, isSync: boolean, moduleDirectives: ConcreteType<any>[],
      modulePipes: ConcreteType<any>[]): SyncAsyncResult<ComponentFactory<T>> {
    var templates =
        this._getTransitiveCompiledTemplates(compType, true, moduleDirectives, modulePipes);
    var loadingPromises: Promise<any>[] = [];
    templates.forEach((template) => {
      if (template.loading) {
        if (isSync) {
          throw new ComponentStillLoadingError(template.compType.runtime);
        } else {
          loadingPromises.push(template.loading);
        }
      }
    });
    let compile = () => { templates.forEach((template) => { this._compileTemplate(template); }); };
    if (isSync) {
      compile();
    }
    let result = this._compiledHostTemplateCache.get(compType).proxyComponentFactory;
    return new SyncAsyncResult(result, Promise.all(loadingPromises).then(() => {
      compile();
      return result;
    }));
  }

  clearCacheFor(type: Type) {
    this._compiledAppModuleCache.delete(type);
    this._metadataResolver.clearCacheFor(type);
    this._compiledHostTemplateCache.delete(type);
    var compiledTemplate = this._compiledTemplateCache.get(type);
    if (compiledTemplate) {
      this._templateNormalizer.clearCacheFor(compiledTemplate.normalizedCompMeta);
      this._compiledTemplateCache.delete(type);
    }
  }

  clearCache(): void {
    this._metadataResolver.clearCache();
    this._compiledTemplateCache.clear();
    this._compiledHostTemplateCache.clear();
    this._templateNormalizer.clearCache();
    this._compiledAppModuleCache.clear();
  }

  private _createCompiledHostTemplate(type: Type): CompiledTemplate {
    var compiledTemplate = this._compiledHostTemplateCache.get(type);
    if (isBlank(compiledTemplate)) {
      var compMeta = this._metadataResolver.getDirectiveMetadata(type);
      assertComponent(compMeta);
      var hostMeta = createHostComponentMeta(compMeta.type, compMeta.selector);
      compiledTemplate = new CompiledTemplate(
          true, compMeta.selector, compMeta.type, [], [type], [], [],
          this._templateNormalizer.normalizeDirective(hostMeta));
      this._compiledHostTemplateCache.set(type, compiledTemplate);
    }
    return compiledTemplate;
  }

  private _createCompiledTemplate(
      type: Type, moduleDirectives: ConcreteType<any>[],
      modulePipes: ConcreteType<any>[]): CompiledTemplate {
    var compiledTemplate = this._compiledTemplateCache.get(type);
    if (isBlank(compiledTemplate)) {
      var compMeta = this._metadataResolver.getDirectiveMetadata(type);
      assertComponent(compMeta);
      var viewDirectives: CompileDirectiveMetadata[] = [];
      moduleDirectives.forEach(
          (type) => viewDirectives.push(this._metadataResolver.getDirectiveMetadata(type)));
      var viewComponentTypes: Type[] = [];
      this._metadataResolver.getViewDirectivesMetadata(type).forEach(dirOrComp => {
        if (dirOrComp.isComponent) {
          viewComponentTypes.push(dirOrComp.type.runtime);
        } else {
          viewDirectives.push(dirOrComp);
        }
      });
      var precompileComponentTypes = compMeta.precompile.map((typeMeta) => typeMeta.runtime);
      var pipes = [
        ...modulePipes.map((type) => this._metadataResolver.getPipeMetadata(type)),
        ...this._metadataResolver.getViewPipesMetadata(type)
      ];
      compiledTemplate = new CompiledTemplate(
          false, compMeta.selector, compMeta.type, viewDirectives, viewComponentTypes,
          precompileComponentTypes, pipes, this._templateNormalizer.normalizeDirective(compMeta));
      this._compiledTemplateCache.set(type, compiledTemplate);
    }
    return compiledTemplate;
  }

  private _getTransitiveCompiledTemplates(
      compType: Type, isHost: boolean, moduleDirectives: ConcreteType<any>[],
      modulePipes: ConcreteType<any>[],
      target: Set<CompiledTemplate> = new Set<CompiledTemplate>()): Set<CompiledTemplate> {
    var template = isHost ? this._createCompiledHostTemplate(compType) :
                            this._createCompiledTemplate(compType, moduleDirectives, modulePipes);
    if (!target.has(template)) {
      target.add(template);
      template.viewComponentTypes.forEach((compType) => {
        this._getTransitiveCompiledTemplates(
            compType, false, moduleDirectives, modulePipes, target);
      });
      template.precompileHostComponentTypes.forEach((compType) => {
        this._getTransitiveCompiledTemplates(compType, true, moduleDirectives, modulePipes, target);
      });
    }
    return target;
  }

  private _compileTemplate(template: CompiledTemplate) {
    if (template.isCompiled) {
      return;
    }
    var compMeta = template.normalizedCompMeta;
    var externalStylesheetsByModuleUrl = new Map<string, CompiledStylesheet>();
    var stylesCompileResult = this._styleCompiler.compileComponent(compMeta);
    stylesCompileResult.externalStylesheets.forEach(
        (r) => { externalStylesheetsByModuleUrl.set(r.meta.moduleUrl, r); });
    this._resolveStylesCompileResult(
        stylesCompileResult.componentStylesheet, externalStylesheetsByModuleUrl);
    var viewCompMetas = template.viewComponentTypes.map(
        (compType) => this._compiledTemplateCache.get(compType).normalizedCompMeta);
    var parsedTemplate = this._templateParser.parse(
        compMeta, compMeta.template.template, template.viewDirectives.concat(viewCompMetas),
        template.viewPipes, compMeta.type.name);
    var compileResult = this._viewCompiler.compileComponent(
        compMeta, parsedTemplate, ir.variable(stylesCompileResult.componentStylesheet.stylesVar),
        template.viewPipes);
    var depTemplates = compileResult.dependencies.map((dep) => {
      let depTemplate: CompiledTemplate;
      if (dep instanceof ViewFactoryDependency) {
        let vfd = <ViewFactoryDependency>dep;
        depTemplate = this._compiledTemplateCache.get(vfd.comp.runtime);
        vfd.placeholder.runtime = depTemplate.proxyViewFactory;
        vfd.placeholder.name = `viewFactory_${vfd.comp.name}`;
      } else if (dep instanceof ComponentFactoryDependency) {
        let cfd = <ComponentFactoryDependency>dep;
        depTemplate = this._compiledHostTemplateCache.get(cfd.comp.runtime);
        cfd.placeholder.runtime = depTemplate.proxyComponentFactory;
        cfd.placeholder.name = `compFactory_${cfd.comp.name}`;
      }
      return depTemplate;
    });
    var statements =
        stylesCompileResult.componentStylesheet.statements.concat(compileResult.statements);
    var factory: any;
    if (IS_DART || !this._genConfig.useJit) {
      factory = interpretStatements(statements, compileResult.viewFactoryVar);
    } else {
      factory = jitStatements(
          `${template.compType.name}.ngfactory.js`, statements, compileResult.viewFactoryVar);
    }
    template.compiled(factory);
  }

  private _resolveStylesCompileResult(
      result: CompiledStylesheet, externalStylesheetsByModuleUrl: Map<string, CompiledStylesheet>) {
    result.dependencies.forEach((dep, i) => {
      var nestedCompileResult = externalStylesheetsByModuleUrl.get(dep.moduleUrl);
      var nestedStylesArr = this._resolveAndEvalStylesCompileResult(
          nestedCompileResult, externalStylesheetsByModuleUrl);
      dep.valuePlaceholder.runtime = nestedStylesArr;
      dep.valuePlaceholder.name = `importedStyles${i}`;
    });
  }

  private _resolveAndEvalStylesCompileResult(
      result: CompiledStylesheet,
      externalStylesheetsByModuleUrl: Map<string, CompiledStylesheet>): string[] {
    this._resolveStylesCompileResult(result, externalStylesheetsByModuleUrl);
    if (IS_DART || !this._genConfig.useJit) {
      return interpretStatements(result.statements, result.stylesVar);
    } else {
      return jitStatements(`${result.meta.moduleUrl}.css.js`, result.statements, result.stylesVar);
    }
  }
}

class CompiledTemplate {
  private _viewFactory: Function = null;
  proxyViewFactory: Function;
  proxyComponentFactory: ComponentFactory<any>;
  loading: Promise<any> = null;
  private _normalizedCompMeta: CompileDirectiveMetadata = null;
  isCompiled = false;
  isCompiledWithDeps = false;

  constructor(
      public isHost: boolean, selector: string, public compType: CompileIdentifierMetadata,
      public viewDirectives: CompileDirectiveMetadata[], public viewComponentTypes: Type[],
      public precompileHostComponentTypes: Type[], public viewPipes: CompilePipeMetadata[],
      _normalizeResult: SyncAsyncResult<CompileDirectiveMetadata>) {
    this.proxyViewFactory = (...args: any[]) => this._viewFactory.apply(null, args);
    this.proxyComponentFactory = isHost ?
        new ComponentFactory<any>(selector, this.proxyViewFactory, compType.runtime) :
        null;
    if (_normalizeResult.syncResult) {
      this._normalizedCompMeta = _normalizeResult.syncResult;
    } else {
      this.loading = _normalizeResult.asyncResult.then((normalizedCompMeta) => {
        this._normalizedCompMeta = normalizedCompMeta;
        this.loading = null;
      });
    }
  }

  get normalizedCompMeta(): CompileDirectiveMetadata {
    if (this.loading) {
      throw new BaseException(`Template is still loading for ${this.compType.name}!`);
    }
    return this._normalizedCompMeta;
  }

  compiled(viewFactory: Function) {
    this._viewFactory = viewFactory;
    this.isCompiled = true;
  }

  depsCompiled() { this.isCompiledWithDeps = true; }
}

function assertComponent(meta: CompileDirectiveMetadata) {
  if (!meta.isComponent) {
    throw new BaseException(`Could not compile '${meta.type.name}' because it is not a component.`);
  }
}

/**
 * A wrapper around `Compiler` and `ComponentResolver` that
 * provides default patform directives / pipes.
 */
class BoundCompiler implements Compiler, ComponentResolver {
  constructor(
      private _delegate: RuntimeCompiler, private _directives: any[], private _pipes: any[],
      private _parentComponentResolver: ComponentResolver) {}

  get injector(): Injector { return this._delegate.injector; }

  resolveComponent(component: Type|string): Promise<ComponentFactory<any>> {
    if (isString(component)) {
      if (this._parentComponentResolver) {
        return this._parentComponentResolver.resolveComponent(component);
      } else {
        return PromiseWrapper.reject(
            new BaseException(`Cannot resolve component using '${component}'.`), null);
      }
    }
    return this.compileComponentAsync(<ConcreteType<any>>component);
  }

  compileComponentAsync<T>(compType: ConcreteType<T>): Promise<ComponentFactory<T>> {
    return this._delegate._compileComponent(compType, false, this._directives, this._pipes)
        .asyncResult;
  }

  compileComponentSync<T>(compType: ConcreteType<T>): ComponentFactory<T> {
    return this._delegate._compileComponent(compType, true, this._directives, this._pipes)
        .syncResult;
  }

  compileAppModuleSync<T>(moduleType: ConcreteType<T>, metadata: AppModuleMetadata = null):
      AppModuleFactory<T> {
    return this._delegate.compileAppModuleSync(moduleType, metadata);
  }

  compileAppModuleAsync<T>(moduleType: ConcreteType<T>, metadata: AppModuleMetadata = null):
      Promise<AppModuleFactory<T>> {
    return this._delegate.compileAppModuleAsync(moduleType, metadata);
  }

  /**
   * Clears all caches
   */
  clearCache(): void {
    this._delegate.clearCache();
    if (this._parentComponentResolver) {
      this._parentComponentResolver.clearCache();
    }
  }

  /**
   * Clears the cache for the given component/appModule.
   */
  clearCacheFor(type: Type) { this._delegate.clearCacheFor(type); }
}