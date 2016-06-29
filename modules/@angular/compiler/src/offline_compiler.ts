/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory} from '@angular/core';

import {CompileDirectiveMetadata, CompileIdentifierMetadata, CompilePipeMetadata, createHostComponentMeta} from './compile_metadata';
import {DirectiveNormalizer} from './directive_normalizer';
import {ListWrapper} from './facade/collection';
import {BaseException} from './facade/exceptions';
import {OutputEmitter} from './output/abstract_emitter';
import * as o from './output/output_ast';
import {CompiledStylesheet, StyleCompiler} from './style_compiler';
import {TemplateParser} from './template_parser';
import {assetUrl} from './util';
import {ComponentFactoryDependency, ViewCompileResult, ViewCompiler, ViewFactoryDependency} from './view_compiler/view_compiler';
import {XHR} from './xhr';

var _COMPONENT_FACTORY_IDENTIFIER = new CompileIdentifierMetadata({
  name: 'ComponentFactory',
  runtime: ComponentFactory,
  moduleUrl: assetUrl('core', 'linker/component_factory')
});

export class SourceModule {
  constructor(public moduleUrl: string, public source: string) {}
}

export class StyleSheetSourceWithImports {
  constructor(public source: SourceModule, public importedUrls: string[]) {}
}

export class NormalizedComponentWithViewDirectives {
  constructor(
      public component: CompileDirectiveMetadata, public directives: CompileDirectiveMetadata[],
      public pipes: CompilePipeMetadata[]) {}
}

export class OfflineCompiler {
  constructor(
      private _directiveNormalizer: DirectiveNormalizer, private _templateParser: TemplateParser,
      private _styleCompiler: StyleCompiler, private _viewCompiler: ViewCompiler,
      private _outputEmitter: OutputEmitter) {}

  normalizeDirectiveMetadata(directive: CompileDirectiveMetadata):
      Promise<CompileDirectiveMetadata> {
    return this._directiveNormalizer.normalizeDirective(directive).asyncResult;
  }

  compileTemplates(components: NormalizedComponentWithViewDirectives[]): SourceModule[] {
    if (components.length === 0) {
      throw new BaseException('No components given');
    }
    var statements: o.DeclareVarStmt[] = [];
    var exportedVars: string[] = [];
    var moduleUrl = _ngfactoryModuleUrl(components[0].component.type);
    var outputSourceModules: SourceModule[] = [];
    components.forEach(componentWithDirs => {
      var compMeta = <CompileDirectiveMetadata>componentWithDirs.component;
      _assertComponent(compMeta);
      var fileSuffix = _splitLastSuffix(compMeta.type.moduleUrl)[1];
      var stylesCompileResults = this._styleCompiler.compileComponent(compMeta);
      stylesCompileResults.externalStylesheets.forEach((compiledStyleSheet) => {
        outputSourceModules.push(this._codgenStyles(compiledStyleSheet, fileSuffix));
      });

      var compViewFactoryVar = this._compileComponent(
          compMeta, componentWithDirs.directives, componentWithDirs.pipes,
          stylesCompileResults.componentStylesheet, fileSuffix, statements);
      exportedVars.push(compViewFactoryVar);

      var hostMeta = createHostComponentMeta(compMeta.type, compMeta.selector);
      var hostViewFactoryVar =
          this._compileComponent(hostMeta, [compMeta], [], null, fileSuffix, statements);
      var compFactoryVar = _componentFactoryName(compMeta.type);
      statements.push(
          o.variable(compFactoryVar)
              .set(o.importExpr(_COMPONENT_FACTORY_IDENTIFIER, [o.importType(compMeta.type)])
                       .instantiate(
                           [
                             o.literal(compMeta.selector), o.variable(hostViewFactoryVar),
                             o.importExpr(compMeta.type)
                           ],
                           o.importType(
                               _COMPONENT_FACTORY_IDENTIFIER, [o.importType(compMeta.type)],
                               [o.TypeModifier.Const])))
              .toDeclStmt(null, [o.StmtModifier.Final]));
      exportedVars.push(compFactoryVar);
    });
    outputSourceModules.unshift(this._codegenSourceModule(moduleUrl, statements, exportedVars));
    return outputSourceModules;
  }

