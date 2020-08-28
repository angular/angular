/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv} from 'yargs';

import {addGithubTokenFlag} from '../../utils/yargs';

import {mergePullRequest} from './index';

/** The options available to the merge command via CLI. */
export interface MergeCommandOptions {
  githubToken: string;
  'pr-number': number;
}

/** Builds the options for the merge command. */
export function buildMergeCommand(yargs: Argv): Argv<MergeCommandOptions> {
  return addGithubTokenFlag(yargs).help().strict().positional(
      'pr-number', {demandOption: true, type: 'number'});
}

/** Handles the merge command. i.e. performs the merge of a specified pull request. */
export async function handleMergeCommand(
    {'pr-number': pr, githubToken}: Arguments<MergeCommandOptions>) {
  await mergePullRequest(pr, githubToken);
}
