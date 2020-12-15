import * as chalk from 'chalk';
import {prompt} from 'inquirer';
import {GitClient} from './git/git-client';
import {Version} from './version-name/parse-version';
import {getAllowedPublishBranches} from './version-name/publish-branches';

/**
 * Base release task class that contains shared methods that are commonly used across
 * the staging and publish script.
 */
export class BaseReleaseTask {

  constructor(public git: GitClient) {}

  /** Checks if the user is on an allowed publish branch for the specified version. */
  protected async assertValidPublishBranch(newVersion: Version): Promise<string> {
    const allowedBranches = getAllowedPublishBranches(newVersion);
    const currentBranchName = this.git.getCurrentBranch();

    // If current branch already matches one of the allowed publish branches, just continue
    // by exiting this function and returning the currently used publish branch.
    if (allowedBranches.includes(currentBranchName)) {
      console.log(chalk.green(`  ✓   Using the "${chalk.italic(currentBranchName)}" branch.`));
      return currentBranchName;
    }

    console.error(chalk.red('  ✘   You are not on an allowed publish branch.'));
    console.info(chalk.yellow(
        `      Allowed branches are: ${chalk.bold(allowedBranches.join(', '))}`));
    console.info();

    // Prompt the user if they wants to forcibly use the current branch. We support this
    // because in some cases, releases do not use the common publish branches. e.g. a major
    // release is delayed, and new features for the next minor version are collected.
    if (await this.promptConfirm(
        `Do you want to forcibly use the current branch? (${chalk.italic(currentBranchName)})`)) {
      console.log();
      console.log(chalk.green(`  ✓   Using the "${chalk.italic(currentBranchName)}" branch.`));
      return currentBranchName;
    }

    console.warn();
    console.warn(chalk.yellow('      Please switch to one of the allowed publish branches.'));
    process.exit(0);
  }

  /** Verifies that the local branch is up to date with the given publish branch. */
  protected verifyLocalCommitsMatchUpstream(publishBranch: string) {
    const upstreamCommitSha = this.git.getRemoteCommitSha(publishBranch);
    const localCommitSha = this.git.getLocalCommitSha('HEAD');

    // Check if the current branch is in sync with the remote branch.
    if (upstreamCommitSha !== localCommitSha) {
      console.error(chalk.red(`  ✘ The current branch is not in sync with the remote branch. ` +
        `Please make sure your local branch "${chalk.italic(publishBranch)}" is up to date.`));
      process.exit(1);
    }
  }

  /** Verifies that there are no uncommitted changes in the project. */
  protected verifyNoUncommittedChanges() {
    if (this.git.hasUncommittedChanges()) {
      console.error(chalk.red(`  ✘   There are changes which are not committed and should be ` +
        `discarded.`));
      process.exit(1);
    }
  }

  /** Prompts the user with a confirmation question and a specified message. */
  protected async promptConfirm(message: string, defaultValue = false): Promise<boolean> {
    return (await prompt<{result: boolean}>({
      type: 'confirm',
      name: 'result',
      message: message,
      default: defaultValue,
    })).result;
  }
}
