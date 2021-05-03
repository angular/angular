/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';

import {error, green, info, yellow} from '../../../utils/console';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains';
import {computeNewPrereleaseVersionForNext} from '../../versioning/next-prerelease-version';
import {ReleaseAction} from '../actions';
import {getCommitMessageForExceptionalNextVersionBump} from '../commit-message';
import {packageJsonPath} from '../constants';

/**
 * Release action that moves the next release-train into the feature-freeze phase. This means
 * that a new version branch is created from the next branch, and a new next pre-release is
 * cut indicating the started feature-freeze.
 */
export class MoveNextIntoFeatureFreezeAction extends ReleaseAction {
  private _newVersion = computeNewPrereleaseVersionForNext(this.active, this.config);

  async getDescription() {
    const {branchName} = this.active.next;
    const newVersion = await this._newVersion;
    return `Move the "${branchName}" branch into feature-freeze phase (v${newVersion}).`;
  }

  async perform() {
    const newVersion = await this._newVersion;
    const newBranch = `${newVersion.major}.${newVersion.minor}.x`;

    // Branch-off the next branch into a feature-freeze branch.
    await this._createNewVersionBranchFromNext(newBranch);

    // Stage the new version for the newly created branch, and push changes to a
    // fork in order to create a staging pull request. Note that we re-use the newly
    // created branch instead of re-fetching from the upstream.
    const stagingPullRequest =
        await this.stageVersionForBranchAndCreatePullRequest(newVersion, newBranch);

    // Wait for the staging PR to be merged. Then build and publish the feature-freeze next
    // pre-release. Finally, cherry-pick the release notes into the next branch in combination
    // with bumping the version to the next minor too.
    await this.waitForPullRequestToBeMerged(stagingPullRequest.id);
    await this.buildAndPublish(newVersion, newBranch, 'next');
    await this._createNextBranchUpdatePullRequest(newVersion, newBranch);
  }

  /** Creates a new version branch from the next branch. */
  private async _createNewVersionBranchFromNext(newBranch: string) {
    const {branchName: nextBranch} = this.active.next;
    await this.verifyPassingGithubStatus(nextBranch);
    await this.checkoutUpstreamBranch(nextBranch);
    await this.createLocalBranchFromHead(newBranch);
    await this.pushHeadToRemoteBranch(newBranch);
    info(green(`  ✓   Version branch "${newBranch}" created.`));
  }

  /**
   * Creates a pull request for the next branch that bumps the version to the next
   * minor, and cherry-picks the changelog for the newly branched-off feature-freeze version.
   */
  private async _createNextBranchUpdatePullRequest(newVersion: semver.SemVer, newBranch: string) {
    const {branchName: nextBranch, version} = this.active.next;
    // We increase the version for the next branch to the next minor. The team can decide
    // later if they want next to be a major through the `Configure Next as Major` release action.
    const newNextVersion = semver.parse(`${version.major}.${version.minor + 1}.0-next.0`)!;
    const bumpCommitMessage = getCommitMessageForExceptionalNextVersionBump(newNextVersion);

    await this.checkoutUpstreamBranch(nextBranch);
    await this.updateProjectVersion(newNextVersion);

    // Create an individual commit for the next version bump. The changelog should go into
    // a separate commit that makes it clear where the changelog is cherry-picked from.
    await this.createCommit(bumpCommitMessage, [packageJsonPath]);

    let nextPullRequestMessage = `The previous "next" release-train has moved into the ` +
        `release-candidate phase. This PR updates the next branch to the subsequent ` +
        `release-train.`;
    const hasChangelogCherryPicked =
        await this.createCherryPickReleaseNotesCommitFrom(newVersion, newBranch);

    if (hasChangelogCherryPicked) {
      nextPullRequestMessage += `\n\nAlso this PR cherry-picks the changelog for ` +
          `v${newVersion} into the ${nextBranch} branch so that the changelog is up to date.`;
    } else {
      error(yellow(`  ✘   Could not cherry-pick release notes for v${newVersion}.`));
      error(yellow(`      Please copy the release note manually into "${nextBranch}".`));
    }

    const nextUpdatePullRequest = await this.pushChangesToForkAndCreatePullRequest(
        nextBranch, `next-release-train-${newNextVersion}`,
        `Update next branch to reflect new release-train "v${newNextVersion}".`,
        nextPullRequestMessage);

    info(green(`  ✓   Pull request for updating the "${nextBranch}" branch has been created.`));
    info(yellow(`      Please ask team members to review: ${nextUpdatePullRequest.url}.`));
  }

  static async isActive(active: ActiveReleaseTrains) {
    // A new feature-freeze/release-candidate branch can only be created if there
    // is no active release-train in feature-freeze/release-candidate phase.
    return active.releaseCandidate === null;
  }
}
