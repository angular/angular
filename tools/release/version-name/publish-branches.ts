import {Version} from './parse-version';

export type VersionType = 'major' | 'minor' | 'patch';

/** Determines the allowed branch names for publishing the specified version. */
export function getAllowedPublishBranches(version: Version): string[] {
  const versionType = getSemverVersionType(version);

  if (versionType === 'major') {
    return ['master'];
  } else if (versionType === 'minor') {
    // It's also possible that the caretaker wants to stage a minor release from a different
    // branch than "master". This can happen if major changes have been merged into "master"
    // and non-major changes are cherry-picked into a separate branch (e.g. 7.x)
    return ['master', `${version.major}.x`];
  } else if (versionType === 'patch') {
    return [`${version.major}.${version.minor}.x`];
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
