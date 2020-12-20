/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {addGithubTokenOption} from '../../utils/git/github-yargs';
import {checkOutPullRequestLocally} from '../common/checkout-pr';

export interface CheckoutOptions {
  prNumber: number;
  githubToken: string;
}

/** Builds the checkout pull request command. */
function builder(yargs: Argv) {
  return addGithubTokenOption(yargs).positional('prNumber', {type: 'number', demandOption: true});
}

/** Handles the checkout pull request command. */
async function handler({prNumber, githubToken}: Arguments<CheckoutOptions>) {
  const prCheckoutOptions = {allowIfMaintainerCannotModify: true, branchName: `pr-${prNumber}`};
  await checkOutPullRequestLocally(prNumber, githubToken, prCheckoutOptions);
}

/** yargs command module for checking out a PR  */
export const CheckoutCommandModule: CommandModule<{}, CheckoutOptions> = {
  handler,
  builder,
  command: 'checkout <pr-number>',
  describe: 'Checkout a PR from the upstream repo',
};
