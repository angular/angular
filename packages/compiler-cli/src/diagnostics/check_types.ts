/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompiler, AotCompilerHost, AotCompilerOptions, EmitterVisitorContext, GeneratedFile, NgAnalyzedModules, ParseSourceSpan, Statement, StaticReflector, TypeScriptEmitter, createAotCompiler} from '@angular/compiler';
import * as ts from 'typescript';

import {Diagnostic} from '../transformers/api';

interface FactoryInfo {
  source: ts.SourceFile;
  context: EmitterVisitorContext;
}

type FactoryInfoMap = Map<string, FactoryInfo>;

const stubCancellationToken: ts.CancellationToken = {
  isCancellationRequested(): boolean{return false;},
  throwIfCancellationRequested(): void{}
};

export class TypeChecker {
  private _aotCompiler: AotCompiler|undefined;
  private _reflector: StaticReflector|undefined;
  private _factories: Map<string, FactoryInfo>|undefined;
  private _factoryNames: string[]|undefined;
  private _diagnosticProgram: ts.Program|undefined;
  private _diagnosticsByFile: Map<string, Diagnostic[]>|undefined;
  private _currentCancellationToken: ts.CancellationToken = stubCancellationToken;
  private _partial: boolean = false;

  constructor(
      private program: ts.Program, private tsOptions: ts.CompilerOptions,
      private compilerHost: ts.CompilerHost, private aotCompilerHost: AotCompilerHost,
      private aotOptions: AotCompilerOptions, private _analyzedModules?: NgAnalyzedModules,
      private _generatedFiles?: GeneratedFile[]) {}

  getDiagnostics(fileName?: string, cancellationToken?: ts.CancellationToken): Diagnostic[] {
    this._currentCancellationToken = cancellationToken || stubCancellationToken;
    try {
      return fileName ?
          this.diagnosticsByFileName.get(fileName) || [] :
          ([] as Diagnostic[]).concat(...Array.from(this.diagnosticsByFileName.values()));
    } finally {
      this._currentCancellationToken = stubCancellationToken;
    }
  }

  get partialResults(): boolean { return this._partial; }

  private get analyzedModules(): NgAnalyzedModules {
    return this._analyzedModules || (this._analyzedModules = this.aotCompiler.analyzeModulesSync(
                                         this.program.getSourceFiles().map(sf => sf.fileName)));
  }

  private get diagnosticsByFileName(): Map<string, Diagnostic[]> {
    return this._diagnosticsByFile || this.createDiagnosticsByFile();
  }

  private get diagnosticProgram(): ts.Program {
    return this._diagnosticProgram || this.createDiagnosticProgram();
  }

  private get generatedFiles(): GeneratedFile[] {
    let result = this._generatedFiles;
    if (!result) {
      this._generatedFiles = result = this.aotCompiler.emitAllImpls(this.analyzedModules);
    }
    return result;
  }

  private get aotCompiler(): AotCompiler {
    return this._aotCompiler || this.createCompilerAndReflector();
  }

  private get reflector(): StaticReflector {
    let result = this._reflector;
    if (!result) {
      this.createCompilerAndReflector();
      result = this._reflector !;
    }
    return result;
  }

  private get factories(): Map<string, FactoryInfo> {
    return this._factories || this.createFactories();
  }

  private get factoryNames(): string[] {
    return this._factoryNames || (this.createFactories() && this._factoryNames !);
  }

  private createCompilerAndReflector() {
    const {compiler, reflector} = createAotCompiler(this.aotCompilerHost, this.aotOptions);
    this._reflector = reflector;
    return this._aotCompiler = compiler;
  }

  private createDiagnosticProgram() {
    // Create a program that is all the files from the original program plus the factories.
    const existingFiles = this.program.getSourceFiles().map(source => source.fileName);
    const host = new TypeCheckingHost(this.compilerHost, this.program, this.factories);
    return this._diagnosticProgram =
               ts.createProgram([...existingFiles, ...this.factoryNames], this.tsOptions, host);
  }

