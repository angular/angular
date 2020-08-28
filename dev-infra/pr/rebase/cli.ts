/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv} from 'yargs';

import {addGithubTokenFlag} from '../../utils/yargs';

import {rebasePr} from './index';

/** URL to the Github page where personal access tokens can be generated. */
export const GITHUB_TOKEN_GENERATE_URL = `https://github.com/settings/tokens`;

/** The options available to the rebase command via CLI. */
export interface RebaseCommandOptions {
  'github-token': string;
  prNumber: number;
}

/** Builds the rebase pull request command. */
export function buildRebaseCommand(yargs: Argv): Argv<RebaseCommandOptions> {
  return addGithubTokenFlag(yargs).positional('prNumber', {type: 'number', demandOption: true});
}


/** Handles the rebase pull request command. */
export async function handleRebaseCommand(
    {prNumber, 'github-token': token}: Arguments<RebaseCommandOptions>) {
  await rebasePr(prNumber, token);
}
