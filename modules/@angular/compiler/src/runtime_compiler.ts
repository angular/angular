/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, ComponentFactory, Injectable, Injector, ModuleWithComponentFactories, NgModuleFactory, SchemaMetadata, Type} from '@angular/core';
import {AnimationCompiler} from './animation/animation_compiler';
import {AnimationParser} from './animation/animation_parser';
import {CompileDirectiveMetadata, CompileIdentifierMetadata, CompileNgModuleMetadata, CompilePipeMetadata, ProviderMeta, createHostComponentMeta} from './compile_metadata';
import {CompilerConfig} from './config';
import {DirectiveNormalizer} from './directive_normalizer';
import {stringify} from './facade/lang';
import {CompileMetadataResolver} from './metadata_resolver';
import {NgModuleCompiler} from './ng_module_compiler';
import * as ir from './output/output_ast';
import {interpretStatements} from './output/output_interpreter';
import {jitStatements} from './output/output_jit';
import {ComponentStillLoadingError} from './private_import_core';
import {CompiledStylesheet, StyleCompiler} from './style_compiler';
import {TemplateParser} from './template_parser/template_parser';
import {SyncAsyncResult} from './util';
import {ComponentFactoryDependency, ViewCompiler, ViewFactoryDependency} from './view_compiler/view_compiler';

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
  private _compiledTemplateCache = new Map<Type<any>, CompiledTemplate>();
  private _compiledHostTemplateCache = new Map<Type<any>, CompiledTemplate>();
  private _compiledNgModuleCache = new Map<Type<any>, NgModuleFactory<any>>();
  private _animationParser = new AnimationParser();
  private _animationCompiler = new AnimationCompiler();

  constructor(
      private _injector: Injector, private _metadataResolver: CompileMetadataResolver,
      private _templateNormalizer: DirectiveNormalizer, private _templateParser: TemplateParser,
      private _styleCompiler: StyleCompiler, private _viewCompiler: ViewCompiler,
      private _ngModuleCompiler: NgModuleCompiler, private _compilerConfig: CompilerConfig) {}

  get injector(): Injector { return this._injector; }

  compileModuleSync<T>(moduleType: Type<T>): NgModuleFactory<T> {
    return this._compileModuleAndComponents(moduleType, true).syncResult;
  }

  compileModuleAsync<T>(moduleType: Type<T>): Promise<NgModuleFactory<T>> {
    return this._compileModuleAndComponents(moduleType, false).asyncResult;
  }

  compileModuleAndAllComponentsSync<T>(moduleType: Type<T>): ModuleWithComponentFactories<T> {
    return this._compileModuleAndAllComponents(moduleType, true).syncResult;
  }

  compileModuleAndAllComponentsAsync<T>(moduleType: Type<T>):
      Promise<ModuleWithComponentFactories<T>> {
    return this._compileModuleAndAllComponents(moduleType, false).asyncResult;
  }

  private _compileModuleAndComponents<T>(moduleType: Type<T>, isSync: boolean):
      SyncAsyncResult<NgModuleFactory<T>> {
    const componentPromise = this._compileComponents(moduleType, isSync);
    const ngModuleFactory = this._compileModule(moduleType);
    return new SyncAsyncResult(ngModuleFactory, componentPromise.then(() => ngModuleFactory));
  }

  private _compileModuleAndAllComponents<T>(moduleType: Type<T>, isSync: boolean):
      SyncAsyncResult<ModuleWithComponentFactories<T>> {
    const componentPromise = this._compileComponents(moduleType, isSync);
    const ngModuleFactory = this._compileModule(moduleType);
    const moduleMeta = this._metadataResolver.getNgModuleMetadata(moduleType);
    const componentFactories: ComponentFactory<any>[] = [];
    const templates = new Set<CompiledTemplate>();
    moduleMeta.transitiveModule.modules.forEach((moduleMeta) => {
      moduleMeta.declaredDirectives.forEach((dirMeta) => {
        if (dirMeta.isComponent) {
          const template = this._createCompiledHostTemplate(dirMeta.type.reference);
          templates.add(template);
          componentFactories.push(template.proxyComponentFactory);
        }
      });
    });
    const syncResult = new ModuleWithComponentFactories(ngModuleFactory, componentFactories);
    // Note: host components themselves can always be compiled synchronously as they have an
    // inline template. However, we still need to wait for the components that they
    // reference to be loaded / compiled.
    const compile = () => {
      templates.forEach((template) => { this._compileTemplate(template); });
      return syncResult;
    };
    const asyncResult = isSync ? Promise.resolve(compile()) : componentPromise.then(compile);
    return new SyncAsyncResult(syncResult, asyncResult);
  }

  private _compileModule<T>(moduleType: Type<T>): NgModuleFactory<T> {
    let ngModuleFactory = this._compiledNgModuleCache.get(moduleType);
    if (!ngModuleFactory) {
      const moduleMeta = this._metadataResolver.getNgModuleMetadata(moduleType);
      // Always provide a bound Compiler
      const extraProviders = [this._metadataResolver.getProviderMetadata(new ProviderMeta(
          Compiler, {useFactory: () => new ModuleBoundCompiler(this, moduleMeta.type.reference)}))];
      var compileResult = this._ngModuleCompiler.compile(moduleMeta, extraProviders);
      compileResult.dependencies.forEach((dep) => {
        dep.placeholder.reference =
            this._assertComponentKnown(dep.comp.reference, true).proxyComponentFactory;
        dep.placeholder.name = `compFactory_${dep.comp.name}`;
      });
      if (!this._compilerConfig.useJit) {
        ngModuleFactory =
            interpretStatements(compileResult.statements, compileResult.ngModuleFactoryVar);
      } else {
        ngModuleFactory = jitStatements(
            `${moduleMeta.type.name}.ngfactory.js`, compileResult.statements,
            compileResult.ngModuleFactoryVar);
      }
      this._compiledNgModuleCache.set(moduleMeta.type.reference, ngModuleFactory);
    }
    return ngModuleFactory;
  }

  /**
   * @internal
   */
  _compileComponents(mainModule: Type<any>, isSync: boolean): Promise<any> {
    const templates = new Set<CompiledTemplate>();
    var loadingPromises: Promise<any>[] = [];

    const ngModule = this._metadataResolver.getNgModuleMetadata(mainModule);
    ngModule.transitiveModule.modules.forEach((localModuleMeta) => {
      localModuleMeta.declaredDirectives.forEach((dirMeta) => {
        if (dirMeta.isComponent) {
          templates.add(this._createCompiledTemplate(dirMeta, localModuleMeta));
          dirMeta.entryComponents.forEach((entryComponentType) => {
            templates.add(this._createCompiledHostTemplate(entryComponentType.reference));
          });
          // TODO: what about entryComponents of entryComponents? maybe skip here and just do the
          // below?
        }
      });
      localModuleMeta.entryComponents.forEach((entryComponentType) => {
        templates.add(this._createCompiledHostTemplate(entryComponentType.reference));
        // TODO: what about entryComponents of entryComponents?
      });
    });
    templates.forEach((template) => {
      if (template.loading) {
        if (isSync) {
          throw new ComponentStillLoadingError(template.compType.reference);
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

  clearCacheFor(type: Type<any>) {
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

  private _createCompiledHostTemplate(compType: Type<any>): CompiledTemplate {
    var compiledTemplate = this._compiledHostTemplateCache.get(compType);
    if (!compiledTemplate) {
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
    var compiledTemplate = this._compiledTemplateCache.get(compMeta.type.reference);
    if (!compiledTemplate) {
      assertComponent(compMeta);
      compiledTemplate = new CompiledTemplate(
          false, compMeta.selector, compMeta.type, ngModule.transitiveModule.directives,
          ngModule.transitiveModule.pipes, ngModule.schemas,
          this._templateNormalizer.normalizeDirective(compMeta));
      this._compiledTemplateCache.set(compMeta.type.reference, compiledTemplate);
    }
    return compiledTemplate;
  }

  private _assertComponentKnown(compType: any, isHost: boolean): CompiledTemplate {
    const compiledTemplate = isHost ? this._compiledHostTemplateCache.get(compType) :
                                      this._compiledTemplateCache.get(compType);
    if (!compiledTemplate) {
      if (isHost) {
        throw new Error(
            `Illegal state: Compiled view for component ${stringify(compType)} does not exist!`);
      } else {
        throw new Error(
            `Component ${stringify(compType)} is not part of any NgModule or the module has not been imported into your module.`);
      }
    }
    return compiledTemplate;
  }

  private _assertComponentLoaded(compType: any, isHost: boolean): CompiledTemplate {
    const compiledTemplate = this._assertComponentKnown(compType, isHost);
    if (compiledTemplate.loading) {
      throw new Error(
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
    const parsedAnimations = this._animationParser.parseComponent(compMeta);
    const parsedTemplate = this._templateParser.parse(
        compMeta, compMeta.template.template, template.viewDirectives.concat(viewCompMetas),
        template.viewPipes, template.schemas, compMeta.type.name);
    const compiledAnimations =
        this._animationCompiler.compile(compMeta.type.name, parsedAnimations);
    const compileResult = this._viewCompiler.compileComponent(
        compMeta, parsedTemplate, ir.variable(stylesCompileResult.componentStylesheet.stylesVar),
        template.viewPipes, compiledAnimations);
    compileResult.dependencies.forEach((dep) => {
      let depTemplate: CompiledTemplate;
      if (dep instanceof ViewFactoryDependency) {
        let vfd = <ViewFactoryDependency>dep;
        depTemplate = this._assertComponentLoaded(vfd.comp.reference, false);
        vfd.placeholder.reference = depTemplate.proxyViewFactory;
        vfd.placeholder.name = `viewFactory_${vfd.comp.name}`;
      } else if (dep instanceof ComponentFactoryDependency) {
        let cfd = <ComponentFactoryDependency>dep;
        depTemplate = this._assertComponentLoaded(cfd.comp.reference, true);
        cfd.placeholder.reference = depTemplate.proxyComponentFactory;
        cfd.placeholder.name = `compFactory_${cfd.comp.name}`;
      }
    });
    const statements =
        stylesCompileResult.componentStylesheet.statements.concat(compileResult.statements);
    compiledAnimations.forEach(
        entry => { entry.statements.forEach(statement => { statements.push(statement); }); });
    let factory: any;
    if (!this._compilerConfig.useJit) {
      factory = interpretStatements(statements, compileResult.viewFactoryVar);
    } else {
      factory = jitStatements(
          `${template.compType.name}${template.isHost?'_Host':''}.ngfactory.js`, statements,
          compileResult.viewFactoryVar);
    }
    template.compiled(factory);
  }

  private _resolveStylesCompileResult(
      result: CompiledStylesheet, externalStylesheetsByModuleUrl: Map<string, CompiledStylesheet>) {
    result.dependencies.forEach((dep, i) => {
      var nestedCompileResult = externalStylesheetsByModuleUrl.get(dep.moduleUrl);
      var nestedStylesArr = this._resolveAndEvalStylesCompileResult(
          nestedCompileResult, externalStylesheetsByModuleUrl);
      dep.valuePlaceholder.reference = nestedStylesArr;
      dep.valuePlaceholder.name = `importedStyles${i}`;
    });
  }

  private _resolveAndEvalStylesCompileResult(
      result: CompiledStylesheet,
      externalStylesheetsByModuleUrl: Map<string, CompiledStylesheet>): string[] {
    this._resolveStylesCompileResult(result, externalStylesheetsByModuleUrl);
    if (!this._compilerConfig.useJit) {
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
  viewComponentTypes: Type<any>[] = [];
  viewDirectives: CompileDirectiveMetadata[] = [];

  constructor(
      public isHost: boolean, selector: string, public compType: CompileIdentifierMetadata,
      viewDirectivesAndComponents: CompileDirectiveMetadata[],
      public viewPipes: CompilePipeMetadata[], public schemas: SchemaMetadata[],
      _normalizeResult: SyncAsyncResult<CompileDirectiveMetadata>) {
    viewDirectivesAndComponents.forEach((dirMeta) => {
      if (dirMeta.isComponent) {
        this.viewComponentTypes.push(dirMeta.type.reference);
      } else {
        this.viewDirectives.push(dirMeta);
      }
    });
    this.proxyViewFactory = (...args: any[]) => {
      if (!this._viewFactory) {
        throw new Error(
            `Illegal state: CompiledTemplate for ${stringify(this.compType)} is not compiled yet!`);
      }
      return this._viewFactory.apply(null, args);
    };
    this.proxyComponentFactory = isHost ?
        new ComponentFactory<any>(selector, this.proxyViewFactory, compType.reference) :
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
      throw new Error(`Template is still loading for ${this.compType.name}!`);
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
    throw new Error(`Could not compile '${meta.type.name}' because it is not a component.`);
  }
}

/**
 * Implements `Compiler` by delegating to the RuntimeCompiler using a known module.
 */
class ModuleBoundCompiler implements Compiler {
  constructor(private _delegate: RuntimeCompiler, private _ngModule: Type<any>) {}

  get _injector(): Injector { return this._delegate.injector; }

  compileModuleSync<T>(moduleType: Type<T>): NgModuleFactory<T> {
    return this._delegate.compileModuleSync(moduleType);
  }

  compileModuleAsync<T>(moduleType: Type<T>): Promise<NgModuleFactory<T>> {
    return this._delegate.compileModuleAsync(moduleType);
  }
  compileModuleAndAllComponentsSync<T>(moduleType: Type<T>): ModuleWithComponentFactories<T> {
    return this._delegate.compileModuleAndAllComponentsSync(moduleType);
  }

  compileModuleAndAllComponentsAsync<T>(moduleType: Type<T>):
      Promise<ModuleWithComponentFactories<T>> {
    return this._delegate.compileModuleAndAllComponentsAsync(moduleType);
  }

  /**
   * Clears all caches
   */
  clearCache(): void { this._delegate.clearCache(); }

  /**
   * Clears the cache for the given component/ngModule.
   */
  clearCacheFor(type: Type<any>) { this._delegate.clearCacheFor(type); }
}
