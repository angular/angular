/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GeneratedFile} from '@angular/compiler';
import * as ts from 'typescript';

import * as api from '../transformers/api';
import {verifySupportedTypeScriptVersion} from '../typescript_support';

import {CompilationTicket, freshCompilationTicket, incrementalFromCompilerTicket, NgCompiler, NgCompilerHost} from './core';
import {NgCompilerOptions} from './core/api';
import {absoluteFrom, AbsoluteFsPath, getFileSystem} from './file_system';
import {TrackedIncrementalBuildStrategy} from './incremental';
import {IndexedComponent} from './indexer';
import {ActivePerfRecorder, PerfCheckpoint as PerfCheckpoint, PerfEvent, PerfPhase} from './perf';
import {DeclarationNode} from './reflection';
import {retagAllTsFiles, untagAllTsFiles} from './shims';
import {ReusedProgramStrategy} from './typecheck';
import {OptimizeFor} from './typecheck/api';



/**
 * Entrypoint to the Angular Compiler (Ivy+) which sits behind the `api.Program` interface, allowing
 * it to be a drop-in replacement for the legacy View Engine compiler to tooling such as the
 * command-line main() function or the Angular CLI.
 */
export class NgtscProgram implements api.Program {
  readonly compiler: NgCompiler;

  /**
   * The primary TypeScript program, which is used for analysis and emit.
   */
  private tsProgram: ts.Program;

  /**
   * The TypeScript program to use for the next incremental compilation.
   *
   * Once a TS program is used to create another (an incremental compilation operation), it can no
   * longer be used to do so again.
   *
   * Since template type-checking uses the primary program to create a type-checking program, after
   * this happens the primary program is no longer suitable for starting a subsequent compilation,
   * and the template type-checking program should be used instead.
   *
   * Thus, the program which should be used for the next incremental compilation is tracked in
   * `reuseTsProgram`, separately from the "primary" program which is always used for emit.
   */
  private reuseTsProgram: ts.Program;
  private closureCompilerEnabled: boolean;
  private host: NgCompilerHost;
  private incrementalStrategy: TrackedIncrementalBuildStrategy;

  constructor(
      rootNames: ReadonlyArray<string>, private options: NgCompilerOptions,
      delegateHost: api.CompilerHost, oldProgram?: NgtscProgram) {
    const perfRecorder = ActivePerfRecorder.zeroedToNow();

    perfRecorder.phase(PerfPhase.Setup);

    // First, check whether the current TS version is supported.
    if (!options.disableTypeScriptVersionCheck) {
      verifySupportedTypeScriptVersion();
    }

    this.closureCompilerEnabled = !!options.annotateForClosureCompiler;

    const reuseProgram = oldProgram?.reuseTsProgram;
    this.host = NgCompilerHost.wrap(delegateHost, rootNames, options, reuseProgram ?? null);

    if (reuseProgram !== undefined) {
      // Prior to reusing the old program, restore shim tagging for all its `ts.SourceFile`s.
      // TypeScript checks the `referencedFiles` of `ts.SourceFile`s for changes when evaluating
      // incremental reuse of data from the old program, so it's important that these match in order
      // to get the most benefit out of reuse.
      retagAllTsFiles(reuseProgram);
    }

    this.tsProgram = perfRecorder.inPhase(
        PerfPhase.TypeScriptProgramCreate,
        () => ts.createProgram(this.host.inputFiles, options, this.host, reuseProgram));
    this.reuseTsProgram = this.tsProgram;

    perfRecorder.phase(PerfPhase.Unaccounted);
    perfRecorder.memory(PerfCheckpoint.TypeScriptProgramCreate);

    this.host.postProgramCreationCleanup();

    // Shim tagging has served its purpose, and tags can now be removed from all `ts.SourceFile`s in
    // the program.
    untagAllTsFiles(this.tsProgram);

    const reusedProgramStrategy = new ReusedProgramStrategy(
        this.tsProgram, this.host, this.options, this.host.shimExtensionPrefixes);

    this.incrementalStrategy = oldProgram !== undefined ?
        oldProgram.incrementalStrategy.toNextBuildStrategy() :
        new TrackedIncrementalBuildStrategy();
    const modifiedResourceFiles = new Set<AbsoluteFsPath>();
    if (this.host.getModifiedResourceFiles !== undefined) {
      const strings = this.host.getModifiedResourceFiles();
      if (strings !== undefined) {
        for (const fileString of strings) {
          modifiedResourceFiles.add(absoluteFrom(fileString));
        }
      }
    }

    let ticket: CompilationTicket;
    if (oldProgram === undefined) {
      ticket = freshCompilationTicket(
          this.tsProgram, options, this.incrementalStrategy, reusedProgramStrategy, perfRecorder,
          /* enableTemplateTypeChecker */ false, /* usePoisonedData */ false);
    } else {
      ticket = incrementalFromCompilerTicket(
          oldProgram.compiler,
          this.tsProgram,
          this.incrementalStrategy,
          reusedProgramStrategy,
          modifiedResourceFiles,
          perfRecorder,
      );
    }


    // Create the NgCompiler which will drive the rest of the compilation.
    this.compiler = NgCompiler.fromTicket(ticket, this.host);
  }

