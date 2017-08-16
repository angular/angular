/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompiler, AotCompilerHost, AotCompilerOptions, GeneratedFile, NgAnalyzedModules, core, createAotCompiler, getParseErrors, isSyntaxError, toTypeScript} from '@angular/compiler';
import {createBundleIndexHost} from '@angular/tsc-wrapped';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {BaseAotCompilerHost} from '../compiler_host';
import {TypeChecker} from '../diagnostics/check_types';

import {CompilerHost, CompilerOptions, CustomTransformers, Diagnostic, EmitFlags, Program, TsEmitArguments, TsEmitCallback} from './api';
import {LowerMetadataCache, getExpressionLoweringTransformFactory} from './lower_expressions';
import {getAngularEmitterTransformFactory} from './node_emitter_transform';

const GENERATED_FILES = /\.ngfactory\.js$|\.ngstyle\.js$|\.ngsummary\.js$/;

const SUMMARY_JSON_FILES = /\.ngsummary.json$/;

const emptyModules: NgAnalyzedModules = {
  ngModules: [],
  ngModuleByPipeOrDirective: new Map(),
  files: []
};

const defaultEmitCallback: TsEmitCallback =
    ({program, targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles,
      customTransformers}) =>
        program.emit(
            targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);


class AngularCompilerProgram implements Program {
  private tsProgram: ts.Program;
  private aotCompilerHost: AotCompilerHost;
  private compiler: AotCompiler;
  private srcNames: string[];
  private metadataCache: LowerMetadataCache;
  // Lazily initialized fields
  private _analyzedModules: NgAnalyzedModules|undefined;
  private _structuralDiagnostics: Diagnostic[] = [];
  private _stubs: GeneratedFile[]|undefined;
  private _stubFiles: string[]|undefined;
  private _programWithStubsHost: ts.CompilerHost|undefined;
  private _programWithStubs: ts.Program|undefined;
  private _generatedFiles: GeneratedFile[]|undefined;
  private _generatedFileDiagnostics: Diagnostic[]|undefined;
  private _typeChecker: TypeChecker|undefined;
  private _semanticDiagnostics: Diagnostic[]|undefined;
  private _optionsDiagnostics: Diagnostic[] = [];

  constructor(
      private rootNames: string[], private options: CompilerOptions, private host: CompilerHost,
      private oldProgram?: Program) {
    if (options.flatModuleOutFile && !options.skipMetadataEmit) {
      const {host: bundleHost, indexName, errors} = createBundleIndexHost(options, rootNames, host);
      if (errors) {
        // TODO(tbosch): once we move MetadataBundler from tsc_wrapped into compiler_cli,
        // directly create ng.Diagnostic instead of using ts.Diagnostic here.
        this._optionsDiagnostics.push(
            ...errors.map(e => ({category: e.category, message: e.messageText as string})));
      } else {
        rootNames.push(indexName !);
        this.host = host = bundleHost;
      }
    }

    const oldTsProgram = oldProgram ? oldProgram.getTsProgram() : undefined;
    this.tsProgram = ts.createProgram(rootNames, options, host, oldTsProgram);
    this.srcNames =
        this.tsProgram.getSourceFiles()
            .map(sf => sf.fileName)
            .filter(f => !f.match(/\.ngfactory\.[\w.]+$|\.ngstyle\.[\w.]+$|\.ngsummary\.[\w.]+$/));
    this.metadataCache = new LowerMetadataCache({quotedNames: true}, !!options.strictMetadataEmit);
    this.aotCompilerHost =
        new AotCompilerHostImpl(this.tsProgram, options, host, this.metadataCache);

    const aotOptions = getAotCompilerOptions(options);
    this.compiler = createAotCompiler(this.aotCompilerHost, aotOptions).compiler;
  }

  // Program implementation
  getTsProgram(): ts.Program { return this.programWithStubs; }

