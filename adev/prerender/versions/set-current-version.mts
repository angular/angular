/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFile, writeFile} from 'fs/promises';
import {dirname, join} from 'path';
import {argv} from 'process';
import {fileURLToPath} from 'url';
import {VersionsConfig, VersionMode} from './types.mjs';

// CONSTANTS
const MODE_ARG = 'v=';
const VERSIONS_CONFIG = 'versions.json';

// PATHS
const ASSETS = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../src/assets',
);
const VERSIONS_CONFIG_PATH = join(ASSETS, VERSIONS_CONFIG);

main();

async function main() {
  console.info('Updating version...');

  const versionsConfig: VersionsConfig = JSON.parse(await readFile(VERSIONS_CONFIG_PATH, 'utf-8'));

  const currentVersion = (await getCurrentVersion()) ?? 'stable';

  if (
    currentVersion !== 'next' &&
    currentVersion !== 'rc' &&
    currentVersion !== 'stable' &&
    Number.isNaN(currentVersion)
  ) {
    throw new Error('Invalid mode value provided!');
  }

  versionsConfig.currentVersion = currentVersion;

  await updateConfig(versionsConfig);

  console.info('Updating version successfully done!');
}

async function updateConfig(config: VersionsConfig): Promise<void> {
  await writeFile(VERSIONS_CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`);
}

async function getCurrentVersion(): Promise<VersionMode | undefined> {
  return argv.find((arg) => arg.startsWith(MODE_ARG))?.replaceAll(MODE_ARG, '') as VersionMode;
}
