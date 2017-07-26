/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// TODO(chuckj): Remove the requirment for a fake 'reflect` implementation from
// the compiler
import 'reflect-metadata';
import {performCompilation} from '@angular/compiler-cli';
import * as fs from 'fs';
import * as path from 'path';
// Note, the tsc_wrapped module comes from rules_typescript, not from @angular/tsc-wrapped
import {parseTsconfig} from 'tsc_wrapped';

function main(args: string[]) {
  const [{options, bazelOpts, files, config}] = parseTsconfig(args[1]);
  const ngOptions: {expectedOut: string[]} = (config as any).angularCompilerOptions;

  const parsedArgs = require('minimist')(args);
  const project = parsedArgs.p || parsedArgs.project || '.';

  const projectDir = fs.lstatSync(project).isFile() ? path.dirname(project) : project;

  // file names in tsconfig are resolved relative to this absolute path
  const basePath = path.resolve(process.cwd(), projectDir);
  const result = performCompilation(basePath, files, options, ngOptions, undefined);

  if (result === 0) {
    // Ensure that expected output files exist.
    if (ngOptions && ngOptions.expectedOut) {
      for (const out of ngOptions.expectedOut) {
        fs.appendFileSync(out, '', 'utf-8');
      }
    }
  }

  return result;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
