#!/usr/bin/env node
'use strict';

/**
 * **Usage:**
 * ```
 * node get-vendored-yarn-path
 * ```
 *
 * Returns the path to the vendored `yarn.js` script, so that it can be used for setting up yarn
 * aliases/symlinks and use the local, vendored yarn script instead of a globally installed one.
 *
 * **Context:**
 * We keep a version of yarn in the repo, at `third_party/github.com/yarnpkg/`. All CI jobs should
 * use that version for consistency (and easier updates). The path to the actual `yarn.js` script,
 * however, changes depending on the version (e.g. `third_party/github.com/yarnpkg/v1.21.1/...`).
 *
 * This script infers the correct path, so that we don't have to update the path in several places,
 * when we update the version of yarn in `third_party/github.com/yarnpkg/`.
 */

const {readdirSync} = require('fs');
const {normalize} = require('path');

const yarnDownloadDir = `${__dirname}/../third_party/github.com/yarnpkg/yarn/releases/download`;
const yarnVersionSubdirs = readdirSync(yarnDownloadDir);

// Based on our current process, there should be exactly one sub-directory inside
// `vendoredYarnDownloadDir` at all times. Throw, if that is not the case.
if (yarnVersionSubdirs.length !== 1) {
  throw new Error(
      `Expected exactly 1 yarn version in '${yarnDownloadDir}', but found ` +
      `${yarnVersionSubdirs.length}: ${yarnVersionSubdirs.join(', ')}`);
}

console.log(normalize(`${yarnDownloadDir}/${yarnVersionSubdirs[0]}/bin/yarn.js`));
