/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';

import {ReleaseConfig} from '../config/index';

import {ActiveReleaseTrains} from './active-release-trains';
import {semverInc} from './inc-semver';
import {isVersionPublishedToNpm} from './npm-registry';

/** Computes the new pre-release version for the next release-train. */
export async function computeNewPrereleaseVersionForNext(
    active: ActiveReleaseTrains, config: ReleaseConfig): Promise<semver.SemVer> {
  const {version: nextVersion} = active.next;
  const isNextPublishedToNpm = await isVersionPublishedToNpm(nextVersion, config);
  // Special-case where the version in the `next` release-train is not published yet. This
  // happens when we recently branched off for feature-freeze. We already bump the version to
  // the next minor or major, but do not publish immediately. Cutting a release immediately would
  // be not helpful as there are no other changes than in the feature-freeze branch. If we happen
  // to detect this case, we stage the release as usual but do not increment the version.
  if (isNextPublishedToNpm) {
    return semverInc(nextVersion, 'prerelease');
  } else {
    return nextVersion;
  }
}
