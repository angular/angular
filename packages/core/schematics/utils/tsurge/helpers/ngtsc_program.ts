/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readConfiguration} from '../../../../../compiler-cli/src/perform_compile';
import {NgCompilerOptions} from '../../../../../compiler-cli/src/ngtsc/core/api';
import {
  FileSystem,
  NgtscCompilerHost,
  NodeJSFileSystem,
  setFileSystem,
} from '../../../../../compiler-cli/src/ngtsc/file_system';
import {NgtscProgram} from '../../../../../compiler-cli/src/ngtsc/program';
import {BaseProgramInfo} from '../program_info';

/**
 * Parses the configuration of the given TypeScript project and creates
 * an instance of the Angular compiler for for the project.
 */
export function createNgtscProgram(
  absoluteTsconfigPath: string,
  fs?: FileSystem,
  optionOverrides: NgCompilerOptions = {},
): BaseProgramInfo<NgtscProgram> {
  if (fs === undefined) {
    fs = new NodeJSFileSystem();
    setFileSystem(fs);
  }

  const tsconfig = readConfiguration(absoluteTsconfigPath, {}, fs);

  if (tsconfig.errors.length > 0) {
    throw new Error(
      `Tsconfig could not be parsed or is invalid:\n\n` +
        `${tsconfig.errors.map((e) => e.messageText)}`,
    );
  }

  const tsHost = new NgtscCompilerHost(fs, tsconfig.options);
  const ngtscProgram = new NgtscProgram(
    tsconfig.rootNames,
    {
      ...tsconfig.options,
      // Migrations commonly make use of TCB information.
      _enableTemplateTypeChecker: true,
      // Avoid checking libraries to speed up migrations.
      skipLibCheck: true,
      skipDefaultLibCheck: true,
      // Additional override options.
      ...optionOverrides,
    },
    tsHost,
  );

  return {
    program: ngtscProgram,
    userOptions: tsconfig.options,
    programAbsoluteRootPaths: tsconfig.rootNames,
    tsconfigAbsolutePath: absoluteTsconfigPath,
  };
}
