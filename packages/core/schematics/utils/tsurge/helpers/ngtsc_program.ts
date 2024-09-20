/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readConfiguration} from '@angular/compiler-cli/src/perform_compile';
import {NgCompilerOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import {
  FileSystem,
  NgtscCompilerHost,
  NodeJSFileSystem,
  setFileSystem,
} from '@angular/compiler-cli/src/ngtsc/file_system';
import {NgtscProgram} from '@angular/compiler-cli/src/ngtsc/program';
import {BaseProgramInfo} from '../program_info';

/** Code of the error raised by TypeScript when a tsconfig doesn't match any files. */
const NO_INPUTS_ERROR_CODE = 18003;

/**
 * Parses the configuration of the given TypeScript project and creates
 * an instance of the Angular compiler for the project.
 */
export function createNgtscProgram(
  absoluteTsconfigPath: string,
  fs?: FileSystem,
  optionOverrides: NgCompilerOptions = {},
): BaseProgramInfo {
  if (fs === undefined) {
    fs = new NodeJSFileSystem();
    setFileSystem(fs);
  }

  const tsconfig = readConfiguration(absoluteTsconfigPath, {}, fs);

  // Skip the "No inputs found..." error since we don't want to interrupt the migration if a
  // tsconfig doesn't match a file. This will result in an empty `Program` which is still valid.
  const errors = tsconfig.errors.filter((diag) => diag.code !== NO_INPUTS_ERROR_CODE);

  if (errors.length) {
    throw new Error(
      `Tsconfig could not be parsed or is invalid:\n\n` + `${errors.map((e) => e.messageText)}`,
    );
  }

  const tsHost = new NgtscCompilerHost(fs, tsconfig.options);
  const ngtscProgram = new NgtscProgram(
    tsconfig.rootNames,
    {
      ...tsconfig.options,
      // Avoid checking libraries to speed up migrations.
      skipLibCheck: true,
      skipDefaultLibCheck: true,
      // Additional override options.
      ...optionOverrides,
    },
    tsHost,
  );

  return {
    ngCompiler: ngtscProgram.compiler,
    program: ngtscProgram.getTsProgram(),
    userOptions: tsconfig.options,
    programAbsoluteRootFileNames: tsconfig.rootNames,
    host: tsHost,
  };
}
