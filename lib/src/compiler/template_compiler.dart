library angular2.src.compiler.template_compiler;

import "package:angular2/src/facade/lang.dart"
    show IS_DART, Type, Json, isBlank, stringify;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, SetWrapper;
import "package:angular2/src/facade/async.dart" show PromiseWrapper, Future;
import "package:angular2/src/core/linker/template_commands.dart"
    show
        CompiledComponentTemplate,
        TemplateCmd,
        CompiledHostTemplate,
        BeginComponentCmd;
import "directive_metadata.dart"
    show
        createHostComponentMeta,
        CompileDirectiveMetadata,
        CompileTypeMetadata,
        CompileTemplateMetadata;
import "template_ast.dart" show TemplateAst;
import "package:angular2/src/core/di.dart" show Injectable;
import "source_module.dart" show SourceModule, moduleRef;
import "change_detector_compiler.dart" show ChangeDetectionCompiler;
import "style_compiler.dart" show StyleCompiler;
import "command_compiler.dart" show CommandCompiler;
import "template_parser.dart" show TemplateParser;
import "template_normalizer.dart" show TemplateNormalizer;
import "runtime_metadata.dart" show RuntimeMetadataResolver;
import "command_compiler.dart" show TEMPLATE_COMMANDS_MODULE_REF;
import "util.dart"
    show
        codeGenExportVariable,
        escapeSingleQuoteString,
        codeGenValueFn,
        MODULE_SUFFIX;

@Injectable()
class TemplateCompiler {
  RuntimeMetadataResolver _runtimeMetadataResolver;
  TemplateNormalizer _templateNormalizer;
  TemplateParser _templateParser;
  StyleCompiler _styleCompiler;
  CommandCompiler _commandCompiler;
  ChangeDetectionCompiler _cdCompiler;
  var _hostCacheKeys = new Map<Type, dynamic>();
  var _compiledTemplateCache = new Map<dynamic, CompiledComponentTemplate>();
  var _compiledTemplateDone =
      new Map<dynamic, Future<CompiledComponentTemplate>>();
  num _nextTemplateId = 0;
  TemplateCompiler(
      this._runtimeMetadataResolver,
      this._templateNormalizer,
      this._templateParser,
      this._styleCompiler,
      this._commandCompiler,
      this._cdCompiler) {}
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

  Future<CompiledHostTemplate> compileHostComponentRuntime(Type type) {
    var hostCacheKey = this._hostCacheKeys[type];
    if (isBlank(hostCacheKey)) {
      hostCacheKey = new Object();
      this._hostCacheKeys[type] = hostCacheKey;
      CompileDirectiveMetadata compMeta =
          this._runtimeMetadataResolver.getMetadata(type);
      assertComponent(compMeta);
      CompileDirectiveMetadata hostMeta =
          createHostComponentMeta(compMeta.type, compMeta.selector);
      this._compileComponentRuntime(
          hostCacheKey, hostMeta, [compMeta], new Set());
    }
    return this._compiledTemplateDone[hostCacheKey]
        .then((compiledTemplate) => new CompiledHostTemplate(compiledTemplate));
  }

  clearCache() {
    this._hostCacheKeys.clear();
    this._styleCompiler.clearCache();
    this._compiledTemplateCache.clear();
    this._compiledTemplateDone.clear();
  }

