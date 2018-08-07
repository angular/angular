/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GeneratedFile} from '@angular/compiler';
import * as path from 'path';
import * as ts from 'typescript';

import * as api from '../transformers/api';

import {ComponentDecoratorHandler, DirectiveDecoratorHandler, InjectableDecoratorHandler, NgModuleDecoratorHandler, PipeDecoratorHandler, ResourceLoader, SelectorScopeRegistry} from './annotations';
import {BaseDefDecoratorHandler} from './annotations/src/base_def';
import {FactoryGenerator, FactoryInfo, GeneratedFactoryHostWrapper, generatedFactoryTransform} from './factories';
import {TypeScriptReflectionHost} from './metadata';
import {FileResourceLoader, HostResourceLoader} from './resource_loader';
import {IvyCompilation, ivyTransformFactory} from './transform';

export class NgtscProgram implements api.Program {
  private tsProgram: ts.Program;
  private resourceLoader: ResourceLoader;
  private compilation: IvyCompilation|undefined = undefined;
  private factoryToSourceInfo: Map<string, FactoryInfo>|null = null;
  private sourceToFactorySymbols: Map<string, Set<string>>|null = null;
  private host: ts.CompilerHost;
  private _coreImportsFrom: ts.SourceFile|null|undefined = undefined;
  private _reflector: TypeScriptReflectionHost|undefined = undefined;
  private _isCore: boolean|undefined = undefined;


  constructor(
      rootNames: ReadonlyArray<string>, private options: api.CompilerOptions,
      host: api.CompilerHost, oldProgram?: api.Program) {
    this.resourceLoader = host.readResource !== undefined ?
        new HostResourceLoader(host.readResource.bind(host)) :
        new FileResourceLoader();
    const shouldGenerateFactories = options.allowEmptyCodegenFiles || false;
    this.host = host;
    let rootFiles = [...rootNames];
    if (shouldGenerateFactories) {
      const generator = new FactoryGenerator();
      const factoryFileMap = generator.computeFactoryFileMap(rootNames);
      rootFiles.push(...Array.from(factoryFileMap.keys()));
      this.factoryToSourceInfo = new Map<string, FactoryInfo>();
      this.sourceToFactorySymbols = new Map<string, Set<string>>();
      factoryFileMap.forEach((sourceFilePath, factoryPath) => {
        const moduleSymbolNames = new Set<string>();
        this.sourceToFactorySymbols !.set(sourceFilePath, moduleSymbolNames);
        this.factoryToSourceInfo !.set(factoryPath, {sourceFilePath, moduleSymbolNames});
      });
      this.host = new GeneratedFactoryHostWrapper(host, generator, factoryFileMap);
    }

    this.tsProgram =
        ts.createProgram(rootFiles, options, this.host, oldProgram && oldProgram.getTsProgram());
  }

  getTsProgram(): ts.Program { return this.tsProgram; }

  getTsOptionDiagnostics(cancellationToken?: ts.CancellationToken|
                         undefined): ReadonlyArray<ts.Diagnostic> {
    return this.tsProgram.getOptionsDiagnostics(cancellationToken);
  }

  getNgOptionDiagnostics(cancellationToken?: ts.CancellationToken|
                         undefined): ReadonlyArray<api.Diagnostic> {
    return [];
  }

  getTsSyntacticDiagnostics(
      sourceFile?: ts.SourceFile|undefined,
      cancellationToken?: ts.CancellationToken|undefined): ReadonlyArray<ts.Diagnostic> {
    return this.tsProgram.getSyntacticDiagnostics(sourceFile, cancellationToken);
  }

  getNgStructuralDiagnostics(cancellationToken?: ts.CancellationToken|
                             undefined): ReadonlyArray<api.Diagnostic> {
    return [];
  }

  getTsSemanticDiagnostics(
      sourceFile?: ts.SourceFile|undefined,
      cancellationToken?: ts.CancellationToken|undefined): ReadonlyArray<ts.Diagnostic> {
    return this.tsProgram.getSemanticDiagnostics(sourceFile, cancellationToken);
  }

  getNgSemanticDiagnostics(
      fileName?: string|undefined,
      cancellationToken?: ts.CancellationToken|undefined): ReadonlyArray<api.Diagnostic> {
    return [];
  }

  async loadNgStructureAsync(): Promise<void> {
    if (this.compilation === undefined) {
      this.compilation = this.makeCompilation();
    }
    await Promise.all(this.tsProgram.getSourceFiles()
                          .filter(file => !file.fileName.endsWith('.d.ts'))
                          .map(file => this.compilation !.analyzeAsync(file))
                          .filter((result): result is Promise<void> => result !== undefined));
  }

  listLazyRoutes(entryRoute?: string|undefined): api.LazyRoute[] { return []; }

  getLibrarySummaries(): Map<string, api.LibrarySummary> {
    throw new Error('Method not implemented.');
  }

  getEmittedGeneratedFiles(): Map<string, GeneratedFile> {
    throw new Error('Method not implemented.');
  }

  getEmittedSourceFiles(): Map<string, ts.SourceFile> {
    throw new Error('Method not implemented.');
  }

