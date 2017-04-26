/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, ComponentFactory, Inject, Injector, ModuleWithComponentFactories, NgModuleFactory, Type, ɵConsole as Console, ɵgetComponentViewDefinitionFactory as getComponentViewDefinitionFactory, ɵstringify as stringify} from '@angular/core';

import {CompileDirectiveMetadata, CompileIdentifierMetadata, CompileNgModuleMetadata, CompileStylesheetMetadata, CompileTypeSummary, ProviderMeta, ProxyClass, createHostComponentMeta, identifierName, ngModuleJitUrl, sharedStylesheetJitUrl, templateJitUrl, templateSourceUrl} from '../compile_metadata';
import {CompilerConfig} from '../config';
import {CompilerInjectable} from '../injectable';
import {CompileMetadataResolver} from '../metadata_resolver';
import {NgModuleCompiler} from '../ng_module_compiler';
import * as ir from '../output/output_ast';
import {interpretStatements} from '../output/output_interpreter';
import {jitStatements} from '../output/output_jit';
import {CompiledStylesheet, StyleCompiler} from '../style_compiler';
import {SummaryResolver} from '../summary_resolver';
import {TemplateParser} from '../template_parser/template_parser';
import {SyncAsyncResult} from '../util';
import {ViewCompiler} from '../view_compiler/view_compiler';