  CompiledComponentTemplate _compileComponentRuntime(
      dynamic cacheKey,
      CompileDirectiveMetadata compMeta,
      List<CompileDirectiveMetadata> viewDirectives,
      Set<dynamic> compilingComponentCacheKeys) {
    var compiledTemplate = this._compiledTemplateCache[cacheKey];
    var done = this._compiledTemplateDone[cacheKey];
    if (isBlank(compiledTemplate)) {
      var styles = [];
      var changeDetectorFactory;
      var commands = [];
      var templateId =
          '''${ stringify ( compMeta . type . runtime )}Template${ this . _nextTemplateId ++}''';
      compiledTemplate = new CompiledComponentTemplate(templateId,
          (dispatcher) => changeDetectorFactory(dispatcher), commands, styles);
      this._compiledTemplateCache[cacheKey] = compiledTemplate;
      compilingComponentCacheKeys.add(cacheKey);
      done = PromiseWrapper
          .all((new List.from([
        (this._styleCompiler.compileComponentRuntime(compMeta.template)
            as dynamic)
      ])
            ..addAll(viewDirectives
                .map((dirMeta) => this.normalizeDirectiveMetadata(dirMeta))
                .toList())))
          .then((List<dynamic> stylesAndNormalizedViewDirMetas) {
        var childPromises = [];
        var normalizedViewDirMetas =
            ListWrapper.slice(stylesAndNormalizedViewDirMetas, 1);
        var parsedTemplate = this._templateParser.parse(
            compMeta.template.template,
            normalizedViewDirMetas,
            compMeta.type.name);
        var changeDetectorFactories = this._cdCompiler.compileComponentRuntime(
            compMeta.type, compMeta.changeDetection, parsedTemplate);
        changeDetectorFactory = changeDetectorFactories[0];
        List<String> tmpStyles = stylesAndNormalizedViewDirMetas[0];
        tmpStyles.forEach((style) => styles.add(style));
        List<TemplateCmd> tmpCommands = this._compileCommandsRuntime(
            compMeta,
            parsedTemplate,
            changeDetectorFactories,
            compilingComponentCacheKeys,
            childPromises);
        tmpCommands.forEach((cmd) => commands.add(cmd));
        return PromiseWrapper.all(childPromises);
      }).then((_) {
        SetWrapper.delete(compilingComponentCacheKeys, cacheKey);
        return compiledTemplate;
      });
      this._compiledTemplateDone[cacheKey] = done;
    }
    return compiledTemplate;
  }

  List<TemplateCmd> _compileCommandsRuntime(
      CompileDirectiveMetadata compMeta,
      List<TemplateAst> parsedTemplate,
      List<Function> changeDetectorFactories,
      Set<Type> compilingComponentCacheKeys,
      List<Future<dynamic>> childPromises) {
    List<TemplateCmd> cmds = this._commandCompiler.compileComponentRuntime(
        compMeta, parsedTemplate, changeDetectorFactories,
        (CompileDirectiveMetadata childComponentDir) {
      var childCacheKey = childComponentDir.type.runtime;
      List<CompileDirectiveMetadata> childViewDirectives = this
          ._runtimeMetadataResolver
          .getViewDirectivesMetadata(childComponentDir.type.runtime);
      var childIsRecursive =
          SetWrapper.has(compilingComponentCacheKeys, childCacheKey);
      var childTemplate = this._compileComponentRuntime(childCacheKey,
          childComponentDir, childViewDirectives, compilingComponentCacheKeys);
      if (!childIsRecursive) {
        // Only wait for a child if it is not a cycle
        childPromises.add(this._compiledTemplateDone[childCacheKey]);
      }
      return () => childTemplate;
    });
    cmds.forEach((cmd) {
      if (cmd is BeginComponentCmd) {
        cmd.templateGetter();
      }
    });
    return cmds;
  }