  getTsProgram(): ts.Program {
    return this.tsProgram;
  }

  getReuseTsProgram(): ts.Program {
    return this.reuseTsProgram;
  }

  getTsOptionDiagnostics(cancellationToken?: ts.CancellationToken|
                         undefined): readonly ts.Diagnostic[] {
    return this.compiler.perfRecorder.inPhase(
        PerfPhase.TypeScriptDiagnostics,
        () => this.tsProgram.getOptionsDiagnostics(cancellationToken));
  }

  getTsSyntacticDiagnostics(
      sourceFile?: ts.SourceFile|undefined,
      cancellationToken?: ts.CancellationToken|undefined): readonly ts.Diagnostic[] {
    return this.compiler.perfRecorder.inPhase(PerfPhase.TypeScriptDiagnostics, () => {
      const ignoredFiles = this.compiler.ignoreForDiagnostics;
      let res: readonly ts.Diagnostic[];
      if (sourceFile !== undefined) {
        if (ignoredFiles.has(sourceFile)) {
          return [];
        }

        res = this.tsProgram.getSyntacticDiagnostics(sourceFile, cancellationToken);
      } else {
        const diagnostics: ts.Diagnostic[] = [];
        for (const sf of this.tsProgram.getSourceFiles()) {
          if (!ignoredFiles.has(sf)) {
            diagnostics.push(...this.tsProgram.getSyntacticDiagnostics(sf, cancellationToken));
          }
        }
        res = diagnostics;
      }
      return res;
    });
  }

  getTsSemanticDiagnostics(
      sourceFile?: ts.SourceFile|undefined,
      cancellationToken?: ts.CancellationToken|undefined): readonly ts.Diagnostic[] {
    return this.compiler.perfRecorder.inPhase(PerfPhase.TypeScriptDiagnostics, () => {
      const ignoredFiles = this.compiler.ignoreForDiagnostics;
      let res: readonly ts.Diagnostic[];
      if (sourceFile !== undefined) {
        if (ignoredFiles.has(sourceFile)) {
          return [];
        }

        res = this.tsProgram.getSemanticDiagnostics(sourceFile, cancellationToken);
      } else {
        const diagnostics: ts.Diagnostic[] = [];
        for (const sf of this.tsProgram.getSourceFiles()) {
          if (!ignoredFiles.has(sf)) {
            diagnostics.push(...this.tsProgram.getSemanticDiagnostics(sf, cancellationToken));
          }
        }
        res = diagnostics;
      }
      return res;
    });
  }

  getNgOptionDiagnostics(cancellationToken?: ts.CancellationToken|
                         undefined): readonly(ts.Diagnostic|api.Diagnostic)[] {
    return this.compiler.getOptionDiagnostics();
  }

  getNgStructuralDiagnostics(cancellationToken?: ts.CancellationToken|
                             undefined): readonly api.Diagnostic[] {
    return [];
  }

