import {bold, cyan, green, italic, red, yellow} from 'chalk';
import {existsSync, readFileSync, writeFileSync} from 'fs';
import {prompt} from 'inquirer';
import {join} from 'path';
import {GitClient} from './git/git-client';
import {promptForNewVersion} from './prompt/new-version-prompt';
import {parseVersionName, Version} from './version-name/parse-version';
import {getExpectedPublishBranch} from './version-name/publish-branch';

/**
 * Class that can be instantiated in order to stage a new release. The tasks requires user
 * interaction/input through command line prompts.
 *
 * Staging a release involves the following the steps:
 *
 *  1) Prompt for release type (with version suggestion)
 *  2) Prompt for version name if no suggestions has been selected
 *  3) Assert that the proper publish branch is checked out (e.g. 6.4.x for patches)
 *  4) Assert that there are no local changes which are uncommitted.
 *  5) Assert that the local branch is up to date with the remote branch.
 *  6) Creates a new branch for the release staging (release-stage/{VERSION})
 *  7) Switches to the staging branch and updates the package.json
 *  8) Waits for the user to continue (users can generate the changelog in the meanwhile)
 *  9) Create a commit that includes all changes in the staging branch.
 */
class StageReleaseTask {

  /** Path to the project package JSON. */
  packageJsonPath: string;

  /** Serialized package.json of the specified project. */
  packageJson: any;

  /** Parsed current version of the project. */
  currentVersion: Version;

  /** Instance of a wrapper that can execute Git commands. */
  git: GitClient;

  constructor(public projectDir: string) {
    this.packageJsonPath = join(projectDir, 'package.json');

    console.log(this.projectDir);

    if (!existsSync(this.packageJsonPath)) {
      console.error(red(`The specified directory is not referring to a project directory. ` +
        `There must be a ${italic('package.json')} file in the project directory.`));
      process.exit(1);
    }

    this.packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf-8'));
    this.currentVersion = parseVersionName(this.packageJson.version);

    if (!this.currentVersion) {
      console.error(red(`Cannot parse current version in ${italic('package.json')}. Please ` +
        `make sure "${this.packageJson.version}" is a valid Semver version.`));
      process.exit(1);
    }

    this.git = new GitClient(projectDir, this.packageJson.repository.url);
  }

  async run() {
    console.log();
    console.log(cyan('-----------------------------------------'));
    console.log(cyan('  Angular Material stage release script'));
    console.log(cyan('-----------------------------------------'));
    console.log();

    const newVersion = await promptForNewVersion(this.currentVersion);
    const expectedPublishBranch = getExpectedPublishBranch(newVersion);

    // After the prompt for the new version, we print a new line because we want the
    // new log messages to be more in the foreground.
    console.log();

    this.verifyPublishBranch(expectedPublishBranch);
    this.verifyLocalCommitsMatchUpstream(expectedPublishBranch);
    this.verifyNoUncommittedChanges();

    // TODO(devversion): Assert that GitHub statuses succeed for this branch.

    const newVersionName = newVersion.format();
    const stagingBranch = `release-stage/${newVersionName}`;

    if (!this.git.checkoutNewBranch(stagingBranch)) {
      console.error(red(`Could not create release staging branch: ${stagingBranch}. Aborting...`));
      process.exit(1);
    }

    this.updatePackageJsonVersion(newVersionName);

    console.log(green(`  ✓   Updated the version to "${bold(newVersionName)}" inside of the ` +
      `${italic('package.json')}`));

    // TODO(devversion): run changelog script w/prompts in the future.
    // For now, we just let users make modifications and stage the changes.

    console.log(yellow(`  ⚠   Please generate the ${bold('CHANGELOG')} for the new version. ` +
      `You can also make other unrelated modifications. After the changes have been made, ` +
      `just continue here.`));
    console.log();

    const {shouldContinue} = await prompt<{shouldContinue: boolean}>({
      type: 'confirm',
      name: 'shouldContinue',
      message: 'Do you want to proceed and commit the changes?'
    });

    if (!shouldContinue) {
      console.log();
      console.log(yellow('Aborting release staging...'));
      process.exit(1);
    }

    this.git.stageAllChanges();
    this.git.createNewCommit(`chore: bump version to ${newVersionName} w/ changelog`);

    console.info();
    console.info(green(`  ✓   Created the staging commit for: "${newVersionName}".`));
    console.info(green(`  ✓   Please push the changes and submit a PR on GitHub.`));
    console.info();

    // TODO(devversion): automatic push and PR open URL shortcut.
  }

  /** Verifies that the user is on the specified publish branch. */
  private verifyPublishBranch(expectedPublishBranch: string) {
    const currentBranchName = this.git.getCurrentBranch();

    // Check if current branch matches the expected publish branch.
    if (expectedPublishBranch !== currentBranchName) {
      console.error(red(`Cannot stage release from "${italic(currentBranchName)}". Please stage ` +
        `the release from "${bold(expectedPublishBranch)}".`));
      process.exit(1);
    }
  }

  /** Verifies that the local branch is up to date with the given publish branch. */
  private verifyLocalCommitsMatchUpstream(publishBranch: string) {
    const upstreamCommitSha = this.git.getRemoteCommitSha(publishBranch);
    const localCommitSha = this.git.getLocalCommitSha('HEAD');

    // Check if the current branch is in sync with the remote branch.
    if (upstreamCommitSha !== localCommitSha) {
      console.error(red(`Cannot stage release. The current branch is not in sync with the remote ` +
        `branch. Please make sure your local branch "${italic(publishBranch)}" is up to date.`));
      process.exit(1);
    }
  }

  /** Verifies that there are no uncommitted changes in the project. */
  private verifyNoUncommittedChanges() {
    if (this.git.hasUncommittedChanges()) {
      console.error(red(`Cannot stage release. There are changes which are not committed and ` +
        `should be stashed.`));
      process.exit(1);
    }
  }

  /** Updates the version of the project package.json and writes the changes to disk. */
  private updatePackageJsonVersion(newVersionName: string) {
    const newPackageJson = {...this.packageJson, version: newVersionName};
    writeFileSync(this.packageJsonPath, JSON.stringify(newPackageJson, null, 2));
  }
}

/** Entry-point for the release staging script. */
async function main() {
  const projectDir = process.argv.slice(2)[0];

  if (!projectDir) {
    console.error(red(`You specified no project directory. Cannot run stage release script.`));
    console.error(red(`Usage: bazel run //tools/release:stage-release <project-directory>`));
    process.exit(1);
  }

  return new StageReleaseTask(projectDir).run();
}

if (require.main === module) {
  main();
}

