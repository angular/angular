#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const GitHubApi = require('@octokit/rest');
const github = new GitHubApi();


/** CONFIGURATION: change these things if you want to tweak how the runs are made. */

/** Path to the local material2. By default based on the location of this script. */
const localRepo = path.resolve(__dirname, '..', '..');

/** Where to write the output from the presubmit script. */
const logDir = '/tmp/pr-presubmit-logs';

/**
 * The presubmit script to use (can change this if you want to use a locally modified script).
 * The default path is stored in an environment variable because it references an internal-Google
 * location.
 */
const presubmitScript = `${process.env.MAT_PRESUBMIT_DIR}/material-presubmit.sh`;

/** Time to start presubmits. */
const startTime = '9:30 pm';

/** Instead of querying github for PR numbers, manually provide the PR numbers to be presubmit */
const explicitPullRequests = [];

/** Options that will be passed to the octokit Github API when querying Github for PR numbers. */
const githubSearchOptions = {
  // Use the maximum of allowed items per Github API query. 100 pull requests should be
  // enough to continuously run presubmits through night.
  per_page: 100,
  q: 'repo:angular/material2 is:open type:pr label:"pr: merge ready" -label:"pr: merge safe"',
};

/** END OF CONFIGURATION. */


if (explicitPullRequests.length) {
  writeScheduleScript(explicitPullRequests.map(n => ({number: n})));
} else {
  // Fetch PRs that are merge-ready but not merge-safe
  github.search.issues(githubSearchOptions)
    .then(response => writeScheduleScript(response.data.items))
    .catch(error => console.error('Fetching merge-ready PRs failed.', error));
}


function writeScheduleScript(prs) {
  let script =
    `#!/bin/bash \n\n` +
    `mkdir -p ${logDir} \n\n` +
    `# Be sure you have no locally modified files in your git client before running this. \n\n`;

  // Generate a command for each file to be piped into the `at` command, scheduling it to run at
  // a later time.
  for (const pr of prs) {
    script +=
      `echo '(` +
        `cd ${localRepo} ; ` +
        `${presubmitScript} ${pr.number} --global 2>&1 > ${logDir}/pr-${pr.number}.txt ` +
      `)' | ` +
      `at ${startTime} today \n`;
  }

  fs.writeFileSync(path.join(localRepo, 'dist', 'schedule-presubmit.sh'), script, 'utf-8');

  console.log('schedule-presubmit.sh written to dist');
  console.log('Be sure to prodaccess overnight and that you have no locally modified files');
}
