/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {error} from '../../utils/console';
import {checkOutPullRequestLocally} from '../common/checkout-pr';

export interface CheckoutOptions {
  prNumber: number;
  'github-token'?: string;
}

/** URL to the Github page where personal access tokens can be generated. */
export const GITHUB_TOKEN_GENERATE_URL = `https://github.com/settings/tokens`;

/** Builds the checkout pull request command. */
function builder(yargs: Argv) {
  return yargs.positional('prNumber', {type: 'number', demandOption: true}).option('github-token', {
    type: 'string',
    description: 'Github token. If not set, token is retrieved from the environment variables.'
  });
}

/** Handles the checkout pull request command. */
async function handler({prNumber, 'github-token': token}: Arguments<CheckoutOptions>) {
  const githubToken = token || process.env.GITHUB_TOKEN || process.env.TOKEN;
  if (!githubToken) {
    error('No Github token set. Please set the `GITHUB_TOKEN` environment variable.');
    error('Alternatively, pass the `--github-token` command line flag.');
    error(`You can generate a token here: ${GITHUB_TOKEN_GENERATE_URL}`);
    process.exitCode = 1;
    return;
  }
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
