/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fetch from 'node-fetch';
import {fetchActiveReleaseTrains} from '../../release/versioning/index';

import {bold, debug, info} from '../../utils/console';
import {GitClient} from '../../utils/git';


/** The results of checking the status of CI.  */
interface StatusCheckResult {
  status: 'success'|'failed';
}

/** Retrieve and log status of CI for the project. */
export async function printCiStatus(git: GitClient) {
  const releaseTrains = await fetchActiveReleaseTrains({api: git.github, ...git.remoteConfig});

  info.group(bold(`CI`));
  for (const [trainName, train] of Object.entries(releaseTrains)) {
    if (train === null) {
      debug(`No active release train for ${trainName}`);
      continue;
    }
    const status = await getStatusOfBranch(git, train.branchName);
    await printStatus(`${trainName.padEnd(6)} (${train.branchName})`, status);
  }
  info.groupEnd();
  info();
}

/** Log the status of CI for a given branch to the console. */
async function printStatus(label: string, status: StatusCheckResult|null) {
  const branchName = label.padEnd(16);
  if (status === null) {
    info(`${branchName} was not found on CircleCI`);
  } else if (status.status === 'success') {
    info(`${branchName} ✅`);
  } else {
    info(`${branchName} ❌`);
  }
}

/** Get the CI status of a given branch from CircleCI. */
async function getStatusOfBranch(git: GitClient, branch: string): Promise<StatusCheckResult|null> {
  const {owner, name} = git.remoteConfig;
  const url = `https://circleci.com/gh/${owner}/${name}/tree/${branch}.svg?style=shield`;
  const result = await fetch(url).then(result => result.text());

  if (result && !result.includes('no builds')) {
    return {
      status: result.includes('passing') ? 'success' : 'failed',
    };
  }
  return null;
}
