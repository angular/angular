/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv} from 'yargs';

import {addGithubTokenOption} from '../../utils/git/github-yargs';

import {rebasePr} from './index';

/** The options available to the rebase command via CLI. */
export interface RebaseCommandOptions {
  githubToken: string;
  prNumber: number;
}

/** Builds the rebase pull request command. */
export function buildRebaseCommand(yargs: Argv): Argv<RebaseCommandOptions> {
  return addGithubTokenOption(yargs).positional('prNumber', {type: 'number', demandOption: true});
}

/** Handles the rebase pull request command. */
export async function handleRebaseCommand(
    {prNumber, githubToken}: Arguments<RebaseCommandOptions>) {
  await rebasePr(prNumber, githubToken);
}
