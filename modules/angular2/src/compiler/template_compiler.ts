import {
  IS_DART,
  Type,
  Json,
  isBlank,
  isPresent,
  stringify,
  evalExpression
} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {
  ListWrapper,
  SetWrapper,
  MapWrapper,
  StringMapWrapper
} from 'angular2/src/facade/collection';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {
  createHostComponentMeta,
  CompileDirectiveMetadata,
  CompileTypeMetadata,
  CompileTemplateMetadata,
  CompilePipeMetadata,
  CompileMetadataWithType
} from './directive_metadata';
import {
  TemplateAst,
  TemplateAstVisitor,
  NgContentAst,
  EmbeddedTemplateAst,
  ElementAst,
  VariableAst,
  BoundEventAst,
  BoundElementPropertyAst,
  AttrAst,
  BoundTextAst,
  TextAst,
  DirectiveAst,
  BoundDirectivePropertyAst,
  templateVisitAll
} from './template_ast';
import {Injectable} from 'angular2/src/core/di';
import {SourceModule, moduleRef, SourceExpression} from './source_module';
import {ChangeDetectionCompiler, CHANGE_DETECTION_JIT_IMPORTS} from './change_detector_compiler';
import {StyleCompiler} from './style_compiler';
import {ViewCompiler, VIEW_JIT_IMPORTS} from './view_compiler';
import {
  ProtoViewCompiler,
  APP_VIEW_MODULE_REF,
  CompileProtoView,
  PROTO_VIEW_JIT_IMPORTS
} from './proto_view_compiler';
import {TemplateParser, PipeCollector} from './template_parser';
import {TemplateNormalizer} from './template_normalizer';
import {RuntimeMetadataResolver} from './runtime_metadata';
import {HostViewFactory} from 'angular2/src/core/linker/view';
import {ChangeDetectorGenConfig} from 'angular2/src/core/change_detection/change_detection';
import {ResolvedMetadataCache} from 'angular2/src/core/linker/resolved_metadata_cache';

import {
  codeGenExportVariable,
  escapeSingleQuoteString,
  codeGenValueFn,
  MODULE_SUFFIX,
  addAll,
  Expression
} from './util';

export var METADATA_CACHE_MODULE_REF =
    moduleRef('package:angular2/src/core/linker/resolved_metadata_cache' + MODULE_SUFFIX);

/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 */
@Injectable()
export class TemplateCompiler {
  private _hostCacheKeys = new Map<Type, any>();
  private _compiledTemplateCache = new Map<any, CompiledTemplate>();
  private _compiledTemplateDone = new Map<any, Promise<CompiledTemplate>>();

  constructor(private _runtimeMetadataResolver: RuntimeMetadataResolver,
              private _templateNormalizer: TemplateNormalizer,
              private _templateParser: TemplateParser, private _styleCompiler: StyleCompiler,
              private _cdCompiler: ChangeDetectionCompiler,
              private _protoViewCompiler: ProtoViewCompiler, private _viewCompiler: ViewCompiler,
              private _resolvedMetadataCache: ResolvedMetadataCache,
              private _genConfig: ChangeDetectorGenConfig) {}

  normalizeDirectiveMetadata(directive: CompileDirectiveMetadata):
      Promise<CompileDirectiveMetadata> {
    if (!directive.isComponent) {
      // For non components there is nothing to be normalized yet.
      return PromiseWrapper.resolve(directive);
    }

    return this._templateNormalizer.normalizeTemplate(directive.type, directive.template)
        .then((normalizedTemplate: CompileTemplateMetadata) => new CompileDirectiveMetadata({
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
                providers: directive.providers,
                viewProviders: directive.viewProviders,
                queries: directive.queries,
                viewQueries: directive.viewQueries,
                template: normalizedTemplate
              }));
  }

  compileHostComponentRuntime(type: Type): Promise<HostViewFactory> {
    var compMeta: CompileDirectiveMetadata =
        this._runtimeMetadataResolver.getDirectiveMetadata(type);
    var hostCacheKey = this._hostCacheKeys.get(type);
    if (isBlank(hostCacheKey)) {
      hostCacheKey = new Object();
      this._hostCacheKeys.set(type, hostCacheKey);
      assertComponent(compMeta);
      var hostMeta: CompileDirectiveMetadata =
          createHostComponentMeta(compMeta.type, compMeta.selector);

      this._compileComponentRuntime(hostCacheKey, hostMeta, [compMeta], [], []);
    }
    return this._compiledTemplateDone.get(hostCacheKey)
        .then((compiledTemplate: CompiledTemplate) =>
                  new HostViewFactory(compMeta.selector, compiledTemplate.viewFactory));
  }

