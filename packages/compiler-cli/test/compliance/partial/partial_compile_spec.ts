/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as prettier from 'prettier';

import {AbsoluteFsPath, FileSystem} from '../../../src/ngtsc/file_system';
import {shouldSkipInNgp} from '../../../src/ngtsc/file_system/testing';
import {ConsoleLogger, LogLevel} from '../../../src/ngtsc/logging';
import {MapAndPath, RawSourceMap, SourceFileLoader} from '../../../src/ngtsc/sourcemaps';
import {checkErrors, checkNoUnexpectedErrors} from '../test_helpers/check_errors';
import {
  checkTypeDeclarations,
  getReferenceFileForTypeDeclaration,
} from '../test_helpers/check_type_declarations';
import {
  compileTest,
  getBuildOutputDirectory,
  initMockTestFileSystem,
} from '../test_helpers/compile_test';
import {expectEmit} from '../test_helpers/expect_emit';
import {getAllComplianceTests} from '../test_helpers/get_compliance_tests';
import {parseGoldenPartial} from '../test_helpers/golden_partials';

describe('compliance tests (partial compile)', () => {
  let counter = 0;
  for (const test of getAllComplianceTests()) {
    if (test.compilationModeFilter.every((mode) => mode === 'local compile')) {
      continue;
    }
    if (test.skipForTemplatePipeline) {
      continue;
    }

    describe(`[${test.relativePath}]/${counter++}`, () => {
      const specKey = `compliance tests (partial compile) [${test.relativePath}] ${test.description}`;
      const itFn = test.focusTest ? fit : test.excludeTest || shouldSkipInNgp(specKey) ? xit : it;
      itFn(test.description, async () => {
        const fs = initMockTestFileSystem(test.realTestPath);
        const builtDirectory = getBuildOutputDirectory(fs);
        const {errors, emittedFiles} = compileTest(fs, test.inputFiles, test.compilerOptions, {
          compilationMode: 'partial',
          ...test.angularCompilerOptions,
        });

        const goldenPartialPath = fs.resolve('/GOLDEN_PARTIAL.js');
        if (!fs.exists(goldenPartialPath)) {
          for (const expectation of test.expectations) {
            if (expectation.expectedErrors.length > 0) {
              checkErrors(
                test.relativePath,
                expectation.failureMessage,
                expectation.expectedErrors,
                errors,
              );
            } else {
              checkNoUnexpectedErrors(test.relativePath, errors);
            }
          }
          return;
        }

        checkNoUnexpectedErrors(test.relativePath, errors);

        const goldenFiles = new Map<string, string>();
        for (const file of parseGoldenPartial(fs.readFile(goldenPartialPath))) {
          goldenFiles.set(file.path, file.content);
        }

        const emittedDtsFiles: AbsoluteFsPath[] = [];
        for (const emittedPath of emittedFiles) {
          const relPath = fs.relative(builtDirectory, emittedPath);
          const goldenContent = goldenFiles.get(relPath);
          if (goldenContent === undefined) {
            throw new Error(
              `No golden partial entry found for "${relPath}" in "${test.relativePath}/GOLDEN_PARTIAL.js".`,
            );
          }

          if (relPath.endsWith('.d.ts')) {
            const refPath = getReferenceFileForTypeDeclaration(fs, emittedPath);
            fs.ensureDir(fs.dirname(refPath));
            fs.writeFile(refPath, goldenContent);
            emittedDtsFiles.push(emittedPath);
          } else if (relPath.endsWith('.js')) {
            const prettierOptions: prettier.Options = {
              parser: 'babel',
              printWidth: 100,
              singleQuote: false,
              trailingComma: 'none',
              arrowParens: 'avoid',
              quoteProps: 'preserve',
            };
            const emittedContent = await prettier.format(fs.readFile(emittedPath), prettierOptions);
            const expectedContent = await prettier.format(goldenContent, prettierOptions);
            expectEmit(
              emittedContent,
              expectedContent,
              `When checking partial output "${relPath}" in "${test.relativePath}"`,
            );
          } else if (relPath.endsWith('.js.map') && test.compilerOptions?.['sourceMap'] === true) {
            const jsRelPath = relPath.slice(0, -'.map'.length);
            const goldenJsContent = goldenFiles.get(jsRelPath);
            if (goldenJsContent !== undefined) {
              checkPartialSourceMap(
                fs,
                builtDirectory,
                emittedPath,
                fs.resolve(builtDirectory, jsRelPath),
                goldenJsContent,
                goldenContent,
                test.relativePath,
              );
            }
          }
        }

        if (emittedDtsFiles.length > 0) {
          checkTypeDeclarations(fs, emittedDtsFiles);
        }
      });
    });
  }
});

