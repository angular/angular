/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


// tslint:disable:no-console
module.exports = (gulp) => () => {
  const shelljs = require('shelljs');
  const bin = resolveBin('@commitlint/cli', 'commitlint');

  let baseBranch = 'master';
  const currentVersion = require('semver').parse(require('../../package.json').version);
  const baseHead =
      shelljs.exec(`git ls-remote --heads origin ${currentVersion.major}.${currentVersion.minor}.*`)
          .trim()
          .split('\n')
          .pop();

  if (baseHead) {
    const match = /refs\/heads\/(.+)/.exec(baseHead);
    baseBranch = match && match[1] || baseBranch;
  }

  // We need to fetch origin explicitly because it might be stale.
  // I couldn't find a reliable way to do this without fetch.
  const fetched = shelljs.exec(`git fetch origin ${baseBranch}`);

  if (fetched.code) {
    console.log(result.stderr);
    process.exit(1);
  }

  console.log(`Examining commits between HEAD and ${baseBranch}`);

  const results = shelljs.exec(`commitlint --from=${baseBranch} --to=HEAD`);

  if (results.code) {
    console.log(result.code);
    console.log(
      'Commit message guidelines: https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines');
    process.exit(1);
  }
};

function resolveBin(pkg, name) {
  const resolvePkg = require('resolve-pkg');
  const readPkg = require('read-pkg');
  const commitlintPkg = readPkg.sync(resolvePkg(pkg));
  return commitlintPkg.bin[name];
}