  getTsOptionDiagnostics(cancellationToken?: ts.CancellationToken) {
    return this.tsProgram.getOptionsDiagnostics(cancellationToken);
  }

  getNgOptionDiagnostics(cancellationToken?: ts.CancellationToken): Diagnostic[] {
    return [...this._optionsDiagnostics, ...getNgOptionDiagnostics(this.options)];
  }

  getTsSyntacticDiagnostics(sourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken):
      ts.Diagnostic[] {
    return this.tsProgram.getSyntacticDiagnostics(sourceFile, cancellationToken);
  }

  getNgStructuralDiagnostics(cancellationToken?: ts.CancellationToken): Diagnostic[] {
    return this.structuralDiagnostics;
  }

  getTsSemanticDiagnostics(sourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken):
      ts.Diagnostic[] {
    return this.programWithStubs.getSemanticDiagnostics(sourceFile, cancellationToken);
  }

  getNgSemanticDiagnostics(fileName?: string, cancellationToken?: ts.CancellationToken):
      Diagnostic[] {
    const compilerDiagnostics = this.generatedFileDiagnostics;

    // If we have diagnostics during the parser phase the type check phase is not meaningful so skip
    // it.
    if (compilerDiagnostics && compilerDiagnostics.length) return compilerDiagnostics;

    return this.typeChecker.getDiagnostics(fileName, cancellationToken);
  }

  loadNgStructureAsync(): Promise<void> {
    return this.compiler.analyzeModulesAsync(this.rootNames)
        .catch(this.catchAnalysisError.bind(this))
        .then(analyzedModules => {
          if (this._analyzedModules) {
            throw new Error('Angular structure loaded both synchronously and asynchronsly');
          }
          this._analyzedModules = analyzedModules;
        });
  }

  getLazyRoutes(cancellationToken?: ts.CancellationToken): {[route: string]: string} { return {}; }

  emit({emitFlags = EmitFlags.Default, cancellationToken, customTransformers,
        emitCallback = defaultEmitCallback}: {
    emitFlags?: EmitFlags,
    cancellationToken?: ts.CancellationToken,
    customTransformers?: CustomTransformers,
    emitCallback?: TsEmitCallback
  }): ts.EmitResult {
    const emitMap = new Map<string, string>();

    const expectedOut = this.options.expectedOut ?
        this.options.expectedOut.map(f => path.resolve(process.cwd(), f)) :
        undefined;

    // Ensure that expected output files exist.
    for (const out of expectedOut || []) {
      this.host.writeFile(out, '', false);
    }

    const emitResult = emitCallback({
      program: this.programWithStubs,
      host: this.host,
      options: this.options,
      targetSourceFile: undefined,
      writeFile:
          createWriteFileCallback(emitFlags, this.host, this.metadataCache, emitMap, expectedOut),
      cancellationToken,
      emitOnlyDtsFiles: (emitFlags & (EmitFlags.DTS | EmitFlags.JS)) == EmitFlags.DTS,
      customTransformers: this.calculateTransforms(customTransformers)
    });

    this.generatedFiles.forEach(file => {
      // In order not to replicate the TS calculation of the out folder for files
      // derive the out location for .json files from the out location of the .ts files
      if (file.source && file.source.length && SUMMARY_JSON_FILES.test(file.genFileUrl)) {
        // If we have emitted the ngsummary.ts file, ensure the ngsummary.json file is emitted to
        // the same location.

        const emittedFile = emitMap.get(file.srcFileUrl);

        if (emittedFile) {
          const fileName = path.join(path.dirname(emittedFile), path.basename(file.genFileUrl));
          this.host.writeFile(fileName, file.source, false, error => {});
        }
      }
    });

    return emitResult;
  }

  // Private members
  private get analyzedModules(): NgAnalyzedModules {
    return this._analyzedModules || (this._analyzedModules = this.analyzeModules());
  }

  private get structuralDiagnostics(): Diagnostic[] {
    return this.analyzedModules && this._structuralDiagnostics;
  }

