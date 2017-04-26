/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompileDirectiveSummary, CompileIdentifierMetadata, CompileNgModuleMetadata, CompileNgModuleSummary, CompilePipeMetadata, CompileProviderMetadata, CompileSummaryKind, CompileTypeMetadata, CompileTypeSummary, componentFactoryName, createHostComponentMeta, flatten, identifierName, sourceUrl, templateSourceUrl} from '../compile_metadata';
import {CompilerConfig} from '../config';
import {Identifiers, createIdentifier, createIdentifierToken} from '../identifiers';
import {CompileMetadataResolver} from '../metadata_resolver';
import {NgModuleCompiler} from '../ng_module_compiler';
import {OutputEmitter} from '../output/abstract_emitter';
import * as o from '../output/output_ast';
import {CompiledStylesheet, StyleCompiler} from '../style_compiler';
import {SummaryResolver} from '../summary_resolver';
import {TemplateParser} from '../template_parser/template_parser';
import {syntaxError} from '../util';
import {ViewCompiler} from '../view_compiler/view_compiler';

import {AotCompilerHost} from './compiler_host';
import {GeneratedFile} from './generated_file';
import {StaticSymbol} from './static_symbol';
import {ResolvedStaticSymbol, StaticSymbolResolver} from './static_symbol_resolver';
import {serializeSummaries} from './summary_serializer';
import {ngfactoryFilePath, splitTypescriptSuffix, summaryFileName, summaryForJitFileName, summaryForJitName} from './util';

export class AotCompiler {
  constructor(
      private _config: CompilerConfig, private _host: AotCompilerHost,
      private _metadataResolver: CompileMetadataResolver, private _templateParser: TemplateParser,
      private _styleCompiler: StyleCompiler, private _viewCompiler: ViewCompiler,
      private _ngModuleCompiler: NgModuleCompiler, private _outputEmitter: OutputEmitter,
      private _summaryResolver: SummaryResolver<StaticSymbol>, private _localeId: string|null,
      private _translationFormat: string|null, private _genFilePreamble: string|null,
      private _symbolResolver: StaticSymbolResolver) {}

  clearCache() { this._metadataResolver.clearCache(); }

  compileAll(rootFiles: string[]): Promise<GeneratedFile[]> {
    const programSymbols = extractProgramSymbols(this._symbolResolver, rootFiles, this._host);
    const {ngModuleByPipeOrDirective, files, ngModules} =
        analyzeAndValidateNgModules(programSymbols, this._host, this._metadataResolver);
    return Promise
        .all(ngModules.map(
            ngModule => this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(
                ngModule.type.reference, false)))
        .then(() => {
          const sourceModules = files.map(
              file => this._compileSrcFile(
                  file.srcUrl, ngModuleByPipeOrDirective, file.directives, file.pipes,
                  file.ngModules, file.injectables));
          return flatten(sourceModules);
        });
  }

  private _compileSrcFile(
      srcFileUrl: string, ngModuleByPipeOrDirective: Map<StaticSymbol, CompileNgModuleMetadata>,
      directives: StaticSymbol[], pipes: StaticSymbol[], ngModules: StaticSymbol[],
      injectables: StaticSymbol[]): GeneratedFile[] {
    const fileSuffix = splitTypescriptSuffix(srcFileUrl, true)[1];
    const statements: o.Statement[] = [];
    const exportedVars: string[] = [];
    const generatedFiles: GeneratedFile[] = [];

    generatedFiles.push(...this._createSummary(
        srcFileUrl, directives, pipes, ngModules, injectables, statements, exportedVars));

    // compile all ng modules
    exportedVars.push(
        ...ngModules.map((ngModuleType) => this._compileModule(ngModuleType, statements)));

    // compile components
    directives.forEach((dirType) => {
      const compMeta = this._metadataResolver.getDirectiveMetadata(<any>dirType);
      if (!compMeta.isComponent) {
        return Promise.resolve(null);
      }
      const ngModule = ngModuleByPipeOrDirective.get(dirType);
      if (!ngModule) {
        throw new Error(
            `Internal Error: cannot determine the module for component ${identifierName(compMeta.type)}!`);
      }

      _assertComponent(compMeta);

      // compile styles
      const stylesCompileResults = this._styleCompiler.compileComponent(compMeta);
      stylesCompileResults.externalStylesheets.forEach((compiledStyleSheet) => {
        generatedFiles.push(this._codgenStyles(srcFileUrl, compiledStyleSheet, fileSuffix));
      });

      // compile components
      const compViewVars = this._compileComponent(
          compMeta, ngModule, ngModule.transitiveModule.directives,
          stylesCompileResults.componentStylesheet, fileSuffix, statements);
      exportedVars.push(
          this._compileComponentFactory(compMeta, ngModule, fileSuffix, statements),
          compViewVars.viewClassVar, compViewVars.compRenderTypeVar);
    });
    if (statements.length > 0) {
      const srcModule = this._codegenSourceModule(
          srcFileUrl, ngfactoryFilePath(srcFileUrl, true), statements, exportedVars);
      generatedFiles.unshift(srcModule);
    }
    return generatedFiles;
  }

