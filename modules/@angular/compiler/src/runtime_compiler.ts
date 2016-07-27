/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, ComponentFactory, ComponentResolver, ComponentStillLoadingError, Injectable, Injector, NgModule, NgModuleFactory, NgModuleMetadata, OptionalMetadata, Provider, SchemaMetadata, SkipSelfMetadata} from '@angular/core';

import {Console} from '../core_private';
import {BaseException} from '../src/facade/exceptions';
import {ConcreteType, IS_DART, Type, isBlank, isString, stringify} from '../src/facade/lang';

import {ListWrapper,} from '../src/facade/collection';
import {PromiseWrapper} from '../src/facade/async';
import {createHostComponentMeta, CompileDirectiveMetadata, CompilePipeMetadata, CompileIdentifierMetadata, CompileNgModuleMetadata} from './compile_metadata';
import {TemplateAst,} from './template_ast';
import {StyleCompiler, StylesCompileDependency, CompiledStylesheet} from './style_compiler';
import {ViewCompiler, ViewCompileResult, ViewFactoryDependency, ComponentFactoryDependency} from './view_compiler/view_compiler';
import {NgModuleCompiler} from './ng_module_compiler';
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
export class RuntimeCompiler implements Compiler {
  private _compiledTemplateCache = new Map<Type, CompiledTemplate>();
  private _compiledHostTemplateCache = new Map<Type, CompiledTemplate>();
  private _compiledNgModuleCache = new Map<Type, NgModuleFactory<any>>();

  constructor(
      private __injector: Injector, private _metadataResolver: CompileMetadataResolver,
      private _templateNormalizer: DirectiveNormalizer, private _templateParser: TemplateParser,
      private _styleCompiler: StyleCompiler, private _viewCompiler: ViewCompiler,
      private _ngModuleCompiler: NgModuleCompiler, private _compilerConfig: CompilerConfig,
      private _console: Console) {}

  get _injector(): Injector { return this.__injector; }

  compileModuleSync<T>(moduleType: ConcreteType<T>): NgModuleFactory<T> {
    return this._compileModuleAndComponents(moduleType, true).syncResult;
  }

  compileModuleAsync<T>(moduleType: ConcreteType<T>): Promise<NgModuleFactory<T>> {
    return this._compileModuleAndComponents(moduleType, false).asyncResult;
  }

  compileComponentAsync<T>(compType: ConcreteType<T>, ngModule: ConcreteType<any> = null):
      Promise<ComponentFactory<T>> {
    if (!ngModule) {
      throw new BaseException(
          `Calling compileComponentAsync on the root compiler without a module is not allowed! (Compiling component ${stringify(compType)})`);
    }
    return this._compileComponentInModule(compType, false, ngModule).asyncResult;
  }

  compileComponentSync<T>(compType: ConcreteType<T>, ngModule: ConcreteType<any> = null):
      ComponentFactory<T> {
    if (!ngModule) {
      throw new BaseException(
          `Calling compileComponentSync on the root compiler without a module is not allowed! (Compiling component ${stringify(compType)})`);
    }
    return this._compileComponentInModule(compType, true, ngModule).syncResult;
  }

  private _compileModuleAndComponents<T>(moduleType: ConcreteType<T>, isSync: boolean):
      SyncAsyncResult<NgModuleFactory<T>> {
    const componentPromise = this._compileComponents(moduleType, isSync);
    const ngModuleFactory = this._compileModule(moduleType);
    return new SyncAsyncResult(ngModuleFactory, componentPromise.then(() => ngModuleFactory));
  }

  private _compileModule<T>(moduleType: ConcreteType<T>): NgModuleFactory<T> {
    let ngModuleFactory = this._compiledNgModuleCache.get(moduleType);
    if (!ngModuleFactory) {
      const moduleMeta = this._metadataResolver.getNgModuleMetadata(moduleType);
      const transitiveModuleMeta = moduleMeta.transitiveModule;
      let boundCompilerFactory = (parentResolver: ComponentResolver) =>
          new ModuleBoundCompiler(this, moduleMeta.type.runtime, parentResolver, this._console);
      // Always provide a bound Compiler and ComponentResolver
      const extraProviders = [
        this._metadataResolver.getProviderMetadata(new Provider(Compiler, {
          useFactory: boundCompilerFactory,
          deps: [[new OptionalMetadata(), new SkipSelfMetadata(), ComponentResolver]]
        })),
        this._metadataResolver.getProviderMetadata(
            new Provider(ComponentResolver, {useExisting: Compiler}))
      ];
      var compileResult = this._ngModuleCompiler.compile(moduleMeta, extraProviders);
      compileResult.dependencies.forEach((dep) => {
        dep.placeholder.runtime =
            this._assertComponentKnown(dep.comp.runtime, true).proxyComponentFactory;
        dep.placeholder.name = `compFactory_${dep.comp.name}`;
      });
      if (IS_DART || !this._compilerConfig.useJit) {
        ngModuleFactory =
            interpretStatements(compileResult.statements, compileResult.ngModuleFactoryVar);
      } else {
        ngModuleFactory = jitStatements(
            `${moduleMeta.type.name}.ngfactory.js`, compileResult.statements,
            compileResult.ngModuleFactoryVar);
      }
      this._compiledNgModuleCache.set(moduleMeta.type.runtime, ngModuleFactory);
    }
    return ngModuleFactory;
  }

