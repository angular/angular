library angular2.src.compiler.template_compiler;

import "package:angular2/src/facade/lang.dart"
    show IS_DART, Type, Json, isBlank, isPresent, stringify, evalExpression;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, SetWrapper, MapWrapper, StringMapWrapper;
import "package:angular2/src/facade/async.dart" show PromiseWrapper, Future;
import "directive_metadata.dart"
    show
        createHostComponentMeta,
        CompileDirectiveMetadata,
        CompileTypeMetadata,
        CompileTemplateMetadata,
        CompilePipeMetadata,
        CompileMetadataWithType;
import "template_ast.dart"
    show
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
        templateVisitAll;
import "package:angular2/src/core/di.dart" show Injectable;
import "source_module.dart" show SourceModule, moduleRef, SourceExpression;
import "change_detector_compiler.dart"
    show ChangeDetectionCompiler, CHANGE_DETECTION_JIT_IMPORTS;
import "style_compiler.dart" show StyleCompiler;
import "view_compiler.dart" show ViewCompiler, VIEW_JIT_IMPORTS;
import "proto_view_compiler.dart"
    show
        ProtoViewCompiler,
        APP_VIEW_MODULE_REF,
        CompileProtoView,
        PROTO_VIEW_JIT_IMPORTS;
import "template_parser.dart" show TemplateParser, PipeCollector;
import "template_normalizer.dart" show TemplateNormalizer;
import "runtime_metadata.dart" show RuntimeMetadataResolver;
import "package:angular2/src/core/linker/view.dart" show HostViewFactory;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show ChangeDetectorGenConfig;
import "package:angular2/src/core/linker/resolved_metadata_cache.dart"
    show ResolvedMetadataCache;
import "util.dart"
    show
        codeGenExportVariable,
        escapeSingleQuoteString,
        codeGenValueFn,
        MODULE_SUFFIX,
        addAll,
        Expression;

var METADATA_CACHE_MODULE_REF = moduleRef(
    "package:angular2/src/core/linker/resolved_metadata_cache" + MODULE_SUFFIX);

/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 */
@Injectable()
class TemplateCompiler {
  RuntimeMetadataResolver _runtimeMetadataResolver;
  TemplateNormalizer _templateNormalizer;
  TemplateParser _templateParser;
  StyleCompiler _styleCompiler;
  ChangeDetectionCompiler _cdCompiler;
  ProtoViewCompiler _protoViewCompiler;
  ViewCompiler _viewCompiler;
  ResolvedMetadataCache _resolvedMetadataCache;
  ChangeDetectorGenConfig _genConfig;
  var _hostCacheKeys = new Map<Type, dynamic>();
  var _compiledTemplateCache = new Map<dynamic, CompiledTemplate>();
  var _compiledTemplateDone = new Map<dynamic, Future<CompiledTemplate>>();
  TemplateCompiler(
      this._runtimeMetadataResolver,
      this._templateNormalizer,
      this._templateParser,
      this._styleCompiler,
      this._cdCompiler,
      this._protoViewCompiler,
      this._viewCompiler,
      this._resolvedMetadataCache,
      this._genConfig) {}
  Future<CompileDirectiveMetadata> normalizeDirectiveMetadata(
      CompileDirectiveMetadata directive) {
    if (!directive.isComponent) {
      // For non components there is nothing to be normalized yet.
      return PromiseWrapper.resolve(directive);
    }
    return this
        ._templateNormalizer
        .normalizeTemplate(directive.type, directive.template)
        .then((CompileTemplateMetadata normalizedTemplate) =>
            new CompileDirectiveMetadata(
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
                template: normalizedTemplate));
  }