  private get stubs(): GeneratedFile[] {
    return this._stubs || (this._stubs = this.generateStubs());
  }

  private get stubFiles(): string[] {
    return this._stubFiles ||
        (this._stubFiles = this.stubs.reduce((files: string[], generatedFile) => {
             if (generatedFile.source || (generatedFile.stmts && generatedFile.stmts.length)) {
               return [...files, generatedFile.genFileUrl];
             }
             return files;
           }, []));
  }

  private get programWithStubsHost(): ts.CompilerHost {
    return this._programWithStubsHost || (this._programWithStubsHost = createProgramWithStubsHost(
                                              this.stubs, this.tsProgram, this.host));
  }

  private get programWithStubs(): ts.Program {
    return this._programWithStubs || (this._programWithStubs = this.createProgramWithStubs());
  }

  private get generatedFiles(): GeneratedFile[] {
    return this._generatedFiles || (this._generatedFiles = this.generateFiles());
  }

  private get typeChecker(): TypeChecker {
    return (this._typeChecker && !this._typeChecker.partialResults) ?
        this._typeChecker :
        (this._typeChecker = this.createTypeChecker());
  }

  private get generatedFileDiagnostics(): Diagnostic[]|undefined {
    return this.generatedFiles && this._generatedFileDiagnostics !;
  }

  private calculateTransforms(customTransformers?: CustomTransformers): ts.CustomTransformers {
    const beforeTs: ts.TransformerFactory<ts.SourceFile>[] = [];
    if (!this.options.disableExpressionLowering) {
      beforeTs.push(getExpressionLoweringTransformFactory(this.metadataCache));
    }
    if (!this.options.skipTemplateCodegen) {
      beforeTs.push(getAngularEmitterTransformFactory(this.generatedFiles));
    }
    if (customTransformers && customTransformers.beforeTs) {
      beforeTs.push(...customTransformers.beforeTs);
    }
    const afterTs = customTransformers ? customTransformers.afterTs : undefined;
    return {before: beforeTs, after: afterTs};
  }

  private catchAnalysisError(e: any): NgAnalyzedModules {
    if (isSyntaxError(e)) {
      const parserErrors = getParseErrors(e);
      if (parserErrors && parserErrors.length) {
        this._structuralDiagnostics =
            parserErrors.map<Diagnostic>(e => ({
                                           message: e.contextualMessage(),
                                           category: ts.DiagnosticCategory.Error,
                                           span: e.span
                                         }));
      } else {
        this._structuralDiagnostics = [{message: e.message, category: ts.DiagnosticCategory.Error}];
      }
      this._analyzedModules = emptyModules;
      return emptyModules;
    }
    throw e;
  }

  private analyzeModules() {
    try {
      return this.compiler.analyzeModulesSync(this.srcNames);
    } catch (e) {
      return this.catchAnalysisError(e);
    }
  }

  private generateStubs() {
    return this.options.skipTemplateCodegen ? [] :
                                              this.options.generateCodeForLibraries === false ?
                                              this.compiler.emitPartialStubs(this.analyzedModules) :
                                              this.compiler.emitAllStubs(this.analyzedModules);
  }

  private generateFiles() {
    try {
      // Always generate the files if requested to ensure we capture any diagnostic errors but only
      // keep the results if we are not skipping template code generation.
      const result = this.compiler.emitAllImpls(this.analyzedModules);
      return this.options.skipTemplateCodegen ? [] : result;
    } catch (e) {
      if (isSyntaxError(e)) {
        this._generatedFileDiagnostics =
            [{message: e.message, category: ts.DiagnosticCategory.Error}];
        return [];
      }
      throw e;
    }
  }

  private createTypeChecker(): TypeChecker {
    return new TypeChecker(
        this.tsProgram, this.options, this.host, this.aotCompilerHost, this.options,
        this.analyzedModules, this.generatedFiles);
  }

