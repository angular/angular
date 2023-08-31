/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {USE_TEMPLATE_PIPELINE} from '../../../../compiler/src/template/pipeline/switch';
import {FileSystem} from '../../../src/ngtsc/file_system';

import {checkErrors, checkNoUnexpectedErrors} from './check_errors';
import {checkExpectations} from './check_expectations';
import {CompileResult, initMockTestFileSystem} from './compile_test';
import {CompilationMode, ComplianceTest, Expectation, getAllComplianceTests} from './get_compliance_tests';

function transformExpectation(expectation: Expectation, isLocalCompilation: boolean): void {
  if (USE_TEMPLATE_PIPELINE) {
    expectation.files =
        expectation.files.map(pair => ({
                                expected: pair.templatePipelineExpected || pair.expected,
                                generated: pair.generated,
                              }));
  }
  if (isLocalCompilation) {
    expectation.files =
        expectation.files.map(pair => ({
                                expected: getFilenameForLocalCompilation(pair.expected),
                                generated: pair.generated,
                              }));
  }
}

/** Adds a '.local' pre-extension, e.g., basic_full.js -> basic_full.local.js */
function getFilenameForLocalCompilation(fileName: string): string {
  return fileName.replace(/\.([cm]?js)$/, '.local.$1');
}

/**
 * Set up jasmine specs for each of the compliance tests.
 *
 * @param type A description of the type of tests being run.
 * @param compileFn The function that will do the compilation of the source files
 * @param options Extra options. Currently the only option is the flag `isLocalCompilation` which
 *     indicates whether we are testing in local compilation mode.
 */
export function runTests(
    type: CompilationMode, compileFn: (fs: FileSystem, test: ComplianceTest) => CompileResult,
    options = {
      isLocalCompilation: false
    }) {
  describe(`compliance tests (${type})`, () => {
    for (const test of getAllComplianceTests()) {
      if (!test.compilationModeFilter.includes(type)) {
        continue;
      }
      if (USE_TEMPLATE_PIPELINE && test.skipForTemplatePipeline) {
        continue;
      }
      if (!USE_TEMPLATE_PIPELINE && test.onlyForTemplatePipeline) {
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
            transformExpectation(expectation, options.isLocalCompilation);
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
