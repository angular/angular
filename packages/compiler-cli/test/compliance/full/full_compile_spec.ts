/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {checkExpectations, compileTest, getComplianceTests} from '../mock_compile/run_compliance_tests';

describe('compliance tests (full compile)', () => {
  for (const test of getComplianceTests()) {
    describe(`[${test.group}]`, () => {
      const itFn = test.focusTest ? fit : test.excludeTest ? xit : it;
      itFn(test.description, () => {
        const {fs, env} = compileTest(
            test.testPath, test.inputFiles, test.compilerOptions, test.angularCompilerOptions);
        for (const expectation of test.expectations) {
          checkExpectations(fs, env, expectation.failureMessage, expectation.files);
        }
      });
    });
  }
});
