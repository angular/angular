/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';
import * as semver from 'semver';
import {changelogPath} from './constants';

/**
 * Gets the default pattern for extracting release notes for the given version.
 * This pattern matches for the conventional-changelog Angular preset.
 */
export function getDefaultExtractReleaseNotesPattern(version: semver.SemVer): RegExp {
  const escapedVersion = version.format().replace('.', '\\.');
  // TODO: Change this once we have a canonical changelog generation tool. Also update this
  // based on the conventional-changelog version. They removed anchors in more recent versions.
  return new RegExp(`(<a name="${escapedVersion}"></a>.*?)(?:<a name="|$)`, 's');
}

/** Gets the path for the changelog file in a given project. */
export function getLocalChangelogFilePath(projectDir: string): string {
  return join(projectDir, changelogPath);
}
