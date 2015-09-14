import {Type, Json, isBlank, stringify} from 'angular2/src/core/facade/lang';
import {BaseException} from 'angular2/src/core/facade/exceptions';
import {ListWrapper, SetWrapper} from 'angular2/src/core/facade/collection';
import {PromiseWrapper, Promise} from 'angular2/src/core/facade/async';
import {CompiledTemplate, TemplateCmd} from 'angular2/src/core/compiler/template_commands';
import {
  createHostComponentMeta,
  DirectiveMetadata,
  INormalizedDirectiveMetadata,
  NormalizedDirectiveMetadata,
  TypeMetadata,
  ChangeDetectionMetadata,
  NormalizedTemplateMetadata
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
import {IS_DART, codeGenExportVariable, escapeSingleQuoteString, codeGenValueFn} from './util';

@Injectable()
export class TemplateCompiler {
  private _compiledTemplateCache: Map<number, CompiledTemplate> = new Map();
  private _compiledTemplateDone: Map<number, Promise<CompiledTemplate>> = new Map();

  constructor(private _runtimeMetadataResolver: RuntimeMetadataResolver,
              private _templateNormalizer: TemplateNormalizer,
              private _templateParser: TemplateParser, private _styleCompiler: StyleCompiler,
              private _commandCompiler: CommandCompiler,
              private _cdCompiler: ChangeDetectionCompiler) {}

  normalizeDirective(directive: DirectiveMetadata): Promise<INormalizedDirectiveMetadata> {
    var normalizedTemplatePromise;
    if (directive.isComponent) {
      normalizedTemplatePromise =
          this._templateNormalizer.normalizeTemplate(directive.type, directive.template);
    } else {
      normalizedTemplatePromise = PromiseWrapper.resolve(null);
    }
    return normalizedTemplatePromise.then(
        (normalizedTemplate) => new NormalizedDirectiveMetadata({
          selector: directive.selector,
          dynamicLoadable: directive.dynamicLoadable,
          isComponent: directive.isComponent,
          type: directive.type,
          changeDetection: directive.changeDetection, template: normalizedTemplate
        }));
  }

  serializeTemplateMetadata(metadata: INormalizedDirectiveMetadata): string {
    return Json.stringify((<NormalizedDirectiveMetadata>metadata).toJson());
  }

  deserializeTemplateMetadata(data: string): INormalizedDirectiveMetadata {
    return NormalizedDirectiveMetadata.fromJson(Json.parse(data));
  }

  compileHostComponentRuntime(type: Type): Promise<CompiledTemplate> {
    var compMeta: DirectiveMetadata = this._runtimeMetadataResolver.getMetadata(type);
    if (isBlank(compMeta) || !compMeta.isComponent || !compMeta.dynamicLoadable) {
      throw new BaseException(
          `Could not compile '${stringify(type)}' because it is not dynamically loadable.`);
    }
    var hostMeta: NormalizedDirectiveMetadata =
        createHostComponentMeta(compMeta.type, compMeta.selector);
    this._compileComponentRuntime(hostMeta, [compMeta], new Set());
    return this._compiledTemplateDone.get(hostMeta.type.id);
  }

  private _compileComponentRuntime(compMeta: NormalizedDirectiveMetadata,
                                   viewDirectives: DirectiveMetadata[],
                                   compilingComponentIds: Set<number>): CompiledTemplate {
    var compiledTemplate = this._compiledTemplateCache.get(compMeta.type.id);
    var done = this._compiledTemplateDone.get(compMeta.type.id);
    if (isBlank(compiledTemplate)) {
      var styles;
      var changeDetectorFactories;
      var commands;
      compiledTemplate =
          new CompiledTemplate(compMeta.type.id, () => [changeDetectorFactories, commands, styles]);
      this._compiledTemplateCache.set(compMeta.type.id, compiledTemplate);
      compilingComponentIds.add(compMeta.type.id);
      done =
          PromiseWrapper.all([this._styleCompiler.compileComponentRuntime(compMeta)].concat(
                                 viewDirectives.map(dirMeta => this.normalizeDirective(dirMeta))))
              .then((stylesAndNormalizedViewDirMetas: any[]) => {
                var childPromises = [];
                var normalizedViewDirMetas = stylesAndNormalizedViewDirMetas.slice(1);
                var parsedTemplate = this._templateParser.parse(
                    compMeta.template.template, normalizedViewDirMetas, compMeta.type.name);

                changeDetectorFactories = this._cdCompiler.compileComponentRuntime(
                    compMeta.type, compMeta.changeDetection.changeDetection, parsedTemplate);
                styles = stylesAndNormalizedViewDirMetas[0];
                commands = this._compileCommandsRuntime(compMeta, parsedTemplate,
                                                        compilingComponentIds, childPromises);
                return PromiseWrapper.all(childPromises);
              })
              .then((_) => {
                SetWrapper.delete(compilingComponentIds, compMeta.type.id);
                return compiledTemplate;
              });
      this._compiledTemplateDone.set(compMeta.type.id, done);
    }
    return compiledTemplate;
  }

  private _compileCommandsRuntime(compMeta: NormalizedDirectiveMetadata,
                                  parsedTemplate: TemplateAst[], compilingComponentIds: Set<number>,
                                  childPromises: Promise<any>[]): TemplateCmd[] {
    return this._commandCompiler.compileComponentRuntime(
        compMeta, parsedTemplate, (childComponentDir: NormalizedDirectiveMetadata) => {
          var childViewDirectives: DirectiveMetadata[] =
              this._runtimeMetadataResolver.getViewDirectivesMetadata(
                  childComponentDir.type.runtime);
          var childIsRecursive = SetWrapper.has(compilingComponentIds, childComponentDir.type.id);
          var childTemplate = this._compileComponentRuntime(childComponentDir, childViewDirectives,
                                                            compilingComponentIds);
          if (!childIsRecursive) {
            // Only wait for a child if it is not a cycle
            childPromises.push(this._compiledTemplateDone.get(childComponentDir.type.id));
          }
          return childTemplate;
        });
  }

  compileTemplatesCodeGen(moduleId: string,
                          components: NormalizedComponentWithViewDirectives[]): SourceModule {
    var declarations = [];
    var templateArguments = [];
    var componentMetas: NormalizedDirectiveMetadata[] = [];
    components.forEach(componentWithDirs => {
      var compMeta = <NormalizedDirectiveMetadata>componentWithDirs.component;
      componentMetas.push(compMeta);
      this._processTemplateCodeGen(compMeta,
                                   <NormalizedDirectiveMetadata[]>componentWithDirs.directives,
                                   declarations, templateArguments);
      if (compMeta.dynamicLoadable) {
        var hostMeta = createHostComponentMeta(compMeta.type, compMeta.selector);
        componentMetas.push(hostMeta);
        this._processTemplateCodeGen(hostMeta, [compMeta], declarations, templateArguments);
      }
    });
    ListWrapper.forEachWithIndex(componentMetas, (compMeta: NormalizedDirectiveMetadata,
                                                  index: number) => {
      var templateDataFn = codeGenValueFn([], `[${templateArguments[index].join(',')}]`);
      declarations.push(
          `${codeGenExportVariable(templateVariableName(compMeta.type))}new ${TEMPLATE_COMMANDS_MODULE_REF}CompiledTemplate(${compMeta.type.id},${templateDataFn});`);
    });
    return new SourceModule(`${templateModuleName(moduleId)}`, declarations.join('\n'));
  }

  compileStylesheetCodeGen(moduleId: string, cssText: string): SourceModule[] {
    return this._styleCompiler.compileStylesheetCodeGen(moduleId, cssText);
  }

  private _processTemplateCodeGen(compMeta: NormalizedDirectiveMetadata,
                                  directives: NormalizedDirectiveMetadata[],
                                  targetDeclarations: string[], targetTemplateArguments: any[][]) {
    var styleExpr = this._styleCompiler.compileComponentCodeGen(compMeta);
    var parsedTemplate =
        this._templateParser.parse(compMeta.template.template, directives, compMeta.type.name);
    var changeDetectorsExpr = this._cdCompiler.compileComponentCodeGen(
        compMeta.type, compMeta.changeDetection.changeDetection, parsedTemplate);
    var commandsExpr = this._commandCompiler.compileComponentCodeGen(
        compMeta, parsedTemplate, codeGenComponentTemplateFactory);

    addAll(styleExpr.declarations, targetDeclarations);
    addAll(changeDetectorsExpr.declarations, targetDeclarations);
    addAll(commandsExpr.declarations, targetDeclarations);

    targetTemplateArguments.push(
        [changeDetectorsExpr.expression, commandsExpr.expression, styleExpr.expression]);
  }
}

export class NormalizedComponentWithViewDirectives {
  constructor(public component: INormalizedDirectiveMetadata,
              public directives: INormalizedDirectiveMetadata[]) {}
}

function templateVariableName(type: TypeMetadata): string {
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

function codeGenComponentTemplateFactory(nestedCompType: NormalizedDirectiveMetadata): string {
  return `${moduleRef(templateModuleName(nestedCompType.type.moduleId))}${templateVariableName(nestedCompType.type)}`;
}
