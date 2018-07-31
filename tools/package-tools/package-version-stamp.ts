import {writeFileSync} from 'fs';
import {spawnSync} from 'child_process';
import {buildConfig} from './build-config';

/**
 * Inserts the a version stamp, which consists of the current commit SHA and the current
 * branch name, into the specified package.json file.
 *
 * This makes it easy to quickly verify the exact snapshot from which the release originated.
 */
export function insertPackageJsonVersionStamp(packageJsonPath: string) {
  const packageJson = require(packageJsonPath);

  packageJson['releaseGitCommitSha'] = getCurrentCommitSha();
  packageJson['releaseGitBranch'] = getCurrentBranchName();
  packageJson['releaseGitUser'] = getCurrentGitUser();

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

/** Returns the commit SHA for the current git HEAD of the project. */
function getCurrentCommitSha(): string {
  return spawnSync('git', ['rev-parse', 'HEAD'], {cwd: buildConfig.projectDir})
    .stdout.toString().trim();
}

/** Returns the name of the currently checked out branch of the project. */
function getCurrentBranchName(): string {
  return spawnSync('git', ['symbolic-ref', '--short', 'HEAD'], {cwd: buildConfig.projectDir})
    .stdout.toString().trim();
}

/** Returns the name and email of the Git user that creates this release build. */
function getCurrentGitUser() {
  const userName = spawnSync('git', ['config', 'user.name'], {cwd: buildConfig.projectDir})
    .stdout.toString().trim();

  const userEmail = spawnSync('git', ['config', 'user.email'], {cwd: buildConfig.projectDir})
    .stdout.toString().trim();

  return `${userName} <${userEmail}>`;
}