/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 *
 * @security  When compiling templates at runtime, you must ensure that the entire template comes
 * from a trusted source. Attacker-controlled data introduced by a template could expose your
 * application to XSS risks.  For more detail, see the [Security Guide](http://g.co/ng/security).
 */
@CompilerInjectable()
export class JitCompiler implements Compiler {
  private _compiledTemplateCache = new Map<Type<any>, CompiledTemplate>();
  private _compiledHostTemplateCache = new Map<Type<any>, CompiledTemplate>();
  private _compiledDirectiveWrapperCache = new Map<Type<any>, Type<any>>();
  private _compiledNgModuleCache = new Map<Type<any>, NgModuleFactory<any>>();
  private _sharedStylesheetCount = 0;

  constructor(
      private _injector: Injector, private _metadataResolver: CompileMetadataResolver,
      private _templateParser: TemplateParser, private _styleCompiler: StyleCompiler,
      private _viewCompiler: ViewCompiler, private _ngModuleCompiler: NgModuleCompiler,
      private _summaryResolver: SummaryResolver<Type<any>>, private _compilerConfig: CompilerConfig,
      private _console: Console) {}

  get injector(): Injector { return this._injector; }

  compileModuleSync<T>(moduleType: Type<T>): NgModuleFactory<T> {
    return this._compileModuleAndComponents(moduleType, true).syncResult !;
  }

  compileModuleAsync<T>(moduleType: Type<T>): Promise<NgModuleFactory<T>> {
    return this._compileModuleAndComponents(moduleType, false).asyncResult !;
  }

  compileModuleAndAllComponentsSync<T>(moduleType: Type<T>): ModuleWithComponentFactories<T> {
    return this._compileModuleAndAllComponents(moduleType, true).syncResult !;
  }

  compileModuleAndAllComponentsAsync<T>(moduleType: Type<T>):
      Promise<ModuleWithComponentFactories<T>> {
    return this._compileModuleAndAllComponents(moduleType, false).asyncResult !;
  }

  getNgContentSelectors(component: Type<any>): string[] {
    this._console.warn(
        'Compiler.getNgContentSelectors is deprecated. Use ComponentFactory.ngContentSelectors instead!');
    const template = this._compiledTemplateCache.get(component);
    if (!template) {
      throw new Error(`The component ${stringify(component)} is not yet compiled!`);
    }
    return template.compMeta.template !.ngContentSelectors;
  }

  getComponentFactory<T>(component: Type<T>): ComponentFactory<T> {
    const summary = this._metadataResolver.getDirectiveSummary(component);
    return <ComponentFactory<T>>summary.componentFactory;
  }

  loadAotSummaries(summaries: () => any[]) {
    this.clearCache();
    flattenSummaries(summaries).forEach((summary) => {
      this._summaryResolver.addSummary(
          {symbol: summary.type.reference, metadata: null, type: summary});
    });
  }

  hasAotSummary(ref: Type<any>) { return !!this._summaryResolver.resolveSummary(ref); }

  private _filterJitIdentifiers(ids: CompileIdentifierMetadata[]): any[] {
    return ids.map(mod => mod.reference).filter((ref) => !this.hasAotSummary(ref));
  }

  private _compileModuleAndComponents<T>(moduleType: Type<T>, isSync: boolean):
      SyncAsyncResult<NgModuleFactory<T>> {
    const loadingPromise = this._loadModules(moduleType, isSync);
    const createResult = () => {
      this._compileComponents(moduleType, null);
      return this._compileModule(moduleType);
    };
    if (isSync) {
      return new SyncAsyncResult(createResult());
    } else {
      return new SyncAsyncResult(null, loadingPromise.then(createResult));
    }
  }

  private _compileModuleAndAllComponents<T>(moduleType: Type<T>, isSync: boolean):
      SyncAsyncResult<ModuleWithComponentFactories<T>> {
    const loadingPromise = this._loadModules(moduleType, isSync);
    const createResult = () => {
      const componentFactories: ComponentFactory<any>[] = [];
      this._compileComponents(moduleType, componentFactories);
      return new ModuleWithComponentFactories(this._compileModule(moduleType), componentFactories);
    };
    if (isSync) {
      return new SyncAsyncResult(createResult());
    } else {
      return new SyncAsyncResult(null, loadingPromise.then(createResult));
    }
  }

  private _loadModules(mainModule: any, isSync: boolean): Promise<any> {
    const loadingPromises: Promise<any>[] = [];
    const mainNgModule = this._metadataResolver.getNgModuleMetadata(mainModule) !;
    // Note: for runtime compilation, we want to transitively compile all modules,
    // so we also need to load the declared directives / pipes for all nested modules.
    this._filterJitIdentifiers(mainNgModule.transitiveModule.modules).forEach((nestedNgModule) => {
      // getNgModuleMetadata only returns null if the value passed in is not an NgModule
      const moduleMeta = this._metadataResolver.getNgModuleMetadata(nestedNgModule) !;
      this._filterJitIdentifiers(moduleMeta.declaredDirectives).forEach((ref) => {
        const promise =
            this._metadataResolver.loadDirectiveMetadata(moduleMeta.type.reference, ref, isSync);
        if (promise) {
          loadingPromises.push(promise);
        }
      });
      this._filterJitIdentifiers(moduleMeta.declaredPipes)
          .forEach((ref) => this._metadataResolver.getOrLoadPipeMetadata(ref));
    });
    return Promise.all(loadingPromises);
  }

  private _compileModule<T>(moduleType: Type<T>): NgModuleFactory<T> {
    let ngModuleFactory = this._compiledNgModuleCache.get(moduleType) !;
    if (!ngModuleFactory) {
      const moduleMeta = this._metadataResolver.getNgModuleMetadata(moduleType) !;
      // Always provide a bound Compiler
      const extraProviders = [this._metadataResolver.getProviderMetadata(new ProviderMeta(
          Compiler, {useFactory: () => new ModuleBoundCompiler(this, moduleMeta.type.reference)}))];
      const compileResult = this._ngModuleCompiler.compile(moduleMeta, extraProviders);
      if (!this._compilerConfig.useJit) {
        ngModuleFactory =
            interpretStatements(compileResult.statements, [compileResult.ngModuleFactoryVar])[0];
      } else {
        ngModuleFactory = jitStatements(
            ngModuleJitUrl(moduleMeta), compileResult.statements,
            [compileResult.ngModuleFactoryVar])[0];
      }
      this._compiledNgModuleCache.set(moduleMeta.type.reference, ngModuleFactory);
    }
    return ngModuleFactory;
  }

  /**
   * @internal
   */
  _compileComponents(mainModule: Type<any>, allComponentFactories: ComponentFactory<any>[]|null) {
    const ngModule = this._metadataResolver.getNgModuleMetadata(mainModule) !;
    const moduleByJitDirective = new Map<any, CompileNgModuleMetadata>();
    const templates = new Set<CompiledTemplate>();

    const transJitModules = this._filterJitIdentifiers(ngModule.transitiveModule.modules);
    transJitModules.forEach((localMod) => {
      const localModuleMeta = this._metadataResolver.getNgModuleMetadata(localMod) !;
      this._filterJitIdentifiers(localModuleMeta.declaredDirectives).forEach((dirRef) => {
        moduleByJitDirective.set(dirRef, localModuleMeta);
        const dirMeta = this._metadataResolver.getDirectiveMetadata(dirRef);
        if (dirMeta.isComponent) {
          templates.add(this._createCompiledTemplate(dirMeta, localModuleMeta));
          if (allComponentFactories) {
            const template =
                this._createCompiledHostTemplate(dirMeta.type.reference, localModuleMeta);
            templates.add(template);
            allComponentFactories.push(<ComponentFactory<any>>dirMeta.componentFactory);
          }
        }
      });
    });
    transJitModules.forEach((localMod) => {
      const localModuleMeta = this._metadataResolver.getNgModuleMetadata(localMod) !;
      this._filterJitIdentifiers(localModuleMeta.declaredDirectives).forEach((dirRef) => {
        const dirMeta = this._metadataResolver.getDirectiveMetadata(dirRef);
        if (dirMeta.isComponent) {
          dirMeta.entryComponents.forEach((entryComponentType) => {
            const moduleMeta = moduleByJitDirective.get(entryComponentType.componentType) !;
            templates.add(
                this._createCompiledHostTemplate(entryComponentType.componentType, moduleMeta));
          });
        }
      });
      localModuleMeta.entryComponents.forEach((entryComponentType) => {
        if (!this.hasAotSummary(entryComponentType.componentType.reference)) {
          const moduleMeta = moduleByJitDirective.get(entryComponentType.componentType) !;
          templates.add(
              this._createCompiledHostTemplate(entryComponentType.componentType, moduleMeta));
        }
      });
    });
    templates.forEach((template) => this._compileTemplate(template));
  }

  clearCacheFor(type: Type<any>) {
    this._compiledNgModuleCache.delete(type);
    this._metadataResolver.clearCacheFor(type);
    this._compiledHostTemplateCache.delete(type);
    const compiledTemplate = this._compiledTemplateCache.get(type);
    if (compiledTemplate) {
      this._compiledTemplateCache.delete(type);
    }
  }

  clearCache(): void {
    this._metadataResolver.clearCache();
    this._compiledTemplateCache.clear();
    this._compiledHostTemplateCache.clear();
    this._compiledNgModuleCache.clear();
  }

  private _createCompiledHostTemplate(compType: Type<any>, ngModule: CompileNgModuleMetadata):
      CompiledTemplate {
    if (!ngModule) {
      throw new Error(
          `Component ${stringify(compType)} is not part of any NgModule or the module has not been imported into your module.`);
    }
    let compiledTemplate = this._compiledHostTemplateCache.get(compType);
    if (!compiledTemplate) {
      const compMeta = this._metadataResolver.getDirectiveMetadata(compType);
      assertComponent(compMeta);

      const componentFactory = <ComponentFactory<any>>compMeta.componentFactory;
      const hostClass = this._metadataResolver.getHostComponentType(compType);
      const hostMeta = createHostComponentMeta(
          hostClass, compMeta, <any>getComponentViewDefinitionFactory(componentFactory));
      compiledTemplate =
          new CompiledTemplate(true, compMeta.type, hostMeta, ngModule, [compMeta.type]);
      this._compiledHostTemplateCache.set(compType, compiledTemplate);
    }
    return compiledTemplate;
  }

  private _createCompiledTemplate(
      compMeta: CompileDirectiveMetadata, ngModule: CompileNgModuleMetadata): CompiledTemplate {
    let compiledTemplate = this._compiledTemplateCache.get(compMeta.type.reference);
    if (!compiledTemplate) {
      assertComponent(compMeta);
      compiledTemplate = new CompiledTemplate(
          false, compMeta.type, compMeta, ngModule, ngModule.transitiveModule.directives);
      this._compiledTemplateCache.set(compMeta.type.reference, compiledTemplate);
    }
    return compiledTemplate;
  }

  private _compileTemplate(template: CompiledTemplate) {
    if (template.isCompiled) {
      return;
    }
    const compMeta = template.compMeta;
    const externalStylesheetsByModuleUrl = new Map<string, CompiledStylesheet>();
    const stylesCompileResult = this._styleCompiler.compileComponent(compMeta);
    stylesCompileResult.externalStylesheets.forEach(
        (r) => { externalStylesheetsByModuleUrl.set(r.meta.moduleUrl !, r); });
    this._resolveStylesCompileResult(
        stylesCompileResult.componentStylesheet, externalStylesheetsByModuleUrl);
    const directives =
        template.directives.map(dir => this._metadataResolver.getDirectiveSummary(dir.reference));
    const pipes = template.ngModule.transitiveModule.pipes.map(
        pipe => this._metadataResolver.getPipeSummary(pipe.reference));
    const {template: parsedTemplate, pipes: usedPipes} = this._templateParser.parse(
        compMeta, compMeta.template !.template !, directives, pipes, template.ngModule.schemas,
        templateSourceUrl(template.ngModule.type, template.compMeta, template.compMeta.template !));
    const compileResult = this._viewCompiler.compileComponent(
        compMeta, parsedTemplate, ir.variable(stylesCompileResult.componentStylesheet.stylesVar),
        usedPipes);
    const statements =
        stylesCompileResult.componentStylesheet.statements.concat(compileResult.statements);
    let viewClassAndRendererTypeVars = compMeta.isHost ?
        [compileResult.viewClassVar] :
        [compileResult.viewClassVar, compileResult.rendererTypeVar];
    let viewClass: any;
    let rendererType: any;
    if (!this._compilerConfig.useJit) {
      [viewClass, rendererType] = interpretStatements(statements, viewClassAndRendererTypeVars);
    } else {
      [viewClass, rendererType] = jitStatements(
          templateJitUrl(template.ngModule.type, template.compMeta), statements,
          viewClassAndRendererTypeVars);
    }
    template.compiled(viewClass, rendererType);
  }

  private _resolveStylesCompileResult(
      result: CompiledStylesheet, externalStylesheetsByModuleUrl: Map<string, CompiledStylesheet>) {
    result.dependencies.forEach((dep, i) => {
      const nestedCompileResult = externalStylesheetsByModuleUrl.get(dep.moduleUrl) !;
      const nestedStylesArr = this._resolveAndEvalStylesCompileResult(
          nestedCompileResult, externalStylesheetsByModuleUrl);
      dep.valuePlaceholder.reference = nestedStylesArr;
    });
  }

  private _resolveAndEvalStylesCompileResult(
      result: CompiledStylesheet,
      externalStylesheetsByModuleUrl: Map<string, CompiledStylesheet>): string[] {
    this._resolveStylesCompileResult(result, externalStylesheetsByModuleUrl);
    if (!this._compilerConfig.useJit) {
      return interpretStatements(result.statements, [result.stylesVar])[0];
    } else {
      return jitStatements(
          sharedStylesheetJitUrl(result.meta, this._sharedStylesheetCount++), result.statements,
          [result.stylesVar])[0];
    }
  }
}

class CompiledTemplate {
  private _viewClass: Function = null !;
  isCompiled = false;

  constructor(
      public isHost: boolean, public compType: CompileIdentifierMetadata,
      public compMeta: CompileDirectiveMetadata, public ngModule: CompileNgModuleMetadata,
      public directives: CompileIdentifierMetadata[]) {}

  compiled(viewClass: Function, rendererType: any) {
    this._viewClass = viewClass;
    (<ProxyClass>this.compMeta.componentViewType).setDelegate(viewClass);
    for (let prop in rendererType) {
      (<any>this.compMeta.rendererType)[prop] = rendererType[prop];
    }
    this.isCompiled = true;
  }
}

function assertComponent(meta: CompileDirectiveMetadata) {
  if (!meta.isComponent) {
    throw new Error(
        `Could not compile '${identifierName(meta.type)}' because it is not a component.`);
  }
}

/**
 * Implements `Compiler` by delegating to the JitCompiler using a known module.
 */
class ModuleBoundCompiler implements Compiler {
  constructor(private _delegate: JitCompiler, private _ngModule: Type<any>) {}

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

  getNgContentSelectors(component: Type<any>): string[] {
    return this._delegate.getNgContentSelectors(component);
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


function flattenSummaries(fn: () => any[], out: CompileTypeSummary[] = []): CompileTypeSummary[] {
  fn().forEach((entry) => {
    if (typeof entry === 'function') {
      flattenSummaries(entry, out);
    } else {
      out.push(entry);
    }
  });
  return out;
}
