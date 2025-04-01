/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as path from 'path';
import ts from 'typescript';

export function parseTsconfigFile(tsconfigPath: string, basePath: string): ts.ParsedCommandLine {
  const {config} = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const parseConfigHost = {
    useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
    fileExists: ts.sys.fileExists,
    readDirectory: ts.sys.readDirectory,
    readFile: ts.sys.readFile,
  };

  // Throw if incorrect arguments are passed to this function. Passing relative base paths
  // results in root directories not being resolved and in later type checking runtime errors.
  // More details can be found here: https://github.com/microsoft/TypeScript/issues/37731.
  if (!path.isAbsolute(basePath)) {
    throw Error('Unexpected relative base path has been specified.');
  }

  return ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, {});
}
