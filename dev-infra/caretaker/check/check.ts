/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GitClient} from '../../utils/git/index';
import {getCaretakerConfig} from '../config';

import {getCiStatusPrinter} from './ci';
import {getG3ComparisonPrinter} from './g3';
import {getGithubTaskPrinter} from './github';
import {getServicesStatusPrinter} from './services';


/** Check the status of services which Angular caretakers need to monitor. */
export async function checkServiceStatuses(githubToken: string) {
  /** The configuration for the caretaker commands. */
  const config = getCaretakerConfig();
  /** The GitClient for interacting with git and Github. */
  const git = new GitClient(githubToken, config);
  // Prevent logging of the git commands being executed during the check.
  GitClient.LOG_COMMANDS = false;

  const printers = await Promise.all([
    getServicesStatusPrinter(), getGithubTaskPrinter(git, config.caretaker),
    getG3ComparisonPrinter(git), getCiStatusPrinter(git)
  ]);

  for (const printer of printers) {
    printer && printer();
  }
}
