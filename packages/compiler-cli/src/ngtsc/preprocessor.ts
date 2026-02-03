/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {NgCompiler, NgCompilerHost} from './core';
import {NgCompilerOptions} from './core/api';
import {TrackedIncrementalBuildStrategy} from './incremental';
import {ActivePerfRecorder, PerfPhase} from './perf';
import {TsCreateProgramDriver} from './program_driver';
import {
  CompilationTicket,
  freshCompilationTicket,
  incrementalFromCompilerTicket,
} from './core/src/compiler';

/**
 * A driver for the Angular Compiler that performs "Source-to-Source" transformation.
 *
 * Unlike `NgtscProgram`, this driver does NOT use `program.emit()`. Instead, it:
 * 1. Analyzes the program using `NgCompiler`.
 * 2. Manually runs `ts.transform` with Angular's Ivy transformers.
 * 3. Prints the transformed AST back to a TypeScript string.
 *
 * This mode is designed for a mode where the Angular Compiler
 * acts as a pre-processor for a downstream TypeScript compiler.
 */
export class NgtscIsolatedPreprocessor {
  readonly compiler: NgCompiler;
  private tsProgram: ts.Program;
  private host: NgCompilerHost;
  private incrementalStrategy: TrackedIncrementalBuildStrategy;

  constructor(
    rootNames: ReadonlyArray<string>,
    private options: NgCompilerOptions,
    delegateHost: ts.CompilerHost,
    oldProgram?: NgtscIsolatedPreprocessor,
  ) {
    // Enable type reification for source-to-source transformation
    this.options = {...options, '_experimentalEmitIntermediateTs': true};

    const perfRecorder = ActivePerfRecorder.zeroedToNow();
    perfRecorder.phase(PerfPhase.Setup);

    const reuseProgram = oldProgram?.compiler.getCurrentProgram();
    this.host = NgCompilerHost.wrap(delegateHost, rootNames, options, reuseProgram ?? null);

    this.tsProgram = ts.createProgram(this.host.inputFiles, options, this.host, reuseProgram);

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

    let ticket: CompilationTicket;
    if (oldProgram === undefined) {
      ticket = freshCompilationTicket(
        this.tsProgram,
        this.options,
        this.incrementalStrategy,
        programDriver,
        perfRecorder,
        /* enableTemplateTypeChecker */ !!this.options._enableTemplateTypeChecker,
        /* usePoisonedData */ false,
      );
    } else {
      ticket = incrementalFromCompilerTicket(
        oldProgram.compiler,
        this.tsProgram,
        this.incrementalStrategy,
        programDriver,
        new Set(), // TODO: track modified resource files
        perfRecorder,
      );
    }

    this.compiler = NgCompiler.fromTicket(ticket, this.host);
  }

  transformAndPrint(): {fileName: string; content: string}[] {
    // 1. Generate TCBs
    this.compiler['ensureAnalyzed']().templateTypeChecker.generateAllTypeCheckBlocks();

    const transformers = this.compiler.prepareEmit().transformers;
    // We only care about 'before' transformers for source-to-source
    const beforeTransformers = (transformers.before ||
      []) as unknown as ts.TransformerFactory<ts.SourceFile>[];

    const result: {fileName: string; content: string}[] = [];
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      removeComments: false,
    });

    const program = this.compiler.getCurrentProgram();

    for (const sf of program.getSourceFiles()) {
      if (sf.isDeclarationFile) {
        continue;
      }

      // If it is a TCB file (ends in .ngtypecheck.ts), we want it as-is, without any transformations.
      if (sf.fileName.endsWith('.ngtypecheck.ts')) {
        const content = printer.printFile(sf);
        result.push({fileName: sf.fileName, content});
        continue;
      }

      if (this.compiler.ignoreForEmit.has(sf)) {
        continue;
      }

      // Manually transform the source file
      const transformationResult = ts.transform(sf, beforeTransformers, this.options);

      if (transformationResult.transformed.length > 0) {
        const transformedSf = transformationResult.transformed[0];
        const content = printer.printFile(transformedSf);
        result.push({fileName: sf.fileName, content});
      }

      transformationResult.dispose();
    }

    return result;
  }
}
