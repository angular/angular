/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


// tslint:disable:no-console
module.exports = (gulp) => () => {
  const validateCommitMessage = require('../validate-commit-message');
  const shelljs = require('shelljs');

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
  result = shelljs.exec(
      `git fetch origin ${baseBranch} && git log --reverse --format=%s HEAD ^origin/${baseBranch}`);

  if (result.code) {
    console.log(result.stderr);
    process.exit(1);
  }

  const commitsByLine = result.trim().split(/\n/).filter(line => line != '');

  console.log(`Examining ${commitsByLine.length} commits between HEAD and ${baseBranch}`);

  if (commitsByLine.length == 0) {
    console.log(`There are zero new commits between this HEAD and ${baseBranch}`);
  }

  const someCommitsInvalid = !commitsByLine.every(validateCommitMessage);

  if (someCommitsInvalid) {
    console.log('Please fix the failing commit messages before continuing...');
    console.log(
        'Commit message guidelines: https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines');
    process.exit(1);
  }
};
