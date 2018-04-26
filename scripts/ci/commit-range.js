#!/bin/env node

/**
 * Relies on `curl` being available on the PATH.
 * Relies on one of the following environment variable sets being available:
 * - CIRCLE_COMPARE_URL
 * - CIRCLE_PR_NUMBER, CIRCLE_PROJECT_USERNAME, CIRCLE_PROJECT_REPONAME
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

  return `${data.base.sha.slice(0, 9)}...${data.head.sha.slice(0, 9)}`;
}

function getCommitRangeFromUrl(url) {
  const compareUrlRe = /^.*\/([0-9a-f]+\.\.\.[0-9a-f]+)$/i;

  if (!url || !compareUrlRe.test(url)) {
    return null;
  }

  return url.replace(compareUrlRe, '$1');
}