  clearCache() {
    this._styleCompiler.clearCache();
    this._compiledTemplateCache.clear();
    this._compiledTemplateDone.clear();
    this._hostCacheKeys.clear();
  }

  compileTemplatesCodeGen(components: NormalizedComponentWithViewDirectives[]): SourceModule {
    if (components.length === 0) {
      throw new BaseException('No components given');
    }
    var declarations = [];
    components.forEach(componentWithDirs => {
      var compMeta = <CompileDirectiveMetadata>componentWithDirs.component;
      assertComponent(compMeta);
      this._compileComponentCodeGen(compMeta, componentWithDirs.directives, componentWithDirs.pipes,
                                    declarations);
      if (compMeta.dynamicLoadable) {
        var hostMeta = createHostComponentMeta(compMeta.type, compMeta.selector);
        var viewFactoryExpression =
            this._compileComponentCodeGen(hostMeta, [compMeta], [], declarations);
        var constructionKeyword = IS_DART ? 'const' : 'new';
        var compiledTemplateExpr =
            `${constructionKeyword} ${APP_VIEW_MODULE_REF}HostViewFactory('${compMeta.selector}',${viewFactoryExpression})`;
        var varName = codeGenHostViewFactoryName(compMeta.type);
        declarations.push(`${codeGenExportVariable(varName)}${compiledTemplateExpr};`);
      }
    });
    var moduleUrl = components[0].component.type.moduleUrl;
    return new SourceModule(`${templateModuleUrl(moduleUrl)}`, declarations.join('\n'));
  }

  compileStylesheetCodeGen(stylesheetUrl: string, cssText: string): SourceModule[] {
    return this._styleCompiler.compileStylesheetCodeGen(stylesheetUrl, cssText);
  }



  private _compileComponentRuntime(cacheKey: any, compMeta: CompileDirectiveMetadata,
                                   viewDirectives: CompileDirectiveMetadata[],
                                   pipes: CompilePipeMetadata[],
                                   compilingComponentsPath: any[]): CompiledTemplate {
    let uniqViewDirectives = <CompileDirectiveMetadata[]>removeDuplicates(viewDirectives);
    let uniqViewPipes = <CompilePipeMetadata[]>removeDuplicates(pipes);
    var compiledTemplate = this._compiledTemplateCache.get(cacheKey);
    var done = this._compiledTemplateDone.get(cacheKey);
    if (isBlank(compiledTemplate)) {
      compiledTemplate = new CompiledTemplate();
      this._compiledTemplateCache.set(cacheKey, compiledTemplate);
      done = PromiseWrapper
                 .all([<any>this._styleCompiler.compileComponentRuntime(compMeta.template)].concat(
                     uniqViewDirectives.map(dirMeta => this.normalizeDirectiveMetadata(dirMeta))))
                 .then((stylesAndNormalizedViewDirMetas: any[]) => {
                   var normalizedViewDirMetas = stylesAndNormalizedViewDirMetas.slice(1);
                   var styles = stylesAndNormalizedViewDirMetas[0];
                   var parsedTemplate = this._templateParser.parse(
                       compMeta.template.template, normalizedViewDirMetas, uniqViewPipes,
                       compMeta.type.name);

                   var childPromises = [];
                   var usedDirectives = DirectiveCollector.findUsedDirectives(parsedTemplate);
                   usedDirectives.components.forEach(
                       component => this._compileNestedComponentRuntime(
                           component, compilingComponentsPath, childPromises));
                   return PromiseWrapper.all(childPromises)
                       .then((_) => {
                         var filteredPipes = filterPipes(parsedTemplate, uniqViewPipes);
                         compiledTemplate.init(this._createViewFactoryRuntime(
                             compMeta, parsedTemplate, usedDirectives.directives, styles,
                             filteredPipes));
                         return compiledTemplate;
                       });
                 });
      this._compiledTemplateDone.set(cacheKey, done);
    }
    return compiledTemplate;
  }

  private _compileNestedComponentRuntime(childComponentDir: CompileDirectiveMetadata,
                                         parentCompilingComponentsPath: any[],
                                         childPromises: Promise<any>[]) {
    var compilingComponentsPath = ListWrapper.clone(parentCompilingComponentsPath);

    var childCacheKey = childComponentDir.type.runtime;
    var childViewDirectives: CompileDirectiveMetadata[] =
        this._runtimeMetadataResolver.getViewDirectivesMetadata(childComponentDir.type.runtime);
    var childViewPipes: CompilePipeMetadata[] =
        this._runtimeMetadataResolver.getViewPipesMetadata(childComponentDir.type.runtime);
    var childIsRecursive = ListWrapper.contains(compilingComponentsPath, childCacheKey);
    compilingComponentsPath.push(childCacheKey);
    this._compileComponentRuntime(childCacheKey, childComponentDir, childViewDirectives,
                                  childViewPipes, compilingComponentsPath);
    if (!childIsRecursive) {
      // Only wait for a child if it is not a cycle
      childPromises.push(this._compiledTemplateDone.get(childCacheKey));
    }
  }

