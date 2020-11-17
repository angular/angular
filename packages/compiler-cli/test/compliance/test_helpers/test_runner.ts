/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FileSystem} from '../../../src/ngtsc/file_system';
import {checkExpectations} from '../test_helpers/check_expectations';
import {initMockTestFileSystem} from '../test_helpers/compile_test';
import {ComplianceTest, getAllComplianceTests} from '../test_helpers/get_compliance_tests';

/**
 * Set up jasmine specs for each of the compliance tests.
 *
 * @param type A description of the type of tests being run.
 * @param compileFn The function that will do the compilation of the source files
 */
export function runTests(type: string, compileFn: (fs: FileSystem, test: ComplianceTest) => void) {
  describe(`compliance tests (${type})`, () => {
    for (const test of getAllComplianceTests()) {
      describe(`[${test.relativePath}]`, () => {
        const itFn = test.focusTest ? fit : test.excludeTest ? xit : it;
        itFn(test.description, () => {
          const fs = initMockTestFileSystem(test.realTestPath);
          compileFn(fs, test);
          for (const expectation of test.expectations) {
            checkExpectations(fs, test.relativePath, expectation.failureMessage, expectation.files);
          }
        });
      });
    }
  });
}