  getNgSemanticDiagnostics(
      fileName?: string|undefined, cancellationToken?: ts.CancellationToken|undefined):
      readonly(ts.Diagnostic|api.Diagnostic)[] {
    let sf: ts.SourceFile|undefined = undefined;
    if (fileName !== undefined) {
      sf = this.tsProgram.getSourceFile(fileName);
      if (sf === undefined) {
        // There are no diagnostics for files which don't exist in the program - maybe the caller
        // has stale data?
        return [];
      }
    }

    const diagnostics = sf === undefined ?
        this.compiler.getDiagnostics() :
        this.compiler.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram);
    this.reuseTsProgram = this.compiler.getNextProgram();
    return diagnostics;
  }

  /**
   * Ensure that the `NgCompiler` has properly analyzed the program, and allow for the asynchronous
   * loading of any resources during the process.
   *
   * This is used by the Angular CLI to allow for spawning (async) child compilations for things
   * like SASS files used in `styleUrls`.
   */
  loadNgStructureAsync(): Promise<void> {
    return this.compiler.analyzeAsync();
  }

  listLazyRoutes(entryRoute?: string|undefined): api.LazyRoute[] {
    return this.compiler.listLazyRoutes(entryRoute);
  }

  emit(opts?: {
    emitFlags?: api.EmitFlags|undefined;
    cancellationToken?: ts.CancellationToken | undefined;
    customTransformers?: api.CustomTransformers | undefined;
    emitCallback?: api.TsEmitCallback | undefined;
    mergeEmitResultsCallback?: api.TsMergeEmitResultsCallback | undefined;
  }|undefined): ts.EmitResult {
    this.compiler.perfRecorder.memory(PerfCheckpoint.PreEmit);

    const res = this.compiler.perfRecorder.inPhase(PerfPhase.TypeScriptEmit, () => {
      const {transformers} = this.compiler.prepareEmit();
      const ignoreFiles = this.compiler.ignoreForEmit;
      const emitCallback = opts && opts.emitCallback || defaultEmitCallback;

      const writeFile: ts.WriteFileCallback =
          (fileName: string, data: string, writeByteOrderMark: boolean,
           onError: ((message: string) => void)|undefined,
           sourceFiles: ReadonlyArray<ts.SourceFile>|undefined) => {
            if (sourceFiles !== undefined) {
              // Record successful writes for any `ts.SourceFile` (that's not a declaration file)
              // that's an input to this write.
              for (const writtenSf of sourceFiles) {
                if (writtenSf.isDeclarationFile) {
                  continue;
                }

                this.compiler.incrementalDriver.recordSuccessfulEmit(writtenSf);
              }
            }
            this.host.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
          };

      const customTransforms = opts && opts.customTransformers;
      const beforeTransforms = transformers.before || [];
      const afterDeclarationsTransforms = transformers.afterDeclarations;

      if (customTransforms !== undefined && customTransforms.beforeTs !== undefined) {
        beforeTransforms.push(...customTransforms.beforeTs);
      }

      const emitResults: ts.EmitResult[] = [];

      for (const targetSourceFile of this.tsProgram.getSourceFiles()) {
        if (targetSourceFile.isDeclarationFile || ignoreFiles.has(targetSourceFile)) {
          continue;
        }

        if (this.compiler.incrementalDriver.safeToSkipEmit(targetSourceFile)) {
          this.compiler.perfRecorder.eventCount(PerfEvent.EmitSkipSourceFile);
          continue;
        }

        this.compiler.perfRecorder.eventCount(PerfEvent.EmitSourceFile);

        emitResults.push(emitCallback({
          targetSourceFile,
          program: this.tsProgram,
          host: this.host,
          options: this.options,
          emitOnlyDtsFiles: false,
          writeFile,
          customTransformers: {
            before: beforeTransforms,
            after: customTransforms && customTransforms.afterTs,
            afterDeclarations: afterDeclarationsTransforms,
          } as any,
        }));
      }

      this.compiler.perfRecorder.memory(PerfCheckpoint.Emit);

      // Run the emit, including a custom transformer that will downlevel the Ivy decorators in
      // code.
      return ((opts && opts.mergeEmitResultsCallback) || mergeEmitResults)(emitResults);
    });

    // Record performance analysis information to disk if we've been asked to do so.
    if (this.options.tracePerformance !== undefined) {
      const perf = this.compiler.perfRecorder.finalize();
      getFileSystem().writeFile(
          getFileSystem().resolve(this.options.tracePerformance), JSON.stringify(perf, null, 2));
    }
    return res;
  }

  getIndexedComponents(): Map<DeclarationNode, IndexedComponent> {
    return this.compiler.getIndexedComponents();
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
}

const defaultEmitCallback: api.TsEmitCallback = ({
  program,
  targetSourceFile,
  writeFile,
  cancellationToken,
  emitOnlyDtsFiles,
  customTransformers
}) =>
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
