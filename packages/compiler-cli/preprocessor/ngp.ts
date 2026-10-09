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
import {HybridCompiler} from './src/hybrid_compiler.js';
import {AnalysisResult} from './src/types.js';
import {ChunkContext} from './src/file_analysis.js';

export interface RunOptions {
  outDir: string | null;
  rootDir: string;
  inPlace?: boolean;
}

export async function run(compiler: HybridCompiler, options: RunOptions): Promise<void> {
  const {outDir, rootDir} = options;
  const results =
    compiler.optimize && !compiler.emitDeclarationOnly
      ? compiler.analyzeOptimized()
      : compiler.analyze();
  try {
    for await (const chunk of results) {
      // Pre-bind all files and analyze cycles in the chunk
      const chunkContext = await compiler.prepareChunk(chunk);

      await Promise.all(
        chunk.files.map((file) =>
          processFile(file, outDir, compiler, options, chunkContext, rootDir),
        ),
      );
      await compiler.writeDiagnosticsFile();
    }
  } finally {
    compiler.analyzer.close();
  }
}

async function processFile(
  file: AnalysisResult,
  outDir: string | null,
  compiler: HybridCompiler,
  options: RunOptions,
  chunkContext: ChunkContext,
  rootDir: string,
) {
  const {filePath} = file;

  const content = await fs.readFile(filePath, 'utf-8');
  const processed = await compiler.processFile(filePath, content, undefined, file, chunkContext);
  const s = processed.magicString;

  const writeOutput = outDir || options.inPlace;

  if (writeOutput) {
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

    await fs.mkdir(outputDir, {recursive: true});

    const map = s.generateMap({
      source: relativeSourcePath,
      file: path.basename(outputPath),
      includeContent: true,
    });

    const sourceWithMap = s.toString() + `\n//# sourceMappingURL=${path.basename(mapPath)}\n`;

    const writePromises: Array<Promise<void>> = [
      fs.writeFile(outputPath, sourceWithMap),
      fs.writeFile(mapPath, map.toString()),
    ];

    if (compiler.optimize && !compiler.emitDeclarationOnly) {
      // Strip `.ng.ts` (--in-place) or `.ts` (--out) before appending `.ngtypecheck.ts`
      // so the TCB never clobbers `outputPath`.
      const tcbPath = outputPath.replace(/(\.ng)?\.ts$/, '.ngtypecheck.ts');
      if (tcbPath === outputPath) {
        throw new Error(
          `Refusing to overwrite ${outputPath} with its type-check block ` +
            `(unexpected output extension).`,
        );
      }
      const tcbCode = processed.tcb?.code ?? '// Empty TCB\nexport const empty = true;\n';
      writePromises.push(fs.writeFile(tcbPath, tcbCode));
    }

    await Promise.all(writePromises);
  } else {
    console.log(`--- ${filePath} ---`);
    console.log(s.toString());
    console.log('-------------------');
  }
}
