import {Type, Json, isBlank, stringify} from 'angular2/src/core/facade/lang';
import {BaseException} from 'angular2/src/core/facade/exceptions';
import {ListWrapper, SetWrapper} from 'angular2/src/core/facade/collection';
import {PromiseWrapper, Promise} from 'angular2/src/core/facade/async';
import {
  CompiledTemplate,
  TemplateCmd,
  nextTemplateId,
  CompiledHostTemplate
} from 'angular2/src/core/compiler/template_commands';
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
import {APP_ID} from 'angular2/src/core/render/dom/dom_tokens';

import {TEMPLATE_COMMANDS_MODULE_REF} from './command_compiler';
import {IS_DART, codeGenExportVariable, escapeSingleQuoteString, codeGenValueFn} from './util';
import {Inject} from 'angular2/src/core/di';

@Injectable()
export class TemplateCompiler {
  private _hostCacheKeys = new Map<Type, any>();
  private _compiledTemplateCache = new Map<any, CompiledTemplate>();
  private _compiledTemplateDone = new Map<any, Promise<CompiledTemplate>>();
  private _appId: string;

  constructor(private _runtimeMetadataResolver: RuntimeMetadataResolver,
              private _templateNormalizer: TemplateNormalizer,
              private _templateParser: TemplateParser, private _styleCompiler: StyleCompiler,
              private _commandCompiler: CommandCompiler,
              private _cdCompiler: ChangeDetectionCompiler, @Inject(APP_ID) appId: string) {
    this._appId = appId;
  }

