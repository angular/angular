/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {getConfig} from '../../utils/config';
import {error, green, info, red, yellow} from '../../utils/console';
import {GitClient} from '../../utils/git/git-client';
import {addGithubTokenOption} from '../../utils/git/github-yargs';
import {getReleaseConfig} from '../config/index';

import {CompletionState, ReleaseTool} from './index';

/** Command line options for publishing a release. */
export interface ReleasePublishOptions {
  githubToken: string;
}

/** Yargs command builder for configuring the `ng-dev release publish` command. */
function builder(argv: Argv): Argv<ReleasePublishOptions> {
  return addGithubTokenOption(argv);
}

/** Yargs command handler for staging a release. */
async function handler() {
  const git = GitClient.get();
  const config = getConfig();
  const releaseConfig = getReleaseConfig(config);
  const projectDir = git.baseDir;
  const task = new ReleaseTool(releaseConfig, config.github, projectDir);
  const result = await task.run();

  switch (result) {
    case CompletionState.FATAL_ERROR:
      error(red(`Release action has been aborted due to fatal errors. See above.`));
      process.exitCode = 2;
      break;
    case CompletionState.MANUALLY_ABORTED:
      info(yellow(`Release action has been manually aborted.`));
      process.exitCode = 1;
      break;
    case CompletionState.SUCCESS:
      info(green(`Release action has completed successfully.`));
      break;
  }
}

/** CLI command module for publishing a release. */
export const ReleasePublishCommandModule: CommandModule<{}, ReleasePublishOptions> = {
  builder,
  handler,
  command: 'publish',
  describe: 'Publish new releases and configure version branches.',
};