  SourceModule compileTemplatesCodeGen(
      List<NormalizedComponentWithViewDirectives> components) {
    if (identical(components.length, 0)) {
      throw new BaseException("No components given");
    }
    var declarations = [];
    var templateArguments = [];
    List<CompileDirectiveMetadata> componentMetas = [];
    components.forEach((componentWithDirs) {
      var compMeta = (componentWithDirs.component as CompileDirectiveMetadata);
      assertComponent(compMeta);
      componentMetas.add(compMeta);
      this._processTemplateCodeGen(
          compMeta,
          (componentWithDirs.directives as List<CompileDirectiveMetadata>),
          declarations,
          templateArguments);
      if (compMeta.dynamicLoadable) {
        var hostMeta =
            createHostComponentMeta(compMeta.type, compMeta.selector);
        componentMetas.add(hostMeta);
        this._processTemplateCodeGen(
            hostMeta, [compMeta], declarations, templateArguments);
      }
    });
    ListWrapper.forEachWithIndex(componentMetas,
        (CompileDirectiveMetadata compMeta, num index) {
      var templateId =
          '''${ compMeta . type . moduleUrl}|${ compMeta . type . name}''';
      var constructionKeyword = IS_DART ? "const" : "new";
      var compiledTemplateExpr =
          '''${ constructionKeyword} ${ TEMPLATE_COMMANDS_MODULE_REF}CompiledComponentTemplate(\'${ templateId}\',${ ( ( templateArguments [ index ] as List < dynamic > ) ) . join ( "," )})''';
      var variableValueExpr;
      if (compMeta.type.isHost) {
        variableValueExpr =
            '''${ constructionKeyword} ${ TEMPLATE_COMMANDS_MODULE_REF}CompiledHostTemplate(${ compiledTemplateExpr})''';
      } else {
        variableValueExpr = compiledTemplateExpr;
      }
      var varName = templateVariableName(compMeta.type);
      declarations.add(
          '''${ codeGenExportVariable ( varName )}${ variableValueExpr};''');
      declarations.add(
          '''${ codeGenValueFn ( [ ] , varName , templateGetterName ( compMeta . type ) )};''');
    });
    var moduleUrl = components[0].component.type.moduleUrl;
    return new SourceModule(
        '''${ templateModuleUrl ( moduleUrl )}''', declarations.join("\n"));
  }

  List<SourceModule> compileStylesheetCodeGen(
      String stylesheetUrl, String cssText) {
    return this._styleCompiler.compileStylesheetCodeGen(stylesheetUrl, cssText);
  }

  _processTemplateCodeGen(
      CompileDirectiveMetadata compMeta,
      List<CompileDirectiveMetadata> directives,
      List<String> targetDeclarations,
      List<List<dynamic>> targetTemplateArguments) {
    var styleExpr =
        this._styleCompiler.compileComponentCodeGen(compMeta.template);
    var parsedTemplate = this
        ._templateParser
        .parse(compMeta.template.template, directives, compMeta.type.name);
    var changeDetectorsExprs = this._cdCompiler.compileComponentCodeGen(
        compMeta.type, compMeta.changeDetection, parsedTemplate);
    var commandsExpr = this._commandCompiler.compileComponentCodeGen(
        compMeta,
        parsedTemplate,
        changeDetectorsExprs.expressions,
        codeGenComponentTemplateFactory);
    addAll(styleExpr.declarations, targetDeclarations);
    addAll(changeDetectorsExprs.declarations, targetDeclarations);
    addAll(commandsExpr.declarations, targetDeclarations);
    targetTemplateArguments.add([
      changeDetectorsExprs.expressions[0],
      commandsExpr.expression,
      styleExpr.expression
    ]);
  }
}

class NormalizedComponentWithViewDirectives {
  CompileDirectiveMetadata component;
  List<CompileDirectiveMetadata> directives;
  NormalizedComponentWithViewDirectives(this.component, this.directives) {}
}

assertComponent(CompileDirectiveMetadata meta) {
  if (!meta.isComponent) {
    throw new BaseException(
        '''Could not compile \'${ meta . type . name}\' because it is not a component.''');
  }
}

String templateVariableName(CompileTypeMetadata type) {
  return '''${ type . name}Template''';
}

String templateGetterName(CompileTypeMetadata type) {
  return '''${ templateVariableName ( type )}Getter''';
}

String templateModuleUrl(String moduleUrl) {
  var urlWithoutSuffix =
      moduleUrl.substring(0, moduleUrl.length - MODULE_SUFFIX.length);
  return '''${ urlWithoutSuffix}.template${ MODULE_SUFFIX}''';
}

addAll(List<dynamic> source, List<dynamic> target) {
  for (var i = 0; i < source.length; i++) {
    target.add(source[i]);
  }
}

String codeGenComponentTemplateFactory(
    CompileDirectiveMetadata nestedCompType) {
  return '''${ moduleRef ( templateModuleUrl ( nestedCompType . type . moduleUrl ) )}${ templateGetterName ( nestedCompType . type )}''';
}
