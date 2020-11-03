/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {compileTest, getComplianceTests} from '../mock_compile/run_compliance_tests';

describe('compliance tests (partial compile)', () => {
  for (const test of getComplianceTests()) {
    describe(`[${test.group}]`, () => {
      const itFn = test.focusTest ? fit : test.excludeTest ? xit : it;
      itFn(test.description, () => {
        const {fs, env} = compileTest(
            test.testPath, test.inputFiles, test.compilerOptions, test.angularCompilerOptions);
      });
    });
  }
});
