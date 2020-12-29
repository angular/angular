/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FileSystem} from '../../../src/ngtsc/file_system';

import {checkErrors, checkNoUnexpectedErrors} from './check_errors';
import {checkExpectations} from './check_expectations';
import {CompileResult, initMockTestFileSystem} from './compile_test';
import {CompilationMode, ComplianceTest, getAllComplianceTests} from './get_compliance_tests';

/**
 * Set up jasmine specs for each of the compliance tests.
 *
 * @param type A description of the type of tests being run.
 * @param compileFn The function that will do the compilation of the source files
 */
export function runTests(
    type: CompilationMode, compileFn: (fs: FileSystem, test: ComplianceTest) => CompileResult) {
  describe(`compliance tests (${type})`, () => {
    for (const test of getAllComplianceTests()) {
      if (!test.compilationModeFilter.includes(type)) {
        continue;
      }

      describe(`[${test.relativePath}]`, () => {
        const itFn = test.focusTest ? fit : test.excludeTest ? xit : it;
        itFn(test.description, () => {
          if (type === 'linked compile' && test.compilerOptions?.target === 'ES5') {
            throw new Error(
                `The "${type}" scenario does not support ES5 output.\n` +
                `Did you mean to set \`"compilationModeFilter": ["full compile"]\` in "${
                    test.relativePath}"?`);
          }

          const fs = initMockTestFileSystem(test.realTestPath);
          const {errors} = compileFn(fs, test);
          for (const expectation of test.expectations) {
            if (expectation.expectedErrors.length > 0) {
              checkErrors(
                  test.relativePath, expectation.failureMessage, expectation.expectedErrors,
                  errors);
            } else {
              checkNoUnexpectedErrors(test.relativePath, errors);
              checkExpectations(
                  fs, test.relativePath, expectation.failureMessage, expectation.files,
                  expectation.extraChecks);
            }
          }
        });
      });
    }
  });
}
