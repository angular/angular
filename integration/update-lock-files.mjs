#!/usr/bin/env node

/**
 * Script that deletes all `yarn.lock` files for integration tests and
 * re-builds them from scratch. This script is useful as lock files in
 * integration tests are not necessarily up-to-date, given dependencies
 * being linked from the root `/package.json`, or locally-built 1st party
 * packages being used from tarball archives.
 */

import childProcess from 'child_process';
import url from 'url';
import path from 'path';
import {globSync} from 'tinyglobby';
import fs from 'fs';

const containingDir = path.dirname(url.fileURLToPath(import.meta.url));
const testDirs = globSync('*/package.json', {cwd: containingDir}).map((d) =>
  path.join(containingDir, path.dirname(d)),
);

for (const testDir of testDirs) {
  console.log('\n> Processing: ' + testDir + '\n');
  try {
    fs.rmSync(path.join(testDir, 'pnpm-lock.lock'));
  } catch (e) {}

  childProcess.spawnSync('pnpm install --lockfile-only --ignore-workspace', {
    cwd: testDir,
    shell: true,
    stdio: 'inherit',
  });
}
