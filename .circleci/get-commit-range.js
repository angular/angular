#!/usr/bin/env node

/**
 * **Usage:**
 * ```
 * node get-commit-range <build-number> [<compare-url> [<circle-token>]]
 * ```
 *
 * Returns the commit range, either extracting it from `compare-url` (if defined), which is of the
 * format of the `CIRCLE_COMPARE_URL` environment variable, or by retrieving the equivalent of
 * `CIRCLE_COMPARE_URL` for jobs that are part of a rerun workflow and extracting it from there.
 *
 * **Context:**
 * CircleCI sets the `CIRCLE_COMPARE_URL` environment variable (from which we can extract the commit
 * range) on push builds (a.k.a. non-PR, non-scheduled builds). Yet, when a workflow is rerun
 * (either from the beginning or from failed jobs) - e.g. when a job flakes - CircleCI does not set
 * the `CIRCLE_COMPARE_URL`.
 *
 * **Implementation details:**
 * This script relies on the fact that all rerun workflows share the same CircleCI workspace and the
 * (undocumented) fact that the workspace ID happens to be the same as the workflow ID that first
 * created it.
 *
 * For example, for a job on push build workflow, the CircleCI API will return data that look like:
 * ```js
 * {
 *   compare: 'THE_COMPARE_URL_WE_ARE_LOOKING_FOR',
 *   //...
 *   previous: {
 *     // ...
 *     build_num: 12345,
 *   },
 *   //...
 *   workflows: {
 *     //...
 *     workflow_id: 'SOME_ID_A',
 *     workspace_id: 'SOME_ID_A',  // Same as `workflow_id`.
 *   }
 * }
 * ```
 *
 * If the workflow is rerun, the data for jobs on the new workflow will look like:
 * ```js
 * {
 *   compare: null,  // ¯\_(ツ)_/¯
 *   //...
 *   previous: {
 *     // ...
 *     build_num: 23456,
 *   },
 *   //...
 *   workflows: {
 *     //...
 *     workflow_id: 'SOME_ID_B',
 *     workspace_id: 'SOME_ID_A',  // Different from current `workflow_id`.
 *                                 // Same as original `workflow_id`. \o/
 *   }
 * }
 * ```
 *
 * This script uses the `previous.build_num` (which points to the previous build number on the same
 * branch) to traverse the jobs backwards, until it finds a job from the original workflow. Such a
 * job (if found) should also contain the compare URL.
 *
 * **NOTE 1:**
 * This is only useful on workflows which are created by rerunning a workflow for which
 * `CIRCLE_COMPARE_URL` was defined.
 *
 * **NOTE 2:**
 * The `circleToken` will be used for CircleCI API requests if provided, but it is not needed for
 * accessing the read-only endpoints that we need (as long as the current project is FOSS and the
 * corresponding setting is turned on in "Advanced Settings" in the project dashboard).
 *
 * ---
 * Inspired by https://circleci.com/orbs/registry/orb/iynere/compare-url
 * (source code: https://github.com/iynere/compare-url-orb).
 *
 * We are not using the `compare-url` orb for the following reasons:
 * 1. (By looking at the code) it would only work if the rerun workflow is the latest workflow on
 *    the branch (which is not guaranteed to be true).
 * 2. It is less efficient (e.g. makes unnecessary CircleCI API requests for builds on different
 *    branches, installs extra dependencies, persists files to the workspace (as a means of passing
 *    the result to the calling job), etc.).
 * 3. It is slightly more complicated to setup and consume than our own script.
 * 4. Its implementation is more complicated than needed for our usecase (e.g. handles different git
 *    providers, handles newly created branches, etc.).
 */

// Imports
const {get: httpsGet} = require('https');

// Constants
const API_URL_BASE = 'https://circleci.com/api/v1.1/project/github/angular/angular';
const COMPARE_URL_RE = /^.*\/([0-9a-f]+\.\.\.[0-9a-f]+)$/i;

// Run
_main(process.argv.slice(2));

// Helpers
async function _main([buildNumber, compareUrl = '', circleToken = '']) {
  try {
    if (!buildNumber || isNaN(buildNumber)) {
      throw new Error(
          'Missing or invalid arguments.\n' +
          'Expected: buildNumber (number), compareUrl? (string), circleToken? (string)');
    }

    if (!compareUrl) {
      compareUrl = await getCompareUrl(buildNumber, circleToken);
    }

    const commitRangeMatch = COMPARE_URL_RE.exec(compareUrl)
    const commitRange = commitRangeMatch ? commitRangeMatch[1] : '';

    console.log(commitRange);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

function getBuildInfo(buildNumber, circleToken) {
  console.error(`BUILD ${buildNumber}`);
  const url = `${API_URL_BASE}/${buildNumber}?circle-token=${circleToken}`;
  return getJson(url);
}

async function getCompareUrl(buildNumber, circleToken) {
  let info = await getBuildInfo(buildNumber, circleToken);
  const targetWorkflowId = info.workflows.workspace_id;

  while (info.workflows.workflow_id !== targetWorkflowId) {
    info = await getBuildInfo(info.previous.build_num, circleToken);
  }

  return info.compare || '';
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    const opts = {headers: {Accept: 'application/json'}};
    const onResponse = res => {
      const statusCode = res.statusCode || -1;
      const isSuccess = (200 <= statusCode) && (statusCode < 400);
      let responseText = '';

      res.
        on('error', reject).
        on('data', d => responseText += d).
        on('end', () => isSuccess ?
          resolve(JSON.parse(responseText)) :
          reject(`Error getting '${url}' (status ${statusCode}):\n${responseText}`));
    };

    httpsGet(url, opts, onResponse).
      on('error', reject).
      end();
  });
}
