#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Extract i18n messages from source code
 */
// Must be imported first, because Angular decorators throw on load.
import 'reflect-metadata';
import * as api from './transformers/api';
import {ParsedConfiguration} from './perform_compile';
import {main, readCommandLineAndConfiguration} from './main';
import {setFileSystem, NodeJSFileSystem} from './ngtsc/file_system';

export function mainXi18n(
    args: string[], consoleError: (msg: string) => void = console.error): number {
  const config = readXi18nCommandLineAndConfiguration(args);
  return main(args, consoleError, config, undefined, undefined, undefined);
}

function readXi18nCommandLineAndConfiguration(args: string[]): ParsedConfiguration {
  const options: api.CompilerOptions = {};
  const parsedArgs = require('minimist')(args);
  if (parsedArgs.outFile) options.i18nOutFile = parsedArgs.outFile;
  if (parsedArgs.i18nFormat) options.i18nOutFormat = parsedArgs.i18nFormat;
  if (parsedArgs.locale) options.i18nOutLocale = parsedArgs.locale;

  const config = readCommandLineAndConfiguration(args, options, [
    'outFile',
    'i18nFormat',
    'locale',
  ]);
  // only emit the i18nBundle but nothing else.
  return {...config, emitFlags: api.EmitFlags.I18nBundle};
}

// Entry point
if (require.main === module) {
  process.title = 'Angular i18n Message Extractor (ng-xi18n)';
  const args = process.argv.slice(2);
  // We are running the real compiler so run against the real file-system
  setFileSystem(new NodeJSFileSystem());
  process.exitCode = mainXi18n(args);
}