  Future<HostViewFactory> compileHostComponentRuntime(Type type) {
    CompileDirectiveMetadata compMeta =
        this._runtimeMetadataResolver.getDirectiveMetadata(type);
    var hostCacheKey = this._hostCacheKeys[type];
    if (isBlank(hostCacheKey)) {
      hostCacheKey = new Object();
      this._hostCacheKeys[type] = hostCacheKey;
      assertComponent(compMeta);
      CompileDirectiveMetadata hostMeta =
          createHostComponentMeta(compMeta.type, compMeta.selector);
      this._compileComponentRuntime(hostCacheKey, hostMeta, [compMeta], [], []);
    }
    return this._compiledTemplateDone[hostCacheKey]
        .then((hostCompiledTemplate) {
      return this._compiledTemplateDone[type].then((componentCompiledTemplate) {
        return new HostViewFactory(
            compMeta.selector,
            hostCompiledTemplate.viewFactory,
            componentCompiledTemplate.viewFactory);
      });
    });
  }

  clearCache() {
    this._styleCompiler.clearCache();
    this._compiledTemplateCache.clear();
    this._compiledTemplateDone.clear();
    this._hostCacheKeys.clear();
  }

  SourceModule compileTemplatesCodeGen(
      List<NormalizedComponentWithViewDirectives> components) {
    if (identical(components.length, 0)) {
      throw new BaseException("No components given");
    }
    var declarations = [];
    components.forEach((componentWithDirs) {
      var compMeta = (componentWithDirs.component as CompileDirectiveMetadata);
      assertComponent(compMeta);
      var componentViewFactoryExpression = this._compileComponentCodeGen(
          compMeta,
          componentWithDirs.directives,
          componentWithDirs.pipes,
          declarations);
      if (compMeta.dynamicLoadable) {
        var hostMeta =
            createHostComponentMeta(compMeta.type, compMeta.selector);
        var hostViewFactoryExpression = this
            ._compileComponentCodeGen(hostMeta, [compMeta], [], declarations);
        var constructionKeyword = IS_DART ? "const" : "new";
        var compiledTemplateExpr =
            '''${ constructionKeyword} ${ APP_VIEW_MODULE_REF}HostViewFactory(\'${ compMeta . selector}\',${ hostViewFactoryExpression},${ componentViewFactoryExpression})''';
        var varName = codeGenHostViewFactoryName(compMeta.type);
        declarations.add(
            '''${ codeGenExportVariable ( varName )}${ compiledTemplateExpr};''');
      }
    });
    var moduleUrl = components[0].component.type.moduleUrl;
    return new SourceModule(
        '''${ templateModuleUrl ( moduleUrl )}''', declarations.join("\n"));
  }

  List<SourceModule> compileStylesheetCodeGen(
      String stylesheetUrl, String cssText) {
    return this._styleCompiler.compileStylesheetCodeGen(stylesheetUrl, cssText);
  }

  CompiledTemplate _compileComponentRuntime(
      dynamic cacheKey,
      CompileDirectiveMetadata compMeta,
      List<CompileDirectiveMetadata> viewDirectives,
      List<CompilePipeMetadata> pipes,
      List<dynamic> compilingComponentsPath) {
    var uniqViewDirectives =
        (removeDuplicates(viewDirectives) as List<CompileDirectiveMetadata>);
    var uniqViewPipes = (removeDuplicates(pipes) as List<CompilePipeMetadata>);
    var compiledTemplate = this._compiledTemplateCache[cacheKey];
    var done = this._compiledTemplateDone[cacheKey];
    if (isBlank(compiledTemplate)) {
      compiledTemplate = new CompiledTemplate();
      this._compiledTemplateCache[cacheKey] = compiledTemplate;
      done = PromiseWrapper
          .all((new List.from([
        (this._styleCompiler.compileComponentRuntime(compMeta.template)
            as dynamic)
      ])
            ..addAll(uniqViewDirectives
                .map((dirMeta) => this.normalizeDirectiveMetadata(dirMeta))
                .toList())))
          .then((List<dynamic> stylesAndNormalizedViewDirMetas) {
        var normalizedViewDirMetas =
            ListWrapper.slice(stylesAndNormalizedViewDirMetas, 1);
        var styles = stylesAndNormalizedViewDirMetas[0];
        var parsedTemplate = this._templateParser.parse(
            compMeta.template.template,
            normalizedViewDirMetas,
            uniqViewPipes,
            compMeta.type.name);
        var childPromises = [];
        var usedDirectives =
            DirectiveCollector.findUsedDirectives(parsedTemplate);
        usedDirectives.components.forEach((component) => this
            ._compileNestedComponentRuntime(
                component, compilingComponentsPath, childPromises));
        return PromiseWrapper.all(childPromises).then((_) {
          var filteredPipes = filterPipes(parsedTemplate, uniqViewPipes);
          compiledTemplate.init(this._createViewFactoryRuntime(
              compMeta,
              parsedTemplate,
              usedDirectives.directives,
              styles,
              filteredPipes));
          return compiledTemplate;
        });
      });
      this._compiledTemplateDone[cacheKey] = done;
    }
    return compiledTemplate;
  }

