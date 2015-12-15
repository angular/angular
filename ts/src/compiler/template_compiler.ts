import {IS_DART, Type, Json, isBlank, stringify} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {ListWrapper, SetWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {
  CompiledComponentTemplate,
  TemplateCmd,
  CompiledHostTemplate,
  BeginComponentCmd
} from 'angular2/src/core/linker/template_commands';
import {
  createHostComponentMeta,
  CompileDirectiveMetadata,
  CompileTypeMetadata,
  CompileTemplateMetadata
} from './directive_metadata';
import {TemplateAst} from './template_ast';
import {Injectable} from 'angular2/src/core/di';
import {SourceModule, moduleRef} from './source_module';
import {ChangeDetectionCompiler} from './change_detector_compiler';
import {StyleCompiler} from './style_compiler';
import {CommandCompiler} from './command_compiler';
import {TemplateParser} from './template_parser';
import {TemplateNormalizer} from './template_normalizer';
import {RuntimeMetadataResolver} from './runtime_metadata';

import {TEMPLATE_COMMANDS_MODULE_REF} from './command_compiler';
import {
  codeGenExportVariable,
  escapeSingleQuoteString,
  codeGenValueFn,
  MODULE_SUFFIX
} from './util';

/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 */
@Injectable()
export class TemplateCompiler {
  private _hostCacheKeys = new Map<Type, any>();
  private _compiledTemplateCache = new Map<any, CompiledComponentTemplate>();
  private _compiledTemplateDone = new Map<any, Promise<CompiledComponentTemplate>>();
  private _nextTemplateId: number = 0;

  constructor(private _runtimeMetadataResolver: RuntimeMetadataResolver,
              private _templateNormalizer: TemplateNormalizer,
              private _templateParser: TemplateParser, private _styleCompiler: StyleCompiler,
              private _commandCompiler: CommandCompiler,
              private _cdCompiler: ChangeDetectionCompiler) {}

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
                template: normalizedTemplate
              }));
  }

  compileHostComponentRuntime(type: Type): Promise<CompiledHostTemplate> {
    var hostCacheKey = this._hostCacheKeys.get(type);
    if (isBlank(hostCacheKey)) {
      hostCacheKey = new Object();
      this._hostCacheKeys.set(type, hostCacheKey);
      var compMeta: CompileDirectiveMetadata = this._runtimeMetadataResolver.getMetadata(type);
      assertComponent(compMeta);
      var hostMeta: CompileDirectiveMetadata =
          createHostComponentMeta(compMeta.type, compMeta.selector);

      this._compileComponentRuntime(hostCacheKey, hostMeta, [compMeta], new Set());
    }
    return this._compiledTemplateDone.get(hostCacheKey)
        .then(compiledTemplate => new CompiledHostTemplate(compiledTemplate));
  }

  clearCache() {
    this._hostCacheKeys.clear();
    this._styleCompiler.clearCache();
    this._compiledTemplateCache.clear();
    this._compiledTemplateDone.clear();
  }

  private _compileComponentRuntime(
      cacheKey: any, compMeta: CompileDirectiveMetadata, viewDirectives: CompileDirectiveMetadata[],
      compilingComponentCacheKeys: Set<any>): CompiledComponentTemplate {
    let uniqViewDirectives = removeDuplicates(viewDirectives);
    var compiledTemplate = this._compiledTemplateCache.get(cacheKey);
    var done = this._compiledTemplateDone.get(cacheKey);
    if (isBlank(compiledTemplate)) {
      var styles = [];
      var changeDetectorFactory;
      var commands = [];
      var templateId = `${stringify(compMeta.type.runtime)}Template${this._nextTemplateId++}`;
      compiledTemplate = new CompiledComponentTemplate(
          templateId, (dispatcher) => changeDetectorFactory(dispatcher), commands, styles);
      this._compiledTemplateCache.set(cacheKey, compiledTemplate);
      compilingComponentCacheKeys.add(cacheKey);
      done = PromiseWrapper
                 .all([<any>this._styleCompiler.compileComponentRuntime(compMeta.template)].concat(
                     uniqViewDirectives.map(dirMeta => this.normalizeDirectiveMetadata(dirMeta))))
                 .then((stylesAndNormalizedViewDirMetas: any[]) => {
                   var childPromises = [];
                   var normalizedViewDirMetas = stylesAndNormalizedViewDirMetas.slice(1);
                   var parsedTemplate = this._templateParser.parse(
                       compMeta.template.template, normalizedViewDirMetas, compMeta.type.name);

                   var changeDetectorFactories = this._cdCompiler.compileComponentRuntime(
                       compMeta.type, compMeta.changeDetection, parsedTemplate);
                   changeDetectorFactory = changeDetectorFactories[0];
                   var tmpStyles: string[] = stylesAndNormalizedViewDirMetas[0];
                   tmpStyles.forEach(style => styles.push(style));
                   var tmpCommands: TemplateCmd[] = this._compileCommandsRuntime(
                       compMeta, parsedTemplate, changeDetectorFactories,
                       compilingComponentCacheKeys, childPromises);
                   tmpCommands.forEach(cmd => commands.push(cmd));
                   return PromiseWrapper.all(childPromises);
                 })
                 .then((_) => {
                   SetWrapper.delete(compilingComponentCacheKeys, cacheKey);
                   return compiledTemplate;
                 });
      this._compiledTemplateDone.set(cacheKey, done);
    }
    return compiledTemplate;
  }

  private _compileCommandsRuntime(compMeta: CompileDirectiveMetadata, parsedTemplate: TemplateAst[],
                                  changeDetectorFactories: Function[],
                                  compilingComponentCacheKeys: Set<Type>,
                                  childPromises: Promise<any>[]): TemplateCmd[] {
    var cmds: TemplateCmd[] = this._commandCompiler.compileComponentRuntime(
        compMeta, parsedTemplate, changeDetectorFactories,
        (childComponentDir: CompileDirectiveMetadata) => {
          var childCacheKey = childComponentDir.type.runtime;
          var childViewDirectives: CompileDirectiveMetadata[] =
              this._runtimeMetadataResolver.getViewDirectivesMetadata(
                  childComponentDir.type.runtime);
          var childIsRecursive = SetWrapper.has(compilingComponentCacheKeys, childCacheKey);
          var childTemplate = this._compileComponentRuntime(
              childCacheKey, childComponentDir, childViewDirectives, compilingComponentCacheKeys);
          if (!childIsRecursive) {
            // Only wait for a child if it is not a cycle
            childPromises.push(this._compiledTemplateDone.get(childCacheKey));
          }
          return () => childTemplate;
        });
    cmds.forEach(cmd => {
      if (cmd instanceof BeginComponentCmd) {
        cmd.templateGetter();
      }
    });
    return cmds;
  }

  compileTemplatesCodeGen(components: NormalizedComponentWithViewDirectives[]): SourceModule {
    if (components.length === 0) {
      throw new BaseException('No components given');
    }
    var declarations = [];
    var templateArguments = [];
    var componentMetas: CompileDirectiveMetadata[] = [];
    components.forEach(componentWithDirs => {
      var compMeta = <CompileDirectiveMetadata>componentWithDirs.component;
      assertComponent(compMeta);
      componentMetas.push(compMeta);

      this._processTemplateCodeGen(compMeta, componentWithDirs.directives, declarations,
                                   templateArguments);
      if (compMeta.dynamicLoadable) {
        var hostMeta = createHostComponentMeta(compMeta.type, compMeta.selector);
        componentMetas.push(hostMeta);
        this._processTemplateCodeGen(hostMeta, [compMeta], declarations, templateArguments);
      }
    });
    ListWrapper.forEachWithIndex(componentMetas, (compMeta: CompileDirectiveMetadata,
                                                  index: number) => {
      var templateId = `${compMeta.type.moduleUrl}|${compMeta.type.name}`;
      var constructionKeyword = IS_DART ? 'const' : 'new';
      var compiledTemplateExpr =
          `${constructionKeyword} ${TEMPLATE_COMMANDS_MODULE_REF}CompiledComponentTemplate('${templateId}',${(<any[]>templateArguments[index]).join(',')})`;
      var variableValueExpr;
      if (compMeta.type.isHost) {
        variableValueExpr =
            `${constructionKeyword} ${TEMPLATE_COMMANDS_MODULE_REF}CompiledHostTemplate(${compiledTemplateExpr})`;
      } else {
        variableValueExpr = compiledTemplateExpr;
      }
      var varName = templateVariableName(compMeta.type);
      declarations.push(`${codeGenExportVariable(varName)}${variableValueExpr};`);
      declarations.push(`${codeGenValueFn([], varName, templateGetterName(compMeta.type))};`);
    });
    var moduleUrl = components[0].component.type.moduleUrl;
    return new SourceModule(`${templateModuleUrl(moduleUrl)}`, declarations.join('\n'));
  }

  compileStylesheetCodeGen(stylesheetUrl: string, cssText: string): SourceModule[] {
    return this._styleCompiler.compileStylesheetCodeGen(stylesheetUrl, cssText);
  }

  private _processTemplateCodeGen(compMeta: CompileDirectiveMetadata,
                                  directives: CompileDirectiveMetadata[],
                                  targetDeclarations: string[], targetTemplateArguments: any[][]) {
    let uniqueDirectives = removeDuplicates(directives);
    var styleExpr = this._styleCompiler.compileComponentCodeGen(compMeta.template);
    var parsedTemplate = this._templateParser.parse(compMeta.template.template, uniqueDirectives,
                                                    compMeta.type.name);
    var changeDetectorsExprs = this._cdCompiler.compileComponentCodeGen(
        compMeta.type, compMeta.changeDetection, parsedTemplate);
    var commandsExpr = this._commandCompiler.compileComponentCodeGen(
        compMeta, parsedTemplate, changeDetectorsExprs.expressions,
        codeGenComponentTemplateFactory);

    addAll(styleExpr.declarations, targetDeclarations);
    addAll(changeDetectorsExprs.declarations, targetDeclarations);
    addAll(commandsExpr.declarations, targetDeclarations);

    targetTemplateArguments.push(
        [changeDetectorsExprs.expressions[0], commandsExpr.expression, styleExpr.expression]);
  }
}