  private _createSummary(
      srcFileUrl: string, directives: StaticSymbol[], pipes: StaticSymbol[],
      ngModules: StaticSymbol[], injectables: StaticSymbol[], targetStatements: o.Statement[],
      targetExportedVars: string[]): GeneratedFile[] {
    const symbolSummaries = this._symbolResolver.getSymbolsOf(srcFileUrl)
                                .map(symbol => this._symbolResolver.resolveSymbol(symbol));
    const typeData: {
      summary: CompileTypeSummary,
      metadata: CompileNgModuleMetadata | CompileDirectiveMetadata | CompilePipeMetadata |
          CompileTypeMetadata
    }[] =
        [
          ...ngModules.map(ref => ({
                             summary: this._metadataResolver.getNgModuleSummary(ref) !,
                             metadata: this._metadataResolver.getNgModuleMetadata(ref) !
                           })),
          ...directives.map(ref => ({
                              summary: this._metadataResolver.getDirectiveSummary(ref) !,
                              metadata: this._metadataResolver.getDirectiveMetadata(ref) !
                            })),
          ...pipes.map(ref => ({
                         summary: this._metadataResolver.getPipeSummary(ref) !,
                         metadata: this._metadataResolver.getPipeMetadata(ref) !
                       })),
          ...injectables.map(ref => ({
                               summary: this._metadataResolver.getInjectableSummary(ref) !,
                               metadata: this._metadataResolver.getInjectableSummary(ref) !.type
                             }))
        ];
    const {json, exportAs, forJit} =
        serializeSummaries(this._summaryResolver, this._symbolResolver, symbolSummaries, typeData);
    exportAs.forEach((entry) => {
      targetStatements.push(
          o.variable(entry.exportAs).set(o.importExpr({reference: entry.symbol})).toDeclStmt());
      targetExportedVars.push(entry.exportAs);
    });
    return [
      new GeneratedFile(srcFileUrl, summaryFileName(srcFileUrl), json),
      this._codegenSourceModule(
          srcFileUrl, summaryForJitFileName(srcFileUrl, true), forJit.statements,
          forJit.exportedVars)
    ];
  }

  private _compileModule(ngModuleType: StaticSymbol, targetStatements: o.Statement[]): string {
    const ngModule = this._metadataResolver.getNgModuleMetadata(ngModuleType) !;
    const providers: CompileProviderMetadata[] = [];

    if (this._localeId) {
      providers.push({
        token: createIdentifierToken(Identifiers.LOCALE_ID),
        useValue: this._localeId,
      });
    }

    if (this._translationFormat) {
      providers.push({
        token: createIdentifierToken(Identifiers.TRANSLATIONS_FORMAT),
        useValue: this._translationFormat
      });
    }

    const appCompileResult = this._ngModuleCompiler.compile(ngModule, providers);
    targetStatements.push(...appCompileResult.statements);
    return appCompileResult.ngModuleFactoryVar;
  }

