/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompileDirectiveSummary, CompileIdentifierMetadata, CompileNgModuleMetadata, CompileNgModuleSummary, CompilePipeMetadata, CompileProviderMetadata, CompileStylesheetMetadata, CompileSummaryKind, CompileTypeMetadata, CompileTypeSummary, componentFactoryName, createHostComponentMeta, flatten, identifierName, sourceUrl, templateSourceUrl} from '../compile_metadata';
import {CompilerConfig} from '../config';
import {Identifiers, createTokenForExternalReference} from '../identifiers';
import {CompileMetadataResolver} from '../metadata_resolver';
import {NgModuleCompiler} from '../ng_module_compiler';
import {OutputEmitter} from '../output/abstract_emitter';
import * as o from '../output/output_ast';
import {CompiledStylesheet, StyleCompiler} from '../style_compiler';
import {SummaryResolver} from '../summary_resolver';
import {TemplateParser} from '../template_parser/template_parser';
import {OutputContext, syntaxError} from '../util';
import {ViewCompileResult, ViewCompiler} from '../view_compiler/view_compiler';

import {AotCompilerHost} from './compiler_host';
import {GeneratedFile} from './generated_file';
import {StaticReflector} from './static_reflector';
import {StaticSymbol} from './static_symbol';
import {ResolvedStaticSymbol, StaticSymbolResolver} from './static_symbol_resolver';
import {createForJitStub, serializeSummaries} from './summary_serializer';
import {ngfactoryFilePath, splitTypescriptSuffix, summaryFileName, summaryForJitFileName, summaryForJitName} from './util';

export class AotCompiler {
  constructor(
      private _config: CompilerConfig, private _host: AotCompilerHost,
      private _reflector: StaticReflector, private _metadataResolver: CompileMetadataResolver,
      private _templateParser: TemplateParser, private _styleCompiler: StyleCompiler,
      private _viewCompiler: ViewCompiler, private _ngModuleCompiler: NgModuleCompiler,
      private _outputEmitter: OutputEmitter,
      private _summaryResolver: SummaryResolver<StaticSymbol>, private _localeId: string|null,
      private _translationFormat: string|null, private _enableSummariesForJit: boolean|null,
      private _symbolResolver: StaticSymbolResolver) {}

  clearCache() { this._metadataResolver.clearCache(); }

  analyzeModulesSync(rootFiles: string[]): NgAnalyzedModules {
    const programSymbols = extractProgramSymbols(this._symbolResolver, rootFiles, this._host);
    const analyzeResult =
        analyzeAndValidateNgModules(programSymbols, this._host, this._metadataResolver);
    analyzeResult.ngModules.forEach(
        ngModule => this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(
            ngModule.type.reference, true));
    return analyzeResult;
  }

  analyzeModulesAsync(rootFiles: string[]): Promise<NgAnalyzedModules> {
    const programSymbols = extractProgramSymbols(this._symbolResolver, rootFiles, this._host);
    const analyzeResult =
        analyzeAndValidateNgModules(programSymbols, this._host, this._metadataResolver);
    return Promise
        .all(analyzeResult.ngModules.map(
            ngModule => this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(
                ngModule.type.reference, false)))
        .then(() => analyzeResult);
  }

  emitAllStubs(analyzeResult: NgAnalyzedModules): GeneratedFile[] {
    const {files} = analyzeResult;
    const sourceModules = files.map(
        file =>
            this._compileStubFile(file.srcUrl, file.directives, file.pipes, file.ngModules, false));
    return flatten(sourceModules);
  }

  emitPartialStubs(analyzeResult: NgAnalyzedModules): GeneratedFile[] {
    const {files} = analyzeResult;
    const sourceModules = files.map(
        file =>
            this._compileStubFile(file.srcUrl, file.directives, file.pipes, file.ngModules, true));
    return flatten(sourceModules);
  }

  emitAllImpls(analyzeResult: NgAnalyzedModules): GeneratedFile[] {
    const {ngModuleByPipeOrDirective, files} = analyzeResult;
    const sourceModules = files.map(
        file => this._compileImplFile(
            file.srcUrl, ngModuleByPipeOrDirective, file.directives, file.pipes, file.ngModules,
            file.injectables));
    return flatten(sourceModules);
  }

