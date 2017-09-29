/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompileDirectiveSummary, CompileIdentifierMetadata, CompileNgModuleMetadata, CompileNgModuleSummary, CompilePipeMetadata, CompilePipeSummary, CompileProviderMetadata, CompileStylesheetMetadata, CompileSummaryKind, CompileTypeMetadata, CompileTypeSummary, componentFactoryName, flatten, identifierName, sourceUrl, templateSourceUrl} from '../compile_metadata';
import {CompilerConfig} from '../config';
import {ViewEncapsulation} from '../core';
import {MessageBundle} from '../i18n/message_bundle';
import {Identifiers, createTokenForExternalReference} from '../identifiers';
import {CompileMetadataResolver} from '../metadata_resolver';
import {HtmlParser} from '../ml_parser/html_parser';
import {InterpolationConfig} from '../ml_parser/interpolation_config';
import {NgModuleCompiler} from '../ng_module_compiler';
import {OutputEmitter} from '../output/abstract_emitter';
import * as o from '../output/output_ast';
import {ParseError} from '../parse_util';
import {CompiledStylesheet, StyleCompiler} from '../style_compiler';
import {SummaryResolver} from '../summary_resolver';
import {TemplateAst} from '../template_parser/template_ast';
import {TemplateParser} from '../template_parser/template_parser';
import {OutputContext, ValueVisitor, syntaxError, visitValue} from '../util';
import {TypeCheckCompiler} from '../view_compiler/type_check_compiler';
import {ViewCompileResult, ViewCompiler} from '../view_compiler/view_compiler';

import {AotCompilerHost} from './compiler_host';
import {AotCompilerOptions} from './compiler_options';
import {GeneratedFile} from './generated_file';
import {StaticReflector} from './static_reflector';
import {StaticSymbol} from './static_symbol';
import {ResolvedStaticSymbol, StaticSymbolResolver} from './static_symbol_resolver';
import {createForJitStub, serializeSummaries} from './summary_serializer';
import {ngfactoryFilePath, splitTypescriptSuffix, summaryFileName, summaryForJitFileName, summaryForJitName} from './util';

enum StubEmitFlags {
  Basic = 1 << 0,
  TypeCheck = 1 << 1,
  All = TypeCheck | Basic
}

export class AotCompiler {
  private _templateAstCache =
      new Map<StaticSymbol, {template: TemplateAst[], pipes: CompilePipeSummary[]}>();
  private _analyzedFiles = new Map<string, NgAnalyzedFile>();

  constructor(
      private _config: CompilerConfig, private _options: AotCompilerOptions,
      private _host: AotCompilerHost, private _reflector: StaticReflector,
      private _metadataResolver: CompileMetadataResolver, private _templateParser: TemplateParser,
      private _styleCompiler: StyleCompiler, private _viewCompiler: ViewCompiler,
      private _typeCheckCompiler: TypeCheckCompiler, private _ngModuleCompiler: NgModuleCompiler,
      private _outputEmitter: OutputEmitter,
      private _summaryResolver: SummaryResolver<StaticSymbol>,
      private _symbolResolver: StaticSymbolResolver) {}

  clearCache() { this._metadataResolver.clearCache(); }

  analyzeModulesSync(rootFiles: string[]): NgAnalyzedModules {
    const analyzeResult = analyzeAndValidateNgModules(
        rootFiles, this._host, this._symbolResolver, this._metadataResolver);
    analyzeResult.ngModules.forEach(
        ngModule => this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(
            ngModule.type.reference, true));
    return analyzeResult;
  }

  analyzeModulesAsync(rootFiles: string[]): Promise<NgAnalyzedModules> {
    const analyzeResult = analyzeAndValidateNgModules(
        rootFiles, this._host, this._symbolResolver, this._metadataResolver);
    return Promise
        .all(analyzeResult.ngModules.map(
            ngModule => this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(
                ngModule.type.reference, false)))
        .then(() => analyzeResult);
  }