  private _compileComponentInModule<T>(
      compType: ConcreteType<T>, isSync: boolean,
      moduleType: ConcreteType<any>): SyncAsyncResult<ComponentFactory<T>> {
    this._metadataResolver.addComponentToModule(moduleType, compType);

    const componentPromise = this._compileComponents(moduleType, isSync);
    const componentFactory: ComponentFactory<T> =
        this._assertComponentKnown(compType, true).proxyComponentFactory;

    return new SyncAsyncResult(componentFactory, componentPromise.then(() => componentFactory));
  }

  /**
   * @internal
   */
  _compileComponents(mainModule: Type, isSync: boolean): Promise<any> {
    const templates = new Set<CompiledTemplate>();
    var loadingPromises: Promise<any>[] = [];

    const ngModule = this._metadataResolver.getNgModuleMetadata(mainModule);
    ngModule.transitiveModule.modules.forEach((localModuleMeta) => {
      localModuleMeta.declaredDirectives.forEach((dirMeta) => {
        if (dirMeta.isComponent) {
          templates.add(this._createCompiledTemplate(dirMeta, localModuleMeta));
          dirMeta.entryComponents.forEach((entryComponentType) => {
            templates.add(this._createCompiledHostTemplate(entryComponentType.runtime));
          });
        }
      });
      localModuleMeta.entryComponents.forEach((entryComponentType) => {
        templates.add(this._createCompiledHostTemplate(entryComponentType.runtime));
      });
    });
    templates.forEach((template) => {
      if (template.loading) {
        if (isSync) {
          throw new ComponentStillLoadingError(template.compType.runtime);
        } else {
          loadingPromises.push(template.loading);
        }
      }
    });
    const compile =
        () => { templates.forEach((template) => { this._compileTemplate(template); }); };
    if (isSync) {
      compile();
      return Promise.resolve(null);
    } else {
      return Promise.all(loadingPromises).then(compile);
    }
  }

  clearCacheFor(type: Type) {
    this._compiledNgModuleCache.delete(type);
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
    this._compiledNgModuleCache.clear();
  }

  private _createCompiledHostTemplate(compType: Type): CompiledTemplate {
    var compiledTemplate = this._compiledHostTemplateCache.get(compType);
    if (isBlank(compiledTemplate)) {
      var compMeta = this._metadataResolver.getDirectiveMetadata(compType);
      assertComponent(compMeta);
      var hostMeta = createHostComponentMeta(compMeta);
      compiledTemplate = new CompiledTemplate(
          true, compMeta.selector, compMeta.type, [compMeta], [], [],
          this._templateNormalizer.normalizeDirective(hostMeta));
      this._compiledHostTemplateCache.set(compType, compiledTemplate);
    }
    return compiledTemplate;
  }

  private _createCompiledTemplate(
      compMeta: CompileDirectiveMetadata, ngModule: CompileNgModuleMetadata): CompiledTemplate {
    var compiledTemplate = this._compiledTemplateCache.get(compMeta.type.runtime);
    if (isBlank(compiledTemplate)) {
      assertComponent(compMeta);
      compiledTemplate = new CompiledTemplate(
          false, compMeta.selector, compMeta.type, ngModule.transitiveModule.directives,
          ngModule.transitiveModule.pipes, ngModule.schemas,
          this._templateNormalizer.normalizeDirective(compMeta));
      this._compiledTemplateCache.set(compMeta.type.runtime, compiledTemplate);
    }
    return compiledTemplate;
  }

  private _assertComponentKnown(compType: any, isHost: boolean): CompiledTemplate {
    const compiledTemplate = isHost ? this._compiledHostTemplateCache.get(compType) :
                                      this._compiledTemplateCache.get(compType);
    if (!compiledTemplate) {
      throw new BaseException(
          `Illegal state: CompiledTemplate for ${stringify(compType)} (isHost: ${isHost}) does not exist!`);
    }
    return compiledTemplate;
  }

  private _assertComponentLoaded(compType: any, isHost: boolean): CompiledTemplate {
    const compiledTemplate = this._assertComponentKnown(compType, isHost);
    if (compiledTemplate.loading) {
      throw new BaseException(
          `Illegal state: CompiledTemplate for ${stringify(compType)} (isHost: ${isHost}) is still loading!`);
    }
    return compiledTemplate;
  }