  private _compileComponent(
      compMeta: CompileDirectiveMetadata, directives: CompileDirectiveMetadata[],
      pipes: CompilePipeMetadata[], componentStyles: CompiledStylesheet, fileSuffix: string,
      targetStatements: o.Statement[]): string {
    var parsedTemplate = this._templateParser.parse(
        compMeta, compMeta.template.template, directives, pipes, compMeta.type.name);
    var stylesExpr = componentStyles ? o.variable(componentStyles.stylesVar) : o.literalArr([]);
    var viewResult =
        this._viewCompiler.compileComponent(compMeta, parsedTemplate, stylesExpr, pipes);
    if (componentStyles) {
      ListWrapper.addAll(targetStatements, _resolveStyleStatements(componentStyles, fileSuffix));
    }
    ListWrapper.addAll(targetStatements, _resolveViewStatements(viewResult));
    return viewResult.viewFactoryVar;
  }

  private _codgenStyles(stylesCompileResult: CompiledStylesheet, fileSuffix: string): SourceModule {
    _resolveStyleStatements(stylesCompileResult, fileSuffix);
    return this._codegenSourceModule(
        _stylesModuleUrl(
            stylesCompileResult.meta.moduleUrl, stylesCompileResult.isShimmed, fileSuffix),
        stylesCompileResult.statements, [stylesCompileResult.stylesVar]);
  }

  private _codegenSourceModule(
      moduleUrl: string, statements: o.Statement[], exportedVars: string[]): SourceModule {
    return new SourceModule(
        moduleUrl, this._outputEmitter.emitStatements(moduleUrl, statements, exportedVars));
  }
}

function _resolveViewStatements(compileResult: ViewCompileResult): o.Statement[] {
  compileResult.dependencies.forEach((dep) => {
    if (dep instanceof ViewFactoryDependency) {
      let vfd = <ViewFactoryDependency>dep;
      vfd.placeholder.moduleUrl = _ngfactoryModuleUrl(vfd.comp);
    } else if (dep instanceof ComponentFactoryDependency) {
      let cfd = <ComponentFactoryDependency>dep;
      cfd.placeholder.name = _componentFactoryName(cfd.comp);
      cfd.placeholder.moduleUrl = _ngfactoryModuleUrl(cfd.comp);
    }
  });
  return compileResult.statements;
}


function _resolveStyleStatements(
    compileResult: CompiledStylesheet, fileSuffix: string): o.Statement[] {
  compileResult.dependencies.forEach((dep) => {
    dep.valuePlaceholder.moduleUrl = _stylesModuleUrl(dep.moduleUrl, dep.isShimmed, fileSuffix);
  });
  return compileResult.statements;
}

function _ngfactoryModuleUrl(comp: CompileIdentifierMetadata): string {
  var urlWithSuffix = _splitLastSuffix(comp.moduleUrl);
  return `${urlWithSuffix[0]}.ngfactory${urlWithSuffix[1]}`;
}

function _componentFactoryName(comp: CompileIdentifierMetadata): string {
  return `${comp.name}NgFactory`;
}

function _stylesModuleUrl(stylesheetUrl: string, shim: boolean, suffix: string): string {
  return shim ? `${stylesheetUrl}.shim${suffix}` : `${stylesheetUrl}${suffix}`;
}

function _assertComponent(meta: CompileDirectiveMetadata) {
  if (!meta.isComponent) {
    throw new BaseException(`Could not compile '${meta.type.name}' because it is not a component.`);
  }
}

function _splitLastSuffix(path: string): string[] {
  let lastDot = path.lastIndexOf('.');
  if (lastDot !== -1) {
    return [path.substring(0, lastDot), path.substring(lastDot)];
  } else {
    return [path, ''];
  }
}
