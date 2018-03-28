#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Must be imported first, because Angular decorators throw on load.
import 'reflect-metadata';

import * as ts from 'typescript';
import * as path from 'path';
import {readCommandLineAndConfiguration} from '../main';
import {createBundleIndexHost} from './bundle_index_host';
import * as ng from '../transformers/entry_points';

export function main(args: string[], consoleError: (s: string) => void = console.error): number {
  const {options, rootNames} = readCommandLineAndConfiguration(args);
  const host = ng.createCompilerHost({options});
  const {host: bundleHost, indexName, errors} = createBundleIndexHost(options, rootNames, host);
  if (!indexName) {
    console.error('Did not find an index.ts in the top-level of the package.');
    return 1;
  }
  // The index file is synthetic, so we have to add it to the program after parsing the tsconfig
  rootNames.push(indexName);
  const program = ts.createProgram(rootNames, options, bundleHost);
  const indexSourceFile = program.getSourceFile(indexName);
  if (!indexSourceFile) {
    console.error(`${indexSourceFile} is not in the program. Please file a bug.`);
    return 1;
  }
  program.emit(indexSourceFile);
  return 0;
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  process.exitCode = main(args);
}