  private _compileComponentFactory(
      compMeta: CompileDirectiveMetadata, ngModule: CompileNgModuleMetadata, fileSuffix: string,
      targetStatements: o.Statement[]): string {
    const hostType = this._metadataResolver.getHostComponentType(compMeta.type.reference);
    const hostMeta = createHostComponentMeta(
        hostType, compMeta, this._metadataResolver.getHostComponentViewClass(hostType));
    const hostViewFactoryVar =
        this._compileComponent(
                hostMeta, ngModule, [compMeta.type], null, fileSuffix, targetStatements)
            .viewClassVar;
    const compFactoryVar = componentFactoryName(compMeta.type.reference);
    const inputsExprs: o.LiteralMapEntry[] = [];
    for (let propName in compMeta.inputs) {
      const templateName = compMeta.inputs[propName];
      // Don't quote so that the key gets minified...
      inputsExprs.push(new o.LiteralMapEntry(propName, o.literal(templateName), false));
    }
    const outputsExprs: o.LiteralMapEntry[] = [];
    for (let propName in compMeta.outputs) {
      const templateName = compMeta.outputs[propName];
      // Don't quote so that the key gets minified...
      outputsExprs.push(new o.LiteralMapEntry(propName, o.literal(templateName), false));
    }

    targetStatements.push(
        o.variable(compFactoryVar)
            .set(o.importExpr(createIdentifier(Identifiers.createComponentFactory)).callFn([
              o.literal(compMeta.selector), o.importExpr(compMeta.type),
              o.variable(hostViewFactoryVar), new o.LiteralMapExpr(inputsExprs),
              new o.LiteralMapExpr(outputsExprs),
              o.literalArr(
                  compMeta.template !.ngContentSelectors.map(selector => o.literal(selector)))
            ]))
            .toDeclStmt(
                o.importType(
                    createIdentifier(Identifiers.ComponentFactory), [o.importType(compMeta.type) !],
                    [o.TypeModifier.Const]),
                [o.StmtModifier.Final]));
    return compFactoryVar;
  }

  private _compileComponent(
      compMeta: CompileDirectiveMetadata, ngModule: CompileNgModuleMetadata,
      directiveIdentifiers: CompileIdentifierMetadata[], componentStyles: CompiledStylesheet|null,
      fileSuffix: string,
      targetStatements: o.Statement[]): {viewClassVar: string, compRenderTypeVar: string} {
    const directives =
        directiveIdentifiers.map(dir => this._metadataResolver.getDirectiveSummary(dir.reference));
    const pipes = ngModule.transitiveModule.pipes.map(
        pipe => this._metadataResolver.getPipeSummary(pipe.reference));

    const {template: parsedTemplate, pipes: usedPipes} = this._templateParser.parse(
        compMeta, compMeta.template !.template !, directives, pipes, ngModule.schemas,
        templateSourceUrl(ngModule.type, compMeta, compMeta.template !));
    const stylesExpr = componentStyles ? o.variable(componentStyles.stylesVar) : o.literalArr([]);
    const viewResult =
        this._viewCompiler.compileComponent(compMeta, parsedTemplate, stylesExpr, usedPipes);
    if (componentStyles) {
      targetStatements.push(
          ..._resolveStyleStatements(this._symbolResolver, componentStyles, fileSuffix));
    }
    targetStatements.push(...viewResult.statements);
    return {viewClassVar: viewResult.viewClassVar, compRenderTypeVar: viewResult.rendererTypeVar};
  }

  private _codgenStyles(
      fileUrl: string, stylesCompileResult: CompiledStylesheet, fileSuffix: string): GeneratedFile {
    _resolveStyleStatements(this._symbolResolver, stylesCompileResult, fileSuffix);
    return this._codegenSourceModule(
        fileUrl,
        _stylesModuleUrl(
            stylesCompileResult.meta.moduleUrl !, stylesCompileResult.isShimmed, fileSuffix),
        stylesCompileResult.statements, [stylesCompileResult.stylesVar]);
  }

  private _codegenSourceModule(
      srcFileUrl: string, genFileUrl: string, statements: o.Statement[],
      exportedVars: string[]): GeneratedFile {
    return new GeneratedFile(
        srcFileUrl, genFileUrl,
        this._outputEmitter.emitStatements(
            sourceUrl(srcFileUrl), genFileUrl, statements, exportedVars, this._genFilePreamble));
  }
}

function _resolveStyleStatements(
    reflector: StaticSymbolResolver, compileResult: CompiledStylesheet,
    fileSuffix: string): o.Statement[] {
  compileResult.dependencies.forEach((dep) => {
    dep.valuePlaceholder.reference = reflector.getStaticSymbol(
        _stylesModuleUrl(dep.moduleUrl, dep.isShimmed, fileSuffix), dep.name);
  });
  return compileResult.statements;
}

