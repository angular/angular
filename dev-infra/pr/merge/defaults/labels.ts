/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReleaseConfig} from '../../../release/config/index';
import {fetchActiveReleaseTrains, isVersionBranch, nextBranchName} from '../../../release/versioning';
import {GithubConfig} from '../../../utils/config';
import {GithubClient} from '../../../utils/git/github';
import {TargetLabel} from '../config';
import {InvalidTargetBranchError, InvalidTargetLabelError} from '../target-label';

import {assertActiveLtsBranch} from './lts-branch';

/**
 * Gets a label configuration for the merge tooling that reflects the default Angular
 * organization-wide labeling and branching semantics as outlined in the specification.
 *
 * https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU
 *
 * @param api Instance of an authenticated Github client.
 * @param githubConfig Configuration for the Github remote. Used as Git remote
 *   for the release train branches.
 * @param releaseConfig Configuration for the release packages. Used to fetch
 *   NPM version data when LTS version branches are validated.
 */
export async function getDefaultTargetLabelConfiguration(
    api: GithubClient, githubConfig: GithubConfig,
    releaseConfig: ReleaseConfig): Promise<TargetLabel[]> {
  const repo = {owner: githubConfig.owner, name: githubConfig.name, api};
  const {latest, releaseCandidate, next} = await fetchActiveReleaseTrains(repo);

  return [
    {
      pattern: 'target: major',
      branches: () => {
        // If `next` is currently not designated to be a major version, we do not
        // allow merging of PRs with `target: major`.
        if (!next.isMajor) {
          throw new InvalidTargetLabelError(
              `Unable to merge pull request. The "${nextBranchName}" branch will be released as ` +
              'a minor version.');
        }
        return [nextBranchName];
      },
    },
    {
      pattern: 'target: minor',
      // Changes labeled with `target: minor` are merged most commonly into the next branch
      // (i.e. `master`). In rare cases of an exceptional minor version while being already
      // on a major release train, this would need to be overridden manually.
      // TODO: Consider handling this automatically by checking if the NPM version matches
      // the last-minor. If not, then an exceptional minor might be in progress. See:
      // https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU/edit#heading=h.h7o5pjq6yqd0
      branches: [nextBranchName],
    },
    {
      pattern: 'target: patch',
      branches: githubTargetBranch => {
        // If a PR is targeting the latest active version-branch through the Github UI,
        // and is also labeled with `target: patch`, then we merge it directly into the
        // branch without doing any cherry-picking. This is useful if a PR could not be
        // applied cleanly, and a separate PR for the patch branch has been created.
        if (githubTargetBranch === latest.branchName) {
          return [latest.branchName];
        }
        // Otherwise, patch changes are always merged into the next and patch branch.
        const branches = [nextBranchName, latest.branchName];
        // Additionally, if there is a release-candidate/feature-freeze release-train
        // currently active, also merge the PR into that version-branch.
        if (releaseCandidate !== null) {
          branches.push(releaseCandidate.branchName);
        }
        return branches;
      }
    },
    {
      pattern: 'target: rc',
      branches: githubTargetBranch => {
        // The `target: rc` label cannot be applied if there is no active feature-freeze
        // or release-candidate release train.
        if (releaseCandidate === null) {
          throw new InvalidTargetLabelError(
              `No active feature-freeze/release-candidate branch. ` +
              `Unable to merge pull request using "target: rc" label.`);
        }
        // If the PR is targeting the active release-candidate/feature-freeze version branch
        // directly through the Github UI and has the `target: rc` label applied, merge it
        // only into the release candidate branch. This is useful if a PR did not apply cleanly
        // into the release-candidate/feature-freeze branch, and a separate PR has been created.
        if (githubTargetBranch === releaseCandidate.branchName) {
          return [releaseCandidate.branchName];
        }
        // Otherwise, merge into the next and active release-candidate/feature-freeze branch.
        return [nextBranchName, releaseCandidate.branchName];
      },
    },
    {
      // LTS changes are rare enough that we won't worry about cherry-picking changes into all
      // active LTS branches for PRs created against any other branch. Instead, PR authors need
      // to manually create separate PRs for desired LTS branches. Additionally, active LT branches
      // commonly diverge quickly. This makes cherry-picking not an option for LTS changes.
      pattern: 'target: lts',
      branches: async githubTargetBranch => {
        if (!isVersionBranch(githubTargetBranch)) {
          throw new InvalidTargetBranchError(
              `PR cannot be merged as it does not target a long-term support ` +
              `branch: "${githubTargetBranch}"`);
        }
        if (githubTargetBranch === latest.branchName) {
          throw new InvalidTargetBranchError(
              `PR cannot be merged with "target: lts" into patch branch. ` +
              `Consider changing the label to "target: patch" if this is intentional.`);
        }
        if (releaseCandidate !== null && githubTargetBranch === releaseCandidate.branchName) {
          throw new InvalidTargetBranchError(
              `PR cannot be merged with "target: lts" into feature-freeze/release-candidate ` +
              `branch. Consider changing the label to "target: rc" if this is intentional.`);
        }
        // Assert that the selected branch is an active LTS branch.
        await assertActiveLtsBranch(repo, releaseConfig, githubTargetBranch);
        return [githubTargetBranch];
      },
    },
  ];
}