  private _createViewFactoryRuntime(compMeta: CompileDirectiveMetadata,
                                    parsedTemplate: TemplateAst[],
                                    directives: CompileDirectiveMetadata[], styles: string[],
                                    pipes: CompilePipeMetadata[]): Function {
    if (IS_DART || !this._genConfig.useJit) {
      var changeDetectorFactories = this._cdCompiler.compileComponentRuntime(
          compMeta.type, compMeta.changeDetection, parsedTemplate);
      var protoViews = this._protoViewCompiler.compileProtoViewRuntime(
          this._resolvedMetadataCache, compMeta, parsedTemplate, pipes);
      return this._viewCompiler.compileComponentRuntime(
          compMeta, parsedTemplate, styles, protoViews.protoViews, changeDetectorFactories,
          (compMeta) => this._getNestedComponentViewFactory(compMeta));
    } else {
      var declarations = [];
      var viewFactoryExpr = this._createViewFactoryCodeGen('resolvedMetadataCache', compMeta,
                                                           new SourceExpression([], 'styles'),
                                                           parsedTemplate, pipes, declarations);
      var vars: {[key: string]: any} =
          {'exports': {}, 'styles': styles, 'resolvedMetadataCache': this._resolvedMetadataCache};
      directives.forEach(dirMeta => {
        vars[dirMeta.type.name] = dirMeta.type.runtime;
        if (dirMeta.isComponent && dirMeta.type.runtime !== compMeta.type.runtime) {
          vars[`viewFactory_${dirMeta.type.name}0`] = this._getNestedComponentViewFactory(dirMeta);
        }
      });
      pipes.forEach(pipeMeta => vars[pipeMeta.type.name] = pipeMeta.type.runtime);
      var declarationsWithoutImports =
          SourceModule.getSourceWithoutImports(declarations.join('\n'));
      return evalExpression(
          `viewFactory_${compMeta.type.name}`, viewFactoryExpr, declarationsWithoutImports,
          mergeStringMaps(
              [vars, CHANGE_DETECTION_JIT_IMPORTS, PROTO_VIEW_JIT_IMPORTS, VIEW_JIT_IMPORTS]));
    }
  }

  private _getNestedComponentViewFactory(compMeta: CompileDirectiveMetadata): Function {
    return this._compiledTemplateCache.get(compMeta.type.runtime).viewFactory;
  }

  private _compileComponentCodeGen(compMeta: CompileDirectiveMetadata,
                                   directives: CompileDirectiveMetadata[],
                                   pipes: CompilePipeMetadata[],
                                   targetDeclarations: string[]): string {
    let uniqueDirectives = <CompileDirectiveMetadata[]>removeDuplicates(directives);
    let uniqPipes = <CompilePipeMetadata[]>removeDuplicates(pipes);
    var styleExpr = this._styleCompiler.compileComponentCodeGen(compMeta.template);
    var parsedTemplate = this._templateParser.parse(compMeta.template.template, uniqueDirectives,
                                                    uniqPipes, compMeta.type.name);
    var filteredPipes = filterPipes(parsedTemplate, uniqPipes);
    return this._createViewFactoryCodeGen(
        `${METADATA_CACHE_MODULE_REF}CODEGEN_RESOLVED_METADATA_CACHE`, compMeta, styleExpr,
        parsedTemplate, filteredPipes, targetDeclarations);
  }

  private _createViewFactoryCodeGen(resolvedMetadataCacheExpr: string,
                                    compMeta: CompileDirectiveMetadata, styleExpr: SourceExpression,
                                    parsedTemplate: TemplateAst[], pipes: CompilePipeMetadata[],
                                    targetDeclarations: string[]): string {
    var changeDetectorsExprs = this._cdCompiler.compileComponentCodeGen(
        compMeta.type, compMeta.changeDetection, parsedTemplate);
    var protoViewExprs = this._protoViewCompiler.compileProtoViewCodeGen(
        new Expression(resolvedMetadataCacheExpr), compMeta, parsedTemplate, pipes);
    var viewFactoryExpr = this._viewCompiler.compileComponentCodeGen(
        compMeta, parsedTemplate, styleExpr, protoViewExprs.protoViews, changeDetectorsExprs,
        codeGenComponentViewFactoryName);

    addAll(changeDetectorsExprs.declarations, targetDeclarations);
    addAll(protoViewExprs.declarations, targetDeclarations);
    addAll(viewFactoryExpr.declarations, targetDeclarations);

    return viewFactoryExpr.expression;
  }
}

