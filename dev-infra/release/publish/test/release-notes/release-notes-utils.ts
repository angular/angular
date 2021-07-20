/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';

import {DevInfraReleaseConfig, ReleaseConfig} from '../../../config';
import {ReleaseNotes} from '../../../notes/release-notes';

/**
 * Mock version of the ReleaseNotes for testing, preventing actual calls to git for commits and
 * returning versioned entry strings.
 */
class MockReleaseNotes extends ReleaseNotes {
  static override async fromRange(version: semver.SemVer, startingRef: string, endingRef: string) {
    return new MockReleaseNotes(version, startingRef, endingRef);
  }

  override async getChangelogEntry() {
    return `Changelog Entry for ${this.version}`;
  }

  override async getGithubReleaseEntry() {
    return `Github Release Entry for ${this.version}`;
  }

  // Overrides of utility functions which call out to other tools and are unused in this mock.
  protected override async getCommitsInRange(from: string, to?: string) {
    return [];
  }
  protected override getReleaseConfig(config?: Partial<DevInfraReleaseConfig>) {
    return {} as ReleaseConfig;
  }
}

/** Replace the ReleaseNotes static builder function with the MockReleaseNotes builder function. */
export function installMockReleaseNotes() {
  spyOn(ReleaseNotes, 'fromRange').and.callFake(MockReleaseNotes.fromRange);
}
