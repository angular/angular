/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Must be imported first, because Angular decorators throw on load.
import 'reflect-metadata';

import {isSyntaxError, syntaxError} from '@angular/compiler';
import * as fs from 'fs';
import * as path from 'path';

import {performCompilation, readConfiguration, throwOnDiagnostics} from './perform-compile';

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
    return performCompilation(
        basePath, parsed.fileNames, parsed.options, ngOptions, consoleError, checkFunc);
  } catch (e) {
    consoleError(e.stack);
    consoleError('Compilation failed');
    return 2;
  }
}

// CLI entry point
if (require.main === module) {
  process.exit(main(process.argv.slice(2), s => console.error(s)));
}
