/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {FileSystem} from '../../../src/ngtsc/file_system';
import {getReferenceFileForTypeDeclaration} from '../test_helpers/check_type_declarations';
import {CompileResult, compileTest} from '../test_helpers/compile_test';
import {ComplianceTest} from '../test_helpers/get_compliance_tests';
import {runTests} from '../test_helpers/test_runner';

runTests('declaration-only emit', emitDeclarationOnlyTest, {emitDeclarationOnly: true});

/**
 * Compile all the input files in the given `test` in full compilation mode and compare the emitted
 * type declarations with the declarations produced by declaration-only emission.
 *
 * @param fs The mock file-system where the input files can be found.
 * @param test The compliance test whose input files should be compiled.
 */
function emitDeclarationOnlyTest(fs: FileSystem, test: ComplianceTest): CompileResult {
  const {emittedFiles} = compileTest(
    fs,
    test.inputFiles,
    test.compilerOptions,
    test.angularCompilerOptions,
  );
  const emittedTypeDeclarations = emittedFiles.filter((file) => file.endsWith('.d.ts'));
  for (const emittedTypeDeclaration of emittedTypeDeclarations) {
    fs.moveFile(
      emittedTypeDeclaration,
      getReferenceFileForTypeDeclaration(fs, emittedTypeDeclaration),
    );
  }
  return compileTest(
    fs,
    test.inputFiles,
    {
      ...test.compilerOptions,
      emitDeclarationOnly: true,
      noCheck: true,
    },
    {
      ...test.angularCompilerOptions,
      _experimentalAllowEmitDeclarationOnly: true,
    },
  );
}
