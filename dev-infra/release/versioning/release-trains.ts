/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';

/** Class describing a release-train. */
export class ReleaseTrain {
  /** Whether the release train is currently targeting a major. */
  isMajor = this.version.minor === 0 && this.version.patch === 0;

  constructor(
      /** Name of the branch for this release-train. */
      public branchName: string,
      /** Most recent version for this release train. */
      public version: semver.SemVer) {}
}
