/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * **Usage:**
 * ```
 * node rebase-pr <github-repository> <pull-request-number>
 * ```
 * **Example:**
 * ```
 * node rebase-pr angular/angular 123
 * ```
 *
 * Rebases the current branch on top of the GitHub PR target branch.
 *
 * **Context:**
 * Since a GitHub PR is not necessarily up to date with its target branch, it is useful to rebase
 * prior to testing it on CI to ensure more up to date test results.
 *
 * **Implementation details:**
 * This script obtains the base for a GitHub PR via the
 * [GitHub PR API](https://developer.github.com/v3/pulls/#get-a-single-pull-request), then
 * fetches that branch, and rebases the current branch on top of it.
 *
 * **NOTE:**
 * This script cannot use external dependencies or be compiled because it needs to run before the
 * environment is setup.
 * Use only features supported by the NodeJS versions used in the environment.
 */

// This script uses `console` to print messages to the user.
// tslint:disable:no-console

// Imports
const util = require('util');
const https = require('https');
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);

// CLI validation
if (process.argv.length != 4) {
  console.error(`This script requires the GitHub repository and PR number as arguments.`);
  console.error(`Example: node tools/rebase-pr.js angular/angular 123`);
  process.exitCode = 1;
  return;
}

// Run
_main(...process.argv.slice(2)).catch(err => {
  console.log('Failed to rebase on top of target branch.\n');
  console.error(err);
  process.exitCode = 1;
});

// Helpers
async function _main(repository, prNumber) {
  console.log(`Determining target branch for PR ${prNumber} on ${repository}.`);
  const targetBranch = await determineTargetBranch(repository, prNumber);
  console.log(`Target branch is ${targetBranch}.`);
  await exec(`git fetch origin ${targetBranch}`);
  console.log(`Rebasing current branch on ${targetBranch}.`);
  await exec(`git rebase origin/${targetBranch}`);
  console.log('Rebase successful.');
}

function determineTargetBranch(repository, prNumber) {
  const pullsUrl = `https://api.github.com/repos/${repository}/pulls/${prNumber}`;
  // GitHub requires a user agent: https://developer.github.com/v3/#user-agent-required
  const options = {headers: {'User-Agent': repository}};

  return new Promise((resolve, reject) => {
    https
        .get(
            pullsUrl, options,
            (res) => {
              const {statusCode} = res;
              const contentType = res.headers['content-type'];
              let rawData = '';

              res.on('data', (chunk) => { rawData += chunk; });
              res.on('end', () => {

                let error;
                if (statusCode !== 200) {
                  error = new Error(
                      `Request Failed.\nStatus Code: ${statusCode}.\nResponse: ${rawData}`);
                } else if (!/^application\/json/.test(contentType)) {
                  error = new Error(
                      'Invalid content-type.\n' +
                      `Expected application/json but received ${contentType}`);
                }

                if (error) {
                  reject(error);
                  return;
                }

                try {
                  const parsedData = JSON.parse(rawData);
                  resolve(parsedData['base']['ref']);
                } catch (e) {
                  reject(e);
                }
              });
            })
        .on('error', (e) => { reject(e); });
  });
}