  _compileNestedComponentRuntime(
      CompileDirectiveMetadata childComponentDir,
      List<dynamic> parentCompilingComponentsPath,
      List<Future<dynamic>> childPromises) {
    var compilingComponentsPath =
        ListWrapper.clone(parentCompilingComponentsPath);
    var childCacheKey = childComponentDir.type.runtime;
    List<CompileDirectiveMetadata> childViewDirectives = this
        ._runtimeMetadataResolver
        .getViewDirectivesMetadata(childComponentDir.type.runtime);
    List<CompilePipeMetadata> childViewPipes = this
        ._runtimeMetadataResolver
        .getViewPipesMetadata(childComponentDir.type.runtime);
    var childIsRecursive =
        ListWrapper.contains(compilingComponentsPath, childCacheKey);
    compilingComponentsPath.add(childCacheKey);
    this._compileComponentRuntime(childCacheKey, childComponentDir,
        childViewDirectives, childViewPipes, compilingComponentsPath);
    if (!childIsRecursive) {
      // Only wait for a child if it is not a cycle
      childPromises.add(this._compiledTemplateDone[childCacheKey]);
    }
  }

  Function _createViewFactoryRuntime(
      CompileDirectiveMetadata compMeta,
      List<TemplateAst> parsedTemplate,
      List<CompileDirectiveMetadata> directives,
      List<String> styles,
      List<CompilePipeMetadata> pipes) {
    if (IS_DART || !this._genConfig.useJit) {
      var changeDetectorFactories = this._cdCompiler.compileComponentRuntime(
          compMeta.type, compMeta.changeDetection, parsedTemplate);
      var protoViews = this._protoViewCompiler.compileProtoViewRuntime(
          this._resolvedMetadataCache, compMeta, parsedTemplate, pipes);
      return this._viewCompiler.compileComponentRuntime(
          compMeta,
          parsedTemplate,
          styles,
          protoViews.protoViews,
          changeDetectorFactories,
          (compMeta) => this._getNestedComponentViewFactory(compMeta));
    } else {
      var declarations = [];
      var viewFactoryExpr = this._createViewFactoryCodeGen(
          "resolvedMetadataCache",
          compMeta,
          new SourceExpression([], "styles"),
          parsedTemplate,
          pipes,
          declarations);
      Map<String, dynamic> vars = {
        "exports": {},
        "styles": styles,
        "resolvedMetadataCache": this._resolvedMetadataCache
      };
      directives.forEach((dirMeta) {
        vars[dirMeta.type.name] = dirMeta.type.runtime;
        if (dirMeta.isComponent &&
            !identical(dirMeta.type.runtime, compMeta.type.runtime)) {
          vars['''viewFactory_${ dirMeta . type . name}0'''] =
              this._getNestedComponentViewFactory(dirMeta);
        }
      });
      pipes.forEach(
          (pipeMeta) => vars[pipeMeta.type.name] = pipeMeta.type.runtime);
      var declarationsWithoutImports =
          SourceModule.getSourceWithoutImports(declarations.join("\n"));
      return evalExpression(
          '''viewFactory_${ compMeta . type . name}''',
          viewFactoryExpr,
          declarationsWithoutImports,
          mergeStringMaps([
            vars,
            CHANGE_DETECTION_JIT_IMPORTS,
            PROTO_VIEW_JIT_IMPORTS,
            VIEW_JIT_IMPORTS
          ]));
    }
  }

