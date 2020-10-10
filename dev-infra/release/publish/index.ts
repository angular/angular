/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ListChoiceOptions, prompt} from 'inquirer';

import {GithubConfig} from '../../utils/config';
import {error, info, log, red, yellow} from '../../utils/console';
import {GitClient} from '../../utils/git/index';
import {ReleaseConfig} from '../config';
import {ActiveReleaseTrains, fetchActiveReleaseTrains, nextBranchName} from '../versioning/active-release-trains';
import {printActiveReleaseTrains} from '../versioning/print-active-trains';
import {GithubRepoWithApi} from '../versioning/version-branches';

import {ReleaseAction} from './actions';
import {FatalReleaseActionError, UserAbortedReleaseActionError} from './actions-error';
import {actions} from './actions/index';

export enum CompletionState {
  SUCCESS,
  FATAL_ERROR,
  MANUALLY_ABORTED,
}

export class ReleaseTool {
  /** Client for interacting with the Github API and the local Git command. */
  private _git = new GitClient(this._githubToken, {github: this._github}, this._projectRoot);

  constructor(
      protected _config: ReleaseConfig, protected _github: GithubConfig,
      protected _githubToken: string, protected _projectRoot: string) {}

  /** Runs the interactive release tool. */
  async run(): Promise<CompletionState> {
    log();
    log(yellow('--------------------------------------------'));
    log(yellow('  Angular Dev-Infra release staging script'));
    log(yellow('--------------------------------------------'));
    log();

    if (!await this._verifyNoUncommittedChanges() || !await this._verifyRunningFromNextBranch()) {
      return CompletionState.FATAL_ERROR;
    }

    const {owner, name} = this._github;
    const repo: GithubRepoWithApi = {owner, name, api: this._git.github};
    const releaseTrains = await fetchActiveReleaseTrains(repo);

    // Print the active release trains so that the caretaker can access
    // the current project branching state without switching context.
    await printActiveReleaseTrains(releaseTrains, this._config);

    const action = await this._promptForReleaseAction(releaseTrains);
    const previousGitBranchOrRevision = this._git.getCurrentBranchOrRevision();

    try {
      await action.perform();
    } catch (e) {
      if (e instanceof UserAbortedReleaseActionError) {
        return CompletionState.MANUALLY_ABORTED;
      }
      // Only print the error message and stack if the error is not a known fatal release
      // action error (for which we print the error gracefully to the console with colors).
      if (!(e instanceof FatalReleaseActionError) && e instanceof Error) {
        console.error(e);
      }
      return CompletionState.FATAL_ERROR;
    } finally {
      this._git.checkout(previousGitBranchOrRevision, true);
    }

    return CompletionState.SUCCESS;
  }

  /** Prompts the caretaker for a release action that should be performed. */
  private async _promptForReleaseAction(activeTrains: ActiveReleaseTrains) {
    const choices: ListChoiceOptions[] = [];

    // Find and instantiate all release actions which are currently valid.
    for (let actionType of actions) {
      if (await actionType.isActive(activeTrains)) {
        const action: ReleaseAction =
            new actionType(activeTrains, this._git, this._config, this._projectRoot);
        choices.push({name: await action.getDescription(), value: action});
      }
    }

    info('Please select the type of release you want to perform.');

    const {releaseAction} = await prompt<{releaseAction: ReleaseAction}>({
      name: 'releaseAction',
      message: 'Please select an action:',
      type: 'list',
      choices,
    });

    return releaseAction;
  }

  /**
   * Verifies that there are no uncommitted changes in the project.
   * @returns a boolean indicating success or failure.
   */
  private async _verifyNoUncommittedChanges(): Promise<boolean> {
    if (this._git.hasUncommittedChanges()) {
      error(red('  ✘   There are changes which are not committed and should be discarded.'));
      return false;
    }
    return true;
  }

  /**
   * Verifies that the next branch from the configured repository is checked out.
   * @returns a boolean indicating success or failure.
   */
  private async _verifyRunningFromNextBranch(): Promise<boolean> {
    const headSha = this._git.run(['rev-parse', 'HEAD']).stdout.trim();
    const {data} =
        await this._git.github.repos.getBranch({...this._git.remoteParams, branch: nextBranchName});

    if (headSha !== data.commit.sha) {
      error(red('  ✘   Running release tool from an outdated local branch.'));
      error(red(`      Please make sure you are running from the "${nextBranchName}" branch.`));
      return false;
    }
    return true;
  }
}
