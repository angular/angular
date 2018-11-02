/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as path from 'canonical-path';
import * as yargs from 'yargs';

import {DependencyHost} from './packages/dependency_host';
import {DependencyResolver} from './packages/dependency_resolver';
import {EntryPointFormat} from './packages/entry_point';
import {EntryPointFinder} from './packages/entry_point_finder';
import {Transformer} from './packages/transformer';

export function mainNgcc(args: string[]): number {
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

  const sourcePath: string = path.resolve(options['s']);
  const formats: EntryPointFormat[] = options['f'];
  const targetPath: string = options['t'] || sourcePath;

  const transformer = new Transformer(sourcePath, targetPath);
  const host = new DependencyHost();
  const resolver = new DependencyResolver(host);
  const finder = new EntryPointFinder(resolver);

  try {
    const {entryPoints} = finder.findEntryPoints(sourcePath);
    entryPoints.forEach(entryPoint => {
      // We transform the d.ts typings files while transforming one of the formats.
      // This variable decides with which of the available formats to do this transform.
      // It is marginally faster to process via the flat file if available.
      const dtsTranformFormat: EntryPointFormat = entryPoint.fesm2015 ? 'fesm2015' : 'esm2015';
      formats.forEach(
          format => transformer.transform(entryPoint, format, format === dtsTranformFormat));
    });
  } catch (e) {
    console.error(e.stack);
    return 1;
  }

  return 0;
}
