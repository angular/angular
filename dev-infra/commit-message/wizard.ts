/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {writeFileSync} from 'fs';

import {info} from '../utils/console';

import {buildCommitMessage} from './builder';

/**
 * The source triggering the git commit message creation.
 * As described in: https://git-scm.com/docs/githooks#_prepare_commit_msg
 */
export type PrepareCommitMsgHookSource = 'message'|'template'|'merge'|'squash'|'commit';

/** The default commit message used if the wizard does not procude a commit message. */
const defaultCommitMessage = `<type>(<scope>): <summary>

# <Describe the motivation behind this change - explain WHY you are making this change. Wrap all
#  lines at 100 characters.>\n\n`;

export async function runWizard(
    args: {filePath: string, source?: PrepareCommitMsgHookSource, commitSha?: string}) {
  // TODO(josephperrott): Add support for skipping wizard with local untracked config file

  if (args.source !== undefined) {
    info(`Skipping commit message wizard due because the commit was created via '${
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