  private _compileStubFile(
      srcFileUrl: string, directives: StaticSymbol[], pipes: StaticSymbol[],
      ngModules: StaticSymbol[], partial: boolean): GeneratedFile[] {
    // partial is true when we only need the files we are certain will produce a factory and/or
    // summary.
    // This is the normal case for `ngc` but if we assume libraryies are generating their own
    // factories
    // then we might need a factory for a file that re-exports a module or factory which we cannot
    // know
    // ahead of time so we need a stub generate for all non-.d.ts files. The .d.ts files do not need
    // to
    // be excluded here because they are excluded when the modules are analyzed. If a factory ends
    // up
    // not being needed, the factory file is not written in writeFile callback.
    const fileSuffix = splitTypescriptSuffix(srcFileUrl, true)[1];
    const generatedFiles: GeneratedFile[] = [];

    const ngFactoryOutputCtx = this._createOutputContext(ngfactoryFilePath(srcFileUrl, true));
    const jitSummaryOutputCtx = this._createOutputContext(summaryForJitFileName(srcFileUrl, true));

    // create exports that user code can reference
    ngModules.forEach((ngModuleReference) => {
      this._ngModuleCompiler.createStub(ngFactoryOutputCtx, ngModuleReference);
      createForJitStub(jitSummaryOutputCtx, ngModuleReference);
    });

    let partialJitStubRequired = false;
    let partialFactoryStubRequired = false;

    // create stubs for external stylesheets (always empty, as users should not import anything from
    // the generated code)
    directives.forEach((dirType) => {
      const compMeta = this._metadataResolver.getDirectiveMetadata(<any>dirType);

      partialJitStubRequired = true;

      if (!compMeta.isComponent) {
        return;
      }
      // Note: compMeta is a component and therefore template is non null.
      compMeta.template !.externalStylesheets.forEach((stylesheetMeta) => {
        const styleContext = this._createOutputContext(_stylesModuleUrl(
            stylesheetMeta.moduleUrl !, this._styleCompiler.needsStyleShim(compMeta), fileSuffix));
        _createTypeReferenceStub(styleContext, Identifiers.ComponentFactory);
        generatedFiles.push(this._codegenSourceModule(stylesheetMeta.moduleUrl !, styleContext));
      });

      partialFactoryStubRequired = true;
    });

    // If we need all the stubs to be generated then insert an arbitrary reference into the stub
    if ((partialFactoryStubRequired || !partial) && ngFactoryOutputCtx.statements.length <= 0) {
      _createTypeReferenceStub(ngFactoryOutputCtx, Identifiers.ComponentFactory);
    }
    if ((partialJitStubRequired || !partial || (pipes && pipes.length > 0)) &&
        jitSummaryOutputCtx.statements.length <= 0) {
      _createTypeReferenceStub(jitSummaryOutputCtx, Identifiers.ComponentFactory);
    }

    // Note: we are creating stub ngfactory/ngsummary for all source files,
    // as the real calculation requires almost the same logic as producing the real content for
    // them. Our pipeline will filter out empty ones at the end. Because of this filter, however,
    // stub references to the reference type needs to be generated even if the user cannot
    // refer to type from the `.d.ts` file to prevent the file being elided from the emit.
    generatedFiles.push(this._codegenSourceModule(srcFileUrl, ngFactoryOutputCtx));
    if (this._enableSummariesForJit) {
      generatedFiles.push(this._codegenSourceModule(srcFileUrl, jitSummaryOutputCtx));
    }

    return generatedFiles;
  }

  private _compileImplFile(
      srcFileUrl: string, ngModuleByPipeOrDirective: Map<StaticSymbol, CompileNgModuleMetadata>,
      directives: StaticSymbol[], pipes: StaticSymbol[], ngModules: StaticSymbol[],
      injectables: StaticSymbol[]): GeneratedFile[] {
    const fileSuffix = splitTypescriptSuffix(srcFileUrl, true)[1];
    const generatedFiles: GeneratedFile[] = [];

    const outputCtx = this._createOutputContext(ngfactoryFilePath(srcFileUrl, true));

    generatedFiles.push(
        ...this._createSummary(srcFileUrl, directives, pipes, ngModules, injectables, outputCtx));

    // compile all ng modules
    ngModules.forEach((ngModuleType) => this._compileModule(outputCtx, ngModuleType));

    // compile components
    directives.forEach((dirType) => {
      const compMeta = this._metadataResolver.getDirectiveMetadata(<any>dirType);
      if (!compMeta.isComponent) {
        return;
      }
      const ngModule = ngModuleByPipeOrDirective.get(dirType);
      if (!ngModule) {
        throw new Error(
            `Internal Error: cannot determine the module for component ${identifierName(compMeta.type)}!`);
      }

      // compile styles
      const componentStylesheet = this._styleCompiler.compileComponent(outputCtx, compMeta);
      // Note: compMeta is a component and therefore template is non null.
      compMeta.template !.externalStylesheets.forEach((stylesheetMeta) => {
        generatedFiles.push(
            this._codegenStyles(stylesheetMeta.moduleUrl !, compMeta, stylesheetMeta, fileSuffix));
      });

      // compile components
      const compViewVars = this._compileComponent(
          outputCtx, compMeta, ngModule, ngModule.transitiveModule.directives, componentStylesheet,
          fileSuffix);
      this._compileComponentFactory(outputCtx, compMeta, ngModule, fileSuffix);
    });
    if (outputCtx.statements.length > 0) {
      const srcModule = this._codegenSourceModule(srcFileUrl, outputCtx);
      generatedFiles.unshift(srcModule);
    }
    return generatedFiles;
  }

