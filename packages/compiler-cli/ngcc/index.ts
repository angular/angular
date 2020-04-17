/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NodeJSFileSystem, setFileSystem} from '../src/ngtsc/file_system';

import {mainNgcc} from './src/main';
import {AsyncNgccOptions, NgccOptions, SyncNgccOptions} from './src/ngcc_options';

export {ConsoleLogger} from './src/logging/console_logger';
export {Logger, LogLevel} from './src/logging/logger';
export {AsyncNgccOptions, NgccOptions, PathMappings, SyncNgccOptions} from './src/ngcc_options';

export function process(options: AsyncNgccOptions): Promise<void>;
export function process(options: SyncNgccOptions): void;
export function process(options: NgccOptions): void|Promise<void> {
  setFileSystem(new NodeJSFileSystem());
  return mainNgcc(options);
}