function _stylesModuleUrl(stylesheetUrl: string, shim: boolean, suffix: string): string {
  return `${stylesheetUrl}${shim ? '.shim' : ''}.ngstyle${suffix}`;
}

function _assertComponent(meta: CompileDirectiveMetadata) {
  if (!meta.isComponent) {
    throw new Error(
        `Could not compile '${identifierName(meta.type)}' because it is not a component.`);
  }
}

export interface NgAnalyzedModules {
  ngModules: CompileNgModuleMetadata[];
  ngModuleByPipeOrDirective: Map<StaticSymbol, CompileNgModuleMetadata>;
  files: Array<{
    srcUrl: string,
    directives: StaticSymbol[],
    pipes: StaticSymbol[],
    ngModules: StaticSymbol[],
    injectables: StaticSymbol[]
  }>;
  symbolsMissingModule?: StaticSymbol[];
}

export interface NgAnalyzeModulesHost { isSourceFile(filePath: string): boolean; }

// Returns all the source files and a mapping from modules to directives
export function analyzeNgModules(
    programStaticSymbols: StaticSymbol[], host: NgAnalyzeModulesHost,
    metadataResolver: CompileMetadataResolver): NgAnalyzedModules {
  const {ngModules, symbolsMissingModule} =
      _createNgModules(programStaticSymbols, host, metadataResolver);
  return _analyzeNgModules(programStaticSymbols, ngModules, symbolsMissingModule, metadataResolver);
}

export function analyzeAndValidateNgModules(
    programStaticSymbols: StaticSymbol[], host: NgAnalyzeModulesHost,
    metadataResolver: CompileMetadataResolver): NgAnalyzedModules {
  const result = analyzeNgModules(programStaticSymbols, host, metadataResolver);
  if (result.symbolsMissingModule && result.symbolsMissingModule.length) {
    const messages = result.symbolsMissingModule.map(
        s =>
            `Cannot determine the module for class ${s.name} in ${s.filePath}! Add ${s.name} to the NgModule to fix it.`);
    throw syntaxError(messages.join('\n'));
  }
  return result;
}

function _analyzeNgModules(
    programSymbols: StaticSymbol[], ngModuleMetas: CompileNgModuleMetadata[],
    symbolsMissingModule: StaticSymbol[],
    metadataResolver: CompileMetadataResolver): NgAnalyzedModules {
  const moduleMetasByRef = new Map<any, CompileNgModuleMetadata>();
  ngModuleMetas.forEach((ngModule) => moduleMetasByRef.set(ngModule.type.reference, ngModule));
  const ngModuleByPipeOrDirective = new Map<StaticSymbol, CompileNgModuleMetadata>();
  const ngModulesByFile = new Map<string, StaticSymbol[]>();
  const ngDirectivesByFile = new Map<string, StaticSymbol[]>();
  const ngPipesByFile = new Map<string, StaticSymbol[]>();
  const ngInjectablesByFile = new Map<string, StaticSymbol[]>();
  const filePaths = new Set<string>();

  // Make sure we produce an analyzed file for each input file
  programSymbols.forEach((symbol) => {
    const filePath = symbol.filePath;
    filePaths.add(filePath);
    if (metadataResolver.isInjectable(symbol)) {
      ngInjectablesByFile.set(filePath, (ngInjectablesByFile.get(filePath) || []).concat(symbol));
    }
  });

  // Looping over all modules to construct:
  // - a map from file to modules `ngModulesByFile`,
  // - a map from file to directives `ngDirectivesByFile`,
  // - a map from file to pipes `ngPipesByFile`,
  // - a map from directive/pipe to module `ngModuleByPipeOrDirective`.
  ngModuleMetas.forEach((ngModuleMeta) => {
    const srcFileUrl = ngModuleMeta.type.reference.filePath;
    filePaths.add(srcFileUrl);
    ngModulesByFile.set(
        srcFileUrl, (ngModulesByFile.get(srcFileUrl) || []).concat(ngModuleMeta.type.reference));

    ngModuleMeta.declaredDirectives.forEach((dirIdentifier) => {
      const fileUrl = dirIdentifier.reference.filePath;
      filePaths.add(fileUrl);
      ngDirectivesByFile.set(
          fileUrl, (ngDirectivesByFile.get(fileUrl) || []).concat(dirIdentifier.reference));
      ngModuleByPipeOrDirective.set(dirIdentifier.reference, ngModuleMeta);
    });
    ngModuleMeta.declaredPipes.forEach((pipeIdentifier) => {
      const fileUrl = pipeIdentifier.reference.filePath;
      filePaths.add(fileUrl);
      ngPipesByFile.set(
          fileUrl, (ngPipesByFile.get(fileUrl) || []).concat(pipeIdentifier.reference));
      ngModuleByPipeOrDirective.set(pipeIdentifier.reference, ngModuleMeta);
    });
  });

  const files: {
    srcUrl: string,
    directives: StaticSymbol[],
    pipes: StaticSymbol[],
    ngModules: StaticSymbol[],
    injectables: StaticSymbol[]
  }[] = [];

  filePaths.forEach((srcUrl) => {
    const directives = ngDirectivesByFile.get(srcUrl) || [];
    const pipes = ngPipesByFile.get(srcUrl) || [];
    const ngModules = ngModulesByFile.get(srcUrl) || [];
    const injectables = ngInjectablesByFile.get(srcUrl) || [];
    files.push({srcUrl, directives, pipes, ngModules, injectables});
  });

  return {
    // map directive/pipe to module
    ngModuleByPipeOrDirective,
    // list modules and directives for every source file
    files,
    ngModules: ngModuleMetas, symbolsMissingModule
  };
}

