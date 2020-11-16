/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ActiveReleaseTrains} from '../../versioning/active-release-trains';
import {semverInc} from '../../versioning/inc-semver';
import {ReleaseAction} from '../actions';

/**
 * Release action that cuts a new patch release for the current latest release-train version
 * branch (i.e. the patch branch). The patch segment is incremented. The changelog is generated
 * for the new patch version, but also needs to be cherry-picked into the next development branch.
 */
export class CutNewPatchAction extends ReleaseAction {
  private _newVersion = semverInc(this.active.latest.version, 'patch');

  async getDescription() {
    const {branchName} = this.active.latest;
    const newVersion = this._newVersion;
    return `Cut a new patch release for the "${branchName}" branch (v${newVersion}).`;
  }

  async perform() {
    const {branchName} = this.active.latest;
    const newVersion = this._newVersion;

    const {id} = await this.checkoutBranchAndStageVersion(newVersion, branchName);

    await this.waitForPullRequestToBeMerged(id);
    await this.buildAndPublish(newVersion, branchName, 'latest');
    await this.cherryPickChangelogIntoNextBranch(newVersion, branchName);
  }

  static async isActive(active: ActiveReleaseTrains) {
    // Patch versions can be cut at any time. See:
    // https://hackmd.io/2Le8leq0S6G_R5VEVTNK9A#Release-prompt-options.
    return true;
  }
}
