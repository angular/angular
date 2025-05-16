/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runfiles} from '@bazel/runfiles';
import * as fs from 'fs';
import * as path from 'path';

import {SymbolExtractor} from './symbol_extractor.mjs';

const args = process.argv.slice(2) as [string, string];
process.exitCode = main(args) ? 0 : 1;

/**
 * CLI main method.
 *
 * ```
 *   cli javascriptFilePath.js goldenFilePath.json
 * ```
 */
function main(argv: [string, string, string] | [string, string]): boolean {
  const javascriptFilePath = runfiles.resolveWorkspaceRelative(argv[0]);
  const goldenFilePath = runfiles.resolveWorkspaceRelative(argv[1]);
  const doUpdate = argv[2] === '--accept';

  console.info('Input javascript file:', javascriptFilePath);

  const javascriptContent = fs.readFileSync(javascriptFilePath).toString();
  const goldenContent = fs.readFileSync(goldenFilePath).toString();
  const symbolExtractor = new SymbolExtractor(javascriptFilePath, javascriptContent);

  let passed = false;
  if (doUpdate) {
    const goldenOutFilePath = path.join(process.env['BUILD_WORKING_DIRECTORY']!, argv[1]);
    fs.writeFileSync(goldenOutFilePath, JSON.stringify(symbolExtractor.actual, undefined, 2));
    console.error('Updated gold file:', goldenOutFilePath);
    passed = true;
  } else {
    passed = symbolExtractor.compareAndPrintError(goldenContent);
    if (!passed) {
      console.error(`TEST FAILED!`);
      console.error(`  To update the golden file run: `);
      console.error(`    yarn bazel run ${process.env['TEST_TARGET']}.accept`);
    }
  }
  return passed;
}
