import {Version} from './parse-version';
import {VersionType} from './publish-branches';

/** Type of a new release */
export type ReleaseType = VersionType | 'stable-release' | 'bump-prerelease';

/** Creates a new version that can be used for the given release type. */
export function createNewVersion(currentVersion: Version, releaseType: ReleaseType):
    Version {
  // Clone the version object in order to keep the original version info un-modified.
  const newVersion = currentVersion.clone();

  if (releaseType === 'bump-prerelease') {
    newVersion.prereleaseNumber++;
  } else {
    // For all other release types, the pre-release label and number should be removed
    // because the new version is not another pre-release.
    newVersion.prereleaseLabel = null;
    newVersion.prereleaseNumber = null;
  }

  if (releaseType === 'major') {
    newVersion.major++;
    newVersion.minor = 0;
    newVersion.patch = 0;
  } else if (releaseType === 'minor') {
    newVersion.minor++;
    newVersion.patch = 0;
  } else if (releaseType === 'patch') {
    newVersion.patch++;
  }

  return newVersion;
}
