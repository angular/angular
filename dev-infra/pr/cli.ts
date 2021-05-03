/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as yargs from 'yargs';

import {CheckTargetBranchesModule} from './check-target-branches/cli';
import {CheckoutCommandModule} from './checkout/cli';
import {buildDiscoverNewConflictsCommand, handleDiscoverNewConflictsCommand} from './discover-new-conflicts/cli';
import {MergeCommandModule} from './merge/cli';
import {buildRebaseCommand, handleRebaseCommand} from './rebase/cli';

/** Build the parser for pull request commands. */
export function buildPrParser(localYargs: yargs.Argv) {
  return localYargs.help()
      .strict()
      .demandCommand()
      .command(
          'discover-new-conflicts <pr-number>',
          'Check if a pending PR causes new conflicts for other pending PRs',
          buildDiscoverNewConflictsCommand, handleDiscoverNewConflictsCommand)
      .command(
          'rebase <pr-number>', 'Rebase a pending PR and push the rebased commits back to Github',
          buildRebaseCommand, handleRebaseCommand)
      .command(MergeCommandModule)
      .command(CheckoutCommandModule)
      .command(CheckTargetBranchesModule);
}
