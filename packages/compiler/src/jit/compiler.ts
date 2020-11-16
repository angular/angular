/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompileIdentifierMetadata, CompileNgModuleMetadata, CompilePipeSummary, CompileProviderMetadata, CompileStylesheetMetadata, CompileTypeSummary, identifierName, ngModuleJitUrl, ProviderMeta, ProxyClass, sharedStylesheetJitUrl, templateJitUrl, templateSourceUrl} from '../compile_metadata';
import {CompileReflector} from '../compile_reflector';
import {CompilerConfig} from '../config';
import {ConstantPool} from '../constant_pool';
import {Type} from '../core';
import {CompileMetadataResolver} from '../metadata_resolver';
import {NgModuleCompiler} from '../ng_module_compiler';
import * as ir from '../output/output_ast';
import {interpretStatements} from '../output/output_interpreter';
import {JitEvaluator} from '../output/output_jit';
import {CompiledStylesheet, StyleCompiler} from '../style_compiler';
import {SummaryResolver} from '../summary_resolver';
import {TemplateAst} from '../template_parser/template_ast';
import {TemplateParser} from '../template_parser/template_parser';
import {Console, OutputContext, stringify, SyncAsync} from '../util';
import {ViewCompiler} from '../view_compiler/view_compiler';

export interface ModuleWithComponentFactories {
  ngModuleFactory: object;
  componentFactories: object[];
}