  private _analyzeFile(fileName: string): NgAnalyzedFile {
    let analyzedFile = this._analyzedFiles.get(fileName);
    if (!analyzedFile) {
      analyzedFile =
          analyzeFile(this._host, this._symbolResolver, this._metadataResolver, fileName);
      this._analyzedFiles.set(fileName, analyzedFile);
    }
    return analyzedFile;
  }

  findGeneratedFileNames(fileName: string): string[] {
    const genFileNames: string[] = [];
    const file = this._analyzeFile(fileName);
    // Make sure we create a .ngfactory if we have a injectable/directive/pipe/NgModule
    // or a reference to a non source file.
    // Note: This is overestimating the required .ngfactory files as the real calculation is harder.
    // Only do this for StubEmitFlags.Basic, as adding a type check block
    // does not change this file (as we generate type check blocks based on NgModules).
    if (this._options.allowEmptyCodegenFiles || file.directives.length || file.pipes.length ||
        file.injectables.length || file.ngModules.length || file.exportsNonSourceFiles) {
      genFileNames.push(ngfactoryFilePath(file.fileName, true));
      if (this._options.enableSummariesForJit) {
        genFileNames.push(summaryForJitFileName(file.fileName, true));
      }
    }
    const fileSuffix = splitTypescriptSuffix(file.fileName, true)[1];
    file.directives.forEach((dirSymbol) => {
      const compMeta =
          this._metadataResolver.getNonNormalizedDirectiveMetadata(dirSymbol) !.metadata;
      if (!compMeta.isComponent) {
        return;
      }
      // Note: compMeta is a component and therefore template is non null.
      compMeta.template !.styleUrls.forEach((styleUrl) => {
        const normalizedUrl = this._host.resourceNameToFileName(styleUrl, file.fileName);
        if (!normalizedUrl) {
          throw new Error(`Couldn't resolve resource ${styleUrl} relative to ${file.fileName}`);
        }
        const needsShim = (compMeta.template !.encapsulation ||
                           this._config.defaultEncapsulation) === ViewEncapsulation.Emulated;
        genFileNames.push(_stylesModuleUrl(normalizedUrl, needsShim, fileSuffix));
        if (this._options.allowEmptyCodegenFiles) {
          genFileNames.push(_stylesModuleUrl(normalizedUrl, !needsShim, fileSuffix));
        }
      });
    });
    return genFileNames;
  }

  emitBasicStub(genFileName: string, originalFileName?: string): GeneratedFile {
    const outputCtx = this._createOutputContext(genFileName);
    if (genFileName.endsWith('.ngfactory.ts')) {
      if (!originalFileName) {
        throw new Error(
            `Assertion error: require the original file for .ngfactory.ts stubs. File: ${genFileName}`);
      }
      const originalFile = this._analyzeFile(originalFileName);
      this._createNgFactoryStub(outputCtx, originalFile, StubEmitFlags.Basic);
    } else if (genFileName.endsWith('.ngsummary.ts')) {
      if (this._options.enableSummariesForJit) {
        if (!originalFileName) {
          throw new Error(
              `Assertion error: require the original file for .ngsummary.ts stubs. File: ${genFileName}`);
        }
        const originalFile = this._analyzeFile(originalFileName);
        _createEmptyStub(outputCtx);
        originalFile.ngModules.forEach(ngModule => {
          // create exports that user code can reference
          createForJitStub(outputCtx, ngModule.type.reference);
        });
      }
    } else if (genFileName.endsWith('.ngstyle.ts')) {
      _createEmptyStub(outputCtx);
    }
    // Note: for the stubs, we don't need a property srcFileUrl,
    // as lateron in emitAllImpls we will create the proper GeneratedFiles with the
    // correct srcFileUrl.
    // This is good as e.g. for .ngstyle.ts files we can't derive
    // the url of components based on the genFileUrl.
    return this._codegenSourceModule('unknown', outputCtx);
  }

