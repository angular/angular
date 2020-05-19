/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const https = require('https');
const shell = require('shelljs');

function httpGet(server, path, headers) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: server,
      port: 443,
      path: path,
      method: 'GET',
      headers: {'User-Agent': 'script', ...headers}
    };
    https
        .get(
            options,
            (res) => {
              let json = '';
              res.on('data', (chunk) => json += chunk.toString());
              res.on('end', () => resolve(json));
            })
        .on('error', (e) => reject(e));
  });
}

let warnNoToken = true;

async function githubGet(path) {
  const token = process.env['TOKEN'];
  const headers = {};
  if (token) {
    headers.Authorization = 'token ' + token;
  } else if (warnNoToken) {
    warnNoToken = false;
    console.warn('############################################################');
    console.warn('############################################################');
    console.warn('WARNING: you should set the TOKEN variable to a github token');
    console.warn('############################################################');
    console.warn('############################################################');
  }

  return JSON.parse(await httpGet('api.github.com', '/repos/angular/angular/' + path, headers));
}

async function githubPrInfo(prNumber) {
  const pr = (await githubGet('pulls/' + prNumber));
  const label = pr.head.label.split(':');
  const user = label[0];
  const branch = label[1];
  return {
    commits: pr.commits,
    repository: {
      user: user,
      gitUrl: `git@github.com:${user}/angular.git`,
    },
    branch: branch
  };
}

function gitHasLocalModifications() {
  return execNoFatal('git diff-index --quiet HEAD --').code != 0;
}

function execNoFatal(cmd, options) {
  const fatal = shell.config.fatal;
  try {
    shell.config.fatal = false;
    return shell.exec(cmd, options);
  } finally {
    shell.config.fatal = fatal;
  }
}

function getCurrentBranch() {
  return shell.exec('git branch', {silent: true})
      .stdout.toString()
      .split('\n')                      // Break into lines
      .map((v) => v.trim())             // trim
      .filter((b) => b[0] == '*')       // select current branch
      .map((b) => b.split(' ')[1])[0];  // remove leading `*`
}

exports.httpGet = httpGet;
exports.githubGet = githubGet;
exports.githubPrInfo = githubPrInfo;
exports.gitHasLocalModifications = gitHasLocalModifications;
exports.execNoFatal = execNoFatal;
exports.getCurrentBranch = getCurrentBranch;
