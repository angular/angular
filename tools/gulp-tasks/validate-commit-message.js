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
  const validateCommitMessage = require('../validate-commit-message');
  const shelljs = require('shelljs');
  const [baseSha, headSha] = process.env.COMMIT_RANGE.split('...');

  // We need to fetch origin explicitly because it might be stale.
  // I couldn't find a reliable way to do this without fetch.
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
