/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConfigAPI, PluginObj} from '@babel/core';

import {NodeJSFileSystem} from '../../../src/ngtsc/file_system';
import {ConsoleLogger, LogLevel} from '../../../src/ngtsc/logging';
import {LinkerOptions} from '../../src/file_linker/linker_options';

import {createEs2015LinkerPlugin} from './es2015_linker_plugin';

export function linkerPlugin(api: ConfigAPI, options: Partial<LinkerOptions>): PluginObj {
  api.assertVersion(7);

  return createEs2015LinkerPlugin({
    ...options,
    fileSystem: new NodeJSFileSystem(),
    logger: new ConsoleLogger(LogLevel.info),
  });
}
