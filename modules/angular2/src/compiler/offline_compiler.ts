import {
  CompileDirectiveMetadata,
  CompileIdentifierMetadata,
  CompilePipeMetadata,
  createHostComponentMeta
} from './compile_metadata';

import {BaseException, unimplemented} from 'angular2/src/facade/exceptions';
import {ListWrapper} from 'angular2/src/facade/collection';
import {StyleCompiler, StylesCompileDependency, StylesCompileResult} from './style_compiler';
import {ViewCompiler, ViewCompileResult} from './view_compiler/view_compiler';
import {TemplateParser} from './template_parser';
import {DirectiveNormalizer} from './directive_normalizer';
import {OutputEmitter} from './output/abstract_emitter';
import * as o from './output/output_ast';
import {ComponentFactory} from 'angular2/src/core/linker/component_factory';

import {
  MODULE_SUFFIX,
} from './util';

var _COMPONENT_FACTORY_IDENTIFIER = new CompileIdentifierMetadata({
  name: 'ComponentFactory',
  runtime: ComponentFactory,
  moduleUrl: `asset:angular2/lib/src/core/linker/component_factory${MODULE_SUFFIX}`
});

export class SourceModule {
  constructor(public moduleUrl: string, public source: string) {}
}

export class NormalizedComponentWithViewDirectives {
  constructor(public component: CompileDirectiveMetadata,
              public directives: CompileDirectiveMetadata[], public pipes: CompilePipeMetadata[]) {}
}

export class OfflineCompiler {
  constructor(private _directiveNormalizer: DirectiveNormalizer,
              private _templateParser: TemplateParser, private _styleCompiler: StyleCompiler,
              private _viewCompiler: ViewCompiler, private _outputEmitter: OutputEmitter) {}

  normalizeDirectiveMetadata(directive: CompileDirectiveMetadata):
      Promise<CompileDirectiveMetadata> {
    return this._directiveNormalizer.normalizeDirective(directive);
  }

  compileTemplates(components: NormalizedComponentWithViewDirectives[]): SourceModule {
    if (components.length === 0) {
      throw new BaseException('No components given');
    }
    var statements = [];
    var exportedVars = [];
    var moduleUrl = _templateModuleUrl(components[0].component);
    components.forEach(componentWithDirs => {
      var compMeta = <CompileDirectiveMetadata>componentWithDirs.component;
      _assertComponent(compMeta);
      var compViewFactoryVar = this._compileComponent(compMeta, componentWithDirs.directives,
                                                      componentWithDirs.pipes, statements);
      exportedVars.push(compViewFactoryVar);

      var hostMeta = createHostComponentMeta(compMeta.type, compMeta.selector);
      var hostViewFactoryVar = this._compileComponent(hostMeta, [compMeta], [], statements);
      var compFactoryVar = `${compMeta.type.name}NgFactory`;
      statements.push(o.variable(compFactoryVar)
                          .set(o.importExpr(_COMPONENT_FACTORY_IDENTIFIER)
                                   .instantiate(
                                       [
                                         o.literal(compMeta.selector),
                                         o.variable(hostViewFactoryVar),
                                         o.importExpr(compMeta.type)
                                       ],
                                       o.importType(_COMPONENT_FACTORY_IDENTIFIER, null,
                                                    [o.TypeModifier.Const])))
                          .toDeclStmt(null, [o.StmtModifier.Final]));
      exportedVars.push(compFactoryVar);
    });
    return this._codegenSourceModule(moduleUrl, statements, exportedVars);
  }

  compileStylesheet(stylesheetUrl: string, cssText: string): SourceModule[] {
    var plainStyles = this._styleCompiler.compileStylesheet(stylesheetUrl, cssText, false);
    var shimStyles = this._styleCompiler.compileStylesheet(stylesheetUrl, cssText, true);
    return [
      this._codegenSourceModule(_stylesModuleUrl(stylesheetUrl, false),
                                _resolveStyleStatements(plainStyles), [plainStyles.stylesVar]),
      this._codegenSourceModule(_stylesModuleUrl(stylesheetUrl, true),
                                _resolveStyleStatements(shimStyles), [shimStyles.stylesVar])
    ];
  }

  private _compileComponent(compMeta: CompileDirectiveMetadata,
                            directives: CompileDirectiveMetadata[], pipes: CompilePipeMetadata[],
                            targetStatements: o.Statement[]): string {
    var styleResult = this._styleCompiler.compileComponent(compMeta);
    var parsedTemplate = this._templateParser.parse(compMeta, compMeta.template.template,
                                                    directives, pipes, compMeta.type.name);
    var viewResult = this._viewCompiler.compileComponent(compMeta, parsedTemplate,
                                                         o.variable(styleResult.stylesVar), pipes);
    ListWrapper.addAll(targetStatements, _resolveStyleStatements(styleResult));
    ListWrapper.addAll(targetStatements, _resolveViewStatements(viewResult));
    return viewResult.viewFactoryVar;
  }


  private _codegenSourceModule(moduleUrl: string, statements: o.Statement[],
                               exportedVars: string[]): SourceModule {
    return new SourceModule(
        moduleUrl, this._outputEmitter.emitStatements(moduleUrl, statements, exportedVars));
  }
}

function _resolveViewStatements(compileResult: ViewCompileResult): o.Statement[] {
  compileResult.dependencies.forEach(
      (dep) => { dep.factoryPlaceholder.moduleUrl = _templateModuleUrl(dep.comp); });
  return compileResult.statements;
}


function _resolveStyleStatements(compileResult: StylesCompileResult): o.Statement[] {
  compileResult.dependencies.forEach((dep) => {
    dep.valuePlaceholder.moduleUrl = _stylesModuleUrl(dep.sourceUrl, dep.isShimmed);
  });
  return compileResult.statements;
}

function _templateModuleUrl(comp: CompileDirectiveMetadata): string {
  var moduleUrl = comp.type.moduleUrl;
  var urlWithoutSuffix = moduleUrl.substring(0, moduleUrl.length - MODULE_SUFFIX.length);
  return `${urlWithoutSuffix}.ngfactory${MODULE_SUFFIX}`;
}

function _stylesModuleUrl(stylesheetUrl: string, shim: boolean): string {
  return shim ? `${stylesheetUrl}.shim${MODULE_SUFFIX}` : `${stylesheetUrl}${MODULE_SUFFIX}`;
}

function _assertComponent(meta: CompileDirectiveMetadata) {
  if (!meta.isComponent) {
    throw new BaseException(`Could not compile '${meta.type.name}' because it is not a component.`);
  }
}
