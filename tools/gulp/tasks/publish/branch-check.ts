import {bold} from 'chalk';
import {spawnSync} from 'child_process';
import {buildConfig} from 'material2-build-tools';

/** Regular expression that matches version names and the individual version segments. */
export const versionNameRegex = /^(\d+)\.(\d+)\.(\d+)(?:-(alpha|beta|rc)\.(\d)+)?/;

/** Regular expression that matches publish branch names and their Semver digits. */
const publishBranchNameRegex = /^([0-9]+)\.([x0-9]+)(?:\.([x0-9]+))?$/;

/** Checks if the specified version can be released from the current Git branch. */
export function checkPublishBranch(version: string) {
  const versionType = getSemverVersionType(version);
  const branchName = spawnSync('git', ['symbolic-ref', '--short', 'HEAD'],
    {cwd: buildConfig.projectDir}).stdout.toString().trim();

  if (branchName === 'master') {
    if (versionType === 'major') {
      return;
    }

    throw `Publishing of "${versionType}" releases should not happen inside of the ` +
        `${bold('master')} branch.`;
  }

  const branchNameMatch = branchName.match(publishBranchNameRegex) || [];
  const branchDigits = branchNameMatch.slice(1, 4);

  if (branchDigits[2] === 'x' && versionType !== 'patch') {
    throw `Cannot publish a "${versionType}" release inside of a patch branch (${branchName})`;
  }

  if (branchDigits[1] === 'x' && versionType !== 'minor') {
    throw `Cannot publish a "${versionType}" release inside of a minor branch (${branchName})`;
  }

  throw `Cannot publish a "${versionType}" release from branch: "${branchName}". Releases should `
  + `be published from "master" or the according publish branch (e.g. "6.x", "6.4.x")`;
}

/**
 * Determines the type of the specified semver version. Can be either a major, minor or
 * patch version.
 */
export function getSemverVersionType(version: string): 'major' | 'minor' | 'patch' {
  const versionNameMatch = version.match(versionNameRegex);

  if (!versionNameMatch) {
    throw `Could not parse version: ${version}. Cannot properly determine version type.`;
  }

  const versionDigits = versionNameMatch.slice(1, 4);

  if (versionDigits[1] === '0' && versionDigits[2] === '0') {
    return 'major';
  } else if (versionDigits[2] === '0') {
    return 'minor';
  } else {
    return 'patch';
  }
}