/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 *
 * @security  When compiling templates at runtime, you must ensure that the entire template comes
 * from a trusted source. Attacker-controlled data introduced by a template could expose your
 * application to XSS risks.  For more detail, see the [Security Guide](https://g.co/ng/security).
 */
export class JitCompiler {
  private _compiledTemplateCache = new Map<Type, CompiledTemplate>();
  private _compiledHostTemplateCache = new Map<Type, CompiledTemplate>();
  private _compiledDirectiveWrapperCache = new Map<Type, Type>();
  private _compiledNgModuleCache = new Map<Type, object>();
  private _sharedStylesheetCount = 0;
  private _addedAotSummaries = new Set<() => any[]>();

  constructor(
      private _metadataResolver: CompileMetadataResolver, private _templateParser: TemplateParser,
      private _styleCompiler: StyleCompiler, private _viewCompiler: ViewCompiler,
      private _ngModuleCompiler: NgModuleCompiler, private _summaryResolver: SummaryResolver<Type>,
      private _reflector: CompileReflector, private _jitEvaluator: JitEvaluator,
      private _compilerConfig: CompilerConfig, private _console: Console,
      private getExtraNgModuleProviders: (ngModule: any) => CompileProviderMetadata[]) {}

  compileModuleSync(moduleType: Type): object {
    return SyncAsync.assertSync(this._compileModuleAndComponents(moduleType, true));
  }

  compileModuleAsync(moduleType: Type): Promise<object> {
    return Promise.resolve(this._compileModuleAndComponents(moduleType, false));
  }

  compileModuleAndAllComponentsSync(moduleType: Type): ModuleWithComponentFactories {
    return SyncAsync.assertSync(this._compileModuleAndAllComponents(moduleType, true));
  }

  compileModuleAndAllComponentsAsync(moduleType: Type): Promise<ModuleWithComponentFactories> {
    return Promise.resolve(this._compileModuleAndAllComponents(moduleType, false));
  }

  getComponentFactory(component: Type): object {
    const summary = this._metadataResolver.getDirectiveSummary(component);
    return summary.componentFactory as object;
  }

  loadAotSummaries(summaries: () => any[]) {
    this.clearCache();
    this._addAotSummaries(summaries);
  }

  private _addAotSummaries(fn: () => any[]) {
    if (this._addedAotSummaries.has(fn)) {
      return;
    }
    this._addedAotSummaries.add(fn);
    const summaries = fn();
    for (let i = 0; i < summaries.length; i++) {
      const entry = summaries[i];
      if (typeof entry === 'function') {
        this._addAotSummaries(entry);
      } else {
        const summary = entry as CompileTypeSummary;
        this._summaryResolver.addSummary(
            {symbol: summary.type.reference, metadata: null, type: summary});
      }
    }
  }

  hasAotSummary(ref: Type) {
    return !!this._summaryResolver.resolveSummary(ref);
  }

  private _filterJitIdentifiers(ids: CompileIdentifierMetadata[]): any[] {
    return ids.map(mod => mod.reference).filter((ref) => !this.hasAotSummary(ref));
  }

  private _compileModuleAndComponents(moduleType: Type, isSync: boolean): SyncAsync<object> {
    return SyncAsync.then(this._loadModules(moduleType, isSync), () => {
      this._compileComponents(moduleType, null);
      return this._compileModule(moduleType);
    });
  }

  private _compileModuleAndAllComponents(moduleType: Type, isSync: boolean):
      SyncAsync<ModuleWithComponentFactories> {
    return SyncAsync.then(this._loadModules(moduleType, isSync), () => {
      const componentFactories: object[] = [];
      this._compileComponents(moduleType, componentFactories);
      return {
        ngModuleFactory: this._compileModule(moduleType),
        componentFactories: componentFactories
      };
    });
  }

  private _loadModules(mainModule: any, isSync: boolean): SyncAsync<any> {
    const loading: Promise<any>[] = [];
    const mainNgModule = this._metadataResolver.getNgModuleMetadata(mainModule)!;
    // Note: for runtime compilation, we want to transitively compile all modules,
    // so we also need to load the declared directives / pipes for all nested modules.
    this._filterJitIdentifiers(mainNgModule.transitiveModule.modules).forEach((nestedNgModule) => {
      // getNgModuleMetadata only returns null if the value passed in is not an NgModule
      const moduleMeta = this._metadataResolver.getNgModuleMetadata(nestedNgModule)!;
      this._filterJitIdentifiers(moduleMeta.declaredDirectives).forEach((ref) => {
        const promise =
            this._metadataResolver.loadDirectiveMetadata(moduleMeta.type.reference, ref, isSync);
        if (promise) {
          loading.push(promise);
        }
      });
      this._filterJitIdentifiers(moduleMeta.declaredPipes)
          .forEach((ref) => this._metadataResolver.getOrLoadPipeMetadata(ref));
    });
    return SyncAsync.all(loading);
  }

  private _compileModule(moduleType: Type): object {
    let ngModuleFactory = this._compiledNgModuleCache.get(moduleType)!;
    if (!ngModuleFactory) {
      const moduleMeta = this._metadataResolver.getNgModuleMetadata(moduleType)!;
      // Always provide a bound Compiler
      const extraProviders = this.getExtraNgModuleProviders(moduleMeta.type.reference);
      const outputCtx = createOutputContext();
      const compileResult = this._ngModuleCompiler.compile(outputCtx, moduleMeta, extraProviders);
      ngModuleFactory = this._interpretOrJit(
          ngModuleJitUrl(moduleMeta), outputCtx.statements)[compileResult.ngModuleFactoryVar];
      this._compiledNgModuleCache.set(moduleMeta.type.reference, ngModuleFactory);
    }
    return ngModuleFactory;
  }

  /**
   * @internal
   */
  _compileComponents(mainModule: Type, allComponentFactories: object[]|null) {
    const ngModule = this._metadataResolver.getNgModuleMetadata(mainModule)!;
    const moduleByJitDirective = new Map<any, CompileNgModuleMetadata>();
    const templates = new Set<CompiledTemplate>();

    const transJitModules = this._filterJitIdentifiers(ngModule.transitiveModule.modules);
    transJitModules.forEach((localMod) => {
      const localModuleMeta = this._metadataResolver.getNgModuleMetadata(localMod)!;
      this._filterJitIdentifiers(localModuleMeta.declaredDirectives).forEach((dirRef) => {
        moduleByJitDirective.set(dirRef, localModuleMeta);
        const dirMeta = this._metadataResolver.getDirectiveMetadata(dirRef);
        if (dirMeta.isComponent) {
          templates.add(this._createCompiledTemplate(dirMeta, localModuleMeta));
          if (allComponentFactories) {
            const template =
                this._createCompiledHostTemplate(dirMeta.type.reference, localModuleMeta);
            templates.add(template);
            allComponentFactories.push(dirMeta.componentFactory as object);
          }
        }
      });
    });
    transJitModules.forEach((localMod) => {
      const localModuleMeta = this._metadataResolver.getNgModuleMetadata(localMod)!;
      this._filterJitIdentifiers(localModuleMeta.declaredDirectives).forEach((dirRef) => {
        const dirMeta = this._metadataResolver.getDirectiveMetadata(dirRef);
        if (dirMeta.isComponent) {
          dirMeta.entryComponents.forEach((entryComponentType) => {
            const moduleMeta = moduleByJitDirective.get(entryComponentType.componentType)!;
            templates.add(
                this._createCompiledHostTemplate(entryComponentType.componentType, moduleMeta));
          });
        }
      });
      localModuleMeta.entryComponents.forEach((entryComponentType) => {
        if (!this.hasAotSummary(entryComponentType.componentType)) {
          const moduleMeta = moduleByJitDirective.get(entryComponentType.componentType)!;
          templates.add(
              this._createCompiledHostTemplate(entryComponentType.componentType, moduleMeta));
        }
      });
    });
    templates.forEach((template) => this._compileTemplate(template));
  }

  clearCacheFor(type: Type) {
    this._compiledNgModuleCache.delete(type);
    this._metadataResolver.clearCacheFor(type);
    this._compiledHostTemplateCache.delete(type);
    const compiledTemplate = this._compiledTemplateCache.get(type);
    if (compiledTemplate) {
      this._compiledTemplateCache.delete(type);
    }
  }

  clearCache(): void {
    // Note: don't clear the _addedAotSummaries, as they don't change!
    this._metadataResolver.clearCache();
    this._compiledTemplateCache.clear();
    this._compiledHostTemplateCache.clear();
    this._compiledNgModuleCache.clear();
  }

  private _createCompiledHostTemplate(compType: Type, ngModule: CompileNgModuleMetadata):
      CompiledTemplate {
    if (!ngModule) {
      throw new Error(`Component ${
          stringify(
              compType)} is not part of any NgModule or the module has not been imported into your module.`);
    }
    let compiledTemplate = this._compiledHostTemplateCache.get(compType);
    if (!compiledTemplate) {
      const compMeta = this._metadataResolver.getDirectiveMetadata(compType);
      assertComponent(compMeta);

      const hostMeta = this._metadataResolver.getHostComponentMetadata(
          compMeta, (compMeta.componentFactory as any).viewDefFactory);
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
    const outputContext = createOutputContext();
    const componentStylesheet = this._styleCompiler.compileComponent(outputContext, compMeta);
    compMeta.template !.externalStylesheets.forEach((stylesheetMeta) => {
      const compiledStylesheet =
          this._styleCompiler.compileStyles(createOutputContext(), compMeta, stylesheetMeta);
      externalStylesheetsByModuleUrl.set(stylesheetMeta.moduleUrl!, compiledStylesheet);
    });
    this._resolveStylesCompileResult(componentStylesheet, externalStylesheetsByModuleUrl);
    const pipes = template.ngModule.transitiveModule.pipes.map(
        pipe => this._metadataResolver.getPipeSummary(pipe.reference));
    const {template: parsedTemplate, pipes: usedPipes} =
        this._parseTemplate(compMeta, template.ngModule, template.directives);
    const compileResult = this._viewCompiler.compileComponent(
        outputContext, compMeta, parsedTemplate, ir.variable(componentStylesheet.stylesVar),
        usedPipes);
    const evalResult = this._interpretOrJit(
        templateJitUrl(template.ngModule.type, template.compMeta), outputContext.statements);
    const viewClass = evalResult[compileResult.viewClassVar];
    const rendererType = evalResult[compileResult.rendererTypeVar];
    template.compiled(viewClass, rendererType);
  }

  private _parseTemplate(
      compMeta: CompileDirectiveMetadata, ngModule: CompileNgModuleMetadata,
      directiveIdentifiers: CompileIdentifierMetadata[]):
      {template: TemplateAst[], pipes: CompilePipeSummary[]} {
    // Note: ! is ok here as components always have a template.
    const preserveWhitespaces = compMeta.template !.preserveWhitespaces;
    const directives =
        directiveIdentifiers.map(dir => this._metadataResolver.getDirectiveSummary(dir.reference));
    const pipes = ngModule.transitiveModule.pipes.map(
        pipe => this._metadataResolver.getPipeSummary(pipe.reference));
    return this._templateParser.parse(
        compMeta, compMeta.template !.htmlAst!, directives, pipes, ngModule.schemas,
        templateSourceUrl(ngModule.type, compMeta, compMeta.template !), preserveWhitespaces);
  }

  private _resolveStylesCompileResult(
      result: CompiledStylesheet, externalStylesheetsByModuleUrl: Map<string, CompiledStylesheet>) {
    result.dependencies.forEach((dep, i) => {
      const nestedCompileResult = externalStylesheetsByModuleUrl.get(dep.moduleUrl)!;
      const nestedStylesArr = this._resolveAndEvalStylesCompileResult(
          nestedCompileResult, externalStylesheetsByModuleUrl);
      dep.setValue(nestedStylesArr);
    });
  }

  private _resolveAndEvalStylesCompileResult(
      result: CompiledStylesheet,
      externalStylesheetsByModuleUrl: Map<string, CompiledStylesheet>): string[] {
    this._resolveStylesCompileResult(result, externalStylesheetsByModuleUrl);
    return this._interpretOrJit(
        sharedStylesheetJitUrl(result.meta, this._sharedStylesheetCount++),
        result.outputCtx.statements)[result.stylesVar];
  }

  private _interpretOrJit(sourceUrl: string, statements: ir.Statement[]): any {
    if (!this._compilerConfig.useJit) {
      return interpretStatements(statements, this._reflector);
    } else {
      return this._jitEvaluator.evaluateStatements(
          sourceUrl, statements, this._reflector, this._compilerConfig.jitDevMode);
    }
  }
}

class CompiledTemplate {
  private _viewClass: Function = null!;
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

function createOutputContext(): OutputContext {
  const importExpr = (symbol: any) =>
      ir.importExpr({name: identifierName(symbol), moduleName: null, runtime: symbol});
  return {statements: [], genFilePath: '', importExpr, constantPool: new ConstantPool()};
}