  emitTypeCheckStub(genFileName: string, originalFileName: string): GeneratedFile|null {
    const originalFile = this._analyzeFile(originalFileName);
    const outputCtx = this._createOutputContext(genFileName);
    if (genFileName.endsWith('.ngfactory.ts')) {
      this._createNgFactoryStub(outputCtx, originalFile, StubEmitFlags.TypeCheck);
    }
    return outputCtx.statements.length > 0 ?
        this._codegenSourceModule(originalFile.fileName, outputCtx) :
        null;
  }

  loadFilesAsync(fileNames: string[]): Promise<NgAnalyzedModules> {
    const files = fileNames.map(fileName => this._analyzeFile(fileName));
    const loadingPromises: Promise<NgAnalyzedModules>[] = [];
    files.forEach(
        file => file.ngModules.forEach(
            ngModule =>
                loadingPromises.push(this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(
                    ngModule.type.reference, false))));
    return Promise.all(loadingPromises).then(_ => mergeAndValidateNgFiles(files));
  }

  loadFilesSync(fileNames: string[]): NgAnalyzedModules {
    const files = fileNames.map(fileName => this._analyzeFile(fileName));
    files.forEach(
        file => file.ngModules.forEach(
            ngModule => this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(
                ngModule.type.reference, true)));
    return mergeAndValidateNgFiles(files);
  }

  private _createNgFactoryStub(
      outputCtx: OutputContext, file: NgAnalyzedFile, emitFlags: StubEmitFlags) {
    file.ngModules.forEach((ngModuleMeta, ngModuleIndex) => {
      // Note: the code below needs to executed for StubEmitFlags.Basic and StubEmitFlags.TypeCheck,
      // so we don't change the .ngfactory file too much when adding the typecheck block.

      // create exports that user code can reference
      this._ngModuleCompiler.createStub(outputCtx, ngModuleMeta.type.reference);

      // add references to the symbols from the metadata.
      // These can be used by the type check block for components,
      // and they also cause TypeScript to include these files into the program too,
      // which will make them part of the analyzedFiles.
      const externalReferences: StaticSymbol[] = [
        ...ngModuleMeta.declaredDirectives.map(d => d.reference),
        ...ngModuleMeta.declaredPipes.map(d => d.reference),
        ...ngModuleMeta.importedModules.map(m => m.type.reference),
        ...ngModuleMeta.exportedModules.map(m => m.type.reference),
      ];
      const externalReferenceVars = new Map<any, string>();
      externalReferences.forEach((ref, typeIndex) => {
        if (this._host.isSourceFile(ref.filePath)) {
          externalReferenceVars.set(ref, `_decl${ngModuleIndex}_${typeIndex}`);
        }
      });
      externalReferenceVars.forEach((varName, reference) => {
        outputCtx.statements.push(
            o.variable(varName)
                .set(o.NULL_EXPR.cast(o.DYNAMIC_TYPE))
                .toDeclStmt(o.expressionType(outputCtx.importExpr(reference))));
      });

      if (emitFlags & StubEmitFlags.TypeCheck) {
        // add the typecheck block for all components of the NgModule
        ngModuleMeta.declaredDirectives.forEach((dirId) => {
          const compMeta = this._metadataResolver.getDirectiveMetadata(dirId.reference);
          if (!compMeta.isComponent) {
            return;
          }
          this._createTypeCheckBlock(
              outputCtx, ngModuleMeta, this._metadataResolver.getHostComponentMetadata(compMeta),
              [compMeta.type], externalReferenceVars);
          this._createTypeCheckBlock(
              outputCtx, ngModuleMeta, compMeta, ngModuleMeta.transitiveModule.directives,
              externalReferenceVars);
        });
      }
    });

    if (outputCtx.statements.length === 0) {
      _createEmptyStub(outputCtx);
    }
  }