  Function _getNestedComponentViewFactory(CompileDirectiveMetadata compMeta) {
    return this._compiledTemplateCache[compMeta.type.runtime].viewFactory;
  }

  String _compileComponentCodeGen(
      CompileDirectiveMetadata compMeta,
      List<CompileDirectiveMetadata> directives,
      List<CompilePipeMetadata> pipes,
      List<String> targetDeclarations) {
    var uniqueDirectives =
        (removeDuplicates(directives) as List<CompileDirectiveMetadata>);
    var uniqPipes = (removeDuplicates(pipes) as List<CompilePipeMetadata>);
    var styleExpr =
        this._styleCompiler.compileComponentCodeGen(compMeta.template);
    var parsedTemplate = this._templateParser.parse(compMeta.template.template,
        uniqueDirectives, uniqPipes, compMeta.type.name);
    var filteredPipes = filterPipes(parsedTemplate, uniqPipes);
    return this._createViewFactoryCodeGen(
        '''${ METADATA_CACHE_MODULE_REF}CODEGEN_RESOLVED_METADATA_CACHE''',
        compMeta,
        styleExpr,
        parsedTemplate,
        filteredPipes,
        targetDeclarations);
  }

  String _createViewFactoryCodeGen(
      String resolvedMetadataCacheExpr,
      CompileDirectiveMetadata compMeta,
      SourceExpression styleExpr,
      List<TemplateAst> parsedTemplate,
      List<CompilePipeMetadata> pipes,
      List<String> targetDeclarations) {
    var changeDetectorsExprs = this._cdCompiler.compileComponentCodeGen(
        compMeta.type, compMeta.changeDetection, parsedTemplate);
    var protoViewExprs = this._protoViewCompiler.compileProtoViewCodeGen(
        new Expression(resolvedMetadataCacheExpr),
        compMeta,
        parsedTemplate,
        pipes);
    var viewFactoryExpr = this._viewCompiler.compileComponentCodeGen(
        compMeta,
        parsedTemplate,
        styleExpr,
        protoViewExprs.protoViews,
        changeDetectorsExprs,
        codeGenComponentViewFactoryName);
    addAll(changeDetectorsExprs.declarations, targetDeclarations);
    addAll(protoViewExprs.declarations, targetDeclarations);
    addAll(viewFactoryExpr.declarations, targetDeclarations);
    return viewFactoryExpr.expression;
  }
}

class NormalizedComponentWithViewDirectives {
  CompileDirectiveMetadata component;
  List<CompileDirectiveMetadata> directives;
  List<CompilePipeMetadata> pipes;
  NormalizedComponentWithViewDirectives(
      this.component, this.directives, this.pipes) {}
}

class CompiledTemplate {
  Function viewFactory = null;
  init(Function viewFactory) {
    this.viewFactory = viewFactory;
  }
}

assertComponent(CompileDirectiveMetadata meta) {
  if (!meta.isComponent) {
    throw new BaseException(
        '''Could not compile \'${ meta . type . name}\' because it is not a component.''');
  }
}

String templateModuleUrl(String moduleUrl) {
  var urlWithoutSuffix =
      moduleUrl.substring(0, moduleUrl.length - MODULE_SUFFIX.length);
  return '''${ urlWithoutSuffix}.template${ MODULE_SUFFIX}''';
}

String codeGenHostViewFactoryName(CompileTypeMetadata type) {
  return '''hostViewFactory_${ type . name}''';
}

String codeGenComponentViewFactoryName(
    CompileDirectiveMetadata nestedCompType) {
  return '''${ moduleRef ( templateModuleUrl ( nestedCompType . type . moduleUrl ) )}viewFactory_${ nestedCompType . type . name}0''';
}

Map<String, dynamic> mergeStringMaps(List<Map<String, dynamic>> maps) {
  var result = {};
  maps.forEach((map) {
    StringMapWrapper.forEach(map, (value, key) {
      result[key] = value;
    });
  });
  return result;
}

