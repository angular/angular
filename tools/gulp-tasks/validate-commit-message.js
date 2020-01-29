/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


// tslint:disable:no-console
module.exports = (gulp) => async () => {
  try {
    if (process.env['CIRCLECI'] === 'true' && !process.env['CIRCLE_PR_NUMBER']) {
      console.info(
        `Since commit messages are validated as part of the PR review process,\n` +
        `we do not need to commit messages on CI runs on upstream branches.\n\n` +
        `Skipping validate-commit-message check`
        )
      process.exit();
    }
    const validateCommitMessage = require('../validate-commit-message');
    const shelljs = require('shelljs');
    const getRefsAndShasForTarget = require('../utils/get-refs-and-shas-for-target')

    shelljs.set('-e');  // Break on error.

    const target = await getRefsAndShasForTarget(process.env['CIRCLE_PR_NUMBER']);

    // We need to fetch origin explicitly because it might be stale.
    // I couldn't find a reliable way to do this without fetch.
    const result = shelljs.exec(
        `git log --reverse --format=%s ${target.commonAncestorSha}..${target.latestShaOfPrBranch}`);

    if (result.code) {
      throw new Error(`Failed to fetch commits: ${result.stderr}`);
    }

    const commitsByLine = result.trim().split(/\n/).filter(line => line != '');

    console.log(`Examining ${commitsByLine.length} commit(s) between ${target.base.ref} and HEAD`);

    if (commitsByLine.length == 0) {
      console.log(`There are zero new commits between ${target.base.ref} and HEAD`);
    }

    const disallowSquashCommits = true;
    const isNonFixup = m => !validateCommitMessage.FIXUP_PREFIX_RE.test(m);
    const someCommitsInvalid = !commitsByLine.every((m, i) => {
      // `priorNonFixupCommits` is only needed if the current commit is a fixup commit.
      const priorNonFixupCommits =
          isNonFixup(m) ? undefined : commitsByLine.slice(0, i).filter(isNonFixup);
      return validateCommitMessage(m, disallowSquashCommits, priorNonFixupCommits);
    });

    if (someCommitsInvalid) {
      throw new Error(
          'Please fix the failing commit messages before continuing...\n' +
          'Commit message guidelines: https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines');
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
