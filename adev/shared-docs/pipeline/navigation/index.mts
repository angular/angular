/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {generateNavItems} from './nav-items-gen.mjs';
import {getNavItemGenStrategy} from './strategies.mjs';

async function main() {
  const [paramFilePath] = process.argv.slice(2);
  const rawParamLines = readFileSync(paramFilePath, {encoding: 'utf8'}).split('\n');
  const [joinedSrcs, packageDir, strategy, outputFilePath] = rawParamLines;

  const srcs = joinedSrcs.split(',');

  // Generate navigation data
  const navData = await generateNavItems(srcs, getNavItemGenStrategy(strategy, packageDir));

  writeFileSync(outputFilePath, JSON.stringify(navData));
}

await main();
