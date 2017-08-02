/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Must be imported first, because Angular decorators throw on load.
import 'reflect-metadata';

import {isSyntaxError} from '@angular/compiler';
import * as fs from 'fs';
import * as path from 'path';

import {performCompilation, readConfiguration, throwOnDiagnostics} from './perform-compile';
import {CompilerOptions} from './transformers/api';

export function main(
    args: string[], consoleError: (s: string) => void = console.error,
    checkFunc: (cwd: string, ...args: any[]) => void = throwOnDiagnostics): number {
  try {
    const parsedArgs = require('minimist')(args);
    const project = parsedArgs.p || parsedArgs.project || '.';

    const projectDir = fs.lstatSync(project).isFile() ? path.dirname(project) : project;

    // file names in tsconfig are resolved relative to this absolute path
    const basePath = path.resolve(process.cwd(), projectDir);
    const {parsed, ngOptions} = readConfiguration(project, basePath, checkFunc);

    // CLI arguments can override the i18n options
    const ngcOptions = mergeCommandLine(parsedArgs, ngOptions);

    const res = performCompilation(
        basePath, parsed.fileNames, parsed.options, ngcOptions, consoleError, checkFunc);

    return res.errorCode;
  } catch (e) {
    if (isSyntaxError(e)) {
      consoleError(e.message);
      return 1;
    }

    consoleError(e.stack);
    consoleError('Compilation failed');
    return 2;
  }
}

// Merge command line parameters
function mergeCommandLine(
    parsedArgs: {[k: string]: string}, options: CompilerOptions): CompilerOptions {
  if (parsedArgs.i18nFile) options.i18nInFile = parsedArgs.i18nFile;
  if (parsedArgs.i18nFormat) options.i18nInFormat = parsedArgs.i18nFormat;
  if (parsedArgs.locale) options.i18nInLocale = parsedArgs.locale;
  const mt = parsedArgs.missingTranslation;
  if (mt === 'error' || mt === 'warning' || mt === 'ignore') {
    options.i18nInMissingTranslations = mt;
  }

  return options;
}

// CLI entry point
if (require.main === module) {
  process.exit(main(process.argv.slice(2), s => console.error(s)));
}