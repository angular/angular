/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommandModule} from 'yargs';

import {info} from '../../utils/console';
import {GitClient} from '../../utils/git/git-client';
import {getReleaseConfig} from '../config/index';
import {fetchActiveReleaseTrains} from '../versioning/active-release-trains';
import {printActiveReleaseTrains} from '../versioning/print-active-trains';

/** Yargs command handler for printing release information. */
async function handler() {
  const git = GitClient.get();
  const gitRepoWithApi = {api: git.github, ...git.remoteConfig};
  const releaseTrains = await fetchActiveReleaseTrains(gitRepoWithApi);

  // Print the active release trains.
  await printActiveReleaseTrains(releaseTrains, getReleaseConfig());
}

/** CLI command module for retrieving release information. */
export const ReleaseInfoCommandModule: CommandModule = {
  handler,
  command: 'info',
  describe: 'Prints active release trains to the console.',
};