  private createProgramWithStubs(): ts.Program {
    // If we are skipping code generation just use the original program.
    // Otherwise, create a new program that includes the stub files.
    return this.options.skipTemplateCodegen ?
        this.tsProgram :
        ts.createProgram(
            [...this.rootNames, ...this.stubFiles], this.options, this.programWithStubsHost);
  }
}

class AotCompilerHostImpl extends BaseAotCompilerHost<CompilerHost> {
  moduleNameToFileName(m: string, containingFile: string): string|null {
    return this.context.moduleNameToFileName(m, containingFile);
  }

  fileNameToModuleName(importedFile: string, containingFile: string): string|null {
    return this.context.fileNameToModuleName(importedFile, containingFile);
  }

  resourceNameToFileName(resourceName: string, containingFile: string): string|null {
    return this.context.resourceNameToFileName(resourceName, containingFile);
  }

  toSummaryFileName(fileName: string, referringSrcFileName: string): string {
    return this.context.toSummaryFileName(fileName, referringSrcFileName);
  }

  fromSummaryFileName(fileName: string, referringLibFileName: string): string {
    return this.context.fromSummaryFileName(fileName, referringLibFileName);
  }
}

export function createProgram(
    {rootNames, options, host, oldProgram}:
        {rootNames: string[], options: CompilerOptions, host: CompilerHost, oldProgram?: Program}):
    Program {
  return new AngularCompilerProgram(rootNames, options, host, oldProgram);
}

// Compute the AotCompiler options
function getAotCompilerOptions(options: CompilerOptions): AotCompilerOptions {
  let missingTranslation = core.MissingTranslationStrategy.Warning;

  switch (options.i18nInMissingTranslations) {
    case 'ignore':
      missingTranslation = core.MissingTranslationStrategy.Ignore;
      break;
    case 'error':
      missingTranslation = core.MissingTranslationStrategy.Error;
      break;
  }

  let translations: string = '';

  if (options.i18nInFile) {
    if (!options.locale) {
      throw new Error(`The translation file (${options.i18nInFile}) locale must be provided.`);
    }
    translations = fs.readFileSync(options.i18nInFile, 'utf8');
  } else {
    // No translations are provided, ignore any errors
    // We still go through i18n to remove i18n attributes
    missingTranslation = core.MissingTranslationStrategy.Ignore;
  }

  return {
    locale: options.i18nInLocale,
    i18nFormat: options.i18nInFormat || options.i18nOutFormat, translations, missingTranslation,
    enableLegacyTemplate: options.enableLegacyTemplate,
    enableSummariesForJit: true,
    preserveWhitespaces: options.preserveWhitespaces,
  };
}

function writeMetadata(
    host: ts.CompilerHost, emitFilePath: string, sourceFile: ts.SourceFile,
    metadataCache: LowerMetadataCache) {
  if (/\.js$/.test(emitFilePath)) {
    const path = emitFilePath.replace(/\.js$/, '.metadata.json');

    // Beginning with 2.1, TypeScript transforms the source tree before emitting it.
    // We need the original, unmodified, tree which might be several levels back
    // depending on the number of transforms performed. All SourceFile's prior to 2.1
    // will appear to be the original source since they didn't include an original field.
    let collectableFile = sourceFile;
    while ((collectableFile as any).original) {
      collectableFile = (collectableFile as any).original;
    }

    const metadata = metadataCache.getMetadata(collectableFile);
    if (metadata) {
      const metadataText = JSON.stringify([metadata]);
      host.writeFile(path, metadataText, false);
    }
  }
}

