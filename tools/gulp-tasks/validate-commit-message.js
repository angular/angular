/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


// tslint:disable:no-console
module.exports = (gulp) => async() => {
  try {
    const validateCommitMessage = require('../validate-commit-message');
    const shelljs = require('shelljs');
    const getRefsAndShasForTarget = require('../utils/get-refs-and-shas-for-target');

    // Break on error.
    shelljs.set('-e');


    let target = {};
    if (process.env['CI'] === 'true') {
      // Validation of commit messages on CI
      if (process.env['CI_PULL_REQUEST'] === 'false') {
        // Skip commit message validation on CI for non-PR branches as we are not testing new
        // unreviewed commits.  By enforcing correctness on the incoming changes in the PR
        // branches, we are able to render this check unnecessary on non-PR branches.
        console.info(
            `Since valid commit messages are enforced by PR linting on CI,\n` +
            `we do not need to validate commit messages on CI runs on upstream branches.\n\n` +
            `Skipping validate-commit-message check`);
        process.exit();
      }
      target = await getRefsAndShasForTarget(process.env['CI_PULL_REQUEST']);
    } else {
      // Validation of commit messages locally
      const baseRef = 'master';
      const headRef = shelljs.exec('git symbolic-ref --short HEAD', {silent: true}).trim();
      const baseSha = shelljs.exec(`git rev-parse origin/master`, {silent: true}).trim();
      const headSha = shelljs.exec(`git rev-parse HEAD`, {silent: true}).trim();
      const commonAncestorSha =
          shelljs.exec(`git merge-base origin/master ${headSha}`, {silent: true}).trim();
      target = {
        base: {
          ref: baseRef,
          sha: baseSha,
        },
        head: {
          ref: headRef,
          sha: headSha,
        },
        commonAncestorSha: commonAncestorSha,
        latestShaOfTargetBranch: baseSha,
        latestShaOfPrBranch: headSha,
      };
    }

    const result = shelljs.exec(
        `git log --reverse --format=%s ${target.commonAncestorSha}..${target.latestShaOfPrBranch}`,
        {silent: true});

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