/**
 * Verifies that an emitted partial `.js.map` preserves all source files and template mappings
 * present in the corresponding `GOLDEN_PARTIAL.js` `.js.map` entry.
 */
function checkPartialSourceMap(
  fs: FileSystem,
  builtDirectory: AbsoluteFsPath,
  emittedMapPath: AbsoluteFsPath,
  emittedJsPath: AbsoluteFsPath,
  goldenJsContent: string,
  goldenMapContent: string,
  testPath: string,
): void {
  const logger = new ConsoleLogger(LogLevel.debug);
  const loader = new SourceFileLoader(fs, logger, {});

  const emittedMap = JSON.parse(fs.readFile(emittedMapPath)) as RawSourceMap;
  const goldenMap = JSON.parse(goldenMapContent) as RawSourceMap;

  const mapDir = fs.dirname(emittedMapPath);
  const emittedSources = new Set(emittedMap.sources.map((s) => fs.resolve(mapDir, s)));
  for (const goldenSource of goldenMap.sources) {
    const resolved = fs.resolve(mapDir, goldenSource);
    if (!emittedSources.has(resolved)) {
      throw new Error(
        `Missing source "${goldenSource}" in partial source map "${fs.relative(builtDirectory, emittedMapPath)}" for "${testPath}".\n` +
          `Emitted sources: ${JSON.stringify(emittedMap.sources)}`,
      );
    }
  }

  const emittedJsContent = fs.readFile(emittedJsPath);
  const emittedMapAndPath: MapAndPath = {map: emittedMap, mapPath: emittedMapPath};
  const goldenMapAndPath: MapAndPath = {map: goldenMap, mapPath: emittedMapPath};

  const emittedSourceFile = loader.loadSourceFile(
    emittedJsPath,
    emittedJsContent,
    emittedMapAndPath,
  );
  const goldenSourceFile = loader.loadSourceFile(emittedJsPath, goldenJsContent, goldenMapAndPath);
  if (emittedSourceFile === null || goldenSourceFile === null) {
    throw new Error(
      `Failed to load partial source map for "${fs.relative(builtDirectory, emittedJsPath)}" in "${testPath}".`,
    );
  }

  // Verify every external template source mapping (non-.ts originalSource) and inline template
  // literal mapping in the golden partial is represented in the emitted source map.
  const emittedOriginalKeys = new Set<string>();
  for (const m of emittedSourceFile.flattenedMappings) {
    emittedOriginalKeys.add(
      `${m.originalSource.sourcePath}:${m.originalSegment.line}:${m.originalSegment.column}`,
    );
  }

  for (const m of goldenSourceFile.flattenedMappings) {
    if (!m.originalSource.sourcePath.endsWith('.ts')) {
      const key = `${m.originalSource.sourcePath}:${m.originalSegment.line}:${m.originalSegment.column}`;
      if (!emittedOriginalKeys.has(key)) {
        throw new Error(
          `Missing external template mapping ${key} in partial source map "${fs.relative(builtDirectory, emittedMapPath)}" for "${testPath}".`,
        );
      }
    }
  }
}
