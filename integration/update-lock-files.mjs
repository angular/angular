#!/usr/bin/env node

/**
 * Script that deletes all `yarn.lock` files for integration tests and
 * re-builds them from scratch. This script is useful as lock fils in
 * integration tests are not necessarily up-to-date, given dependencies
 * being linked from the root `/package.json`, or locally-built 1st party
 * packages being used from tarball archives.
 */

import childProcess from 'child_process';
import url from 'url';
import path from 'path';
import glob from 'glob';
import fs from 'fs';

const containingDir = path.dirname(url.fileURLToPath(import.meta.url));
const testDirs = glob.sync('*/BUILD.bazel', {cwd: containingDir})
                     .map((d) => path.join(containingDir, path.dirname(d)));

const yarnTestTmpDir = path.join(containingDir, '.tmp-yarn-cache');

for (const testDir of testDirs) {
  fs.rmSync(path.join(testDir, 'yarn.lock'));
  childProcess.spawnSync('yarn', ['install', '--cache-folder', yarnTestTmpDir], {
    cwd: testDir,
    shell: true,
    stdio: 'inherit',
  });
}

fs.rmSync(yarnTestTmpDir, {recursive: true});