  private _createSummary(
      srcFileName: string, directives: StaticSymbol[], pipes: StaticSymbol[],
      ngModules: StaticSymbol[], injectables: StaticSymbol[],
      ngFactoryCtx: OutputContext): GeneratedFile[] {
    const symbolSummaries = this._symbolResolver.getSymbolsOf(srcFileName)
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
    const forJitOutputCtx = this._createOutputContext(summaryForJitFileName(srcFileName, true));
    const {json, exportAs} = serializeSummaries(
        srcFileName, forJitOutputCtx, this._summaryResolver, this._symbolResolver, symbolSummaries,
        typeData);
    exportAs.forEach((entry) => {
      ngFactoryCtx.statements.push(
          o.variable(entry.exportAs).set(ngFactoryCtx.importExpr(entry.symbol)).toDeclStmt(null, [
            o.StmtModifier.Exported
          ]));
    });
    const summaryJson = new GeneratedFile(srcFileName, summaryFileName(srcFileName), json);
    if (this._enableSummariesForJit) {
      return [summaryJson, this._codegenSourceModule(srcFileName, forJitOutputCtx)];
    };

    return [summaryJson];
  }

  private _compileModule(outputCtx: OutputContext, ngModuleType: StaticSymbol): void {
    const ngModule = this._metadataResolver.getNgModuleMetadata(ngModuleType) !;
    const providers: CompileProviderMetadata[] = [];

    if (this._localeId) {
      providers.push({
        token: createTokenForExternalReference(this._reflector, Identifiers.LOCALE_ID),
        useValue: this._localeId,
      });
    }

    if (this._translationFormat) {
      providers.push({
        token: createTokenForExternalReference(this._reflector, Identifiers.TRANSLATIONS_FORMAT),
        useValue: this._translationFormat
      });
    }

    this._ngModuleCompiler.compile(outputCtx, ngModule, providers);
  }

  private _compileComponentFactory(
      outputCtx: OutputContext, compMeta: CompileDirectiveMetadata,
      ngModule: CompileNgModuleMetadata, fileSuffix: string): void {
    const hostType = this._metadataResolver.getHostComponentType(compMeta.type.reference);
    const hostMeta = createHostComponentMeta(
        hostType, compMeta, this._metadataResolver.getHostComponentViewClass(hostType));
    const hostViewFactoryVar =
        this._compileComponent(outputCtx, hostMeta, ngModule, [compMeta.type], null, fileSuffix)
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

    outputCtx.statements.push(
        o.variable(compFactoryVar)
            .set(o.importExpr(Identifiers.createComponentFactory).callFn([
              o.literal(compMeta.selector), outputCtx.importExpr(compMeta.type.reference),
              o.variable(hostViewFactoryVar), new o.LiteralMapExpr(inputsExprs),
              new o.LiteralMapExpr(outputsExprs),
              o.literalArr(
                  compMeta.template !.ngContentSelectors.map(selector => o.literal(selector)))
            ]))
            .toDeclStmt(
                o.importType(
                    Identifiers.ComponentFactory,
                    [o.expressionType(outputCtx.importExpr(compMeta.type.reference)) !],
                    [o.TypeModifier.Const]),
                [o.StmtModifier.Final, o.StmtModifier.Exported]));
  }

