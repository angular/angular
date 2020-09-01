/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GitClient} from '../../utils/git';
import {getCaretakerConfig} from '../config';

import {printCiStatus} from './ci';
import {printG3Comparison} from './g3';
import {printGithubTasks} from './github';
import {printServiceStatuses} from './services';


/** Check the status of services which Angular caretakers need to monitor. */
export async function checkServiceStatuses(githubToken: string) {
  /** The configuration for the caretaker commands. */
  const config = getCaretakerConfig();
  /** The GitClient for interacting with git and Github. */
  const git = new GitClient(githubToken, config);

  // TODO(josephperrott): Allow these checks to be loaded in parallel.
  await printServiceStatuses();
  await printGithubTasks(git, config.caretaker);
  await printG3Comparison(git);
  await printCiStatus(git);
}
