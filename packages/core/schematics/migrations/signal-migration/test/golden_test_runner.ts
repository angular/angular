/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview Verifies that the contents of the given migration
 * directory match the given golden.
 */

import fs from 'fs';
import {globSync} from 'tinyglobby';
import chalk from 'chalk';
import path from 'path';
import {diffText} from '../../../utils/tsurge/testing/diff';

const [migratedDir, goldenPath] = process.argv.slice(2);
const files = globSync('**/*', {cwd: migratedDir});

let golden = '';
for (const filePath of files) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.html')) {
    continue;
  }

  const migrateContent = fs.readFileSync(path.join(migratedDir, filePath), 'utf-8');
  golden += `@@@@@@ ${filePath} @@@@@@\n\n${migrateContent}`;
}

const diskGolden = fs.readFileSync(goldenPath, 'utf8');
if (diskGolden !== golden) {
  if (process.env['BUILD_WORKING_DIRECTORY']) {
    fs.writeFileSync(
      path.join(
        process.env['BUILD_WORKING_DIRECTORY'],
        `packages/core/schematics/migrations/signal-migration/test/${goldenPath}`,
      ),
      golden,
    );
    console.info('Golden updated.');
    process.exit(0);
  }

  process.stderr.write(diffText(diskGolden, golden));

  console.error();
  console.error();
  console.error(chalk.red('Golden does not match.'));
  process.exit(1);
}
