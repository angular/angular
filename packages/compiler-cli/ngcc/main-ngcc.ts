#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as path from 'canonical-path';
import * as yargs from 'yargs';

import {mainNgcc} from './src/main';
import {EntryPointFormat} from './src/packages/entry_point';

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const options =
      yargs
          .option('s', {
            alias: 'source',
            describe: 'A path to the root folder to compile.',
            default: './node_modules'
          })
          .option('f', {
            alias: 'formats',
            array: true,
            describe: 'An array of formats to compile.',
            default: ['fesm2015', 'esm2015', 'fesm5', 'esm5']
          })
          .option('t', {
            alias: 'target',
            describe: 'A path to a root folder where the compiled files will be written.',
            defaultDescription: 'The `source` folder.'
          })
          .help()
          .parse(args);

  const baseSourcePath: string = path.resolve(options['s']);
  const formats: EntryPointFormat[] = options['f'];
  const baseTargetPath: string = options['t'];
  try {
    mainNgcc({baseSourcePath, formats, baseTargetPath});
    process.exitCode = 0;
  } catch (e) {
    console.error(e.stack || e.message);
    process.exitCode = 1;
  }
}
