/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {FileSystem} from '../../../src/ngtsc/file_system';
import {CompileResult, compileTest} from '../test_helpers/compile_test';
import {ComplianceTest} from '../test_helpers/get_compliance_tests';
import {runTests} from '../test_helpers/test_runner';

runTests('local compile', compileTests, {isLocalCompilation: true});

/**
 * Compile all the input files in the given `test` using local compilation mode.
 *
 * @param fs The mock file-system where the input files can be found.
 * @param test The compliance test whose input files should be compiled.
 */
function compileTests(fs: FileSystem, test: ComplianceTest): CompileResult {
  return compileTest(fs, test.inputFiles, test.compilerOptions, {
    ...test.angularCompilerOptions,
    compilationMode: 'experimental-local',
  });
}