List<CompileMetadataWithType> removeDuplicates(
    List<CompileMetadataWithType> items) {
  var res = [];
  items.forEach((item) {
    var hasMatch = res
            .where((r) => r.type.name == item.type.name &&
                r.type.moduleUrl == item.type.moduleUrl &&
                r.type.runtime == item.type.runtime)
            .toList()
            .length >
        0;
    if (!hasMatch) {
      res.add(item);
    }
  });
  return res;
}

class DirectiveCollector implements TemplateAstVisitor {
  static DirectiveCollector findUsedDirectives(
      List<TemplateAst> parsedTemplate) {
    var collector = new DirectiveCollector();
    templateVisitAll(collector, parsedTemplate);
    return collector;
  }

  List<CompileDirectiveMetadata> directives = [];
  List<CompileDirectiveMetadata> components = [];
  dynamic visitBoundText(BoundTextAst ast, dynamic context) {
    return null;
  }

  dynamic visitText(TextAst ast, dynamic context) {
    return null;
  }

  dynamic visitNgContent(NgContentAst ast, dynamic context) {
    return null;
  }

  dynamic visitElement(ElementAst ast, dynamic context) {
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }

  dynamic visitEmbeddedTemplate(EmbeddedTemplateAst ast, dynamic context) {
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }

  dynamic visitVariable(VariableAst ast, dynamic ctx) {
    return null;
  }

  dynamic visitAttr(AttrAst ast, Map<String, String> attrNameAndValues) {
    return null;
  }

  dynamic visitDirective(DirectiveAst ast, dynamic ctx) {
    if (ast.directive.isComponent) {
      this.components.add(ast.directive);
    }
    this.directives.add(ast.directive);
    return null;
  }

  dynamic visitEvent(
      BoundEventAst ast, Map<String, BoundEventAst> eventTargetAndNames) {
    return null;
  }

  dynamic visitDirectiveProperty(
      BoundDirectivePropertyAst ast, dynamic context) {
    return null;
  }

  dynamic visitElementProperty(BoundElementPropertyAst ast, dynamic context) {
    return null;
  }
}

List<CompilePipeMetadata> filterPipes(
    List<TemplateAst> template, List<CompilePipeMetadata> allPipes) {
  var visitor = new PipeVisitor();
  templateVisitAll(visitor, template);
  return allPipes
      .where(
          (pipeMeta) => SetWrapper.has(visitor.collector.pipes, pipeMeta.name))
      .toList();
}

class PipeVisitor implements TemplateAstVisitor {
  PipeCollector collector = new PipeCollector();
  dynamic visitBoundText(BoundTextAst ast, dynamic context) {
    ast.value.visit(this.collector);
    return null;
  }

  dynamic visitText(TextAst ast, dynamic context) {
    return null;
  }

  dynamic visitNgContent(NgContentAst ast, dynamic context) {
    return null;
  }

  dynamic visitElement(ElementAst ast, dynamic context) {
    templateVisitAll(this, ast.inputs);
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }

  dynamic visitEmbeddedTemplate(EmbeddedTemplateAst ast, dynamic context) {
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }

  dynamic visitVariable(VariableAst ast, dynamic ctx) {
    return null;
  }

  dynamic visitAttr(AttrAst ast, Map<String, String> attrNameAndValues) {
    return null;
  }

  dynamic visitDirective(DirectiveAst ast, dynamic ctx) {
    templateVisitAll(this, ast.inputs);
    templateVisitAll(this, ast.hostEvents);
    templateVisitAll(this, ast.hostProperties);
    return null;
  }

  dynamic visitEvent(
      BoundEventAst ast, Map<String, BoundEventAst> eventTargetAndNames) {
    ast.handler.visit(this.collector);
    return null;
  }

  dynamic visitDirectiveProperty(
      BoundDirectivePropertyAst ast, dynamic context) {
    ast.value.visit(this.collector);
    return null;
  }

  dynamic visitElementProperty(BoundElementPropertyAst ast, dynamic context) {
    ast.value.visit(this.collector);
    return null;
  }
}
