/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Extract i18n messages from source code
 */

import yargs from 'yargs';

import {main, readCommandLineAndConfiguration} from './main';
import {ParsedConfiguration} from './perform_compile';
import * as api from './transformers/api';

export function mainXi18n(
  args: string[],
  consoleError: (msg: string) => void = console.error,
): number {
  const config = readXi18nCommandLineAndConfiguration(args);
  return main(args, consoleError, config, undefined, undefined, undefined);
}

function readXi18nCommandLineAndConfiguration(args: string[]): ParsedConfiguration {
  const options: api.CompilerOptions = {};
  const parsedArgs = yargs(args)
    .option('i18nFormat', {type: 'string'})
    .option('locale', {type: 'string'})
    .option('outFile', {type: 'string'})
    .parseSync();

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
