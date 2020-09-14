/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fetch from 'node-fetch';

import {bold, green, info, red} from '../../utils/console';
import {GitClient} from '../../utils/git';


/** The results of checking the status of CI.  */
interface StatusCheckResult {
  status: 'success'|'failed'|'canceled'|'infrastructure_fail'|'timedout'|'failed'|'no_tests';
  timestamp: Date;
  buildUrl: string;
}

/** Retrieve and log status of CI for the project. */
export async function printCiStatus(git: GitClient) {
  info.group(bold(`CI`));
  // TODO(josephperrott): Expand list of branches checked to all active branches.
  await printStatus(git, 'master');
  info.groupEnd();
  info();
}

/** Log the status of CI for a given branch to the console. */
async function printStatus(git: GitClient, branch: string) {
  const result = await getStatusOfBranch(git, branch);
  const branchName = branch.padEnd(10);
  if (result === null) {
    info(`${branchName} was not found on CircleCI`);
  } else if (result.status === 'success') {
    info(`${branchName} ✅`);
  } else {
    info(`${branchName} ❌ (Ran at: ${result.timestamp.toLocaleString()})`);
  }
}

/** Get the CI status of a given branch from CircleCI. */
async function getStatusOfBranch(git: GitClient, branch: string): Promise<StatusCheckResult|null> {
  const {owner, name} = git.remoteConfig;
  const url = `https://circleci.com/api/v1.1/project/gh/${owner}/${name}/tree/${
      branch}?limit=1&filter=completed&shallow=true`;
  const result = (await fetch(url).then(result => result.json()))?.[0];

  if (result) {
    return {
      status: result.outcome,
      timestamp: new Date(result.stop_time),
      buildUrl: result.build_url
    };
  }
  return null;
}
