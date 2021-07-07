/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';

import {ReleaseConfig} from '../../config';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains';
import {fetchProjectNpmPackageInfo} from '../../versioning/npm-registry';
import {ReleaseAction} from '../actions';
import {invokeSetNpmDistCommand, invokeYarnInstallCommand} from '../external-commands';

/**
 * Release action that tags the recently published major as latest within the NPM
 * registry. Major versions are published to the `next` NPM dist tag initially and
 * can be re-tagged to the `latest` NPM dist tag. This allows caretakers to make major
 * releases available at the same time. e.g. Framework, Tooling and Components
 * are able to publish v12 to `@latest` at the same time. This wouldn't be possible if
 * we directly publish to `@latest` because Tooling and Components needs to wait
 * for the major framework release to be available on NPM.
 * @see {CutStableAction#perform} for more details.
 */
export class TagRecentMajorAsLatest extends ReleaseAction {
  override async getDescription() {
    return `Tag recently published major v${this.active.latest.version} as "next" in NPM.`;
  }

  override async perform() {
    await this.checkoutUpstreamBranch(this.active.latest.branchName);
    await invokeYarnInstallCommand(this.projectDir);
    await invokeSetNpmDistCommand('latest', this.active.latest.version);
  }

  static override async isActive({latest}: ActiveReleaseTrains, config: ReleaseConfig) {
    // If the latest release-train does currently not have a major version as version. e.g.
    // the latest branch is `10.0.x` with the version being `10.0.2`. In such cases, a major
    // has not been released recently, and this action should never become active.
    if (latest.version.minor !== 0 || latest.version.patch !== 0) {
      return false;
    }

    const packageInfo = await fetchProjectNpmPackageInfo(config);
    const npmLatestVersion = semver.parse(packageInfo['dist-tags']['latest']);
    // This action only becomes active if a major just has been released recently, but is
    // not set to the `latest` NPM dist tag in the NPM registry. Note that we only allow
    // re-tagging if the current `@latest` in NPM is the previous major version.
    return npmLatestVersion !== null && npmLatestVersion.major === latest.version.major - 1;
  }
}
