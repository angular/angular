/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';

import {green, info, yellow} from '../../../utils/console';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains';
import {ReleaseAction} from '../actions';
import {getCommitMessageForNextBranchMajorSwitch} from '../commit-message';
import {packageJsonPath} from '../constants';

/**
 * Release action that configures the active next release-train to be for a major
 * version. This means that major changes can land in the next branch.
 */
export class ConfigureNextAsMajorAction extends ReleaseAction {
  /** The version being released. */
  version = semver.parse(`${this.active.next.version.major + 1}.0.0-next.0`)!;

  async getDescription() {
    const {branchName} = this.active.next;
    return `Configure the "${branchName}" branch to be released as major (v${this.version}).`;
  }

  /** Noop, required by base class. */
  async setup() {}

  async perform() {
    const {branchName} = this.active.next;

    await this.verifyPassingGithubStatus(branchName);
    await this.checkoutUpstreamBranch(branchName);
    await this.updateProjectVersion();
    await this.createCommit(
        getCommitMessageForNextBranchMajorSwitch(this.version), [packageJsonPath]);
    const pullRequest = await this.pushChangesToForkAndCreatePullRequest(
        branchName, `switch-next-to-major-${this.version}`,
        `Configure next branch to receive major changes for v${this.version}`);

    info(green('  ✓   Next branch update pull request has been created.'));
    info(yellow(`      Please ask team members to review: ${pullRequest.url}.`));
  }

  static async isActive(active: ActiveReleaseTrains) {
    // The `next` branch can always be switched to a major version, unless it already
    // is targeting a new major. A major can contain minor changes, so we can always
    // change the target from a minor to a major.
    return !active.next.isMajor;
  }
}
