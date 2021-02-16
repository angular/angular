/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PluginObj, transformSync} from '@babel/core';

import {needsLinking} from '../../../linker';
import {createEs2015LinkerPlugin} from '../../../linker/babel';
import {AbsoluteFsPath, FileSystem} from '../../../src/ngtsc/file_system';
import {ConsoleLogger, LogLevel} from '../../../src/ngtsc/logging';
import {MapAndPath, RawSourceMap, SourceFileLoader} from '../../../src/ngtsc/sourcemaps';
import {CompileResult, getBuildOutputDirectory} from '../test_helpers/compile_test';
import {ComplianceTest} from '../test_helpers/get_compliance_tests';
import {parseGoldenPartial} from '../test_helpers/golden_partials';
import {runTests} from '../test_helpers/test_runner';

runTests('linked compile', linkPartials);

/**
 * Link all the partials specified in the given `test`.
 *
 * @param fileSystem The mock file-system to use for linking the partials.
 * @param test The compliance test whose partials will be linked.
 */
function linkPartials(fileSystem: FileSystem, test: ComplianceTest): CompileResult {
  const logger = new ConsoleLogger(LogLevel.debug);
  const loader = new SourceFileLoader(fileSystem, logger, {});
  const builtDirectory = getBuildOutputDirectory(fileSystem);
  const linkerPlugin = createEs2015LinkerPlugin({
    fileSystem,
    logger,
    // By default we don't render legacy message ids in compliance tests.
    enableI18nLegacyMessageIdFormat: false,
    sourceMapping: test.compilerOptions?.sourceMap === true,
    ...test.angularCompilerOptions
  });
  const goldenPartialPath = fileSystem.resolve('/GOLDEN_PARTIAL.js');
  if (!fileSystem.exists(goldenPartialPath)) {
    throw new Error(
        'Golden partial does not exist for this test\n' +
        'Try generating it by running:\n' +
        `bazel run //packages/compiler-cli/test/compliance/test_cases:${
            test.relativePath}.golden.update`);
  }
  const partialFile = fileSystem.readFile(goldenPartialPath);
  const partialFiles = parseGoldenPartial(partialFile);

  partialFiles.forEach(
      f => safeWrite(fileSystem, fileSystem.resolve(builtDirectory, f.path), f.content));

  for (const expectation of test.expectations) {
    for (const {generated} of expectation.files) {
      const fileName = fileSystem.resolve(builtDirectory, generated);
      if (!fileSystem.exists(fileName)) {
        continue;
      }
      const source = fileSystem.readFile(fileName);
      const sourceMapPath = fileSystem.resolve(fileName + '.map');
      const sourceMap = fileSystem.exists(sourceMapPath) ?
          JSON.parse(fileSystem.readFile(sourceMapPath)) as RawSourceMap :
          undefined;
      const {linkedSource, linkedSourceMap} =
          applyLinker(builtDirectory, fileName, source, sourceMap, linkerPlugin);

      if (linkedSourceMap !== undefined) {
        const mapAndPath: MapAndPath = {map: linkedSourceMap, mapPath: sourceMapPath};
        const sourceFile = loader.loadSourceFile(fileName, linkedSource, mapAndPath);
        safeWrite(fileSystem, sourceMapPath, JSON.stringify(sourceFile.renderFlattenedSourceMap()));
      }
      safeWrite(fileSystem, fileName, linkedSource);
    }
  }
  return {emittedFiles: [], errors: []};
}

/**
 * Run the file through the Babel linker plugin.
 *
 * It will ignore files that do not have a `.js` extension.
 *
 * @param file The absolute file path and its source to be transformed using the linker.
 * @param linkerPlugin The linker plugin to apply.
 * @returns The file's source content, which has been transformed using the linker if necessary.
 */
function applyLinker(
    cwd: string, filename: string, source: string, sourceMap: RawSourceMap|undefined,
    linkerPlugin: PluginObj): {linkedSource: string, linkedSourceMap: RawSourceMap|undefined} {
  if (!filename.endsWith('.js') || !needsLinking(filename, source)) {
    return {linkedSource: source, linkedSourceMap: sourceMap};
  }
  const result = transformSync(source, {
    cwd,
    filename,
    sourceMaps: !!sourceMap,
    plugins: [linkerPlugin],
    parserOpts: {sourceType: 'unambiguous'},
  });
  if (result === null) {
    throw fail('Babel transform did not have output');
  }
  if (result.code == null) {
    throw fail('Babel transform result does not have any code');
  }
  return {linkedSource: result.code, linkedSourceMap: result.map || undefined};
}

/**
 * Write the `content` to the `path` on the `fs` file-system, first ensuring that the containing
 * directory exists.
 */
function safeWrite(fs: FileSystem, path: AbsoluteFsPath, content: string): void {
  fs.ensureDir(fs.dirname(path));
  fs.writeFile(path, content);
}