  private createFactories() {
    // Create all the factory files with enough information to map the diagnostics reported for the
    // created file back to the original source.
    const emitter = new TypeScriptEmitter();
    const factorySources =
        this.generatedFiles.filter(file => file.stmts != null && file.stmts.length)
            .map<[string, FactoryInfo]>(
                file => [file.genFileUrl, createFactoryInfo(emitter, file)]);
    this._factories = new Map(factorySources);
    this._factoryNames = Array.from(this._factories.keys());
    return this._factories;
  }

  private createDiagnosticsByFile() {
    // Collect all the diagnostics binned by original source file name.
    const result = new Map<string, Diagnostic[]>();
    const diagnosticsFor = (fileName: string) => {
      let r = result.get(fileName);
      if (!r) {
        r = [];
        result.set(fileName, r);
      }
      return r;
    };
    const program = this.diagnosticProgram;
    for (const factoryName of this.factoryNames) {
      if (this._currentCancellationToken.isCancellationRequested()) return result;
      const sourceFile = program.getSourceFile(factoryName);
      for (const diagnostic of this.diagnosticProgram.getSemanticDiagnostics(sourceFile)) {
        const span = this.sourceSpanOf(diagnostic.file, diagnostic.start, diagnostic.length);
        if (span) {
          const fileName = span.start.file.url;
          const diagnosticsList = diagnosticsFor(fileName);
          diagnosticsList.push({
            message: diagnosticMessageToString(diagnostic.messageText),
            category: diagnostic.category, span
          });
        }
      }
    }
    return result;
  }

  private sourceSpanOf(source: ts.SourceFile, start: number, length: number): ParseSourceSpan|null {
    // Find the corresponding TypeScript node
    const info = this.factories.get(source.fileName);
    if (info) {
      const {line, character} = ts.getLineAndCharacterOfPosition(source, start);
      return info.context.spanOf(line, character);
    }
    return null;
  }
}

function diagnosticMessageToString(message: ts.DiagnosticMessageChain | string): string {
  return ts.flattenDiagnosticMessageText(message, '\n');
}

function createFactoryInfo(emitter: TypeScriptEmitter, file: GeneratedFile): FactoryInfo {
  const {sourceText, context} =
      emitter.emitStatementsAndContext(file.srcFileUrl, file.genFileUrl, file.stmts !);
  const source = ts.createSourceFile(
      file.genFileUrl, sourceText, ts.ScriptTarget.Latest, /* setParentNodes */ true);
  return {source, context};
}

class TypeCheckingHost implements ts.CompilerHost {
  constructor(
      private host: ts.CompilerHost, private originalProgram: ts.Program,
      private factories: Map<string, FactoryInfo>) {}

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: ((message: string) => void)): ts.SourceFile {
    const originalSource = this.originalProgram.getSourceFile(fileName);
    if (originalSource) {
      return originalSource;
    }
    const factoryInfo = this.factories.get(fileName);
    if (factoryInfo) {
      return factoryInfo.source;
    }
    return this.host.getSourceFile(fileName, languageVersion, onError);
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return this.host.getDefaultLibFileName(options);
  }

  writeFile: ts.WriteFileCallback =
      () => { throw new Error('Unexpected write in diagnostic program'); };

  getCurrentDirectory(): string { return this.host.getCurrentDirectory(); }

  getDirectories(path: string): string[] { return this.host.getDirectories(path); }

  getCanonicalFileName(fileName: string): string {
    return this.host.getCanonicalFileName(fileName);
  }

  useCaseSensitiveFileNames(): boolean { return this.host.useCaseSensitiveFileNames(); }

  getNewLine(): string { return this.host.getNewLine(); }

  fileExists(fileName: string): boolean {
    return this.factories.has(fileName) || this.host.fileExists(fileName);
  }

  readFile(fileName: string): string {
    const factoryInfo = this.factories.get(fileName);
    return (factoryInfo && factoryInfo.source.text) || this.host.readFile(fileName);
  }
}
