/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, ComponentFactory, ComponentResolver, Injectable} from '@angular/core';

import {BaseException} from '../src/facade/exceptions';
import {ConcreteType, IS_DART, Type, isBlank, isString, stringify} from '../src/facade/lang';

import {ListWrapper,} from '../src/facade/collection';
import {PromiseWrapper} from '../src/facade/async';
import {createHostComponentMeta, CompileDirectiveMetadata, CompilePipeMetadata, CompileIdentifierMetadata} from './compile_metadata';
import {TemplateAst,} from './template_ast';
import {StyleCompiler, StylesCompileDependency, CompiledStylesheet} from './style_compiler';
import {ViewCompiler, ViewCompileResult, ViewFactoryDependency, ComponentFactoryDependency} from './view_compiler/view_compiler';
import {TemplateParser} from './template_parser';
import {DirectiveNormalizer, NormalizeDirectiveResult} from './directive_normalizer';
import {CompileMetadataResolver} from './metadata_resolver';
import {CompilerConfig} from './config';
import * as ir from './output/output_ast';
import {jitStatements} from './output/output_jit';
import {interpretStatements} from './output/output_interpreter';
import {InterpretiveAppViewInstanceFactory} from './output/interpretive_view';

/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 */
@Injectable()
export class RuntimeCompiler implements ComponentResolver, Compiler {
  private _compiledTemplateCache = new Map<any, CompiledTemplate>();
  private _compiledHostTemplateCache = new Map<any, CompiledTemplate>();

  constructor(
      private _metadataResolver: CompileMetadataResolver,
      private _templateNormalizer: DirectiveNormalizer, private _templateParser: TemplateParser,
      private _styleCompiler: StyleCompiler, private _viewCompiler: ViewCompiler,
      private _genConfig: CompilerConfig) {}

  resolveComponent(component: Type|string): Promise<ComponentFactory<any>> {
    if (isString(component)) {
      return PromiseWrapper.reject(
          new BaseException(`Cannot resolve component using '${component}'.`), null);
    }
    return this.compileComponentAsync(<ConcreteType<any>>component);
  }

  compileComponentAsync<T>(compType: ConcreteType<T>): Promise<ComponentFactory<T>> {
    var templates = this._getTransitiveCompiledTemplates(compType, true);
    var loadingPromises: Promise<any>[] = [];
    templates.forEach((template) => {
      if (template.loading) {
        loadingPromises.push(template.loading);
      }
    });
    return Promise.all(loadingPromises).then(() => {
      templates.forEach((template) => { this._compileTemplate(template); });
      return this._getCompiledHostTemplate(compType).proxyComponentFactory;
    });
  }

  compileComponentSync<T>(compType: ConcreteType<T>): ComponentFactory<T> {
    var templates = this._getTransitiveCompiledTemplates(compType, true);
    templates.forEach((template) => {
      if (template.loading) {
        throw new BaseException(
            `Can't compile synchronously as ${template.compType.name} is still being loaded!`);
      }
    });
    templates.forEach((template) => { this._compileTemplate(template); });
    return this._getCompiledHostTemplate(compType).proxyComponentFactory;
  }

  clearCacheFor(compType: Type) {
    this._metadataResolver.clearCacheFor(compType);
    this._compiledHostTemplateCache.delete(compType);
    var compiledTemplate = this._compiledTemplateCache.get(compType);
    if (compiledTemplate) {
      this._templateNormalizer.clearCacheFor(compiledTemplate.normalizedCompMeta);
      this._compiledTemplateCache.delete(compType);
    }
  }

  clearCache(): void {
    this._metadataResolver.clearCache();
    this._compiledTemplateCache.clear();
    this._compiledHostTemplateCache.clear();
    this._templateNormalizer.clearCache();
  }

  private _getCompiledHostTemplate(type: Type): CompiledTemplate {
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

  private _getCompiledTemplate(type: Type): CompiledTemplate {
    var compiledTemplate = this._compiledTemplateCache.get(type);
    if (isBlank(compiledTemplate)) {
      var compMeta = this._metadataResolver.getDirectiveMetadata(type);
      assertComponent(compMeta);
      var viewDirectives: CompileDirectiveMetadata[] = [];
      var viewComponentTypes: Type[] = [];
      this._metadataResolver.getViewDirectivesMetadata(type).forEach(dirOrComp => {
        if (dirOrComp.isComponent) {
          viewComponentTypes.push(dirOrComp.type.runtime);
        } else {
          viewDirectives.push(dirOrComp);
        }
      });
      var precompileComponentTypes = compMeta.precompile.map((typeMeta) => typeMeta.runtime);
      var pipes = this._metadataResolver.getViewPipesMetadata(type);
      compiledTemplate = new CompiledTemplate(
          false, compMeta.selector, compMeta.type, viewDirectives, viewComponentTypes,
          precompileComponentTypes, pipes, this._templateNormalizer.normalizeDirective(compMeta));
      this._compiledTemplateCache.set(type, compiledTemplate);
    }
    return compiledTemplate;
  }

  private _getTransitiveCompiledTemplates(
      compType: Type, isHost: boolean,
      target: Set<CompiledTemplate> = new Set<CompiledTemplate>()): Set<CompiledTemplate> {
    var template =
        isHost ? this._getCompiledHostTemplate(compType) : this._getCompiledTemplate(compType);
    if (!target.has(template)) {
      target.add(template);
      template.viewComponentTypes.forEach(
          (compType) => { this._getTransitiveCompiledTemplates(compType, false, target); });
      template.precompileHostComponentTypes.forEach(
          (compType) => { this._getTransitiveCompiledTemplates(compType, true, target); });
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
        (compType) => this._getCompiledTemplate(compType).normalizedCompMeta);
    var parsedTemplate = this._templateParser.parse(
        compMeta, compMeta.template.template, template.viewDirectives.concat(viewCompMetas),
        template.viewPipes, compMeta.type.name);
    var compileResult = this._viewCompiler.compileComponent(
        compMeta, parsedTemplate, ir.variable(stylesCompileResult.componentStylesheet.stylesVar),
        template.viewPipes);
    var depTemplates = compileResult.dependencies.map((dep) => {
      let depTemplate: CompiledTemplate;
      if (dep instanceof ViewFactoryDependency) {
        depTemplate = this._getCompiledTemplate(dep.comp.runtime);
        dep.placeholder.runtime = depTemplate.proxyViewFactory;
        dep.placeholder.name = `viewFactory_${dep.comp.name}`;
      } else if (dep instanceof ComponentFactoryDependency) {
        depTemplate = this._getCompiledHostTemplate(dep.comp.runtime);
        dep.placeholder.runtime = depTemplate.proxyComponentFactory;
        dep.placeholder.name = `compFactory_${dep.comp.name}`;
      }
      return depTemplate;
    });
    var statements =
        stylesCompileResult.componentStylesheet.statements.concat(compileResult.statements);
    var factory: any;
    if (IS_DART || !this._genConfig.useJit) {
      factory = interpretStatements(
          statements, compileResult.viewFactoryVar, new InterpretiveAppViewInstanceFactory());
    } else {
      factory = jitStatements(
          `${template.compType.name}.template.js`, statements, compileResult.viewFactoryVar);
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
      return interpretStatements(
          result.statements, result.stylesVar, new InterpretiveAppViewInstanceFactory());
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
      private _normalizeResult: NormalizeDirectiveResult) {
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
