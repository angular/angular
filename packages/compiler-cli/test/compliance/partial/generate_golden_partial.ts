/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {AbsoluteFsPath, FileSystem} from '../../../src/ngtsc/file_system';
import {
  compileTest,
  getBuildOutputDirectory,
  initMockTestFileSystem,
} from '../test_helpers/compile_test';
import {ComplianceTest, getComplianceTests} from '../test_helpers/get_compliance_tests';
import {PartiallyCompiledFile, renderGoldenPartial} from '../test_helpers/golden_partials';

/**
 * Generate the golden partial output for the tests described in the `testConfigPath` config file.
 *
 * @param testConfigPath Absolute disk path of the `TEST_CASES.json` file that describes the tests.
 */
export function generateGoldenPartial(absTestConfigPath: AbsoluteFsPath): void {
  const files: PartiallyCompiledFile[] = [];
  const tests = getComplianceTests(absTestConfigPath);
  for (const test of tests) {
    const fs = initMockTestFileSystem(test.realTestPath);
    for (const file of compilePartials(fs, test)) {
      files.push(file);
    }
  }
  writeGoldenPartial(files);
}

/**
 * Partially compile the source files specified by the given `test`.
 *
 * @param fs The mock file-system to use when compiling partials.
 * @param test The information about the test being compiled.
 */
function* compilePartials(fs: FileSystem, test: ComplianceTest): Generator<PartiallyCompiledFile> {
  const builtDirectory = getBuildOutputDirectory(fs);
  const result = compileTest(fs, test.inputFiles, test.compilerOptions, {
    compilationMode: 'partial',
    ...test.angularCompilerOptions,
  });

  if (result.errors.length > 0) {
    throw new Error(
      `Unexpected compilation errors: ${result.errors.map((e) => ` - ${e}`).join('\n')}`,
    );
  }

  for (const generatedPath of result.emittedFiles) {
    yield {
      path: fs.relative(builtDirectory, generatedPath),
      content: fs.readFile(generatedPath),
    };
  }
}

/**
 * Write the partially compiled files to the appropriate output destination.
 *
 * For now just push the concatenated partial files to standard out.
 *
 * @param files The partially compiled files.
 */
function writeGoldenPartial(files: PartiallyCompiledFile[]): void {
  // tslint:disable-next-line: no-console
  console.log(renderGoldenPartial(files));
}
