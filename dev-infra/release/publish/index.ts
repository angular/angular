/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ListChoiceOptions, prompt} from 'inquirer';

import {spawn} from '../../utils/child-process';
import {GithubConfig} from '../../utils/config';
import {debug, error, info, log, promptConfirm, red, yellow} from '../../utils/console';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {ReleaseConfig} from '../config/index';
import {ActiveReleaseTrains, fetchActiveReleaseTrains, nextBranchName} from '../versioning/active-release-trains';
import {npmIsLoggedIn, npmLogin, npmLogout} from '../versioning/npm-publish';
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
  /** The singleton instance of the authenticated git client. */
  private _git = AuthenticatedGitClient.get();
  /** The previous git commit to return back to after the release tool runs. */
  private previousGitBranchOrRevision = this._git.getCurrentBranchOrRevision();

  constructor(
      protected _config: ReleaseConfig, protected _github: GithubConfig,
      protected _projectRoot: string) {}

  /** Runs the interactive release tool. */
  async run(): Promise<CompletionState> {
    log();
    log(yellow('--------------------------------------------'));
    log(yellow('  Angular Dev-Infra release staging script'));
    log(yellow('--------------------------------------------'));
    log();

    if (!await this._verifyEnvironmentHasPython3Symlink() ||
        !await this._verifyNoUncommittedChanges() || !await this._verifyRunningFromNextBranch()) {
      return CompletionState.FATAL_ERROR;
    }

    if (!await this._verifyNpmLoginState()) {
      return CompletionState.MANUALLY_ABORTED;
    }

    const {owner, name} = this._github;
    const repo: GithubRepoWithApi = {owner, name, api: this._git.github};
    const releaseTrains = await fetchActiveReleaseTrains(repo);

    // Print the active release trains so that the caretaker can access
    // the current project branching state without switching context.
    await printActiveReleaseTrains(releaseTrains, this._config);

    const action = await this._promptForReleaseAction(releaseTrains);

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
      await this.cleanup();
    }

    return CompletionState.SUCCESS;
  }

  /** Run post release tool cleanups. */
  private async cleanup(): Promise<void> {
    // Return back to the git state from before the release tool ran.
    this._git.checkout(this.previousGitBranchOrRevision, true);
    // Ensure log out of NPM.
    await npmLogout(this._config.publishRegistry);
  }

  /** Prompts the caretaker for a release action that should be performed. */
  private async _promptForReleaseAction(activeTrains: ActiveReleaseTrains) {
    const choices: ListChoiceOptions[] = [];

    // Find and instantiate all release actions which are currently valid.
    for (let actionType of actions) {
      if (await actionType.isActive(activeTrains, this._config)) {
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
   * Verifies that Python can be resolved within scripts and points to a compatible version. Python
   * is required in Bazel actions as there can be tools (such as `skydoc`) that rely on it.
   * @returns a boolean indicating success or failure.
   */
  private async _verifyEnvironmentHasPython3Symlink(): Promise<boolean> {
    try {
      // Note: We do not rely on `/usr/bin/env` but rather access the `env` binary directly as it
      // should be part of the shell's `$PATH`. This is necessary for compatibility with Windows.
      const pyVersion = await spawn('env', ['python', '--version'], {mode: 'silent'});
      const version = pyVersion.stdout.trim() || pyVersion.stderr.trim();
      if (version.startsWith('Python 3.')) {
        debug(`Local python version: ${version}`);
        return true;
      }
      error(red(`  ✘   \`/usr/bin/python\` is currently symlinked to "${version}", please update`));
      error(red('      the symlink to link instead to Python3'));
      error();
      error(red('      Googlers: please run the following command to symlink python to python3:'));
      error(red('        sudo ln -s /usr/bin/python3 /usr/bin/python'));
      return false;
    } catch {
      error(red('  ✘   `/usr/bin/python` does not exist, please ensure `/usr/bin/python` is'));
      error(red('      symlinked to Python3.'));
      error();
      error(red('      Googlers: please run the following command to symlink python to python3:'));
      error(red('        sudo ln -s /usr/bin/python3 /usr/bin/python'));
    }
    return false;
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

  /**
   * Verifies that the user is logged into NPM at the correct registry, if defined for the release.
   * @returns a boolean indicating whether the user is logged into NPM.
   */
  private async _verifyNpmLoginState(): Promise<boolean> {
    const registry = `NPM at the ${this._config.publishRegistry ?? 'default NPM'} registry`;
    // TODO(josephperrott): remove wombat specific block once wombot allows `npm whoami` check to
    // check the status of the local token in the .npmrc file.
    if (this._config.publishRegistry?.includes('wombat-dressing-room.appspot.com')) {
      info('Unable to determine NPM login state for wombat proxy, requiring login now.');
      try {
        await npmLogin(this._config.publishRegistry);
      } catch {
        return false;
      }
      return true;
    }
    if (await npmIsLoggedIn(this._config.publishRegistry)) {
      debug(`Already logged into ${registry}.`);
      return true;
    }
    error(red(`  ✘   Not currently logged into ${registry}.`));
    const shouldLogin = await promptConfirm('Would you like to log into NPM now?');
    if (shouldLogin) {
      debug('Starting NPM login.');
      try {
        await npmLogin(this._config.publishRegistry);
      } catch {
        return false;
      }
      return true;
    }
    return false;
  }
}
