/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// tslint:disable:no-console

import * as fs from 'fs/promises';
import * as path from 'path';
import {getDiagnosticPath, HybridCompiler, serializeDiagnostics} from './src/hybrid_compiler.js';
import type {ProcessedFile} from './src/processor.js';
import {
  Counter,
  createTracer,
  NOOP_TRACER,
  SpanKind,
  type PerfSummary,
  type TraceEvent,
  type Tracer,
} from './src/perf.js';
import {AnalysisResult} from './src/types.js';
import {ChunkContext} from './src/file_analysis.js';

const reusedSourceMapCache = new WeakMap<
  ProcessedFile,
  {key: string; sourceWithMap: string; mapString: string}
>();

export {
  Counter,
  createTracer,
  NOOP_TRACER,
  SpanKind,
  type PerfSummary,
  type TraceEvent,
  type Tracer,
};

export interface RunOptions {
  outDir?: string | null;
  rootDir?: string;
  inPlace?: boolean;
  /** When set, writes `<tsconfig>.ngdiag.json` from `compiler.getDiagnostics()`. */
  tsconfigPath?: string;
  /** When true, leaves `compiler.analyzer` open so the caller can reuse it across runs. */
  keepAnalyzerAlive?: boolean;
  /** Records run-level spans and counters. Defaults to `compiler.tracer`. */
  tracer?: Tracer;
}

export async function run(compiler: HybridCompiler, options: RunOptions): Promise<void> {
  const {outDir = null, rootDir = '', tsconfigPath} = options;
  const tracer = options.tracer ?? compiler.tracer;
  const optimized = compiler.optimize && !compiler.emitDeclarationOnly;
  const chunks = optimized ? compiler.analyzeOptimized() : compiler.analyze();
  const results = tracer.enabled ? timeEachNext(tracer, chunks) : chunks;
  try {
    for await (const chunk of results) {
      // Pre-bind all files and analyze cycles in the chunk
      const chunkContext = await compiler.prepareChunk(chunk);

      await Promise.all(
        chunk.files.map((file) =>
          processFile(file, outDir, compiler, options, chunkContext, rootDir, tracer),
        ),
      );
    }
    // Unconditional: even when the analyzer produced no chunks, option diagnostics (which don't
    // depend on any file) still have to make it into the `.ngdiag.json`.
    await tracer.sliceAsync(SpanKind.WriteDiagnostics, () =>
      writeDiagnosticsFile(compiler, tsconfigPath),
    );
  } finally {
    const {analyzer} = compiler;
    if (tracer.enabled && analyzer.takePerf) {
      try {
        tracer.addAnalyzerPerf(
          await tracer.sliceAsync(SpanKind.TakePerf, () => analyzer.takePerf!()),
        );
      } catch {
        // The sidecar may already have exited (e.g. after a fatal error).
      }
    }
    if (!options.keepAnalyzerAlive) {
      tracer.slice(SpanKind.Close, () => analyzer.close());
    }
  }
}

/**
 * Records each wait on `source.next()` as an `AwaitAnalysis` slice. Nothing else runs on the
 * main thread meanwhile, as `sliceAsync` requires.
 */
async function* timeEachNext<T>(tracer: Tracer, source: AsyncIterable<T>): AsyncGenerator<T> {
  const iterator = source[Symbol.asyncIterator]();
  let done = false;
  try {
    while (true) {
      const next = await tracer.sliceAsync(SpanKind.AwaitAnalysis, () => iterator.next());
      if (next.done) {
        done = true;
        return;
      }
      yield next.value;
    }
  } finally {
    if (!done) {
      await iterator.return?.();
    }
  }
}

async function writeDiagnosticsFile(
  compiler: HybridCompiler,
  tsconfigPath: string | undefined,
): Promise<void> {
  if (!tsconfigPath) {
    return;
  }
  const diagPath = getDiagnosticPath(tsconfigPath);
  const content = serializeDiagnostics(
    tsconfigPath,
    compiler.getDiagnostics(),
    compiler.optionDiagnostics,
  );
  await fs.writeFile(diagPath, content, 'utf-8');
}

async function processFile(
  file: AnalysisResult,
  outDir: string | null,
  compiler: HybridCompiler,
  options: RunOptions,
  chunkContext: ChunkContext,
  rootDir: string,
  tracer: Tracer,
) {
  const {filePath} = file;

  // Declaration files are program inputs, not compilation outputs, so avoid emitting them.
  if (filePath.endsWith('.d.ts')) {
    return;
  }

  const fileId = tracer.newFileId(filePath);
  try {
    await emitFile(file, outDir, compiler, options, chunkContext, rootDir, tracer, fileId);
  } finally {
    tracer.asyncEnd(SpanKind.File, fileId);
  }
}