  private _createTypeCheckBlock(
      ctx: OutputContext, moduleMeta: CompileNgModuleMetadata, compMeta: CompileDirectiveMetadata,
      directives: CompileIdentifierMetadata[], externalReferenceVars: Map<any, string>) {
    const {template: parsedTemplate, pipes: usedPipes} =
        this._parseTemplate(compMeta, moduleMeta, directives);
    ctx.statements.push(...this._typeCheckCompiler.compileComponent(
        compMeta, parsedTemplate, usedPipes, externalReferenceVars));
  }

  emitMessageBundle(analyzeResult: NgAnalyzedModules, locale: string|null): MessageBundle {
    const errors: ParseError[] = [];
    const htmlParser = new HtmlParser();

    // TODO(vicb): implicit tags & attributes
    const messageBundle = new MessageBundle(htmlParser, [], {}, locale);

    analyzeResult.files.forEach(file => {
      const compMetas: CompileDirectiveMetadata[] = [];
      file.directives.forEach(directiveType => {
        const dirMeta = this._metadataResolver.getDirectiveMetadata(directiveType);
        if (dirMeta && dirMeta.isComponent) {
          compMetas.push(dirMeta);
        }
      });
      compMetas.forEach(compMeta => {
        const html = compMeta.template !.template !;
        const interpolationConfig =
            InterpolationConfig.fromArray(compMeta.template !.interpolation);
        errors.push(
            ...messageBundle.updateFromTemplate(html, file.fileName, interpolationConfig) !);
      });
    });

    if (errors.length) {
      throw new Error(errors.map(e => e.toString()).join('\n'));
    }

    return messageBundle;
  }

  emitAllImpls(analyzeResult: NgAnalyzedModules): GeneratedFile[] {
    const {ngModuleByPipeOrDirective, files} = analyzeResult;
    const sourceModules = files.map(
        file => this._compileImplFile(
            file.fileName, ngModuleByPipeOrDirective, file.directives, file.pipes, file.ngModules,
            file.injectables));
    return flatten(sourceModules);
  }

