import * as fs from 'fs';
import * as path from 'path';

import {
  ActiveReleaseTrains,
  assertValidReleaseConfig,
  fetchLongTermSupportBranchesFromNpm,
  getConfig,
} from '@angular/ng-dev';

import {sites} from './utils.mjs';

interface VersionEntry {
  url: string;
  title: string;
}

type VersionList = VersionEntry[];

/** Path to the `versions.json` file in the docs-app. */
const relativeVersionFilePath = 'src/assets/versions.json';

/**
 * List of hard-coded major versions which have an archived docs-site,
 * but their major is not detectable as active/inactive LTS due to these
 * majors being released with the old release tool (not tagging LTS majors).
 */
// TODO: This can be removed at some point in the future if we feel like nobody
// needing these doc-site archives.
const hardcodedOldMajorsWithoutLtsTag = [5, 6, 7, 8, 9, 10, 11];

/**
 * Updates the versions list file in the specified docs repo to reflect
 * the current active release trains and archived LTS versions.
 */
export async function updateVersionsFile(docsRepoDir: string, active: ActiveReleaseTrains) {
  const versionFilePath = path.join(docsRepoDir, relativeVersionFilePath);
  const {release} = await getConfig([assertValidReleaseConfig]);
  const ltsBranches = await fetchLongTermSupportBranchesFromNpm(release);

  const versions: VersionList = [
    {url: sites.next.remoteUrl, title: 'Next'},
    {url: sites.rc.remoteUrl, title: 'Release Candidate'},
    {url: sites.stable.remoteUrl, title: `${active.latest.version.format()} (latest)`},
  ];

  const archivedMajors = new Set(
    [...ltsBranches.active, ...ltsBranches.inactive]
      .map(e => e.version.major)
      .concat(hardcodedOldMajorsWithoutLtsTag),
  );

  // Insert archived majors in descending order (i.e. starting with newer ones).
  Array.from(archivedMajors)
    .sort((a, b) => b - a)
    .forEach(major =>
      versions.push({
        title: `v${major}`,
        url: sites.forMajor(major).remoteUrl,
      }),
    );

  await fs.promises.writeFile(versionFilePath, JSON.stringify(versions, null, 2));
}
