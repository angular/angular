/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {glob} from 'glob';
import {TUTORIALS_CONTENT_NODE_PATH} from './utils/node-constants';
import {dirname} from 'path';
import {execSync} from 'child_process';

main();

/**
 * This script updates the package-lock.json files for all tutorials
 * after manually changing the dependencies in the package.json files
 */
async function main() {
  const tutorialsPackageJsons = await glob('**/package.json', {
    ignore: ['**/node_modules'],
    absolute: true,
    cwd: TUTORIALS_CONTENT_NODE_PATH,
  });

  for (const path of tutorialsPackageJsons) {
    const directory = dirname(path);

    console.info(`\nUpdating lock file at ${directory}\n`);
    execSync('npm install --package-lock-only', {
      cwd: directory,
      stdio: [null, null, 'inherit'],
    });
  }
}
