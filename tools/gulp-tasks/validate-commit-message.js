/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Relies on a `COMMIT_RANGE` environment variable (of the form `<SHA1>...<SHA2>`).
 */

// tslint:disable:no-console
module.exports = (gulp) => () => {
  if (!process.env.COMMIT_RANGE) {
    console.error(
        'Required environment variable `COMMIT_RANGE` is missing or empty.\n' +
        'On CircleCI, you can get the commit range by executing `.circleci/commit-range.js`.');
    process.exit(1);
  }

  const validateCommitMessage = require('../validate-commit-message');
  const shelljs = require('shelljs');
  const [baseSha, headSha] = process.env.COMMIT_RANGE.split('...');

  const result = shelljs.exec(`git log --reverse --format=%s ${baseSha}..${headSha}`);

  if (result.code) {
    console.log(result.stderr);
    process.exit(1);
  }

  const commitsByLine = result.trim().split(/\n/).filter(line => line != '');

  console.log(`Examining ${commitsByLine.length} commits between ${baseSha} and ${headSha}.`);

  if (commitsByLine.length === 0) {
    console.log(`There are zero new commits between ${baseSha} and ${headSha}.`);
  }

  const someCommitsInvalid = !commitsByLine.every(validateCommitMessage);

  if (someCommitsInvalid) {
    console.log('Please fix the failing commit messages before continuing...');
    console.log(
        'Commit message guidelines: https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines');
    process.exit(1);
  }
};
