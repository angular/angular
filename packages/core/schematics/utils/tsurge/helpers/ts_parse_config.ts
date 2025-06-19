/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FileSystem, ParsedConfiguration, readConfiguration} from '@angular/compiler-cli';

/** Code of the error raised by TypeScript when a tsconfig doesn't match any files. */
const NO_INPUTS_ERROR_CODE = 18003;

/** Parses the given tsconfig file, supporting Angular compiler options. */
export function parseTsconfigOrDie(
  absoluteTsconfigPath: string,
  fs: FileSystem,
): ParsedConfiguration {
  const tsconfig = readConfiguration(absoluteTsconfigPath, {}, fs);

  // Skip the "No inputs found..." error since we don't want to interrupt the migration if a
  // tsconfig doesn't match a file. This will result in an empty `Program` which is still valid.
  const errors = tsconfig.errors.filter((diag) => diag.code !== NO_INPUTS_ERROR_CODE);

  if (errors.length) {
    throw new Error(
      `Tsconfig could not be parsed or is invalid:\n\n` + `${errors.map((e) => e.messageText)}`,
    );
  }

  return tsconfig;
}