export function extractProgramSymbols(
    staticSymbolResolver: StaticSymbolResolver, files: string[],
    host: NgAnalyzeModulesHost): StaticSymbol[] {
  const staticSymbols: StaticSymbol[] = [];
  files.filter(fileName => host.isSourceFile(fileName)).forEach(sourceFile => {
    staticSymbolResolver.getSymbolsOf(sourceFile).forEach((symbol) => {
      const resolvedSymbol = staticSymbolResolver.resolveSymbol(symbol);
      const symbolMeta = resolvedSymbol.metadata;
      if (symbolMeta) {
        if (symbolMeta.__symbolic != 'error') {
          // Ignore symbols that are only included to record error information.
          staticSymbols.push(resolvedSymbol.symbol);
        }
      }
    });
  });

  return staticSymbols;
}

// Load the NgModules and check
// that all directives / pipes that are present in the program
// are also declared by a module.
function _createNgModules(
    programStaticSymbols: StaticSymbol[], host: NgAnalyzeModulesHost,
    metadataResolver: CompileMetadataResolver):
    {ngModules: CompileNgModuleMetadata[], symbolsMissingModule: StaticSymbol[]} {
  const ngModules = new Map<any, CompileNgModuleMetadata>();
  const programPipesAndDirectives: StaticSymbol[] = [];
  const ngModulePipesAndDirective = new Set<StaticSymbol>();

  const addNgModule = (staticSymbol: any) => {
    if (ngModules.has(staticSymbol) || !host.isSourceFile(staticSymbol.filePath)) {
      return false;
    }
    const ngModule = metadataResolver.getNgModuleMetadata(staticSymbol, false);
    if (ngModule) {
      ngModules.set(ngModule.type.reference, ngModule);
      ngModule.declaredDirectives.forEach((dir) => ngModulePipesAndDirective.add(dir.reference));
      ngModule.declaredPipes.forEach((pipe) => ngModulePipesAndDirective.add(pipe.reference));
      // For every input module add the list of transitively included modules
      ngModule.transitiveModule.modules.forEach(modMeta => addNgModule(modMeta.reference));
    }
    return !!ngModule;
  };
  programStaticSymbols.forEach((staticSymbol) => {
    if (!addNgModule(staticSymbol) &&
        (metadataResolver.isDirective(staticSymbol) || metadataResolver.isPipe(staticSymbol))) {
      programPipesAndDirectives.push(staticSymbol);
    }
  });

  // Throw an error if any of the program pipe or directives is not declared by a module
  const symbolsMissingModule =
      programPipesAndDirectives.filter(s => !ngModulePipesAndDirective.has(s));

  return {ngModules: Array.from(ngModules.values()), symbolsMissingModule};
}
