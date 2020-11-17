/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FileSystem} from '../../../src/ngtsc/file_system';
import {getBuildOutputDirectory} from './compile_test';
import {expectEmit} from './expect_emit';
import {ExpectedFile} from './get_compliance_tests';

/**
 * Check that each of the generated files matches the expected files.
 *
 * @param fs The mock file-system that holds the expected and generated files to compare.
 * @param testPath Path to the current test case (relative to the basePath).
 * @param failureMessage The message to display if the expectation fails.
 * @param expectedFiles The list of expected-generated pairs to compare.
 */
export function checkExpectations(
    fs: FileSystem, testPath: string, failureMessage: string, expectedFiles: ExpectedFile[]): void {
  const builtDirectory = getBuildOutputDirectory(fs);
  for (const expectedFile of expectedFiles) {
    const expectedPath = fs.resolve(expectedFile.expected);
    if (!fs.exists(expectedPath)) {
      throw new Error(`The expected file at ${
          expectedPath} does not exist. Please check the TEST_CASES.json file for this test case.`);
    }

    const generatedPath = fs.resolve(builtDirectory, expectedFile.generated);
    if (!fs.exists(generatedPath)) {
      throw new Error(`The generated file at ${
          generatedPath} does not exist. Perhaps there is no matching input source file in the TEST_CASES.json file for this test case.`);
    }

    const expected = fs.readFile(expectedPath);
    const generated = fs.readFile(generatedPath);

    expectEmit(
        generated, expected,
        `When checking against expected file "${testPath}/${expectedFile.expected}"\n` +
            failureMessage);
  }
}
