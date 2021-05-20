/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';
import {GitClient} from '../../utils/git/index';
import {GithubRepoWithApi} from './version-branches';

/** Type describing a version tag. */
export interface VersionTag {
  /** The tag in Git. e.g. `10.1.2`. */
  tag: string;
  /** Parsed SemVer version for the version tag. */
  parsed: semver.SemVer;
}


/**
 * Regular expression that matches version tags.
 *
 * NOTE: While the relese tooling does not create version tags prefixed with `v`, historically some
 * angular repositories used this prefix for version tags. `v?` is included to properly match these
 * historic versions, however new tags with a `v` prefix should no longer be created.
 */
const versionTagRegex = /^v?(\d+)\.(\d+)\.(\d+)(\-(alpha|beta|next|rc)\.\d+)?$/;

/** Whether the provided tag is a version tag. */
function isVersionTag(tag: string): boolean {
  return versionTagRegex.test(tag);
}

/**
 * Get the filter and sorted list of tags from the provided list of tags foor the provided major
 * versions.
 */
function filterAndSortVersionTags(tags: string[]): VersionTag[] {
  const versionTags: VersionTag[] = [];

  for (const tag of tags) {
    if (!isVersionTag(tag)) {
      continue;
    }

    const parsed = semver.parse(tag);

    if (parsed === null) {
      continue;
    }
    versionTags.push({tag, parsed});
  }

  return versionTags.sort((a, b) => semver.rcompare(a.parsed, b.parsed));
}

/** Retrieve the all semver matching tags from the current branch on git. */
async function getSemverTagsForRepo(repo: GithubRepoWithApi): Promise<VersionTag[]> {
  const {data: tags} = await repo.api.repos.listTags({owner: repo.owner, repo: repo.name});

  return filterAndSortVersionTags(tags.map(tag => tag.name));
}

/** Retrieve the latest semver matching tag from the current branch on git. */
export async function getLatestSemverTagForRepo(repo: GithubRepoWithApi): Promise<VersionTag> {
  const git = GitClient.getInstance();
  const latestTag = (await getSemverTagsForRepo(repo))[0];
  if (latestTag === undefined) {
    throw new Error(
        `Unable to find a SemVer matching tag on "${git.getCurrentBranchOrRevision()}"`);
  }

  return latestTag;
}
