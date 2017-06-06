var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IS_DART, isBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { createHostComponentMeta, CompileIdentifierMetadata } from './compile_metadata';
import { Injectable } from 'angular2/src/core/di';
import { StyleCompiler } from './style_compiler';
import { ViewCompiler } from './view_compiler/view_compiler';
import { TemplateParser } from './template_parser';
import { DirectiveNormalizer } from './directive_normalizer';
import { CompileMetadataResolver } from './metadata_resolver';
import { ComponentFactory } from 'angular2/src/core/linker/component_factory';
import { CompilerConfig } from './config';
import * as ir from './output/output_ast';
import { jitStatements } from './output/output_jit';
import { interpretStatements } from './output/output_interpreter';
import { InterpretiveAppViewInstanceFactory } from './output/interpretive_view';
import { XHR } from 'angular2/src/compiler/xhr';
/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 */
export let RuntimeCompiler = class RuntimeCompiler {
    constructor(_metadataResolver, _templateNormalizer, _templateParser, _styleCompiler, _viewCompiler, _xhr, _genConfig) {
        this._metadataResolver = _metadataResolver;
        this._templateNormalizer = _templateNormalizer;
        this._templateParser = _templateParser;
        this._styleCompiler = _styleCompiler;
        this._viewCompiler = _viewCompiler;
        this._xhr = _xhr;
        this._genConfig = _genConfig;
        this._styleCache = new Map();
        this._hostCacheKeys = new Map();
        this._compiledTemplateCache = new Map();
        this._compiledTemplateDone = new Map();
    }
    resolveComponent(componentType) {
        var compMeta = this._metadataResolver.getDirectiveMetadata(componentType);
        var hostCacheKey = this._hostCacheKeys.get(componentType);
        if (isBlank(hostCacheKey)) {
            hostCacheKey = new Object();
            this._hostCacheKeys.set(componentType, hostCacheKey);
            assertComponent(compMeta);
            var hostMeta = createHostComponentMeta(compMeta.type, compMeta.selector);
            this._loadAndCompileComponent(hostCacheKey, hostMeta, [compMeta], [], []);
        }
        return this._compiledTemplateDone.get(hostCacheKey)
            .then((compiledTemplate) => new ComponentFactory(compMeta.selector, compiledTemplate.viewFactory, componentType));
    }
    clearCache() {
        this._styleCache.clear();
        this._compiledTemplateCache.clear();
        this._compiledTemplateDone.clear();
        this._hostCacheKeys.clear();
    }
    _loadAndCompileComponent(cacheKey, compMeta, viewDirectives, pipes, compilingComponentsPath) {
        var compiledTemplate = this._compiledTemplateCache.get(cacheKey);
        var done = this._compiledTemplateDone.get(cacheKey);
        if (isBlank(compiledTemplate)) {
            compiledTemplate = new CompiledTemplate();
            this._compiledTemplateCache.set(cacheKey, compiledTemplate);
            done =
                PromiseWrapper.all([this._compileComponentStyles(compMeta)].concat(viewDirectives.map(dirMeta => this._templateNormalizer.normalizeDirective(dirMeta))))
                    .then((stylesAndNormalizedViewDirMetas) => {
                    var normalizedViewDirMetas = stylesAndNormalizedViewDirMetas.slice(1);
                    var styles = stylesAndNormalizedViewDirMetas[0];
                    var parsedTemplate = this._templateParser.parse(compMeta, compMeta.template.template, normalizedViewDirMetas, pipes, compMeta.type.name);
                    var childPromises = [];
                    compiledTemplate.init(this._compileComponent(compMeta, parsedTemplate, styles, pipes, compilingComponentsPath, childPromises));
                    return PromiseWrapper.all(childPromises).then((_) => { return compiledTemplate; });
                });
            this._compiledTemplateDone.set(cacheKey, done);
        }
        return compiledTemplate;
    }
    _compileComponent(compMeta, parsedTemplate, styles, pipes, compilingComponentsPath, childPromises) {
        var compileResult = this._viewCompiler.compileComponent(compMeta, parsedTemplate, new ir.ExternalExpr(new CompileIdentifierMetadata({ runtime: styles })), pipes);
        compileResult.dependencies.forEach((dep) => {
            var childCompilingComponentsPath = ListWrapper.clone(compilingComponentsPath);
            var childCacheKey = dep.comp.type.runtime;
            var childViewDirectives = this._metadataResolver.getViewDirectivesMetadata(dep.comp.type.runtime);
            var childViewPipes = this._metadataResolver.getViewPipesMetadata(dep.comp.type.runtime);
            var childIsRecursive = ListWrapper.contains(childCompilingComponentsPath, childCacheKey);
            childCompilingComponentsPath.push(childCacheKey);
            var childComp = this._loadAndCompileComponent(dep.comp.type.runtime, dep.comp, childViewDirectives, childViewPipes, childCompilingComponentsPath);
            dep.factoryPlaceholder.runtime = childComp.proxyViewFactory;
            dep.factoryPlaceholder.name = `viewFactory_${dep.comp.type.name}`;
            if (!childIsRecursive) {
                // Only wait for a child if it is not a cycle
                childPromises.push(this._compiledTemplateDone.get(childCacheKey));
            }
        });
        var factory;
        if (IS_DART || !this._genConfig.useJit) {
            factory = interpretStatements(compileResult.statements, compileResult.viewFactoryVar, new InterpretiveAppViewInstanceFactory());
        }
        else {
            factory = jitStatements(`${compMeta.type.name}.template.js`, compileResult.statements, compileResult.viewFactoryVar);
        }
        return factory;
    }
    _compileComponentStyles(compMeta) {
        var compileResult = this._styleCompiler.compileComponent(compMeta);
        return this._resolveStylesCompileResult(compMeta.type.name, compileResult);
    }
    _resolveStylesCompileResult(sourceUrl, result) {
        var promises = result.dependencies.map((dep) => this._loadStylesheetDep(dep));
        return PromiseWrapper.all(promises)
            .then((cssTexts) => {
            var nestedCompileResultPromises = [];
            for (var i = 0; i < result.dependencies.length; i++) {
                var dep = result.dependencies[i];
                var cssText = cssTexts[i];
                var nestedCompileResult = this._styleCompiler.compileStylesheet(dep.sourceUrl, cssText, dep.isShimmed);
                nestedCompileResultPromises.push(this._resolveStylesCompileResult(dep.sourceUrl, nestedCompileResult));
            }
            return PromiseWrapper.all(nestedCompileResultPromises);
        })
            .then((nestedStylesArr) => {
            for (var i = 0; i < result.dependencies.length; i++) {
                var dep = result.dependencies[i];
                dep.valuePlaceholder.runtime = nestedStylesArr[i];
                dep.valuePlaceholder.name = `importedStyles${i}`;
            }
            if (IS_DART || !this._genConfig.useJit) {
                return interpretStatements(result.statements, result.stylesVar, new InterpretiveAppViewInstanceFactory());
            }
            else {
                return jitStatements(`${sourceUrl}.css.js`, result.statements, result.stylesVar);
            }
        });
    }
    _loadStylesheetDep(dep) {
        var cacheKey = `${dep.sourceUrl}${dep.isShimmed ? '.shim' : ''}`;
        var cssTextPromise = this._styleCache.get(cacheKey);
        if (isBlank(cssTextPromise)) {
            cssTextPromise = this._xhr.get(dep.sourceUrl);
            this._styleCache.set(cacheKey, cssTextPromise);
        }
        return cssTextPromise;
    }
};
RuntimeCompiler = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [CompileMetadataResolver, DirectiveNormalizer, TemplateParser, StyleCompiler, ViewCompiler, XHR, CompilerConfig])
], RuntimeCompiler);
class CompiledTemplate {
    constructor() {
        this.viewFactory = null;
        this.proxyViewFactory = (viewUtils, childInjector, contextEl) => this.viewFactory(viewUtils, childInjector, contextEl);
    }
    init(viewFactory) { this.viewFactory = viewFactory; }
}
function assertComponent(meta) {
    if (!meta.isComponent) {
        throw new BaseException(`Could not compile '${meta.type.name}' because it is not a component.`);
    }
}
