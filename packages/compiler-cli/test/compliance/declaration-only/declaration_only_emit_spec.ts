/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as nodeFs from 'fs';
import * as path from 'path';
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
  const result = compileTest(
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

  const {emittedFiles} = result;
  const emittedTypeDeclarations = emittedFiles.filter((file) => file.endsWith('.d.ts'));

  for (const emittedTypeDeclaration of emittedTypeDeclarations) {
    const baseName = fs.basename(emittedTypeDeclaration, '.d.ts');
    const goldenFileName = baseName + '_isolated.golden.d.ts';
    const goldenPath = fs.resolve('/', goldenFileName);

    if (fs.exists(goldenPath)) {
      const goldenContent = fs.readFile(goldenPath);
      const refPath = getReferenceFileForTypeDeclaration(fs, emittedTypeDeclaration);
      fs.writeFile(refPath, goldenContent);
    } else {
      throw new Error(`Missing golden file for ${emittedTypeDeclaration} at ${goldenPath}`);
    }
  }

  return result;
}
