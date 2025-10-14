/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {HtmlParser, MessageBundle} from '@angular/compiler';
import ts from 'typescript';
import * as api from '../transformers/api';
import {i18nExtract} from '../transformers/i18n';
import {verifySupportedTypeScriptVersion} from '../typescript_support';
import {
  freshCompilationTicket,
  incrementalFromCompilerTicket,
  NgCompiler,
  NgCompilerHost,
} from './core';
import {absoluteFrom, getFileSystem, resolve} from './file_system';
import {TrackedIncrementalBuildStrategy} from './incremental';
import {ActivePerfRecorder, PerfCheckpoint as PerfCheckpoint, PerfEvent, PerfPhase} from './perf';
import {TsCreateProgramDriver} from './program_driver';
import {retagAllTsFiles} from './shims';
import {OptimizeFor} from './typecheck/api';
/**
 * Entrypoint to the Angular Compiler (Ivy+) which sits behind the `api.Program` interface, allowing
 * it to be a drop-in replacement for the legacy View Engine compiler to tooling such as the
 * command-line main() function or the Angular CLI.
 */
export class NgtscProgram {
  options;
  compiler;
  /**
   * The primary TypeScript program, which is used for analysis and emit.
   */
  tsProgram;
  host;
  incrementalStrategy;
  constructor(rootNames, options, delegateHost, oldProgram) {
    this.options = options;
    const perfRecorder = ActivePerfRecorder.zeroedToNow();
    perfRecorder.phase(PerfPhase.Setup);
    // First, check whether the current TS version is supported.
    if (!options.disableTypeScriptVersionCheck) {
      verifySupportedTypeScriptVersion();
    }
    // In local compilation mode there are almost always (many) emit errors due to imports that
    // cannot be resolved. So we should emit regardless.
    if (options.compilationMode === 'experimental-local') {
      options.noEmitOnError = false;
    }
    const reuseProgram = oldProgram?.compiler.getCurrentProgram();
    this.host = NgCompilerHost.wrap(delegateHost, rootNames, options, reuseProgram ?? null);
    if (reuseProgram !== undefined) {
      // Prior to reusing the old program, restore shim tagging for all its `ts.SourceFile`s.
      // TypeScript checks the `referencedFiles` of `ts.SourceFile`s for changes when evaluating
      // incremental reuse of data from the old program, so it's important that these match in order
      // to get the most benefit out of reuse.
      retagAllTsFiles(reuseProgram);
    }
    this.tsProgram = perfRecorder.inPhase(PerfPhase.TypeScriptProgramCreate, () =>
      ts.createProgram(this.host.inputFiles, options, this.host, reuseProgram),
    );
    perfRecorder.phase(PerfPhase.Unaccounted);
    perfRecorder.memory(PerfCheckpoint.TypeScriptProgramCreate);
    this.host.postProgramCreationCleanup();
    const programDriver = new TsCreateProgramDriver(
      this.tsProgram,
      this.host,
      this.options,
      this.host.shimExtensionPrefixes,
    );
    this.incrementalStrategy =
      oldProgram !== undefined
        ? oldProgram.incrementalStrategy.toNextBuildStrategy()
        : new TrackedIncrementalBuildStrategy();
    const modifiedResourceFiles = new Set();
    if (this.host.getModifiedResourceFiles !== undefined) {
      const strings = this.host.getModifiedResourceFiles();
      if (strings !== undefined) {
        for (const fileString of strings) {
          modifiedResourceFiles.add(absoluteFrom(fileString));
        }
      }
    }
    let ticket;
    if (oldProgram === undefined) {
      ticket = freshCompilationTicket(
        this.tsProgram,
        options,
        this.incrementalStrategy,
        programDriver,
        perfRecorder,
        /* enableTemplateTypeChecker */ false,
        /* usePoisonedData */ false,
      );
    } else {
      ticket = incrementalFromCompilerTicket(
        oldProgram.compiler,
        this.tsProgram,
        this.incrementalStrategy,
        programDriver,
        modifiedResourceFiles,
        perfRecorder,
      );
    }
    // Create the NgCompiler which will drive the rest of the compilation.
    this.compiler = NgCompiler.fromTicket(ticket, this.host);
  }
  getTsProgram() {
    return this.tsProgram;
  }
  getReuseTsProgram() {
    return this.compiler.getCurrentProgram();
  }
  getTsOptionDiagnostics(cancellationToken) {
    return this.compiler.perfRecorder.inPhase(PerfPhase.TypeScriptDiagnostics, () =>
      this.tsProgram.getOptionsDiagnostics(cancellationToken),
    );
  }
  getTsSyntacticDiagnostics(sourceFile, cancellationToken) {
    return this.compiler.perfRecorder.inPhase(PerfPhase.TypeScriptDiagnostics, () => {
      const ignoredFiles = this.compiler.ignoreForDiagnostics;
      let res;
      if (sourceFile !== undefined) {
        if (ignoredFiles.has(sourceFile)) {
          return [];
        }
        res = this.tsProgram.getSyntacticDiagnostics(sourceFile, cancellationToken);
      } else {
        const diagnostics = [];
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
  getTsSemanticDiagnostics(sourceFile, cancellationToken) {
    // No TS semantic check should be done in local compilation mode, as it is always full of errors
    // due to cross file imports.
    if (this.options.compilationMode === 'experimental-local') {
      return [];
    }
    return this.compiler.perfRecorder.inPhase(PerfPhase.TypeScriptDiagnostics, () => {
      const ignoredFiles = this.compiler.ignoreForDiagnostics;
      let res;
      if (sourceFile !== undefined) {
        if (ignoredFiles.has(sourceFile)) {
          return [];
        }
        res = this.tsProgram.getSemanticDiagnostics(sourceFile, cancellationToken);
      } else {
        const diagnostics = [];
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
  getNgOptionDiagnostics(cancellationToken) {
    return this.compiler.getOptionDiagnostics();
  }
  getNgStructuralDiagnostics(cancellationToken) {
    return [];
  }
  getNgSemanticDiagnostics(fileName, cancellationToken) {
    let sf = undefined;
    if (fileName !== undefined) {
      sf = this.tsProgram.getSourceFile(fileName);
      if (sf === undefined) {
        // There are no diagnostics for files which don't exist in the program - maybe the caller
        // has stale data?
        return [];
      }
    }
    if (sf === undefined) {
      return this.compiler.getDiagnostics();
    } else {
      return this.compiler.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram);
    }
  }
  /**
   * Ensure that the `NgCompiler` has properly analyzed the program, and allow for the asynchronous
   * loading of any resources during the process.
   *
   * This is used by the Angular CLI to allow for spawning (async) child compilations for things
   * like SASS files used in `styleUrls`.
   */
  loadNgStructureAsync() {
    return this.compiler.analyzeAsync();
  }
  listLazyRoutes(entryRoute) {
    return [];
  }
  emitXi18n() {
    const ctx = new MessageBundle(
      new HtmlParser(),
      [],
      {},
      this.options.i18nOutLocale ?? null,
      this.options.i18nPreserveWhitespaceForLegacyExtraction,
    );
    this.compiler.xi18n(ctx);
    i18nExtract(
      this.options.i18nOutFormat ?? null,
      this.options.i18nOutFile ?? null,
      this.host,
      this.options,
      ctx,
      resolve,
    );
  }
  emit(opts) {
    // Check if emission of the i18n messages bundle was requested.
    if (
      opts !== undefined &&
      opts.emitFlags !== undefined &&
      opts.emitFlags & api.EmitFlags.I18nBundle
    ) {
      this.emitXi18n();
      // `api.EmitFlags` is a View Engine compiler concept. We only pay attention to the absence of
      // the other flags here if i18n emit was requested (since this is usually done in the xi18n
      // flow, where we don't want to emit JS at all).
      if (!(opts.emitFlags & api.EmitFlags.JS)) {
        return {
          diagnostics: [],
          emitSkipped: true,
          emittedFiles: [],
        };
      }
    }
    const forceEmit = opts?.forceEmit ?? false;
    this.compiler.perfRecorder.memory(PerfCheckpoint.PreEmit);
    const res = this.compiler.perfRecorder.inPhase(PerfPhase.TypeScriptEmit, () => {
      const {transformers} = this.compiler.prepareEmit();
      const ignoreFiles = this.compiler.ignoreForEmit;
      const emitCallback = opts?.emitCallback ?? defaultEmitCallback;
      const writeFile = (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
        if (sourceFiles !== undefined) {
          // Record successful writes for any `ts.SourceFile` (that's not a declaration file)
          // that's an input to this write.
          for (const writtenSf of sourceFiles) {
            if (writtenSf.isDeclarationFile) {
              continue;
            }
            this.compiler.incrementalCompilation.recordSuccessfulEmit(writtenSf);
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
      const emitResults = [];
      for (const targetSourceFile of this.tsProgram.getSourceFiles()) {
        if (targetSourceFile.isDeclarationFile || ignoreFiles.has(targetSourceFile)) {
          continue;
        }
        if (!forceEmit && this.compiler.incrementalCompilation.safeToSkipEmit(targetSourceFile)) {
          this.compiler.perfRecorder.eventCount(PerfEvent.EmitSkipSourceFile);
          continue;
        }
        this.compiler.perfRecorder.eventCount(PerfEvent.EmitSourceFile);
        emitResults.push(
          emitCallback({
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
            },
          }),
        );
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
        getFileSystem().resolve(this.options.tracePerformance),
        JSON.stringify(perf, null, 2),
      );
    }
    return res;
  }
  getIndexedComponents() {
    return this.compiler.getIndexedComponents();
  }
  /**
   * Gets information for the current program that may be used to generate API
   * reference documentation. This includes Angular-specific information, such
   * as component inputs and outputs.
   *
   * @param entryPoint Path to the entry point for the package for which API
   *     docs should be extracted.
   */
  getApiDocumentation(entryPoint, privateModules) {
    return this.compiler.getApiDocumentation(entryPoint, privateModules);
  }
  getEmittedSourceFiles() {
    throw new Error('Method not implemented.');
  }
}
const defaultEmitCallback = ({
  program,
  targetSourceFile,
  writeFile,
  cancellationToken,
  emitOnlyDtsFiles,
  customTransformers,
}) =>
  program.emit(
    targetSourceFile,
    writeFile,
    cancellationToken,
    emitOnlyDtsFiles,
    customTransformers,
  );
function mergeEmitResults(emitResults) {
  const diagnostics = [];
  let emitSkipped = false;
  const emittedFiles = [];
  for (const er of emitResults) {
    diagnostics.push(...er.diagnostics);
    emitSkipped = emitSkipped || er.emitSkipped;
    emittedFiles.push(...(er.emittedFiles || []));
  }
  return {diagnostics, emitSkipped, emittedFiles};
}
//# sourceMappingURL=program.js.map