  normalizeDirectiveMetadata(directive:
                                 CompileDirectiveMetadata): Promise<CompileDirectiveMetadata> {
    if (!directive.isComponent) {
      // For non components there is nothing to be normalized yet.
      return PromiseWrapper.resolve(directive);
    }
    var normalizedTemplatePromise;
    if (directive.isComponent) {
      normalizedTemplatePromise =
          this._templateNormalizer.normalizeTemplate(directive.type, directive.template);
    } else {
      normalizedTemplatePromise = PromiseWrapper.resolve(null);
    }
    return normalizedTemplatePromise.then(
        (normalizedTemplate) => new CompileDirectiveMetadata({
          type: directive.type,
          isComponent: directive.isComponent,
          dynamicLoadable: directive.dynamicLoadable,
          selector: directive.selector,
          exportAs: directive.exportAs,
          changeDetection: directive.changeDetection,
          properties: directive.properties,
          events: directive.events,
          hostListeners: directive.hostListeners,
          hostProperties: directive.hostProperties,
          hostAttributes: directive.hostAttributes,
          lifecycleHooks: directive.lifecycleHooks, template: normalizedTemplate
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
        .then(compiledTemplate => new CompiledHostTemplate(() => compiledTemplate));
  }

  clearCache() {
    this._hostCacheKeys.clear();
    this._styleCompiler.clearCache();
    this._compiledTemplateCache.clear();
    this._compiledTemplateDone.clear();
  }

  private _compileComponentRuntime(cacheKey: any, compMeta: CompileDirectiveMetadata,
                                   viewDirectives: CompileDirectiveMetadata[],
                                   compilingComponentCacheKeys: Set<any>): CompiledTemplate {
    var compiledTemplate = this._compiledTemplateCache.get(cacheKey);
    var done = this._compiledTemplateDone.get(cacheKey);
    if (isBlank(compiledTemplate)) {
      var styles;
      var changeDetectorFactory;
      var commands;
      var templateId = nextTemplateId();
      compiledTemplate =
          new CompiledTemplate(templateId, (_a, _b) => [changeDetectorFactory, commands, styles]);
      this._compiledTemplateCache.set(cacheKey, compiledTemplate);
      compilingComponentCacheKeys.add(cacheKey);
      done =
          PromiseWrapper.all([
                          <any>this._styleCompiler.compileComponentRuntime(this._appId, templateId,
                                                                           compMeta.template)
                        ].concat(viewDirectives.map(dirMeta =>
                                                        this.normalizeDirectiveMetadata(dirMeta))))
              .then((stylesAndNormalizedViewDirMetas: any[]) => {
                var childPromises = [];
                var normalizedViewDirMetas = stylesAndNormalizedViewDirMetas.slice(1);
                var parsedTemplate = this._templateParser.parse(
                    compMeta.template.template, normalizedViewDirMetas, compMeta.type.name);

                var changeDetectorFactories = this._cdCompiler.compileComponentRuntime(
                    compMeta.type, compMeta.changeDetection, parsedTemplate);
                changeDetectorFactory = changeDetectorFactories[0];
                styles = stylesAndNormalizedViewDirMetas[0];
                commands = this._compileCommandsRuntime(compMeta, templateId, parsedTemplate,
                                                        changeDetectorFactories,
                                                        compilingComponentCacheKeys, childPromises);
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

  private _compileCommandsRuntime(compMeta: CompileDirectiveMetadata, templateId: number,
                                  parsedTemplate: TemplateAst[],
                                  changeDetectorFactories: Function[],
                                  compilingComponentCacheKeys: Set<Type>,
                                  childPromises: Promise<any>[]): TemplateCmd[] {
    return this._commandCompiler.compileComponentRuntime(
        compMeta, this._appId, templateId, parsedTemplate, changeDetectorFactories,
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
          return childTemplate;
        });
  }

  compileTemplatesCodeGen(moduleId: string,
                          components: NormalizedComponentWithViewDirectives[]): SourceModule {
    var declarations = [];
    var templateArguments = [];
    var componentMetas: CompileDirectiveMetadata[] = [];
    var isHost: boolean[] = [];
    var templateIdVariable = 'templateId';
    var appIdVariable = 'appId';
    components.forEach(componentWithDirs => {
      var compMeta = <CompileDirectiveMetadata>componentWithDirs.component;
      assertComponent(compMeta);
      componentMetas.push(compMeta);
      isHost.push(false);
      this._processTemplateCodeGen(compMeta, appIdVariable, templateIdVariable,
                                   <CompileDirectiveMetadata[]>componentWithDirs.directives,
                                   declarations, templateArguments);
      if (compMeta.dynamicLoadable) {
        var hostMeta = createHostComponentMeta(compMeta.type, compMeta.selector);
        componentMetas.push(hostMeta);
        isHost.push(true);
        this._processTemplateCodeGen(hostMeta, appIdVariable, templateIdVariable, [compMeta],
                                     declarations, templateArguments);
      }
    });
    ListWrapper.forEachWithIndex(componentMetas, (compMeta: CompileDirectiveMetadata,
                                                  index: number) => {
      var templateDataFn = codeGenValueFn([templateIdVariable, appIdVariable],
                                          `[${(<any[]>templateArguments[index]).join(',')}]`);
      var compiledTemplateExpr =
          `new ${TEMPLATE_COMMANDS_MODULE_REF}CompiledTemplate(${TEMPLATE_COMMANDS_MODULE_REF}nextTemplateId(),${templateDataFn})`;
      var variableValueExpr;
      if (isHost[index]) {
        variableValueExpr =
            `new ${TEMPLATE_COMMANDS_MODULE_REF}CompiledHostTemplate(${codeGenValueFn([], compiledTemplateExpr)})`;
      } else {
        variableValueExpr = compiledTemplateExpr;
      }
      declarations.push(
          `${codeGenExportVariable(templateVariableName(compMeta.type))}${variableValueExpr};`);
    });
    return new SourceModule(`${templateModuleName(moduleId)}`, declarations.join('\n'));
  }

  compileStylesheetCodeGen(moduleId: string, cssText: string): SourceModule[] {
    return this._styleCompiler.compileStylesheetCodeGen(moduleId, cssText);
  }

  private _processTemplateCodeGen(compMeta: CompileDirectiveMetadata, appIdExpr: string,
                                  templateIdExpr: string, directives: CompileDirectiveMetadata[],
                                  targetDeclarations: string[], targetTemplateArguments: any[][]) {
    var styleExpr =
        this._styleCompiler.compileComponentCodeGen(appIdExpr, templateIdExpr, compMeta.template);
    var parsedTemplate =
        this._templateParser.parse(compMeta.template.template, directives, compMeta.type.name);
    var changeDetectorsExprs = this._cdCompiler.compileComponentCodeGen(
        compMeta.type, compMeta.changeDetection, parsedTemplate);
    var commandsExpr = this._commandCompiler.compileComponentCodeGen(
        compMeta, appIdExpr, templateIdExpr, parsedTemplate, changeDetectorsExprs.expressions,
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

function templateModuleName(moduleId: string): string {
  return `${moduleId}.template`;
}

function addAll(source: any[], target: any[]) {
  for (var i = 0; i < source.length; i++) {
    target.push(source[i]);
  }
}

function codeGenComponentTemplateFactory(nestedCompType: CompileDirectiveMetadata): string {
  return `${moduleRef(templateModuleName(nestedCompType.type.moduleId))}${templateVariableName(nestedCompType.type)}`;
}
