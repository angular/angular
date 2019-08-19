/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CachedFileSystem, NodeJSFileSystem, setFileSystem} from '../src/ngtsc/file_system';

import {AsyncNgccOptions, NgccOptions, SyncNgccOptions, mainNgcc} from './src/main';
export {ConsoleLogger, LogLevel} from './src/logging/console_logger';
export {Logger} from './src/logging/logger';
export {AsyncNgccOptions, NgccOptions, SyncNgccOptions} from './src/main';
export {PathMappings} from './src/utils';

export function process(options: AsyncNgccOptions): Promise<void>;
export function process(options: SyncNgccOptions): void;
export function process(options: NgccOptions): void|Promise<void> {
  // Recreate the file system on each call to reset the cache
  setFileSystem(new CachedFileSystem(new NodeJSFileSystem()));
  return mainNgcc(options);
}
