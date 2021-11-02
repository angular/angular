/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

import {NodeJSFileSystem, setFileSystem} from '../src/ngtsc/file_system';

import {mainNgcc} from './src/main';
import {AsyncNgccOptions, SyncNgccOptions} from './src/ngcc_options';

export {ConsoleLogger, Logger, LogLevel} from '../src/ngtsc/logging';
export {AsyncNgccOptions, clearTsConfigCache, NgccOptions, SyncNgccOptions} from './src/ngcc_options';
export {PathMappings} from './src/path_mappings';

export function process<T extends AsyncNgccOptions|SyncNgccOptions>(options: T):
    T extends AsyncNgccOptions ? Promise<void>: void;
export function process(options: AsyncNgccOptions|SyncNgccOptions): void|Promise<void> {
  setFileSystem(new NodeJSFileSystem());
  return mainNgcc(options);
}


// CommonJS/ESM interop for determining the current file name and containing
// directory. These path is needed for providing an absolute path to the ngcc
// command line entry-point script (for the CLI).
export const containingDirPath =
    typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(__ESM_IMPORT_META_URL__));

/**
 * Absolute file path that points to the `ngcc` command line entry-point.
 *
 * This can be used by the Angular CLI to spawn a process running ngcc using
 * command line options.
 */
export const ngccMainFilePath = join(containingDirPath, './main-ngcc.js');
