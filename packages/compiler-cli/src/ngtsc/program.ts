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

import {CompilerHost} from './compiler_host';
import {InjectableCompilerAdapter, IvyCompilation, ivyTransformFactory} from './transform';

export class NgtscProgram implements api.Program {
  private tsProgram: ts.Program;

  constructor(
      rootNames: ReadonlyArray<string>, private options: api.CompilerOptions,
      private host: api.CompilerHost, oldProgram?: api.Program) {
    this.tsProgram =
        ts.createProgram(rootNames, options, host, oldProgram && oldProgram.getTsProgram());
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

  loadNgStructureAsync(): Promise<void> { return Promise.resolve(); }

  listLazyRoutes(entryRoute?: string|undefined): api.LazyRoute[] {
    throw new Error('Method not implemented.');
  }

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
    const mergeEmitResultsCallback = opts && opts.mergeEmitResultsCallback || mergeEmitResults;

    const checker = this.tsProgram.getTypeChecker();

    // Set up the IvyCompilation, which manages state for the Ivy transformer.
    const adapters = [new InjectableCompilerAdapter(checker)];
    const compilation = new IvyCompilation(adapters, checker);

    // Analyze every source file in the program.
    this.tsProgram.getSourceFiles()
        .filter(file => !file.fileName.endsWith('.d.ts'))
        .forEach(file => compilation.analyze(file));

    // Since there is no .d.ts transformation API, .d.ts files are transformed during write.
    const writeFile: ts.WriteFileCallback =
        (fileName: string, data: string, writeByteOrderMark: boolean,
         onError: ((message: string) => void) | undefined,
         sourceFiles: ReadonlyArray<ts.SourceFile>) => {
          if (fileName.endsWith('.d.ts')) {
            data = sourceFiles.reduce(
                (data, sf) => compilation.transformedDtsFor(sf.fileName, data), data);
          }
          this.host.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
        };


    // Run the emit, including a custom transformer that will downlevel the Ivy decorators in code.
    const emitResult = emitCallback({
      program: this.tsProgram,
      host: this.host,
      options: this.options,
      emitOnlyDtsFiles: false, writeFile,
      customTransformers: {
        before: [ivyTransformFactory(compilation)],
      },
    });
    return emitResult;
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