  private _compileTemplate(template: CompiledTemplate) {
    if (template.isCompiled) {
      return;
    }
    const compMeta = template.normalizedCompMeta;
    const externalStylesheetsByModuleUrl = new Map<string, CompiledStylesheet>();
    const stylesCompileResult = this._styleCompiler.compileComponent(compMeta);
    stylesCompileResult.externalStylesheets.forEach(
        (r) => { externalStylesheetsByModuleUrl.set(r.meta.moduleUrl, r); });
    this._resolveStylesCompileResult(
        stylesCompileResult.componentStylesheet, externalStylesheetsByModuleUrl);
    const viewCompMetas = template.viewComponentTypes.map(
        (compType) => this._assertComponentLoaded(compType, false).normalizedCompMeta);
    const parsedTemplate = this._templateParser.parse(
        compMeta, compMeta.template.template, template.viewDirectives.concat(viewCompMetas),
        template.viewPipes, template.schemas, compMeta.type.name);
    const compileResult = this._viewCompiler.compileComponent(
        compMeta, parsedTemplate, ir.variable(stylesCompileResult.componentStylesheet.stylesVar),
        template.viewPipes);
    compileResult.dependencies.forEach((dep) => {
      let depTemplate: CompiledTemplate;
      if (dep instanceof ViewFactoryDependency) {
        let vfd = <ViewFactoryDependency>dep;
        depTemplate = this._assertComponentLoaded(vfd.comp.runtime, false);
        vfd.placeholder.runtime = depTemplate.proxyViewFactory;
        vfd.placeholder.name = `viewFactory_${vfd.comp.name}`;
      } else if (dep instanceof ComponentFactoryDependency) {
        let cfd = <ComponentFactoryDependency>dep;
        depTemplate = this._assertComponentLoaded(cfd.comp.runtime, true);
        cfd.placeholder.runtime = depTemplate.proxyComponentFactory;
        cfd.placeholder.name = `compFactory_${cfd.comp.name}`;
      }
    });
    const statements =
        stylesCompileResult.componentStylesheet.statements.concat(compileResult.statements);
    let factory: any;
    if (IS_DART || !this._compilerConfig.useJit) {
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
    if (IS_DART || !this._compilerConfig.useJit) {
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
  viewComponentTypes: Type[] = [];
  viewDirectives: CompileDirectiveMetadata[] = [];

  constructor(
      public isHost: boolean, selector: string, public compType: CompileIdentifierMetadata,
      viewDirectivesAndComponents: CompileDirectiveMetadata[],
      public viewPipes: CompilePipeMetadata[], public schemas: SchemaMetadata[],
      _normalizeResult: SyncAsyncResult<CompileDirectiveMetadata>) {
    viewDirectivesAndComponents.forEach((dirMeta) => {
      if (dirMeta.isComponent) {
        this.viewComponentTypes.push(dirMeta.type.runtime);
      } else {
        this.viewDirectives.push(dirMeta);
      }
    });
    this.proxyViewFactory = (...args: any[]) => {
      if (!this._viewFactory) {
        throw new BaseException(
            `Illegal state: CompiledTemplate for ${stringify(this.compType)} is not compiled yet!`);
      }
      return this._viewFactory.apply(null, args);
    };
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
 * Implements `Compiler` and `ComponentResolver` by delegating
 * to the RuntimeCompiler using a known module.
 */
class ModuleBoundCompiler implements Compiler, ComponentResolver {
  private _warnOnComponentResolver = true;

  constructor(
      private _delegate: RuntimeCompiler, private _ngModule: ConcreteType<any>,
      private _parentComponentResolver: ComponentResolver, private _console: Console) {}

  get _injector(): Injector { return this._delegate._injector; }

  resolveComponent(component: Type|string): Promise<ComponentFactory<any>> {
    if (isString(component)) {
      if (this._parentComponentResolver) {
        return this._parentComponentResolver.resolveComponent(component);
      } else {
        return PromiseWrapper.reject(
            new BaseException(`Cannot resolve component using '${component}'.`), null);
      }
    }
    if (this._warnOnComponentResolver) {
      this._console.warn(ComponentResolver.DynamicCompilationDeprecationMsg);
      this._warnOnComponentResolver = false;
    }
    return this.compileComponentAsync(<ConcreteType<any>>component);
  }

  compileComponentAsync<T>(compType: ConcreteType<T>, ngModule: ConcreteType<any> = null):
      Promise<ComponentFactory<T>> {
    return this._delegate.compileComponentAsync(compType, ngModule ? ngModule : this._ngModule);
  }

  compileComponentSync<T>(compType: ConcreteType<T>, ngModule: ConcreteType<any> = null):
      ComponentFactory<T> {
    return this._delegate.compileComponentSync(compType, ngModule ? ngModule : this._ngModule);
  }

  compileModuleSync<T>(moduleType: ConcreteType<T>): NgModuleFactory<T> {
    return this._delegate.compileModuleSync(moduleType);
  }

  compileModuleAsync<T>(moduleType: ConcreteType<T>): Promise<NgModuleFactory<T>> {
    return this._delegate.compileModuleAsync(moduleType);
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
   * Clears the cache for the given component/ngModule.
   */
  clearCacheFor(type: Type) { this._delegate.clearCacheFor(type); }
}
