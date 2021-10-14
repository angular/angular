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

export function parseTsconfigFile(
  tsconfigPath: WorkspacePath,
  fileSystem: FileSystem,
): ts.ParsedCommandLine {
  const {config} = ts.readConfigFile(tsconfigPath, p => fileSystem.read(fileSystem.resolve(p))!);
  return ts.parseJsonConfigFileContent(
    config,
    new FileSystemHost(fileSystem),
    dirname(tsconfigPath),
    {},
  );
}