function createWriteFileCallback(
    emitFlags: EmitFlags, host: ts.CompilerHost, metadataCache: LowerMetadataCache,
    emitMap: Map<string, string>, expectedOut?: string[]) {
  return (fileName: string, data: string, writeByteOrderMark: boolean,
          onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]) => {

    let srcFile: ts.SourceFile|undefined;

    if (sourceFiles && sourceFiles.length == 1) {
      srcFile = sourceFiles[0];
      emitMap.set(srcFile.fileName, fileName);
    }

    const absFile = path.resolve(process.cwd(), fileName);
    const generatedFile = GENERATED_FILES.test(fileName);

    // Don't emit unexpected files nor empty generated files
    if ((!expectedOut || expectedOut.indexOf(absFile) > -1) && (!generatedFile || data)) {
      host.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);

      if (srcFile && !generatedFile && (emitFlags & EmitFlags.Metadata) != 0) {
        writeMetadata(host, fileName, srcFile, metadataCache);
      }
    }
  };
}

function getNgOptionDiagnostics(options: CompilerOptions): Diagnostic[] {
  if (options.annotationsAs) {
    switch (options.annotationsAs) {
      case 'decorators':
      case 'static fields':
        break;
      default:
        return [{
          message:
              'Angular compiler options "annotationsAs" only supports "static fields" and "decorators"',
          category: ts.DiagnosticCategory.Error
        }];
    }
  }
  return [];
}

function createProgramWithStubsHost(
    generatedFiles: GeneratedFile[], originalProgram: ts.Program,
    originalHost: ts.CompilerHost): ts.CompilerHost {
  interface FileData {
    g: GeneratedFile;
    s?: ts.SourceFile;
  }
  return new class implements ts.CompilerHost {
    private generatedFiles: Map<string, FileData>;
    writeFile: ts.WriteFileCallback;
    getCancellationToken: () => ts.CancellationToken;
    getDefaultLibLocation: () => string;
    trace: (s: string) => void;
    getDirectories: (path: string) => string[];
    directoryExists: (directoryName: string) => boolean;
    constructor() {
      this.generatedFiles =
          new Map(generatedFiles.filter(g => g.source || (g.stmts && g.stmts.length))
                      .map<[string, FileData]>(g => [g.genFileUrl, {g}]));
      this.writeFile = originalHost.writeFile;
      if (originalHost.getDirectories) {
        this.getDirectories = path => originalHost.getDirectories !(path);
      }
      if (originalHost.directoryExists) {
        this.directoryExists = directoryName => originalHost.directoryExists !(directoryName);
      }
      if (originalHost.getCancellationToken) {
        this.getCancellationToken = () => originalHost.getCancellationToken !();
      }
      if (originalHost.getDefaultLibLocation) {
        this.getDefaultLibLocation = () => originalHost.getDefaultLibLocation !();
      }
      if (originalHost.trace) {
        this.trace = s => originalHost.trace !(s);
      }
    }
    getSourceFile(
        fileName: string, languageVersion: ts.ScriptTarget,
        onError?: ((message: string) => void)|undefined): ts.SourceFile {
      const data = this.generatedFiles.get(fileName);
      if (data) {
        return data.s || (data.s = ts.createSourceFile(
                              fileName, data.g.source || toTypeScript(data.g), languageVersion));
      }
      return originalProgram.getSourceFile(fileName) ||
          originalHost.getSourceFile(fileName, languageVersion, onError);
    }
    readFile(fileName: string): string {
      const data = this.generatedFiles.get(fileName);
      if (data) {
        return data.g.source || toTypeScript(data.g);
      }
      return originalHost.readFile(fileName);
    }
    getDefaultLibFileName = (options: ts.CompilerOptions) =>
        originalHost.getDefaultLibFileName(options);
    getCurrentDirectory = () => originalHost.getCurrentDirectory();
    getCanonicalFileName = (fileName: string) => originalHost.getCanonicalFileName(fileName);
    useCaseSensitiveFileNames = () => originalHost.useCaseSensitiveFileNames();
    getNewLine = () => originalHost.getNewLine();
    realPath = (p: string) => p;
    fileExists = (fileName: string) =>
        this.generatedFiles.has(fileName) || originalHost.fileExists(fileName);
  };
}
