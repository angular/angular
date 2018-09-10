import {spawnSync} from 'child_process';
import {buildConfig} from 'material2-build-tools';

/** Regular expression that matches version names and the individual version segments. */
export const versionNameRegex = /^(\d+)\.(\d+)\.(\d+)(?:-(alpha|beta|rc)\.(\d)+)?$/;

/** Checks if the specified version can be released from the current Git branch. */
export function checkPublishBranch(version: string) {
  const versionType = getSemverVersionType(version);
  const branchName = spawnSync('git', ['symbolic-ref', '--short', 'HEAD'],
    {cwd: buildConfig.projectDir}).stdout.toString().trim();


  // TODO(devversion): also check the the local branch's HEAD sha matches upstream.
  // TODO(devversion): also check that the version is a single increment of the previous release.
  // TODO(devversion): minor releases can also be published from master if there isn't a minor
  // branch for that major range yet.
  const [major, minor] = version.split('.');

  let expectedBranch = '';
  if (versionType === 'major') {
    expectedBranch = 'master';
  } else if (versionType === 'minor') {
    expectedBranch = `${major}.x`;
  } else if (versionType === 'patch') {
    expectedBranch = `${major}.${minor}.x`;
  }

  if (branchName !== expectedBranch) {
    throw `A ${versionType} release must be done from the ${expectedBranch} branch.`;
  }
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
