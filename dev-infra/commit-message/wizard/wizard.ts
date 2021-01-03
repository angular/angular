/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {writeFileSync} from 'fs';

import {getUserConfig} from '../../utils/config';
import {debug, info} from '../../utils/console';

import {buildCommitMessage} from '../builder';
import {CommitMsgSource} from '../commit-message-source';


/** The default commit message used if the wizard does not procude a commit message. */
const defaultCommitMessage = `<type>(<scope>): <summary>

# <Describe the motivation behind this change - explain WHY you are making this change. Wrap all
#  lines at 100 characters.>\n\n`;

export async function runWizard(
    args: {filePath: string, source?: CommitMsgSource, commitSha?: string}) {
  if (getUserConfig().commitMessage?.disableWizard) {
    debug('Skipping commit message wizard due to enabled `commitMessage.disableWizard` option in');
    debug('user config.');
    process.exitCode = 0;
    return;
  }

  if (args.source !== undefined) {
    info(`Skipping commit message wizard because the commit was created via '${
        args.source}' source`);
    process.exitCode = 0;
    return;
  }

  // Set the default commit message to be updated if the user cancels out of the wizard in progress
  writeFileSync(args.filePath, defaultCommitMessage);

  /** The generated commit message. */
  const commitMessage = await buildCommitMessage();
  writeFileSync(args.filePath, commitMessage);
}