  private _compileImplFile(
      srcFileUrl: string, ngModuleByPipeOrDirective: Map<StaticSymbol, CompileNgModuleMetadata>,
      directives: StaticSymbol[], pipes: StaticSymbol[], ngModules: CompileNgModuleMetadata[],
      injectables: StaticSymbol[]): GeneratedFile[] {
    const fileSuffix = splitTypescriptSuffix(srcFileUrl, true)[1];
    const generatedFiles: GeneratedFile[] = [];

    const outputCtx = this._createOutputContext(ngfactoryFilePath(srcFileUrl, true));

    generatedFiles.push(
        ...this._createSummary(srcFileUrl, directives, pipes, ngModules, injectables, outputCtx));

    // compile all ng modules
    ngModules.forEach((ngModuleMeta) => this._compileModule(outputCtx, ngModuleMeta));

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
        // Note: fill non shim and shim style files as they might
        // be shared by component with and without ViewEncapsulation.
        const shim = this._styleCompiler.needsStyleShim(compMeta);
        generatedFiles.push(
            this._codegenStyles(srcFileUrl, compMeta, stylesheetMeta, shim, fileSuffix));
        if (this._options.allowEmptyCodegenFiles) {
          generatedFiles.push(
              this._codegenStyles(srcFileUrl, compMeta, stylesheetMeta, !shim, fileSuffix));
        }
      });

      // compile components
      const compViewVars = this._compileComponent(
          outputCtx, compMeta, ngModule, ngModule.transitiveModule.directives, componentStylesheet,
          fileSuffix);
      this._compileComponentFactory(outputCtx, compMeta, ngModule, fileSuffix);
    });
    if (outputCtx.statements.length > 0 || this._options.allowEmptyCodegenFiles) {
      const srcModule = this._codegenSourceModule(srcFileUrl, outputCtx);
      generatedFiles.unshift(srcModule);
    }
    return generatedFiles;
  }

  private _createSummary(
      srcFileName: string, directives: StaticSymbol[], pipes: StaticSymbol[],
      ngModules: CompileNgModuleMetadata[], injectables: StaticSymbol[],
      ngFactoryCtx: OutputContext): GeneratedFile[] {
    const symbolSummaries = this._symbolResolver.getSymbolsOf(srcFileName)
                                .map(symbol => this._symbolResolver.resolveSymbol(symbol));
    const typeData: {
      summary: CompileTypeSummary,
      metadata: CompileNgModuleMetadata | CompileDirectiveMetadata | CompilePipeMetadata |
          CompileTypeMetadata
    }[] =
        [
          ...ngModules.map(
              meta => ({
                summary: this._metadataResolver.getNgModuleSummary(meta.type.reference) !,
                metadata: this._metadataResolver.getNgModuleMetadata(meta.type.reference) !
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
    const forJitOutputCtx = this._options.enableSummariesForJit ?
        this._createOutputContext(summaryForJitFileName(srcFileName, true)) :
        null;
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
    const result = [summaryJson];
    if (forJitOutputCtx) {
      result.push(this._codegenSourceModule(srcFileName, forJitOutputCtx));
    }
    return result;
  }

  private _compileModule(outputCtx: OutputContext, ngModule: CompileNgModuleMetadata): void {
    const providers: CompileProviderMetadata[] = [];

    if (this._options.locale) {
      const normalizedLocale = this._options.locale.replace(/_/g, '-');
      providers.push({
        token: createTokenForExternalReference(this._reflector, Identifiers.LOCALE_ID),
        useValue: normalizedLocale,
      });
    }

    if (this._options.i18nFormat) {
      providers.push({
        token: createTokenForExternalReference(this._reflector, Identifiers.TRANSLATIONS_FORMAT),
        useValue: this._options.i18nFormat
      });
    }

    this._ngModuleCompiler.compile(outputCtx, ngModule, providers);
  }

  private _compileComponentFactory(
      outputCtx: OutputContext, compMeta: CompileDirectiveMetadata,
      ngModule: CompileNgModuleMetadata, fileSuffix: string): void {
    const hostMeta = this._metadataResolver.getHostComponentMetadata(compMeta);
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
    const {template: parsedTemplate, pipes: usedPipes} =
        this._parseTemplate(compMeta, ngModule, directiveIdentifiers);
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

  private _parseTemplate(
      compMeta: CompileDirectiveMetadata, ngModule: CompileNgModuleMetadata,
      directiveIdentifiers: CompileIdentifierMetadata[]):
      {template: TemplateAst[], pipes: CompilePipeSummary[]} {
    if (this._templateAstCache.has(compMeta.type.reference)) {
      return this._templateAstCache.get(compMeta.type.reference) !;
    }
    const preserveWhitespaces = compMeta !.template !.preserveWhitespaces;
    const directives =
        directiveIdentifiers.map(dir => this._metadataResolver.getDirectiveSummary(dir.reference));
    const pipes = ngModule.transitiveModule.pipes.map(
        pipe => this._metadataResolver.getPipeSummary(pipe.reference));
    const result = this._templateParser.parse(
        compMeta, compMeta.template !.htmlAst !, directives, pipes, ngModule.schemas,
        templateSourceUrl(ngModule.type, compMeta, compMeta.template !), preserveWhitespaces);
    this._templateAstCache.set(compMeta.type.reference, result);
    return result;
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
      stylesheetMetadata: CompileStylesheetMetadata, isShimmed: boolean,
      fileSuffix: string): GeneratedFile {
    const outputCtx = this._createOutputContext(
        _stylesModuleUrl(stylesheetMetadata.moduleUrl !, isShimmed, fileSuffix));
    const compiledStylesheet =
        this._styleCompiler.compileStyles(outputCtx, compMeta, stylesheetMetadata, isShimmed);
    _resolveStyleStatements(this._symbolResolver, compiledStylesheet, isShimmed, fileSuffix);
    return this._codegenSourceModule(srcFileUrl, outputCtx);
  }

  private _codegenSourceModule(srcFileUrl: string, ctx: OutputContext): GeneratedFile {
    return new GeneratedFile(srcFileUrl, ctx.genFilePath, ctx.statements);
  }
}

function _createEmptyStub(outputCtx: OutputContext) {
  // Note: We need to produce at least one import statement so that
  // TypeScript knows that the file is an es6 module. Otherwise our generated
  // exports / imports won't be emitted properly by TypeScript.
  outputCtx.statements.push(o.importExpr(Identifiers.ComponentFactory).toStmt());
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
  files: NgAnalyzedFile[];
  symbolsMissingModule?: StaticSymbol[];
}

export interface NgAnalyzedFile {
  fileName: string;
  directives: StaticSymbol[];
  pipes: StaticSymbol[];
  ngModules: CompileNgModuleMetadata[];
  injectables: StaticSymbol[];
  exportsNonSourceFiles: boolean;
}

export interface NgAnalyzeModulesHost { isSourceFile(filePath: string): boolean; }

export function analyzeNgModules(
    fileNames: string[], host: NgAnalyzeModulesHost, staticSymbolResolver: StaticSymbolResolver,
    metadataResolver: CompileMetadataResolver): NgAnalyzedModules {
  const files = _analyzeFilesIncludingNonProgramFiles(
      fileNames, host, staticSymbolResolver, metadataResolver);
  return mergeAnalyzedFiles(files);
}

export function analyzeAndValidateNgModules(
    fileNames: string[], host: NgAnalyzeModulesHost, staticSymbolResolver: StaticSymbolResolver,
    metadataResolver: CompileMetadataResolver): NgAnalyzedModules {
  return validateAnalyzedModules(
      analyzeNgModules(fileNames, host, staticSymbolResolver, metadataResolver));
}

function validateAnalyzedModules(analyzedModules: NgAnalyzedModules): NgAnalyzedModules {
  if (analyzedModules.symbolsMissingModule && analyzedModules.symbolsMissingModule.length) {
    const messages = analyzedModules.symbolsMissingModule.map(
        s =>
            `Cannot determine the module for class ${s.name} in ${s.filePath}! Add ${s.name} to the NgModule to fix it.`);
    throw syntaxError(messages.join('\n'));
  }
  return analyzedModules;
}

// Analyzes all of the program files,
// including files that are not part of the program
// but are referenced by an NgModule.
function _analyzeFilesIncludingNonProgramFiles(
    fileNames: string[], host: NgAnalyzeModulesHost, staticSymbolResolver: StaticSymbolResolver,
    metadataResolver: CompileMetadataResolver): NgAnalyzedFile[] {
  const seenFiles = new Set<string>();
  const files: NgAnalyzedFile[] = [];

  const visitFile = (fileName: string) => {
    if (seenFiles.has(fileName) || !host.isSourceFile(fileName)) {
      return false;
    }
    seenFiles.add(fileName);
    const analyzedFile = analyzeFile(host, staticSymbolResolver, metadataResolver, fileName);
    files.push(analyzedFile);
    analyzedFile.ngModules.forEach(ngModule => {
      ngModule.transitiveModule.modules.forEach(modMeta => visitFile(modMeta.reference.filePath));
    });
  };
  fileNames.forEach((fileName) => visitFile(fileName));
  return files;
}

export function analyzeFile(
    host: NgAnalyzeModulesHost, staticSymbolResolver: StaticSymbolResolver,
    metadataResolver: CompileMetadataResolver, fileName: string): NgAnalyzedFile {
  const directives: StaticSymbol[] = [];
  const pipes: StaticSymbol[] = [];
  const injectables: StaticSymbol[] = [];
  const ngModules: CompileNgModuleMetadata[] = [];
  const hasDecorators = staticSymbolResolver.hasDecorators(fileName);
  let exportsNonSourceFiles = false;
  // Don't analyze .d.ts files that have no decorators as a shortcut
  // to speed up the analysis. This prevents us from
  // resolving the references in these files.
  // Note: exportsNonSourceFiles is only needed when compiling with summaries,
  // which is not the case when .d.ts files are treated as input files.
  if (!fileName.endsWith('.d.ts') || hasDecorators) {
    staticSymbolResolver.getSymbolsOf(fileName).forEach((symbol) => {
      const resolvedSymbol = staticSymbolResolver.resolveSymbol(symbol);
      const symbolMeta = resolvedSymbol.metadata;
      if (!symbolMeta || symbolMeta.__symbolic === 'error') {
        return;
      }
      let isNgSymbol = false;
      if (symbolMeta.__symbolic === 'class') {
        if (metadataResolver.isDirective(symbol)) {
          isNgSymbol = true;
          directives.push(symbol);
        } else if (metadataResolver.isPipe(symbol)) {
          isNgSymbol = true;
          pipes.push(symbol);
        } else if (metadataResolver.isInjectable(symbol)) {
          isNgSymbol = true;
          injectables.push(symbol);
        } else {
          const ngModule = metadataResolver.getNgModuleMetadata(symbol, false);
          if (ngModule) {
            isNgSymbol = true;
            ngModules.push(ngModule);
          }
        }
      }
      if (!isNgSymbol) {
        exportsNonSourceFiles =
            exportsNonSourceFiles || isValueExportingNonSourceFile(host, symbolMeta);
      }
    });
  }
  return {
      fileName, directives, pipes, ngModules, injectables, exportsNonSourceFiles,
  };
}

function isValueExportingNonSourceFile(host: NgAnalyzeModulesHost, metadata: any): boolean {
  let exportsNonSourceFiles = false;

  class Visitor implements ValueVisitor {
    visitArray(arr: any[], context: any): any { arr.forEach(v => visitValue(v, this, context)); }
    visitStringMap(map: {[key: string]: any}, context: any): any {
      Object.keys(map).forEach((key) => visitValue(map[key], this, context));
    }
    visitPrimitive(value: any, context: any): any {}
    visitOther(value: any, context: any): any {
      if (value instanceof StaticSymbol && !host.isSourceFile(value.filePath)) {
        exportsNonSourceFiles = true;
      }
    }
  }

  visitValue(metadata, new Visitor(), null);
  return exportsNonSourceFiles;
}

export function mergeAnalyzedFiles(analyzedFiles: NgAnalyzedFile[]): NgAnalyzedModules {
  const allNgModules: CompileNgModuleMetadata[] = [];
  const ngModuleByPipeOrDirective = new Map<StaticSymbol, CompileNgModuleMetadata>();
  const allPipesAndDirectives = new Set<StaticSymbol>();

  analyzedFiles.forEach(af => {
    af.ngModules.forEach(ngModule => {
      allNgModules.push(ngModule);
      ngModule.declaredDirectives.forEach(
          d => ngModuleByPipeOrDirective.set(d.reference, ngModule));
      ngModule.declaredPipes.forEach(p => ngModuleByPipeOrDirective.set(p.reference, ngModule));
    });
    af.directives.forEach(d => allPipesAndDirectives.add(d));
    af.pipes.forEach(p => allPipesAndDirectives.add(p));
  });

  const symbolsMissingModule: StaticSymbol[] = [];
  allPipesAndDirectives.forEach(ref => {
    if (!ngModuleByPipeOrDirective.has(ref)) {
      symbolsMissingModule.push(ref);
    }
  });
  return {
    ngModules: allNgModules,
    ngModuleByPipeOrDirective,
    symbolsMissingModule,
    files: analyzedFiles
  };
}

function mergeAndValidateNgFiles(files: NgAnalyzedFile[]): NgAnalyzedModules {
  return validateAnalyzedModules(mergeAnalyzedFiles(files));
}
