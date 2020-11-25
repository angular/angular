/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PluginObj, transformSync} from '@babel/core';

import {createEs2015LinkerPlugin} from '../../../linker/babel';
import {AbsoluteFsPath, FileSystem} from '../../../src/ngtsc/file_system';
import {CompileResult, getBuildOutputDirectory} from '../test_helpers/compile_test';
import {ComplianceTest} from '../test_helpers/get_compliance_tests';
import {parseGoldenPartial} from '../test_helpers/golden_partials';
import {runTests} from '../test_helpers/test_runner';

runTests('partial compile + link', linkPartials);

/**
 * Link all the partials specified in the given `test`.
 *
 * @param fs The mock file-system to use for linking the partials.
 * @param test The compliance test whose partials will be linked.
 */
function linkPartials(fs: FileSystem, test: ComplianceTest): CompileResult {
  const builtDirectory = getBuildOutputDirectory(fs);
  const linkerPlugin = createEs2015LinkerPlugin({
    // By default we don't render legacy message ids in compliance tests.
    enableI18nLegacyMessageIdFormat: false,
    ...test.angularCompilerOptions
  });
  const goldenPartialPath = fs.resolve('/GOLDEN_PARTIAL.js');
  if (!fs.exists(goldenPartialPath)) {
    throw new Error(
        'Golden partial does not exist for this test\n' +
        'Try generating it by running:\n' +
        `bazel run //packages/compiler-cli/test/compliance/test_cases:${
            test.relativePath}.golden.update`);
  }
  const partialFile = fs.readFile(goldenPartialPath);
  const partials = parseGoldenPartial(partialFile).filter(f => f.path.endsWith('.js'));
  for (const partial of partials) {
    const linkedSource =
        applyLinker({fileName: partial.path, source: partial.content}, linkerPlugin);
    safeWrite(fs, fs.resolve(builtDirectory, partial.path), linkedSource);
  }
  return {emittedFiles: [], errors: []};
}

/**
 * Run the file through the Babel linker plugin.
 *
 * It will ignore files that do not have a `.js` extension.
 *
 * @param file The file name and its source to be transformed using the linker.
 * @param linkerPlugin The linker plugin to apply.
 * @returns The file's source content, which has been transformed using the linker if necessary.
 */
function applyLinker(file: {fileName: string; source: string}, linkerPlugin: PluginObj): string {
  if (!file.fileName.endsWith('.js')) {
    return file.source;
  }
  const result = transformSync(file.source, {
    filename: file.fileName,
    plugins: [linkerPlugin],
    parserOpts: {sourceType: 'unambiguous'},
  });
  if (result === null) {
    throw fail('Babel transform did not have output');
  }
  if (result.code == null) {
    throw fail('Babel transform result does not have any code');
  }
  return result.code;
}

/**
 * Write the `content` to the `path` on the `fs` file-system, first ensuring that the containing
 * directory exists.
 */
function safeWrite(fs: FileSystem, path: AbsoluteFsPath, content: string): void {
  fs.ensureDir(fs.dirname(path));
  fs.writeFile(path, content);
}
