/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgCompilerOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import {
  FileSystem,
  NgtscCompilerHost,
  NodeJSFileSystem,
  setFileSystem,
} from '@angular/compiler-cli/src/ngtsc/file_system';
import {BaseProgramInfo} from '../program_info';
import {google3UsePlainTsProgramIfNoKnownAngularOption} from './google3/target_detection';
import {createNgtscProgram} from './ngtsc_program';
import {parseTsconfigOrDie} from './ts_parse_config';
import {createPlainTsProgram} from './ts_program';

/** Creates the base program info for the given tsconfig path. */
export function createBaseProgramInfo(
  absoluteTsconfigPath: string,
  fs?: FileSystem,
  optionOverrides: NgCompilerOptions = {},
): BaseProgramInfo {
  if (fs === undefined) {
    fs = new NodeJSFileSystem();
    setFileSystem(fs);
  }

  const tsconfig = parseTsconfigOrDie(absoluteTsconfigPath, fs);
  const tsHost = new NgtscCompilerHost(fs, tsconfig.options);

  // When enabled, use a plain TS program if we are sure it's not
  // an Angular project based on the `tsconfig.json`.
  if (
    google3UsePlainTsProgramIfNoKnownAngularOption() &&
    tsconfig.options['_useHostForImportGeneration'] === undefined
  ) {
    return createPlainTsProgram(tsHost, tsconfig, optionOverrides);
  }

  return createNgtscProgram(tsHost, tsconfig, optionOverrides);
}
