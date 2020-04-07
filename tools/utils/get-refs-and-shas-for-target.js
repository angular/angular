/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// NOTE: When invoked directly via node, this script will take the first positional
// arguement as to be the PR number, and log out the ref and sha information in its
// JSON format.  For other usages, the function to get the ref and sha information
// may be imported by another script to be invoked.

// This script uses `console` to print messages to the user.
// tslint:disable:no-console

const https = require('https');
const util = require('util');
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);

async function requestDataFromGithub(url) {
  // GitHub requires a user agent: https://developer.github.com/v3/#user-agent-required
  let options = {headers: {'User-Agent': 'angular'}};

  // If a github token is present, use it for authorization.
  const githubToken = process.env.TOKEN || process.env.GITHUB_TOKEN || '';
  if (githubToken) {
    options = {
      headers: {
        Authorization: `token ${githubToken}`,
        ...options.headers,
      }
    };
  }

  return new Promise((resolve, reject) => {
    https
        .get(
            url, options,
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
                  resolve(JSON.parse(rawData));
                } catch (e) {
                  reject(e);
                }
              });
            })
        .on('error', (e) => { reject(e); });
  });
}
// clang-format off
// clang keeps trying to put the function name on the next line.
async function getRefsAndShasForTarget(prNumber, suppressLog) {
  // clang-format on
  // If the environment variable already contains the refs and shas, reuse them.
  if (process.env['GITHUB_REFS_AND_SHAS']) {
    suppressLog ||
        console.info(`Retrieved refs and SHAs for PR ${prNumber} from environment variables.`);
    return JSON.parse(process.env['GITHUB_REFS_AND_SHAS']);
  }

  suppressLog ||
      console.info(`Getting refs and SHAs for PR ${prNumber} on angular/angular from Github.`);
  const pullsUrl = `https://api.github.com/repos/angular/angular/pulls/${prNumber}`;
  const result = await requestDataFromGithub(pullsUrl);

  // Ensure the base ref is up to date
  await exec(`git fetch origin ${result.base.ref}`);

  // The sha of the latest commit on the target branch.
  const {stdout: latestShaOfTargetBranch} = await exec(`git rev-parse origin/${result.base.ref}`);
  // The sha of the latest commit on the PR.
  const {stdout: latestShaOfPrBranch} = await exec(`git rev-parse HEAD`);
  // The first common SHA in the history of the target branch and the latest commit in the PR.
  const {stdout: commonAncestorSha} =
      await exec(`git merge-base origin/${result.base.ref} ${latestShaOfPrBranch}`);

  const output = {
    base: {
      ref: result.base.ref,
      sha: result.base.sha,
    },
    head: {
      ref: result.head.ref,
      sha: result.head.sha,
    },
    commonAncestorSha: commonAncestorSha.trim(),
    latestShaOfTargetBranch: latestShaOfTargetBranch.trim(),
    latestShaOfPrBranch: latestShaOfPrBranch.trim(),
  };
  return output;
}

// If the script is called directly, log the output of the refs and sha for the
// requested PR.
if (require.main === module) {
  const run = async() => {
    const prNumber = Number.parseInt(process.argv[2], 10);
    if (!!prNumber) {
      console.info(JSON.stringify(await getRefsAndShasForTarget(prNumber, true)));
    }
  };
  run();
}

module.exports = getRefsAndShasForTarget;