async function emitFile(
  file: AnalysisResult,
  outDir: string | null,
  compiler: HybridCompiler,
  options: RunOptions,
  chunkContext: ChunkContext,
  rootDir: string,
  tracer: Tracer,
  fileId: number,
) {
  const {filePath} = file;
  const content =
    compiler.fileCache.get(filePath)?.sourceContent ?? (await fs.readFile(filePath, 'utf-8'));
  const processed = await compiler.processFile(filePath, content, file, chunkContext, fileId);
  const s = processed.magicString;

  const writeOutput = outDir || options.inPlace;
  const emitsTcb = compiler.optimize && !compiler.emitDeclarationOnly;

  if (options.inPlace && !outDir && !s.hasChanged() && !processed.tcb?.code) {
    return;
  }

  if (writeOutput) {
    if (tracer.enabled && !s.hasChanged()) {
      tracer.count(Counter.UnchangedFilesEmitted);
    }
    let outputPath: string;
    let relativeSourcePath: string;

    if (outDir) {
      const normalizedRoot =
        process.platform === 'win32' || process.platform === 'darwin'
          ? rootDir.toLowerCase()
          : rootDir;
      const normalizedFile =
        process.platform === 'win32' || process.platform === 'darwin'
          ? filePath.toLowerCase()
          : filePath;
      const relativePath = path.relative(normalizedRoot, normalizedFile);
      outputPath = path.join(outDir, relativePath);
      relativeSourcePath = relativePath;
    } else {
      outputPath = filePath.replace(/\.ts$/, '.ng.ts');
      relativeSourcePath = path.basename(filePath);
    }

    const outputDir = path.dirname(outputPath);
    const mapPath = outputPath + '.map';

    if (outDir) {
      await fs.mkdir(outputDir, {recursive: true});
    }

    const outputBase = path.basename(outputPath);
    const mapCacheKey = `${relativeSourcePath}\0${outputBase}`;
    let mapEntry = reusedSourceMapCache.get(processed);
    if (!mapEntry || mapEntry.key !== mapCacheKey) {
      mapEntry = tracer.slice(
        SpanKind.SourceMap,
        () => {
          const map = processed.generateSourceMap({
            source: relativeSourcePath,
            file: outputBase,
            includeContent: true,
          });
          return {
            key: mapCacheKey,
            sourceWithMap: s.toString() + `\n//# sourceMappingURL=${path.basename(mapPath)}\n`,
            mapString: map.toString(),
          };
        },
        fileId,
      );
      if (compiler.incrementalEnabled) {
        reusedSourceMapCache.set(processed, mapEntry);
      }
    }
    const {sourceWithMap, mapString} = mapEntry;
    // Writes of different files overlap, so this is an async slice.
    tracer.asyncBegin(SpanKind.WriteOutput, fileId);

    const writePromises: Array<Promise<void>> = [
      fs.writeFile(outputPath, sourceWithMap),
      fs.writeFile(mapPath, mapString),
    ];

    // Files without a TCB only get the empty placeholder with `--out`, since in-place mode
    // shouldn't write `.ngtypecheck.ts` files for anything that has nothing to type-check.
    if (emitsTcb && (processed.tcb?.code || outDir)) {
      // Strip `.ng.ts` (--in-place) or `.ts` (--out) before appending `.ngtypecheck.ts`
      // so the TCB never clobbers `outputPath`.
      const tcbPath = outputPath.replace(/(\.ng)?\.ts$/, '.ngtypecheck.ts');
      if (tcbPath === outputPath) {
        throw new Error(
          `Refusing to overwrite ${outputPath} with its type-check block ` +
            `(unexpected output extension).`,
        );
      }
      if (!processed.tcb) {
        tracer.count(Counter.EmptyTcbFilesWritten);
      }
      const tcbCode = processed.tcb?.code ?? '// Empty TCB\nexport const empty = true;\n';
      writePromises.push(fs.writeFile(tcbPath, tcbCode));
    }

    await Promise.all(writePromises);
    tracer.asyncEnd(SpanKind.WriteOutput, fileId);
    tracer.count(Counter.FilesEmitted);
  } else {
    console.log(`--- ${filePath} ---`);
    console.log(s.toString());
    console.log('-------------------');
  }
}
