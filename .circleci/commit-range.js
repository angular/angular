#!/usr/bin/env node

/**
 * CircleCI does not provide the range of commits that were included in the push or pull request as
 * an environment variable. We need this range for tasks such as verifying the commit messages.
 * Related issue: https://discuss.circleci.com/t/commit-range-environment-variable/10410
 *
 * We deterine the commit range based on other environment variables:
 * - For push requests, `CIRCLE_COMPARE_URL` is defined and includes the range.
 * - For pull requests, we request the PR info using the GitHub API.
 *
 * NOTES:
 * 1. This script relies on `curl` being available on the PATH.
 * 2. Relies on one of the following environment variable sets being available:
 *    - CIRCLE_COMPARE_URL
 *    - CIRCLE_PR_NUMBER, CIRCLE_PROJECT_USERNAME, CIRCLE_PROJECT_REPONAME
 */

'use strict';

// Imports
const {execSync} = require('child_process');

// Exports
module.exports = getCommitRange;

// Main
if (require.main === module) {
  const range = module.exports();
  console.log(range);
}

// Functions
function getCommitRange() {
  const repoSlug = `${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}`;
  const range = getCommitRangeFromUrl(process.env.CIRCLE_COMPARE_URL) ||
                getCommitRangeFromPr(repoSlug, process.env.CIRCLE_PR_NUMBER);

  if (!range) {
    throw new Error('Unable to determine commit range.');
  }

  return range;
}

function getCommitRangeFromPr(repoSlug, prNumber) {
  if (!prNumber) {
    return null;
  }

  const url = `https://api.github.com/repos/${repoSlug}/pulls/${prNumber}`;
  const opts = {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']};
  const data = JSON.parse(execSync(`curl "${url}"`, opts));

  return `${data.base.sha}...${data.head.sha}`;
}

function getCommitRangeFromUrl(url) {
  const compareUrlRe = /^.*\/([0-9a-f]+\.\.\.[0-9a-f]+)$/i;

  if (!url || !compareUrlRe.test(url)) {
    return null;
  }

  return url.replace(compareUrlRe, '$1');
}
