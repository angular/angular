/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {FileSystem, WorkspacePath} from '../file-system';
import {FileSystemHost} from './virtual-host';
import {dirname} from 'path';
import {formatDiagnostics} from './diagnostics';

/** Class capturing a tsconfig parse error. */
export class TsconfigParseError extends Error {}

/**
 * Attempts to parse the specified tsconfig file.
 *
 * @throws {TsconfigParseError} If the tsconfig could not be read or parsed.
 */
export function parseTsconfigFile(
  tsconfigPath: WorkspacePath,
  fileSystem: FileSystem,
): ts.ParsedCommandLine {
  if (!fileSystem.fileExists(tsconfigPath)) {
    throw new TsconfigParseError(`Tsconfig cannot not be read: ${tsconfigPath}`);
  }

  const {config, error} = ts.readConfigFile(
    tsconfigPath,
    p => fileSystem.read(fileSystem.resolve(p))!,
  );

  // If there is a config reading error, we never attempt to parse the config.
  if (error) {
    throw new TsconfigParseError(formatDiagnostics([error], fileSystem));
  }

  const parsed = ts.parseJsonConfigFileContent(
    config,
    new FileSystemHost(fileSystem),
    dirname(tsconfigPath),
    {},
  );

  if (parsed.errors.length) {
    throw new TsconfigParseError(formatDiagnostics(parsed.errors, fileSystem));
  }

  return parsed;
}
