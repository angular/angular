/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This script uses `console` to print messages to the user.
// tslint:disable:no-console

const https = require('https');
const util = require('util');
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);

async function requestDataFromGithub(url) {
  // GitHub requires a user agent: https://developer.github.com/v3/#user-agent-required
  const options = {headers: {'User-Agent': 'angular'}};

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

module.exports = async function getRefsAndShasForTarget(prNumber) {
  console.log(`Getting refs and SHAs for PR ${prNumber} on angular/angular.`);
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
};
