var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IS_DART, isBlank, evalExpression } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper, SetWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { createHostComponentMeta, CompileDirectiveMetadata } from './directive_metadata';
import { templateVisitAll } from './template_ast';
import { Injectable } from 'angular2/src/core/di';
import { SourceModule, moduleRef, SourceExpression } from './source_module';
import { ChangeDetectionCompiler, CHANGE_DETECTION_JIT_IMPORTS } from './change_detector_compiler';
import { StyleCompiler } from './style_compiler';
import { ViewCompiler, VIEW_JIT_IMPORTS } from './view_compiler';
import { ProtoViewCompiler, APP_VIEW_MODULE_REF, PROTO_VIEW_JIT_IMPORTS } from './proto_view_compiler';
import { TemplateParser, PipeCollector } from './template_parser';
import { TemplateNormalizer } from './template_normalizer';
import { RuntimeMetadataResolver } from './runtime_metadata';
import { HostViewFactory } from 'angular2/src/core/linker/view';
import { ChangeDetectorGenConfig } from 'angular2/src/core/change_detection/change_detection';
import { ResolvedMetadataCache } from 'angular2/src/core/linker/resolved_metadata_cache';
import { codeGenExportVariable, MODULE_SUFFIX, addAll, Expression } from './util';
export var METADATA_CACHE_MODULE_REF = moduleRef('package:angular2/src/core/linker/resolved_metadata_cache' + MODULE_SUFFIX);
/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 */
export let TemplateCompiler = class {
    constructor(_runtimeMetadataResolver, _templateNormalizer, _templateParser, _styleCompiler, _cdCompiler, _protoViewCompiler, _viewCompiler, _resolvedMetadataCache, _genConfig) {
        this._runtimeMetadataResolver = _runtimeMetadataResolver;
        this._templateNormalizer = _templateNormalizer;
        this._templateParser = _templateParser;
        this._styleCompiler = _styleCompiler;
        this._cdCompiler = _cdCompiler;
        this._protoViewCompiler = _protoViewCompiler;
        this._viewCompiler = _viewCompiler;
        this._resolvedMetadataCache = _resolvedMetadataCache;
        this._genConfig = _genConfig;
        this._hostCacheKeys = new Map();
        this._compiledTemplateCache = new Map();
        this._compiledTemplateDone = new Map();
    }
    normalizeDirectiveMetadata(directive) {
        if (!directive.isComponent) {
            // For non components there is nothing to be normalized yet.
            return PromiseWrapper.resolve(directive);
        }
        return this._templateNormalizer.normalizeTemplate(directive.type, directive.template)
            .then((normalizedTemplate) => new CompileDirectiveMetadata({
            type: directive.type,
            isComponent: directive.isComponent,
            dynamicLoadable: directive.dynamicLoadable,
            selector: directive.selector,
            exportAs: directive.exportAs,
            changeDetection: directive.changeDetection,
            inputs: directive.inputs,
            outputs: directive.outputs,
            hostListeners: directive.hostListeners,
            hostProperties: directive.hostProperties,
            hostAttributes: directive.hostAttributes,
            lifecycleHooks: directive.lifecycleHooks,
            template: normalizedTemplate
        }));
    }
    compileHostComponentRuntime(type) {
        var compMeta = this._runtimeMetadataResolver.getDirectiveMetadata(type);
        var hostCacheKey = this._hostCacheKeys.get(type);
        if (isBlank(hostCacheKey)) {
            hostCacheKey = new Object();
            this._hostCacheKeys.set(type, hostCacheKey);
            assertComponent(compMeta);
            var hostMeta = createHostComponentMeta(compMeta.type, compMeta.selector);
            this._compileComponentRuntime(hostCacheKey, hostMeta, [compMeta], [], []);
        }
        return this._compiledTemplateDone.get(hostCacheKey)
            .then((compiledTemplate) => new HostViewFactory(compMeta.selector, compiledTemplate.viewFactory));
    }
    clearCache() {
        this._styleCompiler.clearCache();
        this._compiledTemplateCache.clear();
        this._compiledTemplateDone.clear();
        this._hostCacheKeys.clear();
    }
    compileTemplatesCodeGen(components) {
        if (components.length === 0) {
            throw new BaseException('No components given');
        }
        var declarations = [];
        components.forEach(componentWithDirs => {
            var compMeta = componentWithDirs.component;
            assertComponent(compMeta);
            this._compileComponentCodeGen(compMeta, componentWithDirs.directives, componentWithDirs.pipes, declarations);
            if (compMeta.dynamicLoadable) {
                var hostMeta = createHostComponentMeta(compMeta.type, compMeta.selector);
                var viewFactoryExpression = this._compileComponentCodeGen(hostMeta, [compMeta], [], declarations);
                var constructionKeyword = IS_DART ? 'const' : 'new';
                var compiledTemplateExpr = `${constructionKeyword} ${APP_VIEW_MODULE_REF}HostViewFactory('${compMeta.selector}',${viewFactoryExpression})`;
                var varName = codeGenHostViewFactoryName(compMeta.type);
                declarations.push(`${codeGenExportVariable(varName)}${compiledTemplateExpr};`);
            }
        });
        var moduleUrl = components[0].component.type.moduleUrl;
        return new SourceModule(`${templateModuleUrl(moduleUrl)}`, declarations.join('\n'));
    }
    compileStylesheetCodeGen(stylesheetUrl, cssText) {
        return this._styleCompiler.compileStylesheetCodeGen(stylesheetUrl, cssText);
    }
    _compileComponentRuntime(cacheKey, compMeta, viewDirectives, pipes, compilingComponentsPath) {
        let uniqViewDirectives = removeDuplicates(viewDirectives);
        let uniqViewPipes = removeDuplicates(pipes);
        var compiledTemplate = this._compiledTemplateCache.get(cacheKey);
        var done = this._compiledTemplateDone.get(cacheKey);
        if (isBlank(compiledTemplate)) {
            compiledTemplate = new CompiledTemplate();
            this._compiledTemplateCache.set(cacheKey, compiledTemplate);
            done = PromiseWrapper
                .all([this._styleCompiler.compileComponentRuntime(compMeta.template)].concat(uniqViewDirectives.map(dirMeta => this.normalizeDirectiveMetadata(dirMeta))))
                .then((stylesAndNormalizedViewDirMetas) => {
                var normalizedViewDirMetas = stylesAndNormalizedViewDirMetas.slice(1);
                var styles = stylesAndNormalizedViewDirMetas[0];
                var parsedTemplate = this._templateParser.parse(compMeta.template.template, normalizedViewDirMetas, uniqViewPipes, compMeta.type.name);
                var childPromises = [];
                var usedDirectives = DirectiveCollector.findUsedDirectives(parsedTemplate);
                usedDirectives.components.forEach(component => this._compileNestedComponentRuntime(component, compilingComponentsPath, childPromises));
                return PromiseWrapper.all(childPromises)
                    .then((_) => {
                    var filteredPipes = filterPipes(parsedTemplate, uniqViewPipes);
                    compiledTemplate.init(this._createViewFactoryRuntime(compMeta, parsedTemplate, usedDirectives.directives, styles, filteredPipes));
                    return compiledTemplate;
                });
            });
            this._compiledTemplateDone.set(cacheKey, done);
        }
        return compiledTemplate;
    }
    _compileNestedComponentRuntime(childComponentDir, parentCompilingComponentsPath, childPromises) {
        var compilingComponentsPath = ListWrapper.clone(parentCompilingComponentsPath);
        var childCacheKey = childComponentDir.type.runtime;
        var childViewDirectives = this._runtimeMetadataResolver.getViewDirectivesMetadata(childComponentDir.type.runtime);
        var childViewPipes = this._runtimeMetadataResolver.getViewPipesMetadata(childComponentDir.type.runtime);
        var childIsRecursive = ListWrapper.contains(compilingComponentsPath, childCacheKey);
        compilingComponentsPath.push(childCacheKey);
        this._compileComponentRuntime(childCacheKey, childComponentDir, childViewDirectives, childViewPipes, compilingComponentsPath);
        if (!childIsRecursive) {
            // Only wait for a child if it is not a cycle
            childPromises.push(this._compiledTemplateDone.get(childCacheKey));
        }
    }
    _createViewFactoryRuntime(compMeta, parsedTemplate, directives, styles, pipes) {
        if (IS_DART || !this._genConfig.useJit) {
            var changeDetectorFactories = this._cdCompiler.compileComponentRuntime(compMeta.type, compMeta.changeDetection, parsedTemplate);
            var protoViews = this._protoViewCompiler.compileProtoViewRuntime(this._resolvedMetadataCache, compMeta, parsedTemplate, pipes);
            return this._viewCompiler.compileComponentRuntime(compMeta, parsedTemplate, styles, protoViews.protoViews, changeDetectorFactories, (compMeta) => this._getNestedComponentViewFactory(compMeta));
        }
        else {
            var declarations = [];
            var viewFactoryExpr = this._createViewFactoryCodeGen('resolvedMetadataCache', compMeta, new SourceExpression([], 'styles'), parsedTemplate, pipes, declarations);
            var vars = { 'exports': {}, 'styles': styles, 'resolvedMetadataCache': this._resolvedMetadataCache };
            directives.forEach(dirMeta => {
                vars[dirMeta.type.name] = dirMeta.type.runtime;
                if (dirMeta.isComponent && dirMeta.type.runtime !== compMeta.type.runtime) {
                    vars[`viewFactory_${dirMeta.type.name}0`] = this._getNestedComponentViewFactory(dirMeta);
                }
            });
            pipes.forEach(pipeMeta => vars[pipeMeta.type.name] = pipeMeta.type.runtime);
            var declarationsWithoutImports = SourceModule.getSourceWithoutImports(declarations.join('\n'));
            return evalExpression(`viewFactory_${compMeta.type.name}`, viewFactoryExpr, declarationsWithoutImports, mergeStringMaps([vars, CHANGE_DETECTION_JIT_IMPORTS, PROTO_VIEW_JIT_IMPORTS, VIEW_JIT_IMPORTS]));
        }
    }
    _getNestedComponentViewFactory(compMeta) {
        return this._compiledTemplateCache.get(compMeta.type.runtime).viewFactory;
    }
    _compileComponentCodeGen(compMeta, directives, pipes, targetDeclarations) {
        let uniqueDirectives = removeDuplicates(directives);
        let uniqPipes = removeDuplicates(pipes);
        var styleExpr = this._styleCompiler.compileComponentCodeGen(compMeta.template);
        var parsedTemplate = this._templateParser.parse(compMeta.template.template, uniqueDirectives, uniqPipes, compMeta.type.name);
        var filteredPipes = filterPipes(parsedTemplate, uniqPipes);
        return this._createViewFactoryCodeGen(`${METADATA_CACHE_MODULE_REF}CODEGEN_RESOLVED_METADATA_CACHE`, compMeta, styleExpr, parsedTemplate, filteredPipes, targetDeclarations);
    }
    _createViewFactoryCodeGen(resolvedMetadataCacheExpr, compMeta, styleExpr, parsedTemplate, pipes, targetDeclarations) {
        var changeDetectorsExprs = this._cdCompiler.compileComponentCodeGen(compMeta.type, compMeta.changeDetection, parsedTemplate);
        var protoViewExprs = this._protoViewCompiler.compileProtoViewCodeGen(new Expression(resolvedMetadataCacheExpr), compMeta, parsedTemplate, pipes);
        var viewFactoryExpr = this._viewCompiler.compileComponentCodeGen(compMeta, parsedTemplate, styleExpr, protoViewExprs.protoViews, changeDetectorsExprs, codeGenComponentViewFactoryName);
        addAll(changeDetectorsExprs.declarations, targetDeclarations);
        addAll(protoViewExprs.declarations, targetDeclarations);
        addAll(viewFactoryExpr.declarations, targetDeclarations);
        return viewFactoryExpr.expression;
    }
};
TemplateCompiler = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [RuntimeMetadataResolver, TemplateNormalizer, TemplateParser, StyleCompiler, ChangeDetectionCompiler, ProtoViewCompiler, ViewCompiler, ResolvedMetadataCache, ChangeDetectorGenConfig])
], TemplateCompiler);
export class NormalizedComponentWithViewDirectives {
    constructor(component, directives, pipes) {
        this.component = component;
        this.directives = directives;
        this.pipes = pipes;
    }
}
class CompiledTemplate {
    constructor() {
        this.viewFactory = null;
    }
    init(viewFactory) { this.viewFactory = viewFactory; }
}
function assertComponent(meta) {
    if (!meta.isComponent) {
        throw new BaseException(`Could not compile '${meta.type.name}' because it is not a component.`);
    }
}
function templateModuleUrl(moduleUrl) {
    var urlWithoutSuffix = moduleUrl.substring(0, moduleUrl.length - MODULE_SUFFIX.length);
    return `${urlWithoutSuffix}.template${MODULE_SUFFIX}`;
}
function codeGenHostViewFactoryName(type) {
    return `hostViewFactory_${type.name}`;
}
function codeGenComponentViewFactoryName(nestedCompType) {
    return `${moduleRef(templateModuleUrl(nestedCompType.type.moduleUrl))}viewFactory_${nestedCompType.type.name}0`;
}
function mergeStringMaps(maps) {
    var result = {};
    maps.forEach((map) => { StringMapWrapper.forEach(map, (value, key) => { result[key] = value; }); });
    return result;
}
function removeDuplicates(items) {
    let res = [];
    items.forEach(item => {
        let hasMatch = res.filter(r => r.type.name == item.type.name && r.type.moduleUrl == item.type.moduleUrl &&
            r.type.runtime == item.type.runtime)
            .length > 0;
        if (!hasMatch) {
            res.push(item);
        }
    });
    return res;
}
class DirectiveCollector {
    constructor() {
        this.directives = [];
        this.components = [];
    }
    static findUsedDirectives(parsedTemplate) {
        var collector = new DirectiveCollector();
        templateVisitAll(collector, parsedTemplate);
        return collector;
    }
    visitBoundText(ast, context) { return null; }
    visitText(ast, context) { return null; }
    visitNgContent(ast, context) { return null; }
    visitElement(ast, context) {
        templateVisitAll(this, ast.directives);
        templateVisitAll(this, ast.children);
        return null;
    }
    visitEmbeddedTemplate(ast, context) {
        templateVisitAll(this, ast.directives);
        templateVisitAll(this, ast.children);
        return null;
    }
    visitVariable(ast, ctx) { return null; }
    visitAttr(ast, attrNameAndValues) { return null; }
    visitDirective(ast, ctx) {
        if (ast.directive.isComponent) {
            this.components.push(ast.directive);
        }
        this.directives.push(ast.directive);
        return null;
    }
    visitEvent(ast, eventTargetAndNames) {
        return null;
    }
    visitDirectiveProperty(ast, context) { return null; }
    visitElementProperty(ast, context) { return null; }
}
function filterPipes(template, allPipes) {
    var visitor = new PipeVisitor();
    templateVisitAll(visitor, template);
    return allPipes.filter((pipeMeta) => SetWrapper.has(visitor.collector.pipes, pipeMeta.name));
}
class PipeVisitor {
    constructor() {
        this.collector = new PipeCollector();
    }
    visitBoundText(ast, context) {
        ast.value.visit(this.collector);
        return null;
    }
    visitText(ast, context) { return null; }
    visitNgContent(ast, context) { return null; }
    visitElement(ast, context) {
        templateVisitAll(this, ast.inputs);
        templateVisitAll(this, ast.outputs);
        templateVisitAll(this, ast.directives);
        templateVisitAll(this, ast.children);
        return null;
    }
    visitEmbeddedTemplate(ast, context) {
        templateVisitAll(this, ast.outputs);
        templateVisitAll(this, ast.directives);
        templateVisitAll(this, ast.children);
        return null;
    }
    visitVariable(ast, ctx) { return null; }
    visitAttr(ast, attrNameAndValues) { return null; }
    visitDirective(ast, ctx) {
        templateVisitAll(this, ast.inputs);
        templateVisitAll(this, ast.hostEvents);
        templateVisitAll(this, ast.hostProperties);
        return null;
    }
    visitEvent(ast, eventTargetAndNames) {
        ast.handler.visit(this.collector);
        return null;
    }
    visitDirectiveProperty(ast, context) {
        ast.value.visit(this.collector);
        return null;
    }
    visitElementProperty(ast, context) {
        ast.value.visit(this.collector);
        return null;
    }
}