export class NormalizedComponentWithViewDirectives {
  constructor(public component: CompileDirectiveMetadata,
              public directives: CompileDirectiveMetadata[], public pipes: CompilePipeMetadata[]) {}
}

class CompiledTemplate {
  viewFactory: Function = null;
  init(viewFactory: Function) { this.viewFactory = viewFactory; }
}

function assertComponent(meta: CompileDirectiveMetadata) {
  if (!meta.isComponent) {
    throw new BaseException(`Could not compile '${meta.type.name}' because it is not a component.`);
  }
}

function templateModuleUrl(moduleUrl: string): string {
  var urlWithoutSuffix = moduleUrl.substring(0, moduleUrl.length - MODULE_SUFFIX.length);
  return `${urlWithoutSuffix}.template${MODULE_SUFFIX}`;
}


function codeGenHostViewFactoryName(type: CompileTypeMetadata): string {
  return `hostViewFactory_${type.name}`;
}

function codeGenComponentViewFactoryName(nestedCompType: CompileDirectiveMetadata): string {
  return `${moduleRef(templateModuleUrl(nestedCompType.type.moduleUrl))}viewFactory_${nestedCompType.type.name}0`;
}

function mergeStringMaps(maps: Array<{[key: string]: any}>): {[key: string]: any} {
  var result = {};
  maps.forEach(
      (map) => { StringMapWrapper.forEach(map, (value, key) => { result[key] = value; }); });
  return result;
}

function removeDuplicates(items: CompileMetadataWithType[]): CompileMetadataWithType[] {
  let res = [];
  items.forEach(item => {
    let hasMatch =
        res.filter(r => r.type.name == item.type.name && r.type.moduleUrl == item.type.moduleUrl &&
                        r.type.runtime == item.type.runtime)
            .length > 0;
    if (!hasMatch) {
      res.push(item);
    }
  });
  return res;
}

class DirectiveCollector implements TemplateAstVisitor {
  static findUsedDirectives(parsedTemplate: TemplateAst[]): DirectiveCollector {
    var collector = new DirectiveCollector();
    templateVisitAll(collector, parsedTemplate);
    return collector;
  }

  directives: CompileDirectiveMetadata[] = [];
  components: CompileDirectiveMetadata[] = [];

  visitBoundText(ast: BoundTextAst, context: any): any { return null; }
  visitText(ast: TextAst, context: any): any { return null; }

  visitNgContent(ast: NgContentAst, context: any): any { return null; }

  visitElement(ast: ElementAst, context: any): any {
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitVariable(ast: VariableAst, ctx: any): any { return null; }
  visitAttr(ast: AttrAst, attrNameAndValues: {[key: string]: string}): any { return null; }
  visitDirective(ast: DirectiveAst, ctx: any): any {
    if (ast.directive.isComponent) {
      this.components.push(ast.directive);
    }
    this.directives.push(ast.directive);
    return null;
  }
  visitEvent(ast: BoundEventAst, eventTargetAndNames: Map<string, BoundEventAst>): any {
    return null;
  }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any { return null; }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any { return null; }
}


function filterPipes(template: TemplateAst[],
                     allPipes: CompilePipeMetadata[]): CompilePipeMetadata[] {
  var visitor = new PipeVisitor();
  templateVisitAll(visitor, template);
  return allPipes.filter((pipeMeta) => SetWrapper.has(visitor.collector.pipes, pipeMeta.name));
}

class PipeVisitor implements TemplateAstVisitor {
  collector: PipeCollector = new PipeCollector();

  visitBoundText(ast: BoundTextAst, context: any): any {
    ast.value.visit(this.collector);
    return null;
  }
  visitText(ast: TextAst, context: any): any { return null; }

  visitNgContent(ast: NgContentAst, context: any): any { return null; }

  visitElement(ast: ElementAst, context: any): any {
    templateVisitAll(this, ast.inputs);
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitVariable(ast: VariableAst, ctx: any): any { return null; }
  visitAttr(ast: AttrAst, attrNameAndValues: {[key: string]: string}): any { return null; }
  visitDirective(ast: DirectiveAst, ctx: any): any {
    templateVisitAll(this, ast.inputs);
    templateVisitAll(this, ast.hostEvents);
    templateVisitAll(this, ast.hostProperties);
    return null;
  }
  visitEvent(ast: BoundEventAst, eventTargetAndNames: Map<string, BoundEventAst>): any {
    ast.handler.visit(this.collector);
    return null;
  }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {
    ast.value.visit(this.collector);
    return null;
  }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any {
    ast.value.visit(this.collector);
    return null;
  }
}
