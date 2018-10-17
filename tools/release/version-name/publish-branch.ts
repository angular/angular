import {Version} from './parse-version';

export type VersionType = 'major' | 'minor' | 'patch';

/** Determines the expected branch name for publishing the specified version. */
export function getExpectedPublishBranch(version: Version): string {
  const versionType = getSemverVersionType(version);

  if (versionType === 'major') {
    return 'master';
  } else if (versionType === 'minor') {
    return `${version.major}.x`;
  } else if (versionType === 'patch') {
    return `${version.major}.${version.minor}.x`;
  }
}

/** Determines the type of the specified Semver version. */
export function getSemverVersionType(version: Version): VersionType {
  if (version.minor === 0 && version.patch === 0) {
    return 'major';
  } else if (version.patch === 0) {
    return 'minor';
  } else {
    return 'patch';
  }
}