  private _compileComponent(
      outputCtx: OutputContext, compMeta: CompileDirectiveMetadata,
      ngModule: CompileNgModuleMetadata, directiveIdentifiers: CompileIdentifierMetadata[],
      componentStyles: CompiledStylesheet|null, fileSuffix: string): ViewCompileResult {
    const directives =
        directiveIdentifiers.map(dir => this._metadataResolver.getDirectiveSummary(dir.reference));
    const pipes = ngModule.transitiveModule.pipes.map(
        pipe => this._metadataResolver.getPipeSummary(pipe.reference));

    const preserveWhitespaces = compMeta !.template !.preserveWhitespaces;
    const {template: parsedTemplate, pipes: usedPipes} = this._templateParser.parse(
        compMeta, compMeta.template !.template !, directives, pipes, ngModule.schemas,
        templateSourceUrl(ngModule.type, compMeta, compMeta.template !), preserveWhitespaces);
    const stylesExpr = componentStyles ? o.variable(componentStyles.stylesVar) : o.literalArr([]);
    const viewResult = this._viewCompiler.compileComponent(
        outputCtx, compMeta, parsedTemplate, stylesExpr, usedPipes);
    if (componentStyles) {
      _resolveStyleStatements(
          this._symbolResolver, componentStyles, this._styleCompiler.needsStyleShim(compMeta),
          fileSuffix);
    }
    return viewResult;
  }

  private _createOutputContext(genFilePath: string): OutputContext {
    const importExpr = (symbol: StaticSymbol, typeParams: o.Type[] | null = null) => {
      if (!(symbol instanceof StaticSymbol)) {
        throw new Error(`Internal error: unknown identifier ${JSON.stringify(symbol)}`);
      }
      const arity = this._symbolResolver.getTypeArity(symbol) || 0;
      const {filePath, name, members} = this._symbolResolver.getImportAs(symbol) || symbol;
      const importModule = this._symbolResolver.fileNameToModuleName(filePath, genFilePath);

      // It should be good enough to compare filePath to genFilePath and if they are equal
      // there is a self reference. However, ngfactory files generate to .ts but their
      // symbols have .d.ts so a simple compare is insufficient. They should be canonical
      // and is tracked by #17705.
      const selfReference = this._symbolResolver.fileNameToModuleName(genFilePath, genFilePath);
      const moduleName = importModule === selfReference ? null : importModule;

      // If we are in a type expression that refers to a generic type then supply
      // the required type parameters. If there were not enough type parameters
      // supplied, supply any as the type. Outside a type expression the reference
      // should not supply type parameters and be treated as a simple value reference
      // to the constructor function itself.
      const suppliedTypeParams = typeParams || [];
      const missingTypeParamsCount = arity - suppliedTypeParams.length;
      const allTypeParams =
          suppliedTypeParams.concat(new Array(missingTypeParamsCount).fill(o.DYNAMIC_TYPE));
      return members.reduce(
          (expr, memberName) => expr.prop(memberName),
          <o.Expression>o.importExpr(
              new o.ExternalReference(moduleName, name, null), allTypeParams));
    };

    return {statements: [], genFilePath, importExpr};
  }

  private _codegenStyles(
      srcFileUrl: string, compMeta: CompileDirectiveMetadata,
      stylesheetMetadata: CompileStylesheetMetadata, fileSuffix: string): GeneratedFile {
    const outputCtx = this._createOutputContext(_stylesModuleUrl(
        stylesheetMetadata.moduleUrl !, this._styleCompiler.needsStyleShim(compMeta), fileSuffix));
    const compiledStylesheet =
        this._styleCompiler.compileStyles(outputCtx, compMeta, stylesheetMetadata);
    _resolveStyleStatements(
        this._symbolResolver, compiledStylesheet, this._styleCompiler.needsStyleShim(compMeta),
        fileSuffix);
    return this._codegenSourceModule(srcFileUrl, outputCtx);
  }

  private _codegenSourceModule(srcFileUrl: string, ctx: OutputContext): GeneratedFile {
    return new GeneratedFile(srcFileUrl, ctx.genFilePath, ctx.statements);
  }
}

function _createTypeReferenceStub(outputCtx: OutputContext, reference: o.ExternalReference) {
  outputCtx.statements.push(o.importExpr(reference).toStmt());
}

function _resolveStyleStatements(
    symbolResolver: StaticSymbolResolver, compileResult: CompiledStylesheet, needsShim: boolean,
    fileSuffix: string): void {
  compileResult.dependencies.forEach((dep) => {
    dep.setValue(symbolResolver.getStaticSymbol(
        _stylesModuleUrl(dep.moduleUrl, needsShim, fileSuffix), dep.name));
  });
}

function _stylesModuleUrl(stylesheetUrl: string, shim: boolean, suffix: string): string {
  return `${stylesheetUrl}${shim ? '.shim' : ''}.ngstyle${suffix}`;
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