export class NormalizedComponentWithViewDirectives {
  constructor(public component: CompileDirectiveMetadata,
              public directives: CompileDirectiveMetadata[]) {}
}

function assertComponent(meta: CompileDirectiveMetadata) {
  if (!meta.isComponent) {
    throw new BaseException(`Could not compile '${meta.type.name}' because it is not a component.`);
  }
}

function templateVariableName(type: CompileTypeMetadata): string {
  return `${type.name}Template`;
}

function templateGetterName(type: CompileTypeMetadata): string {
  return `${templateVariableName(type)}Getter`;
}

function templateModuleUrl(moduleUrl: string): string {
  var urlWithoutSuffix = moduleUrl.substring(0, moduleUrl.length - MODULE_SUFFIX.length);
  return `${urlWithoutSuffix}.template${MODULE_SUFFIX}`;
}

function addAll(source: any[], target: any[]) {
  for (var i = 0; i < source.length; i++) {
    target.push(source[i]);
  }
}

function codeGenComponentTemplateFactory(nestedCompType: CompileDirectiveMetadata): string {
  return `${moduleRef(templateModuleUrl(nestedCompType.type.moduleUrl))}${templateGetterName(nestedCompType.type)}`;
}

function removeDuplicates(items: CompileDirectiveMetadata[]): CompileDirectiveMetadata[] {
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