  emit(opts?: {
    emitFlags?: api.EmitFlags,
    cancellationToken?: ts.CancellationToken,
    customTransformers?: api.CustomTransformers,
    emitCallback?: api.TsEmitCallback,
    mergeEmitResultsCallback?: api.TsMergeEmitResultsCallback
  }): ts.EmitResult {
    const emitCallback = opts && opts.emitCallback || defaultEmitCallback;

    if (this.compilation === undefined) {
      this.compilation = this.makeCompilation();
      this.tsProgram.getSourceFiles()
          .filter(file => !file.fileName.endsWith('.d.ts'))
          .forEach(file => this.compilation !.analyzeSync(file));
    }

    // Since there is no .d.ts transformation API, .d.ts files are transformed during write.
    const writeFile: ts.WriteFileCallback =
        (fileName: string, data: string, writeByteOrderMark: boolean,
         onError: ((message: string) => void) | undefined,
         sourceFiles: ReadonlyArray<ts.SourceFile>) => {
          if (fileName.endsWith('.d.ts')) {
            data = sourceFiles.reduce(
                (data, sf) => this.compilation !.transformedDtsFor(sf.fileName, data, fileName),
                data);
          }
          this.host.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
        };

    const transforms =
        [ivyTransformFactory(this.compilation !, this.reflector, this.coreImportsFrom)];
    if (this.factoryToSourceInfo !== null) {
      transforms.push(generatedFactoryTransform(this.factoryToSourceInfo, this.coreImportsFrom));
    }
    // Run the emit, including a custom transformer that will downlevel the Ivy decorators in code.
    const emitResult = emitCallback({
      program: this.tsProgram,
      host: this.host,
      options: this.options,
      emitOnlyDtsFiles: false, writeFile,
      customTransformers: {
        before: transforms,
      },
    });
    return emitResult;
  }

  private makeCompilation(): IvyCompilation {
    const checker = this.tsProgram.getTypeChecker();
    const scopeRegistry = new SelectorScopeRegistry(checker, this.reflector);

    // Set up the IvyCompilation, which manages state for the Ivy transformer.
    const handlers = [
      new BaseDefDecoratorHandler(checker, this.reflector),
      new ComponentDecoratorHandler(
          checker, this.reflector, scopeRegistry, this.isCore, this.resourceLoader),
      new DirectiveDecoratorHandler(checker, this.reflector, scopeRegistry, this.isCore),
      new InjectableDecoratorHandler(this.reflector, this.isCore),
      new NgModuleDecoratorHandler(checker, this.reflector, scopeRegistry, this.isCore),
      new PipeDecoratorHandler(checker, this.reflector, scopeRegistry, this.isCore),
    ];

    return new IvyCompilation(
        handlers, checker, this.reflector, this.coreImportsFrom, this.sourceToFactorySymbols);
  }

  private get reflector(): TypeScriptReflectionHost {
    if (this._reflector === undefined) {
      this._reflector = new TypeScriptReflectionHost(this.tsProgram.getTypeChecker());
    }
    return this._reflector;
  }

  private get coreImportsFrom(): ts.SourceFile|null {
    if (this._coreImportsFrom === undefined) {
      this._coreImportsFrom = this.isCore && getR3SymbolsFile(this.tsProgram) || null;
    }
    return this._coreImportsFrom;
  }

  private get isCore(): boolean {
    if (this._isCore === undefined) {
      this._isCore = isAngularCorePackage(this.tsProgram);
    }
    return this._isCore;
  }
}

const defaultEmitCallback: api.TsEmitCallback =
    ({program, targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles,
      customTransformers}) =>
        program.emit(
            targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);

function mergeEmitResults(emitResults: ts.EmitResult[]): ts.EmitResult {
  const diagnostics: ts.Diagnostic[] = [];
  let emitSkipped = false;
  const emittedFiles: string[] = [];
  for (const er of emitResults) {
    diagnostics.push(...er.diagnostics);
    emitSkipped = emitSkipped || er.emitSkipped;
    emittedFiles.push(...(er.emittedFiles || []));
  }
  return {diagnostics, emitSkipped, emittedFiles};
}

/**
 * Find the 'r3_symbols.ts' file in the given `Program`, or return `null` if it wasn't there.
 */
function getR3SymbolsFile(program: ts.Program): ts.SourceFile|null {
  return program.getSourceFiles().find(file => file.fileName.indexOf('r3_symbols.ts') >= 0) || null;
}

/**
 * Determine if the given `Program` is @angular/core.
 */
function isAngularCorePackage(program: ts.Program): boolean {
  // Look for its_just_angular.ts somewhere in the program.
  const r3Symbols = getR3SymbolsFile(program);
  if (r3Symbols === null) {
    return false;
  }

  // Look for the constant ITS_JUST_ANGULAR in that file.
  return r3Symbols.statements.some(stmt => {
    // The statement must be a variable declaration statement.
    if (!ts.isVariableStatement(stmt)) {
      return false;
    }
    // It must be exported.
    if (stmt.modifiers === undefined ||
        !stmt.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
      return false;
    }
    // It must declare ITS_JUST_ANGULAR.
    return stmt.declarationList.declarations.some(decl => {
      // The declaration must match the name.
      if (!ts.isIdentifier(decl.name) || decl.name.text !== 'ITS_JUST_ANGULAR') {
        return false;
      }
      // It must initialize the variable to true.
      if (decl.initializer === undefined || decl.initializer.kind !== ts.SyntaxKind.TrueKeyword) {
        return false;
      }
      // This definition matches.
      return true;
    });
  });
}
